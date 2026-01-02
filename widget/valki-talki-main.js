(function(){
  "use strict";

  /* ===============================
     CONFIG
  ================================ */
  const BASE_URL = "https://auth.valki.wiki";

  const API_VALKI        = BASE_URL + "/api/valki";
  const API_ME           = BASE_URL + "/api/me";
  const API_MESSAGES     = BASE_URL + "/api/messages";
  const API_CLEAR        = BASE_URL + "/api/clear";
  const API_IMPORT_GUEST = BASE_URL + "/api/import-guest";
  const API_UPLOAD       = BASE_URL + "/api/upload";

  const AUTH_DISCORD_START = BASE_URL + "/auth/discord";
  const AUTH_GOOGLE_START  = BASE_URL + "/auth/google";

  const DISCORD_INVITE_URL = "https://discord.com/invite/vqDJuGJN2u";
  const AVATAR_URL = "https://valki.wiki/blogmedia/Valki%20Talki.jpg";

  const GUEST_FREE_ROUND_SIZE = 3;
  const GUEST_MAX_ROUNDS = 2;

  const AUTH_KEY        = "valki_auth_token_v1";
  const HISTORY_KEY     = "valki_history_v20";
  const GUEST_METER_KEY = "valki_guest_meter_v1";
  const CLIENT_ID_KEY   = "valki_client_id_v20";
  const PRIVACY_NOTICE_DISMISS_KEY = "valki_privacy_notice_dismissed";

  const MSG_GENERIC_ERROR = "Something went wrong talking to Valki.";
  const MSG_NO_RESPONSE   = "…krrzzzt… no response received.";

  const CHAT_MAX_LINES = 4;
  const CHAT_PAD_BASE = "var(--valki-chat-pad-bottom)";

  /* Attachments */
  const MAX_FILES = 4;
  const MAX_BYTES = 5 * 1024 * 1024; // 5MB per file (client-side gate)
  const isiOS = /iP(ad|hone|od)/.test(navigator.userAgent);
  const DEBUG = !!window.__VALKI_DEBUG__;
  const overlayCleanupTimers = new WeakMap();
  let viewportManager = null;

  /* ===============================
     DOM
  ================================ */
  const $ = (id)=>document.getElementById(id);

  const bgCanvas    = $("valki-bg");
  const root        = $("valki-root");
  const signalLock   = $("valki-signal-lock");
  const signalLineMain = $("line-main");
  const signalLineSub  = $("line-sub");

  const searchForm  = $("valki-search-form");
  const searchInput = $("valki-search-input");

  const heroLoginBtn = $("valki-hero-login-btn");
  const badge       = $("valki-top-badge");
  const overlay     = $("valki-overlay");
  const closeBtn    = $("valki-close");

  const headerAvatar = $("valki-header-avatar");
  const headerTitle  = $("valki-title");
  const sessionLabel = $("valki-session-label");

  const loginOutBtn  = $("valki-loginout-btn");
  const deleteAllBtn = $("valki-deleteall-btn");

  const messagesEl    = $("valki-messages");
  const messagesInner = $("valki-messages-inner");

  const chatForm      = $("valki-chat-form");
  const chatFormInner = chatForm ? chatForm.querySelector(".valki-chat-form-inner") : null;
  const chatInput     = $("valki-chat-input");
  const sendBtn       = $("valki-chat-send");

  const attachBtn     = $("valki-chat-attach");
  const fileInput     = $("valki-file-input");
  const attachTray    = $("valki-attachments");

  const authOverlay   = $("valki-auth-overlay");
  const authTitle     = $("valki-auth-title");
  const authSubtitle  = $("valki-auth-subtitle");
  const authNote      = $("valki-auth-note");
  const authDismiss   = $("valki-auth-dismiss");
  const cookiePrefsBtn = $("valki-cookie-prefs-btn");

  const loginDiscordBtn = $("valki-login-discord-btn");
  const loginGoogleBtn  = $("valki-login-google-btn");
  const joinDiscordBtn  = $("valki-join-discord-btn");

  const confirmOverlay = $("valki-confirm-overlay");
  const confirmNo      = $("valki-confirm-no");
  const confirmYes     = $("valki-confirm-yes");

  const logoutOverlay  = $("valki-logout-overlay");
  const logoutNo       = $("valki-logout-no");
  const logoutYes      = $("valki-logout-yes");

  const required = [
    { id: "valki-root", el: root },
    { id: "valki-search-form", el: searchForm },
    { id: "valki-search-input", el: searchInput },
    { id: "valki-hero-login-btn", el: heroLoginBtn },
    { id: "valki-top-badge", el: badge },
    { id: "valki-overlay", el: overlay },
    { id: "valki-close", el: closeBtn },
    { id: "valki-messages", el: messagesEl },
    { id: "valki-messages-inner", el: messagesInner },
    { id: "valki-chat-form", el: chatForm },
    { id: "valki-chat-form-inner", el: chatFormInner },
    { id: "valki-chat-input", el: chatInput },
    { id: "valki-chat-send", el: sendBtn },
    { id: "valki-chat-attach", el: attachBtn },
    { id: "valki-file-input", el: fileInput },
    { id: "valki-attachments", el: attachTray },
    { id: "valki-auth-overlay", el: authOverlay },
    { id: "valki-loginout-btn", el: loginOutBtn },
    { id: "valki-deleteall-btn", el: deleteAllBtn },
    { id: "valki-login-discord-btn", el: loginDiscordBtn },
    { id: "valki-login-google-btn", el: loginGoogleBtn },
    { id: "valki-join-discord-btn", el: joinDiscordBtn },
    { id: "valki-confirm-overlay", el: confirmOverlay },
    { id: "valki-confirm-no", el: confirmNo },
    { id: "valki-confirm-yes", el: confirmYes },
    { id: "valki-logout-overlay", el: logoutOverlay },
    { id: "valki-logout-no", el: logoutNo },
    { id: "valki-logout-yes", el: logoutYes }
  ];

  if (required.some(item => !item.el)) {
    const missing = required.filter(item => !item.el).map(item => item.id);
    console.log('[ValkiTalki] Early return: missing required elements.', missing);
    return;
  }

  document.documentElement.classList.add("valki-landing-ready");
  document.body.classList.add("valki-landing-ready");
  viewportManager = createViewportManager();
  viewportManager.bind();
  viewportManager.run("init");
  window.__VALKI_DIAG__ = ()=> viewportManager.diag();

  /* ===============================
     Valki animated background
  ================================*/
  (function initBackgroundCanvas(){
    if (window.__VALKI_BG_RUNNING__) return;
    if (!bgCanvas) return;

    const ctx = bgCanvas.getContext("2d", { alpha:true });
    if (!ctx) return;
    window.__VALKI_BG_RUNNING__ = true;

    const cfg = {
      baseDark: 15,
      vignetteStrength: 0.44,
      ringEmitters: 2,
      ringsPerEmitter: 5,
      ringSpeed: 0.018,
      ringMax: 1.25,
      ringLine: 1.2,
      ringOpacity: 0.05,
      traceOpacity: 0.018,
      traceSpeed: 0.22,
      traceAmp: 0.020,
      grainOpacity: 0.02
    };

    let w = 0, h = 0, dpr = 1;
    let emitters = [];

    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize(){
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth * dpr);
      h = Math.floor(getViewportHeight() * dpr);
      bgCanvas.width = w;
      bgCanvas.height = h;
      bgCanvas.style.width = "100vw";
      bgCanvas.style.height = "var(--vvh)";

      emitters = [
        { x: w * 0.28, y: h * 0.42, phase: Math.random() * 10 },
        { x: w * 0.72, y: h * 0.58, phase: Math.random() * 10 }
      ].slice(0, cfg.ringEmitters);
    }

    window.addEventListener("resize", resize, { passive:true });
    resize();

    const grainCanvas = document.createElement("canvas");
    const gctx = grainCanvas.getContext("2d");

    function makeGrain(){
      if (!gctx) return;
      const gw = Math.floor(220 * dpr);
      const gh = Math.floor(220 * dpr);
      grainCanvas.width = gw;
      grainCanvas.height = gh;

      const img = gctx.createImageData(gw, gh);
      for (let i = 0; i < img.data.length; i += 4){
        const v = (Math.random() * 255) | 0;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      gctx.putImageData(img, 0, 0);
    }
    makeGrain();
    setInterval(makeGrain, 1600);

    function drawBackground(){
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgb(" + cfg.baseDark + "," + cfg.baseDark + "," + cfg.baseDark + ")";
      ctx.fillRect(0, 0, w, h);

      const r = Math.max(w, h) * 0.78;
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.5, r);
      grad.addColorStop(0, "rgba(255,255,255,0.02)");
      grad.addColorStop(1, "rgba(0,0,0," + cfg.vignetteStrength + ")");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    function drawRadioRings(t){
      ctx.save();
      ctx.globalCompositeOperation = "source-over";

      const minDim = Math.min(w, h);
      const maxR = minDim * cfg.ringMax;

      for (const e of emitters){
        const aBase = cfg.ringOpacity * (0.85 + 0.15 * Math.sin(t * 0.6 + e.phase));
        ctx.lineWidth = cfg.ringLine * dpr;

        for (let i = 0; i < cfg.ringsPerEmitter; i++){
          const offset = i / cfg.ringsPerEmitter;
          const p = (t * cfg.ringSpeed + offset + e.phase * 0.02) % 1;
          const radius = p * maxR;

          const fade = (1 - p) * (1 - p);
          const alpha = aBase * fade;

          ctx.strokeStyle = "rgba(190,200,215," + alpha + ")";
          ctx.beginPath();
          ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(190,200,215,0.06)";
        ctx.beginPath();
        ctx.arc(e.x, e.y, 1.6 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function drawSignalTrace(t){
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(190,200,215," + cfg.traceOpacity + ")";
      ctx.lineWidth = 1 * dpr;

      const y0 = h * (0.34 + 0.08 * Math.sin(t * 0.12));
      const amp = h * cfg.traceAmp;
      const freq = (2 * Math.PI) / (w * 0.55);

      ctx.beginPath();
      const step = 8 * dpr;

      for (let x = 0; x <= w; x += step){
        const y =
          y0 +
          Math.sin(x * freq + t * cfg.traceSpeed) * amp +
          Math.sin(x * freq * 0.35 - t * cfg.traceSpeed * 0.7) * amp * 0.55 +
          Math.sin(x * freq * 1.7 + t * 0.9) * amp * 0.12;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.restore();
    }

    function drawGrain(){
      if (!gctx) return;
      ctx.save();
      ctx.globalAlpha = cfg.grainOpacity;
      ctx.globalCompositeOperation = "overlay";
      const pattern = ctx.createPattern(grainCanvas, "repeat");
      if (pattern){
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
    }

    const start = performance.now();
    function frame(now){
      const t = (now - start) * 0.001;
      drawBackground();

      if (!prefersReduced){
        drawRadioRings(t);
        drawSignalTrace(t);
      } else {
        drawRadioRings(0);
        drawSignalTrace(0);
      }

      drawGrain();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* ===============================
     Helpers
  ================================ */
  function cleanText(v){ return String(v ?? "").replace(/\\u0000/g,"").trim(); }
  function safeJsonParse(s, fallback){ try{ return JSON.parse(s); } catch { return fallback; } }
  function parsePx(v){ const n = parseFloat(String(v||"").replace("px","")); return Number.isFinite(n) ? n : 0; }

  function nowIso(){ return new Date().toISOString(); }
  function describeEl(el){
    if (!el) return null;
    const cs = window.getComputedStyle ? getComputedStyle(el) : null;
    return {
      id: el.id || el.className || el.tagName,
      display: el.style.display || (cs && cs.display),
      opacity: el.style.opacity || (cs && cs.opacity),
      classList: Array.from(el.classList || []),
      ariaHidden: el.getAttribute("aria-hidden"),
      ts: nowIso()
    };
  }
  function logDebug(label, el, extra){
    if (!DEBUG) return;
    const payload = Object.assign(
      { label, ts: nowIso() },
      el ? { overlay: describeEl(el) } : {},
      extra || {}
    );
    console.log("[VALKI][overlay]", payload);
  }

  function createViewportManager(){
    const state = {
      chatOpen: false,
      bound: false,
      timers: { main:null, late:null },
      lastMetrics: {
        viewportHeight: getViewportHeight(),
        visualViewportHeight: null,
        visualViewportTop: 0,
        keyboardHeight: 0,
        composerHeight: 0,
        chatGap: 0,
        innerHeight: window.innerHeight || 0,
        reason: "init",
        ts: nowIso(),
        nearBottom: false
      }
    };

    function run(reason, opts={}){
      state.lastMetrics = Object.assign(state.lastMetrics, {
        reason: reason || state.lastMetrics.reason,
        ts: nowIso()
      });
      return state.lastMetrics;
    }

    function schedule(reason, { delay=45, lateDelay=120, forceStick=false } = {}){
      return { reason, delay, lateDelay, forceStick };
    }

    function onComposerChange(reason){
      state.lastMetrics = Object.assign(state.lastMetrics, { reason: reason || "composer-change", ts: nowIso() });
      return state.lastMetrics;
    }

    function onChatOpen(){
      state.chatOpen = true;
    }

    function onChatClose(){
      state.chatOpen = false;
    }

    function bind(){
      if (state.bound) return;
      state.bound = true;
    }

    function diag(){
      const dump = Object.assign({}, state.lastMetrics, {
        chatOpen: state.chatOpen,
        bodyLocked: isBodyScrollLocked(),
        scrollY: window.scrollY,
        htmlClassList: Array.from(document.documentElement.classList || [])
      });
      console.log("[VALKI][diag]", dump);
      return dump;
    }

    return { run, schedule, onComposerChange, onChatOpen, onChatClose, bind, diag };
  }

  function getViewportHeight(){
    return window.innerHeight ||
      (document.documentElement && document.documentElement.clientHeight) ||
      0;
  }

  function syncViewportLayout(reason, opts){
    if (!viewportManager) return;
    return viewportManager.run(reason, opts);
  }

  function scheduleViewportSync(reason, delay=45, lateDelay=120, forceStick=false){
    if (!viewportManager) return;
    return viewportManager.schedule(reason, { delay, lateDelay, forceStick });
  }

  function isNearBottom(el, px=90){
    return (el.scrollHeight - el.scrollTop - el.clientHeight) < px;
  }
  function scrollToBottom(force=false){
    if (force || isNearBottom(messagesEl)) messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function blurChatInputSafe(reason){
    try{ chatInput.blur(); }catch{}
  }
  function focusChatInputSafe(reason, opts={}){
    const stickToBottom = !!(opts && opts.stickToBottom);
    requestAnimationFrame(()=>{
      try{ chatInput.focus({ preventScroll:true }); }catch{ chatInput.focus(); }
      if (stickToBottom){
        requestAnimationFrame(()=> scrollToBottom(true));
      }
    });
  }

  function genId(prefix){
    try{
      if (crypto && crypto.getRandomValues){
        const a = new Uint32Array(2);
        crypto.getRandomValues(a);
        const hex = Array.from(a).map(n=>n.toString(16).padStart(8,"0")).join("");
        return prefix + "-" + hex;
      }
    }catch{}
    return prefix + "-" + Math.random().toString(16).slice(2) + Date.now().toString(16);
  }

  function forceOverlayHidden(el, reason){
    if (!el) return;
    el.classList.remove("is-visible");
    el.setAttribute("aria-hidden","true");
    el.style.display = "none";
    el.style.pointerEvents = "none";
    overlayCleanupTimers.delete(el);
    logDebug("force-hide", el, { reason });
  }

  function setVisible(el, on, reason){
    if (!el) return;
    const existing = overlayCleanupTimers.get(el);
    if (existing) clearTimeout(existing);

    if (on){
      el.style.display = "flex";
      el.style.pointerEvents = "auto";
      el.setAttribute("aria-hidden","false");
      requestAnimationFrame(()=>{
        el.classList.add("is-visible");
        logDebug("is-visible:add", el, { reason });
      });
      logDebug("show", el, { reason });
      return;
    }

    el.setAttribute("aria-hidden","true");
    el.classList.remove("is-visible");
    el.style.pointerEvents = "none";
    logDebug("is-visible:remove", el, { reason });
    logDebug("hide", el, { reason });

    const timer = setTimeout(()=> forceOverlayHidden(el, reason || "hide-fallback"), 300);
    overlayCleanupTimers.set(el, timer);
  }

  /* ===============================
     Locale placeholders
  ================================ */
  const searchCopy = {
    en: "What went wrong?",
    nl: "Wat ging er mis?",
    de: "Was ist schiefgelaufen?",
    fr: "Qu’est-ce qui s’est mal passé ?",
    es: "¿Qué salió mal?",
    it: "Cosa è andato storto?",
    pt: "O que deu errado?",
    pl: "Co poszło nie tak?",
    ja: "何がうまくいかなかった？",
    zh: "哪里出了问题？",
    ko: "무엇이 잘못됐나요?",
    ar: "ما الذي حدث خطأ؟",
    tr: "Ne yanlış gitti?"
  };

  const noticeCopy = {
    nl: {
      privacy:
        "🔒 Privacy: deel alleen wat nodig is. Valki Talki is geen big tech — maar je device of browser kan dat wel zijn. Deel nooit seed phrases, private keys of herstelcodes en minimaliseer persoonlijke gegevens."
    },
    en: {
      privacy:
        "🔒 Privacy: share only what’s necessary. Valki Talki isn’t big tech — but your device or browser sometimes is. Never share seed phrases, private keys, or recovery codes, and keep personal data to a minimum."
    },
    de: {
      privacy:
        "🔒 Datenschutz: Teile nur das Notwendige. Valki Talki ist kein Big Tech — dein Gerät oder Browser jedoch manchmal schon. Teile niemals Seed-Phrases, Private Keys oder Wiederherstellungscodes und minimiere persönliche Daten."
    },
    fr: {
      privacy:
        "🔒 Confidentialité : partage uniquement ce qui est nécessaire. Valki Talki n’est pas une big tech — mais ton appareil ou navigateur peut l’être. Ne partage jamais de seed phrase, clé privée ou code de récupération et limite les données personnelles."
    },
    es: {
      privacy:
        "🔒 Privacidad: comparte solo lo necesario. Valki Talki no es big tech — pero tu dispositivo o navegador a veces sí. Nunca compartas frases semilla, claves privadas ni códigos de recuperación y minimiza los datos personales."
    },
    it: {
      privacy:
        "🔒 Privacy: condividi solo ciò che è necessario. Valki Talki non è big tech — ma il tuo dispositivo o browser a volte sì. Non condividere mai seed phrase, chiavi private o codici di recupero e riduci al minimo i dati personali."
    },
    pt: {
      privacy:
        "🔒 Privacidade: compartilhe apenas o necessário. A Valki Talki não é big tech — mas seu dispositivo ou navegador às vezes é. Nunca compartilhe seed phrases, chaves privadas ou códigos de recuperação e minimize dados pessoais."
    },
    pl: {
      privacy:
        "🔒 Prywatność: udostępniaj tylko to, co konieczne. Valki Talki nie jest big tech — ale Twoje urządzenie lub przeglądarka czasem tak. Nigdy nie udostępniaj seed phrase, kluczy prywatnych ani kodów odzyskiwania i ogranicz dane osobowe."
    },
    tr: {
      privacy:
        "🔒 Gizlilik: yalnızca gerekli olanı paylaş. Valki Talki big tech değildir — ancak cihazın veya tarayıcın bazen öyledir. Seed phrase, özel anahtar veya kurtarma kodlarını asla paylaşma ve kişisel verileri minimumda tut."
    },
    ar: {
      privacy:
        "🔒 الخصوصية: شارك فقط ما هو ضروري. Valki Talki ليست من شركات التقنية الكبرى — لكن جهازك أو متصفحك قد يكون كذلك. لا تشارك أبدًا عبارات الاسترداد أو المفاتيح الخاصة أو رموز الاستعادة وقلّل البيانات الشخصية."
    },
  ja: {
      privacy:
        "🔒 プライバシー：必要な情報のみ共有してください。Valki Talki はビッグテックではありませんが、端末やブラウザは該当する場合があります。シードフレーズ、秘密鍵、復元コードは決して共有せず、個人情報は最小限にしてください。"
    },
    zh: {
      privacy:
        "🔒 隐私：仅分享必要的信息。Valki Talki 不是大型科技公司，但你的设备或浏览器有时是。切勿分享助记词、私钥或恢复代码，并尽量减少个人信息。"
    },
    ko: {
      privacy:
        "🔒 개인정보: 필요한 정보만 공유하세요. Valki Talki는 빅테크가 아니지만, 기기나 브라우저는 그럴 수 있습니다. 시드 문구, 개인 키, 복구 코드는 절대 공유하지 말고 개인정보를 최소화하세요."
    }
  };

  const landingCopy = {
    en: [
      ["Crypto problem?", "Explained."],
      ["Lost in crypto?", "Let’s talk."],
      ["Crypto confusion?", "Cleared."],
      ["Crypto questions?", "Answered."],
      ["Stuck in crypto?", "We help."],
      ["Crypto talk?", "Anytime."],
      ["Need crypto help?", "We’re here."],
      ["Crypto clarity.", "No noise."],
      ["Crypto issues?", "Solved."],
      ["Let’s talk crypto.", "Clearly."]
    ],
    nl: [
      ["Crypto problemen?", "Uitgelegd."],
      ["Vast in crypto?", "Wij helpen."],
      ["Crypto verwarring?", "Helder."],
      ["Crypto vragen?", "Beantwoord."],
      ["Crypto hulp?", "Direct."],
      ["Praat crypto.", "Helder."],
      ["Crypto chaos?", "Rust."],
      ["Crypto vast?", "Opgelost."],
      ["Crypto uitleg.", "Zonder ruis."],
      ["Samen crypto.", "Begrijpen."]
    ],
    de: [
      ["Krypto Probleme?", "Erklärt."],
      ["Fest in Krypto?", "Wir helfen."],
      ["Krypto Fragen?", "Beantwortet."],
      ["Krypto Chaos?", "Klarheit."],
      ["Krypto Hilfe?", "Jetzt."],
      ["Krypto Talk?", "Einfach."],
      ["Krypto verstehen.", "Ohne Lärm."],
      ["Krypto Thema?", "Geklärt."],
      ["Krypto Blockade?", "Gelöst."],
      ["Reden wir Krypto.", "Klar."]
    ],
    fr: [
      ["Problème crypto ?", "Expliqué."],
      ["Bloqué en crypto ?", "On aide."],
      ["Questions crypto ?", "Réponses."],
      ["Crypto confuse ?", "Clair."],
      ["Besoin d’aide ?", "Crypto."],
      ["Parlons crypto.", "Simplement."],
      ["Crypto clair.", "Sans bruit."],
      ["Crypto bloqué ?", "Résolu."],
      ["Aide crypto ?", "Ici."],
      ["Crypto expliqué.", "Calme."]
    ],
    es: [
      ["Problemas crypto?", "Explicado."],
      ["Atascado en cripto?", "Hablemos."],
      ["Dudas crypto?", "Resueltas."],
      ["Crypto confuso?", "Claro."],
      ["Ayuda crypto?", "Aquí."],
      ["Hablemos crypto.", "Simple."],
      ["Crypto claro.", "Sin ruido."],
      ["Crypto bloqueado?", "Solucionado."],
      ["Tema crypto?", "Aclarado."],
      ["Cripto fácil.", "Directo."]
    ],
    it: [
      ["Problemi crypto?", "Spiegati."],
      ["Bloccato nel crypto?", "Parliamo."],
      ["Dubbi crypto?", "Chiariti."],
      ["Crypto confuso?", "Chiaro."],
      ["Aiuto crypto?", "Qui."],
      ["Parliamo crypto.", "Semplice."],
      ["Crypto chiaro.", "Senza rumore."],
      ["Crypto fermo?", "Risolto."],
      ["Tema crypto?", "Spiegato."],
      ["Crypto facile.", "Pulito."]
    ],
    pt: [
      ["Problemas cripto?", "Explicado."],
      ["Preso no cripto?", "Vamos falar."],
      ["Dúvidas cripto?", "Resolvidas."],
      ["Cripto confuso?", "Claro."],
      ["Ajuda cripto?", "Aqui."],
      ["Vamos cripto.", "Simples."],
      ["Cripto claro.", "Sem ruído."],
      ["Cripto travado?", "Resolvido."],
      ["Tema cripto?", "Explicado."],
      ["Cripto direto.", "Limpo."]
    ],
    pl: [
      ["Problem z krypto?", "Wyjaśniony."],
      ["Utknąłeś w krypto?", "Pogadamy."],
      ["Pytania krypto?", "Odpowiedzi."],
      ["Krypto chaos?", "Jasność."],
      ["Pomoc krypto?", "Tu."],
      ["Rozmowa krypto.", "Prosto."],
      ["Krypto jasno.", "Bez szumu."],
      ["Krypto blokada?", "Rozwiązana."],
      ["Temat krypto?", "Wyjaśniony."],
      ["Krypto prosto.", "Czysto."]
    ],
    ja: [
      ["暗号資産の悩み？", "解決。"],
      ["暗号で迷子？", "話そう。"],
      ["暗号の疑問？", "解説。"],
      ["暗号が難しい？", "シンプル。"],
      ["暗号サポート？", "ここ。"],
      ["暗号の話。", "わかりやすく。"],
      ["暗号クリア。", "ノイズなし。"],
      ["暗号で停止？", "解消。"],
      ["暗号テーマ？", "整理。"],
      ["暗号を理解。", "一緒に。"]
    ],
    zh: [
      ["加密问题？", "解释清楚。"],
      ["被加密困住？", "聊聊。"],
      ["加密疑问？", "解答。"],
      ["加密混乱？", "清晰。"],
      ["需要加密帮助？", "这里。"],
      ["聊聊加密。", "简单。"],
      ["加密清晰。", "无噪音。"],
      ["加密卡住？", "解决。"],
      ["加密主题？", "说明。"],
      ["理解加密。", "一起。"]
    ],
    ko: [
      ["크립토 문제?", "해결."],
      ["크립토 막힘?", "이야기해요."],
      ["크립토 질문?", "답변."],
      ["크립토 혼란?", "명확."],
      ["크립토 도움?", "여기."],
      ["크립토 대화.", "간단히."],
      ["크립토 클리어.", "노이즈 없음."],
      ["크립토 정체?", "해결됨."],
      ["크립토 주제?", "설명."],
      ["크립토 이해.", "함께."]
    ]
  };

  let selectedLanding;

  function getLocaleKey(copyMap){
    const langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || "en"];
    for (const l of langs){
      const lang = String(l || "").toLowerCase();
      const base = lang.split("-")[0];
      if (copyMap[lang]) return lang;
      if (copyMap[base]) return base;
    }
    return "en";
  }

  function pickLocale(){
    return getLocaleKey(searchCopy);
  }

  function pickLandingLines(){
    const navLang = String(navigator.language || "en").slice(0,2).toLowerCase();
    const lang = landingCopy[navLang] ? navLang : "en";
    const variants = landingCopy[lang] || landingCopy.en;
    const fallback = (landingCopy.en && landingCopy.en[0]) || ["Crypto problem?", "Explained."];
    const choice = variants[Math.floor(Math.random() * variants.length)] || fallback;
    selectedLanding = { lang, lines: choice };
    return selectedLanding;
  }

  function applySignalLockLocale(){
    if (!signalLock || !signalLineMain || !signalLineSub) return;
    const { lang, lines } = selectedLanding || pickLandingLines();
    signalLineMain.textContent = lines[0];
    signalLineSub.textContent = lines[1];
    signalLock.setAttribute("lang", lang);
    if (lang === "ar") signalLock.setAttribute("dir","rtl");
    else signalLock.removeAttribute("dir");
  }

  function preventSignalLockCopy(){
    if (!signalLock) return;
    const block = (e)=>{ e.preventDefault(); return false; };
    ["copy","cut","contextmenu","selectstart"].forEach(evt=> signalLock.addEventListener(evt, block));
    signalLock.addEventListener("mousedown", (e)=> e.preventDefault());
  }

  function applyLocale(){
    const loc = pickLocale();
    const txt = searchCopy[loc] || searchCopy.en;
    searchInput.placeholder = txt;
    chatInput.placeholder = txt;
    applySignalLockLocale();
    showPrivacyNoticeIfNeeded();
  }

  function tNotice(key){
    const loc = getLocaleKey(noticeCopy);
    const pack = noticeCopy[loc] || noticeCopy.en;
    return (pack && pack[key]) ? pack[key] : (noticeCopy.en[key] || "");
  }
  applyLocale();
  preventSignalLockCopy();
  window.addEventListener("languagechange", ()=>{
    applyLocale();
    showPrivacyNoticeIfNeeded();
  });

  /* ===============================
     Auth token + user state
  ================================ */
  function getAuthToken(){ try{ return localStorage.getItem(AUTH_KEY) || ""; } catch { return ""; } }
  function setAuthToken(tok){ try{ localStorage.setItem(AUTH_KEY, String(tok||"")); } catch {} }
  function clearAuthToken(){ try{ localStorage.removeItem(AUTH_KEY); } catch {} }
  function isLoggedIn(){ return !!getAuthToken(); }

  let me = null;
  async function fetchMe(){
    const tok = getAuthToken();
    if (!tok){ me = null; return null; }
    try{
      const r = await fetch(API_ME, { headers:{ Authorization:"Bearer " + tok } });
      const j = await r.json().catch(()=>null);
      if (j && j.loggedIn && j.user){
        me = j.user;
        return me;
      }
    }catch{}
    me = null;
    return null;
  }

  function updateSessionLabel(){
    if (me && me.name){
      sessionLabel.textContent = me.name + " 🟢";
      return;
    }
    sessionLabel.textContent = isLoggedIn() ? "you 🟢" : "Guest 🟠";
  }

  function updateHeroLoginButton(){
    if (!heroLoginBtn) return;
    const loggedIn = isLoggedIn();
    heroLoginBtn.textContent = loggedIn ? "Log out" : "Login";
    heroLoginBtn.dataset.state = loggedIn ? "logout" : "login";
    heroLoginBtn.setAttribute("aria-label", loggedIn ? "Log out of Valki" : "Login to Valki");
  }

  function updateLoginOutButtonLabel(){
    if (isLoggedIn()){
      loginOutBtn.style.display = "none";
    } else {
      loginOutBtn.style.display = "inline-flex";
      loginOutBtn.textContent = "Login";
    }
    updateHeroLoginButton();
  }

  function hasAnyRealMessages(){
    const rows = messagesInner.querySelectorAll(".valki-msg-row");
    for (const r of rows){
      if (r.querySelector(".valki-typing-bar")) continue;
      if (r.getAttribute("data-valki-system")) continue;
      return true;
    }
    return false;
  }

  function hasDismissedPrivacyNotice(){
    try{ return sessionStorage.getItem(PRIVACY_NOTICE_DISMISS_KEY) === "1"; }catch{ return false; }
  }
  function setPrivacyNoticeDismissed(){
    try{ sessionStorage.setItem(PRIVACY_NOTICE_DISMISS_KEY, "1"); }catch{}
  }
  function removePrivacyNotice(){
    const existing = $("valki-notice");
    if (existing) existing.remove();
  }
  function ensureNoticeSlot(){
    let slot = $("valki-notice-slot");
    if (slot) return slot;
    if (!chatFormInner) return null;
    slot = document.createElement("div");
    slot.id = "valki-notice-slot";
    chatFormInner.prepend(slot);
    return slot;
  }
  function showPrivacyNoticeIfNeeded(){
    if (!isChatOpen()){
      removePrivacyNotice();
      return;
    }
    if (isLoggedIn() || hasAnyRealMessages() || hasDismissedPrivacyNotice()){
      removePrivacyNotice();
      return;
    }
    const slot = ensureNoticeSlot();
    if (!slot) return;

    const loc = getLocaleKey(noticeCopy);
    const text = tNotice("privacy");
    let notice = $("valki-notice");
    if (!notice){
      notice = document.createElement("div");
      notice.id = "valki-notice";
      notice.className = "valki-notice";
      notice.setAttribute("role","status");
      notice.setAttribute("aria-live","polite");

      const textEl = document.createElement("div");
      textEl.className = "valki-notice-text";
      textEl.textContent = text;

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "valki-notice-close";
      closeBtn.setAttribute("aria-label", "Dismiss privacy notice");
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", ()=>{
        setPrivacyNoticeDismissed();
        removePrivacyNotice();
      });

      notice.appendChild(textEl);
      notice.appendChild(closeBtn);
    } else {
      const textEl = notice.querySelector(".valki-notice-text");
      if (textEl) textEl.textContent = text;
    }

    const langAttr = (loc || "en").toLowerCase();
    notice.setAttribute("lang", langAttr);
    if (langAttr.split("-")[0] === "ar") notice.setAttribute("dir","rtl");
    else notice.removeAttribute("dir");

    if (!slot.contains(notice)) slot.prepend(notice);
  }

  function updateDeleteButtonVisibility(){
    deleteAllBtn.style.display = hasAnyRealMessages() ? "inline-flex" : "none";
  }

  function updateDeleteButtonState(isBusy){
    if (!hasAnyRealMessages()) return;
    deleteAllBtn.disabled = !!isBusy;
    deleteAllBtn.style.opacity = isBusy ? ".55" : "";
    deleteAllBtn.style.pointerEvents = isBusy ? "none" : "";
  }

  function updateHeroState(){
    const hero = !hasAnyRealMessages();
    if (messagesEl){
      messagesEl.style.display = "";
      messagesEl.setAttribute("aria-hidden", "false");
    }
    if (root){
      root.classList.toggle("valki-hero-mode", hero);
    }
  }

  /* ===============================
     Guest meter
  ================================ */
  function getGuestMeter(){
    const raw = (()=>{ try{ return localStorage.getItem(GUEST_METER_KEY) || ""; }catch{ return ""; } })();
    const m = safeJsonParse(raw, null) || { count:0, roundsShown:0 };
    m.count = Number.isFinite(Number(m.count)) ? Number(m.count) : 0;
    m.roundsShown = Number.isFinite(Number(m.roundsShown)) ? Number(m.roundsShown) : 0;
    return m;
  }
  function setGuestMeter(m){ try{ localStorage.setItem(GUEST_METER_KEY, JSON.stringify(m)); }catch{} }
  function resetGuestMeter(){ try{ localStorage.removeItem(GUEST_METER_KEY); }catch{} }

  function guestHardBlocked(){
    if (isLoggedIn()) return false;
    const m = getGuestMeter();
    return m.count >= (GUEST_FREE_ROUND_SIZE * GUEST_MAX_ROUNDS);
  }

  function maybePromptLoginAfterSend(){
    if (isLoggedIn()) return;
    const m = getGuestMeter();
    const threshold = (m.roundsShown + 1) * GUEST_FREE_ROUND_SIZE;
    if (m.count >= threshold && m.roundsShown < GUEST_MAX_ROUNDS){
      m.roundsShown += 1;
      setGuestMeter(m);
      openAuthOverlay({ hard: (m.roundsShown >= GUEST_MAX_ROUNDS) });
    }
  }

  function bumpGuestCount(){
    if (isLoggedIn()) return;
    const m = getGuestMeter();
    m.count += 1;
    setGuestMeter(m);
  }

  /* ===============================
     Guest history
  ================================ */
  function sanitizeImageMeta(img){
    if (!img || typeof img !== "object") return null;
    const rawUrl = img.url || img.src;
    if (!rawUrl || String(rawUrl).startsWith("data:")) return null;
    const meta = {
      url: String(rawUrl)
    };
    if (img.name) meta.name = String(img.name);
    if (img.type) meta.type = String(img.type);
    if (Number.isFinite(Number(img.size))) meta.size = Number(img.size);
    return meta;
  }

  function sanitizeImagesList(images){
    return Array.isArray(images)
      ? images.map(sanitizeImageMeta).filter(Boolean)
      : [];
  }

  function loadGuestHistory(){
    try{
      const raw = localStorage.getItem(HISTORY_KEY);
      const arr = safeJsonParse(raw, []);
      if (!Array.isArray(arr)) return [];
      return arr
        .filter(x => x && (x.type==="user"||x.type==="bot"))
        .map(x => ({
          type: x.type === "bot" ? "bot" : "user",
          text: (typeof x.text === "string") ? x.text : "",
          images: sanitizeImagesList(Array.isArray(x.images) ? x.images : (Array.isArray(x.attachments) ? x.attachments : undefined))
        }))
        .filter(x => (x.text && x.text.length) || (Array.isArray(x.images) && x.images.length));
    }catch{
      return [];
    }
  }
  function saveGuestHistory(arr){ try{ localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); }catch{} }
  function clearGuestHistory(){ try{ localStorage.removeItem(HISTORY_KEY); }catch{} }

  let guestHistory = loadGuestHistory();

  /* ===============================
     Markdown (optional)
  ================================ */

  function renderMarkdown(text){
    if (!text) return "";
    if (window.marked){
      let html = window.marked.parse(text, { breaks:true });
      if (window.DOMPurify) html = window.DOMPurify.sanitize(html);
      return html;
    }
    return String(text)
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/\\n/g,"<br>");
  }

  function hardenLinks(containerEl){
    if (!containerEl) return;
    containerEl.querySelectorAll("a").forEach(a=>{
      const href = (a.getAttribute("href")||"").trim();
      if (/^javascript:/i.test(href)) a.removeAttribute("href");
      a.setAttribute("target","_blank");
      a.setAttribute("rel","noopener noreferrer");
    });
  }

  /* ===============================
     Messages UI
  ================================ */
  function createMessageRow({ type, text, images }){
    const row = document.createElement("div");
    row.className = "valki-msg-row " + (type === "user" ? "user" : "bot");

    if (type === "bot"){
      const avatarWrap = document.createElement("div");
      avatarWrap.className = "valki-bot-avatar-wrap";
      const avatar = document.createElement("img");
      avatar.className = "valki-bot-avatar";
      avatar.src = AVATAR_URL;
      avatar.alt = "Valki icon";
      avatarWrap.appendChild(avatar);
      row.appendChild(avatarWrap);
    }

    const bubble = document.createElement("div");
    bubble.className = "valki-msg-bubble";
    const normalizedImages = Array.isArray(images)
      ? images.map((img)=> {
          if (img && typeof img === "object"){
            const rawUrl = img.url || img.src;
            const previewUrl = img.previewUrl;
            const safeUrl = rawUrl && !String(rawUrl).startsWith("data:") ? String(rawUrl) : "";
            const safePreview = previewUrl && !String(previewUrl).startsWith("data:") ? String(previewUrl) : "";
            const src = safeUrl || safePreview;
            if (!src) return null;
            const alt = img.name || "uploaded image";
            return { src, alt, clickUrl: safeUrl || safePreview };
          }
          if (img){
            const safeSrc = String(img);
            if (safeSrc.startsWith("data:")) return null;
            return { src:safeSrc, alt:"uploaded image", clickUrl: safeSrc };
          }
          return null;
        }).filter(Boolean)
      : [];

    // tekst
    if (type === "bot"){
      bubble.innerHTML = renderMarkdown(typeof text === "string" ? text : "");
      hardenLinks(bubble);
    } else {
      bubble.textContent = typeof text === "string" ? text : "";
    }

    // images (url/preview)
    if (normalizedImages.length){
      const grid = document.createElement("div");
      grid.className = "valki-img-grid";
      for (const imgData of normalizedImages){
        const img = document.createElement("img");
        img.className = "valki-inline-img";
        img.src = imgData.src;
        img.alt = imgData.alt || "uploaded image";
        img.loading = "lazy";
        img.addEventListener("click", ()=>{
          try{
            window.open(imgData.clickUrl || imgData.src, "_blank", "noopener,noreferrer");
          }catch{}
        });
        grid.appendChild(img);
      }
      bubble.appendChild(grid);
    }

    row.appendChild(bubble);
    return row;
  }

  async function addMessage({ type, text, images } = {}){
    const stick = isNearBottom(messagesEl);
    messagesInner.appendChild(createMessageRow({ type, text, images }));
    scrollToBottom(stick);
    removePrivacyNotice();
    updateDeleteButtonVisibility();
    updateHeroState();
  }

  function clearMessagesUI(){
    messagesInner.innerHTML = "";
    updateDeleteButtonVisibility();
    updateHeroState();
  }

  function createTypingRow(){
    const typingRow = document.createElement("div");
    typingRow.className = "valki-msg-row bot";

    const avatarWrap = document.createElement("div");
    avatarWrap.className = "valki-bot-avatar-wrap";
    const avatar = document.createElement("img");
    avatar.className = "valki-bot-avatar";
    avatar.src = AVATAR_URL;
    avatar.alt = "Valki icon";
    avatarWrap.appendChild(avatar);
    typingRow.appendChild(avatarWrap);

    const bubble = document.createElement("div");
    bubble.className = "valki-msg-bubble";
    bubble.innerHTML =
      '<div class="valki-typing-bar">' +
        '<span class="valki-typing-dots"><span></span><span></span><span></span></span>' +
        '<span class="valki-typing-label">Analyzing the signal…</span>' +
      '</div>';

    typingRow.appendChild(bubble);
    const stick = isNearBottom(messagesEl);
    messagesInner.appendChild(typingRow);
    scrollToBottom(stick);
    return typingRow;
  }

  /* ===============================
     Overlay open/close (iOS safe)
  ================================ */
  function isChatOpen(){
    return overlay.classList.contains("is-visible") || overlay.getAttribute("aria-hidden") === "false";
  }
  function isBodyScrollLocked(){ return document.body.dataset.valkiScrollLocked === "1"; }

  function lockBodyScroll(){
    if (isBodyScrollLocked()) return;
    const y = window.scrollY || 0;
    document.body.dataset.valkiScrollLocked = "1";
    document.body.dataset.valkiScrollY = String(y);
    document.body.style.position = "fixed";
    document.body.style.top = "-" + y + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.classList.add("valki-chat-open");
    logDebug("lockBodyScroll", overlay, { htmlClassList: Array.from(document.documentElement.classList || []), scrollY:y });
  }
  function unlockBodyScroll(){
    const hadLock = isBodyScrollLocked();
    const y = parseInt(document.body.dataset.valkiScrollY || "0", 10);
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    delete document.body.dataset.valkiScrollLocked;
    delete document.body.dataset.valkiScrollY;
    document.documentElement.classList.remove("valki-chat-open");
    logDebug("unlockBodyScroll", overlay, { htmlClassList: Array.from(document.documentElement.classList || []), scrollY:y });
    if (hadLock) window.scrollTo({ top:y, behavior:"auto" });
  }

  function openOverlay(){
    logDebug("openOverlay:start", overlay);
    if (document.activeElement === searchInput){
      searchInput.blur();
    }

    setVisible(overlay, true);
    lockBodyScroll();

    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        try{ chatInput.focus({ preventScroll:true }); } catch { chatInput.focus(); }
        scrollToBottom(true);
        clampComposer();
        showPrivacyNoticeIfNeeded();
      });
    });
  }

  function closeOverlay(reason){
    const why = (typeof reason === "string") ? reason : "closeOverlay";
    blurChatInputSafe("closeOverlay");
    logDebug("closeOverlay:start", overlay);
    setVisible(overlay, false, why);
    unlockBodyScroll();
    removePrivacyNotice();
  }

  function closeAllOverlays(reason){
    const why = reason || "closeAllOverlays";
    if (logoutOverlay && logoutOverlay.classList.contains("is-visible")) closeLogoutPrompt(why);
    if (confirmOverlay && confirmOverlay.classList.contains("is-visible")) closeConfirm(why);
    if (authOverlay && authOverlay.classList.contains("is-visible")) closeAuthOverlay({ force:true, reason:why });
    if (isChatOpen()) closeOverlay(why);
    unlockBodyScroll();
  }

  const TERMLY_SELECTORS = [
    ".termly-modal",
    ".termly-preference-modal",
    "#consent-preferences-modal",
    '#termly-code-snippet-support [data-tnc="preferences-modal"]',
    '#termly-code-snippet-support [data-testid="termly-preference-modal"]',
    "#termly-pref-modal",
    "#termly-preference-center"
  ];

  function isElementVisible(el){
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle ? getComputedStyle(el) : null;
    const hasSize = (rect.width > 0 || rect.height > 0);
    const hidden = style && (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity || "1") === 0);
    return hasSize && !hidden;
  }

  function isTermlyModalOpen(){
    for (const sel of TERMLY_SELECTORS){
      const node = document.querySelector(sel);
      if (node && isElementVisible(node)) return true;
    }
    const support = document.querySelector("#termly-code-snippet-support");
    if (support){
      const dialog = support.querySelector('[role="dialog"], [data-tnc="preferences-modal"]');
      if (dialog && isElementVisible(dialog)) return true;
    }
    return false;
  }

  function startTermlyObserver(){
    if (!window.MutationObserver || window.__VALKI_TERMLY_OBS__) return;
    const obs = new MutationObserver(()=>{
      if (isTermlyModalOpen()){
        closeAllOverlays("termly-open");
      }
    });
    try{
      obs.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["style","class","aria-hidden"] });
      window.__VALKI_TERMLY_OBS__ = obs;
    }catch(e){
      console.warn("Termly observer failed", e);
    }
  }

  function openCookiePrefsSafe(){
    try{
      closeAllOverlays("cookie-prefs");
      setTimeout(()=>{
        if (typeof displayPreferenceModal === "function"){
          displayPreferenceModal();
        }
      }, 250);
    }catch(e){
      console.warn("openCookiePrefsSafe failed", e);
    }
  }
  window.openCookiePrefsSafe = openCookiePrefsSafe;

  /* ===============================
     Composer auto-grow (native)
     - clamps to CHAT_MAX_LINES
     - flips overflowY only when needed
  ================================ */
  function computeLineHeightPx(el){
    const cs = getComputedStyle(el);
    const fontSize = parsePx(cs.fontSize) || 16;
    const lh = cs.lineHeight;
    if (!lh || lh==="normal") return Math.round(fontSize*1.35);
    if (String(lh).endsWith("px")) return Math.round(parsePx(lh));
    const asNum = parseFloat(lh);
    if (Number.isFinite(asNum)) return Math.round(fontSize*asNum);
    return Math.round(fontSize*1.35);
  }

  function clampComposer(){
    chatInput.style.height = "auto";

    const cs = getComputedStyle(chatInput);
    const lh = computeLineHeightPx(chatInput);

    const padTop = parsePx(cs.paddingTop);
    const padBot = parsePx(cs.paddingBottom);

    const maxH = Math.ceil(lh * CHAT_MAX_LINES + padTop + padBot);
    const scrollH = chatInput.scrollHeight;

    const next = Math.min(scrollH, maxH);
    chatInput.style.height = next + "px";

    chatInput.style.overflowY = (scrollH > maxH) ? "auto" : "hidden";
  }

  /* ===============================
     Attachments (JPEG/PNG)
  ================================ */
  let attachments = []; // { id, name, type, url, size? }
  let pendingAttachRefocus = false;

  function normalizeImagePayload(img){
    if (!img || typeof img !== "object") return null;

    const name = String(img.name || "image");
    const type = String(img.type || "image/jpeg");

    const url = (typeof img.url === "string") ? img.url : (typeof img.src === "string" ? img.src : "");
    if (!url || url.startsWith("data:")) return null;

    return { name, type, url };
  }

  function normalizeImagesPayload(images){
    return Array.isArray(images)
      ? images.map(normalizeImagePayload).filter(Boolean)
      : [];
  }

  function buildSafeJsonBody(rawPayload){
    const basePayload = {
      message: typeof rawPayload.message === "string" ? rawPayload.message : "",
      clientId: typeof rawPayload.clientId === "string" ? rawPayload.clientId : String(rawPayload.clientId || ""),
      images: normalizeImagesPayload(rawPayload.images)
    };

    try{
      return JSON.stringify(basePayload);
    }catch(err){
      console.warn("valki payload JSON serialization failed; stripping images", err, {
        message: basePayload.message,
        clientId: basePayload.clientId,
        imagesLength: Array.isArray(basePayload.images) ? basePayload.images.length : 0
      });
      const fallbackPayload = {
        message: basePayload.message,
        clientId: basePayload.clientId,
        images: []
      };

      try{
        return JSON.stringify(fallbackPayload);
      }catch(err){
        console.error("valki payload fallback serialization failed; sending minimal payload", err, {
          message: fallbackPayload.message,
          clientId: fallbackPayload.clientId,
          imagesLength: Array.isArray(fallbackPayload.images) ? fallbackPayload.images.length : 0
        });
        return JSON.stringify({ message:"", clientId:"", images: [] });
      }
    }
  }

  async function showAttachmentError(msg){
    if (!msg) return;
    await addMessage({ type:"bot", text:msg });
    if (!isLoggedIn()){
      guestHistory.push({ type:"bot", text:msg });
      saveGuestHistory(guestHistory);
    }
  }

  function revokeAttachmentPreview(a){
    if (a && a.previewUrl){
      try{ URL.revokeObjectURL(a.previewUrl); }catch{}
    }
  }

  function clearAttachments(){
    for (const a of attachments){
      revokeAttachmentPreview(a);
    }
    attachments = [];
  }

  function showAttachTray(){
    if (!attachments.length){
      attachTray.style.display = "none";
      attachTray.innerHTML = "";
      return;
    }
    attachTray.style.display = "flex";
    attachTray.innerHTML = "";
    for (const a of attachments){
      const wrap = document.createElement("div");
      wrap.className = "valki-attachment";

      const img = document.createElement("img");
      img.src = a.url || "";
      img.alt = a.name || "attachment";

      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "valki-attachment-remove";
      rm.textContent = "×";
      rm.addEventListener("click", ()=>{
        attachments = attachments.filter(x => x.id !== a.id);
        revokeAttachmentPreview(a);
        showAttachTray();
        clampComposer();
      });

      wrap.appendChild(img);
      wrap.appendChild(rm);
      attachTray.appendChild(wrap);
    }
  }

  function resolveUploadUrl(){
    if (typeof API_UPLOAD !== "undefined" && API_UPLOAD){
      return API_UPLOAD;
    }
    if (typeof API_BASE !== "undefined" && API_BASE){
      return API_BASE + "/api/upload";
    }
    return new URL("/api/upload", window.location.href).toString();
  }

  async function uploadFile(file){
    const form = new FormData();
    form.append("file", file, file.name);

    const uploadUrl = resolveUploadUrl();
    const headers = {};
    const tok = getAuthToken();
    if (tok){
      headers.Authorization = "Bearer " + tok;
    }

    const res = await fetch(uploadUrl, {
      method:"POST",
      headers: Object.keys(headers).length ? headers : undefined,
      body: form
    });

    if (!res.ok){
      const host = new URL(uploadUrl).host;
      console.warn("[VALKI] upload failed", { host, status: res.status });
      throw new Error("Upload failed (" + res.status + ")");
    }

    const payload = await res.json().catch(()=> null);
    const fileMeta = payload && (payload.file || payload);
    const uploadedUrl = fileMeta && fileMeta.url;
    if (!uploadedUrl || String(uploadedUrl).startsWith("data:")){
      const host = new URL(uploadUrl).host;
      console.warn("[VALKI] upload invalid response", { host, status: res.status });
      throw new Error("Upload response missing url");
    }

    return {
      url: uploadedUrl,
      name: fileMeta.name || file.name || "image",
      type: fileMeta.type || file.type || "image/jpeg",
      size: Number.isFinite(Number(fileMeta.size)) ? Number(fileMeta.size) : file.size
    };
  }

  async function addFiles(fileList){
    const files = Array.from(fileList || []);
    const errors = new Set();
    for (const f of files){
      if (attachments.length >= MAX_FILES){
        errors.add("Image limit reached (max 4).");
        break;
      }

      const t = String(f.type || "").toLowerCase();
      const ok = (t === "image/jpeg" || t === "image/png" || t === "image/jpg");
      if (!ok){
        errors.add((f.name || "File") + " is not a supported image (JPEG/PNG).");
        continue;
      }

      if (f.size > MAX_BYTES){
        errors.add((f.name || "Image") + " is too large (max 5MB).");
        continue;
      }

      try{
        const uploaded = await uploadFile(f);
        attachments.push({
          id: genId("att"),
          name: uploaded.name,
          type: uploaded.type,
          url: uploaded.url,
          size: uploaded.size
        });
      }catch(e){
        const name = f.name || "image";
        errors.add("Could not upload " + name + " (" + (e && e.message ? e.message : "network") + ").");
      }
    }
    showAttachTray();
    if (errors.size){
      for (const err of errors){
        await showAttachmentError(err);
      }
    }
  }

  function setAttachmentUiDisabled(on){
    attachBtn.disabled = !!on || chatInput.disabled;
    attachBtn.style.opacity = attachBtn.disabled ? ".55" : "";
  }

  /* ===============================
     Auth overlay
  ================================ */
  let authHard = false;

  function openAuthOverlay({ hard }){
    logDebug("openAuthOverlay:start", authOverlay, { hard });
    authHard = !!hard;

    authTitle.textContent = authHard ? "Login required" : "Log in to continue";
    authSubtitle.textContent = authHard
      ? "You’ve reached the guest limit. Log in to keep chatting."
      : "Sign in to keep your chat history and manage messages.";

    authNote.textContent = authHard
      ? "Guest limit reached."
      : "Tip: you can continue as guest, but limits apply.";

    authDismiss.style.display = authHard ? "none" : "inline-block";

    setVisible(authOverlay, true, "openAuthOverlay");

    if (authHard){
      chatInput.disabled = true;
      sendBtn.disabled = true;
      searchInput.disabled = true;
      setAttachmentUiDisabled(true);
      updateDeleteButtonState(true);
    }
  }

  function closeAuthOverlay(arg){
    const opts = (arg && typeof arg === "object" && "preventDefault" in arg) ? {} : (arg || {});
    const force = !!opts.force;
    const reason = opts.reason || "closeAuthOverlay";
    if (authHard && !force) return;
    logDebug("closeAuthOverlay:start", authOverlay, { force, reason });
    setVisible(authOverlay, false, reason);
    if (force && authHard){
      chatInput.disabled = false;
      sendBtn.disabled = false;
      searchInput.disabled = false;
      setAttachmentUiDisabled(false);
      updateDeleteButtonState(false);
    }
  }

  /* ===============================
     Confirm delete-all overlay
  ================================ */
  function openConfirm(){
    logDebug("openConfirm:start", confirmOverlay);
    setVisible(confirmOverlay, true, "openConfirm");
  }
  function closeConfirm(reason){
    const why = (typeof reason === "string") ? reason : "closeConfirm";
    logDebug("closeConfirm:start", confirmOverlay);
    setVisible(confirmOverlay, false, why);
  }

  /* ===============================
     Logout overlay (custom)
  ================================ */
  function openLogoutPrompt(){
    logDebug("openLogoutPrompt:start", logoutOverlay);
    setVisible(logoutOverlay, true, "openLogoutPrompt");
  }
  function closeLogoutPrompt(reason){
    const why = (typeof reason === "string") ? reason : "closeLogoutPrompt";
    logDebug("closeLogoutPrompt:start", logoutOverlay);
    setVisible(logoutOverlay, false, why);
  }

  logoutNo.addEventListener("click", closeLogoutPrompt);
  logoutOverlay.addEventListener("click", (e)=>{ if (e.target === logoutOverlay) closeLogoutPrompt(); });

  /* ===============================
     OAuth popup login
  ================================ */
  function openOAuthPopup(authStartUrl, popupName){
    const returnTo = window.location.origin;
    const w = 480, h = 720;
    const y = Math.max(0, (window.screenY || 0) + ((window.outerHeight - h) / 2));
    const x = Math.max(0, (window.screenX || 0) + ((window.outerWidth - w) / 2));

    const url = authStartUrl + "?returnTo=" + encodeURIComponent(returnTo);
    const popup = window.open(
      url,
      popupName,
      "popup=yes,width=" + w + ",height=" + h + ",left=" + Math.round(x) + ",top=" + Math.round(y)
    );

    if (!popup){
      window.location.href = url;
      return;
    }
    try{ popup.focus(); }catch{}
  }

  function openDiscordLoginPopup(){ openOAuthPopup(AUTH_DISCORD_START, "valki_discord_login"); }
  function openGoogleLoginPopup(){ openOAuthPopup(AUTH_GOOGLE_START,  "valki_google_login"); }

  async function importGuestIntoAccount(authToken){
    try{
      if (!Array.isArray(guestHistory) || !guestHistory.length) return;

      const payload = {
        messages: guestHistory.slice(-80).map(m => ({
          role: (m.type === "bot") ? "assistant" : "user",
          content: String(m.text || "")
        }))
      };

      await fetch(API_IMPORT_GUEST, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:"Bearer " + authToken
        },
        body: JSON.stringify(payload)
      }).catch(()=>{});

      guestHistory = [];
      clearGuestHistory();
    }catch(e){
      console.warn("Guest import failed (non-fatal):", e);
    }
  }

  const BACKEND_ORIGIN = new URL(BASE_URL).origin;

  window.addEventListener("message", async (ev)=>{
    if (ev.origin !== BACKEND_ORIGIN) return;
    const data = ev.data;
    if (!data || typeof data !== "object") return;
    if (data.type !== "valki_auth") return;
    if (!data.token) return;

    setAuthToken(data.token);

    await fetchMe();
    updateSessionLabel();
    updateLoginOutButtonLabel();

    resetGuestMeter();

    chatInput.disabled = false;
    sendBtn.disabled = false;
    searchInput.disabled = false;
    setAttachmentUiDisabled(false);

    authHard = false;
    setVisible(authOverlay, false, "auth-message-close");

    await importGuestIntoAccount(data.token);
    await loadLoggedInMessagesToUI({ forceOpen:true });
  });

  loginDiscordBtn.addEventListener("click", openDiscordLoginPopup);
  loginGoogleBtn.addEventListener("click", openGoogleLoginPopup);
  joinDiscordBtn.addEventListener("click", ()=> window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer"));
  authDismiss.addEventListener("click", closeAuthOverlay);
  authOverlay.addEventListener("click", (e)=>{ if (e.target === authOverlay) closeAuthOverlay(); });
  if (cookiePrefsBtn){
    cookiePrefsBtn.addEventListener("click", ()=>{
      if (typeof window.openCookiePrefsSafe === "function"){
        window.openCookiePrefsSafe();
      }
    });
  }

  /* ===============================
     Load messages (logged-in)
  ================================ */
  async function loadLoggedInMessagesToUI({ forceOpen=false } = {}){
    const tok = getAuthToken();
    if (!tok) return false;

    try{
      const r = await fetch(API_MESSAGES, { headers:{ Authorization:"Bearer " + tok } });
      if (r.status === 401){
        clearAuthToken();
        me = null;
        updateSessionLabel();
        updateLoginOutButtonLabel();
        return false;
      }
      if (!r.ok) return false;

      const j = await r.json().catch(()=>null);
      if (!j || !Array.isArray(j.messages)) return false;

      clearMessagesUI();
      for (const m of j.messages){
        const type = (m.role === "assistant") ? "bot" : "user";
        const text = typeof m.message === "string"
          ? m.message
          : (typeof m.content === "string" ? m.content : "");
        const images = sanitizeImagesList(
          Array.isArray(m.images)
            ? m.images
            : (Array.isArray(m.attachments) ? m.attachments : undefined)
        );
        await addMessage({ type, text, images });
      }

      scrollToBottom(true);
      updateDeleteButtonVisibility();
      updateHeroState();
      removePrivacyNotice();

      if (forceOpen && !isChatOpen()) openOverlay();
      return true;
    }catch(e){
      console.warn("loadLoggedInMessagesToUI failed (non-fatal)", e);
      return false;
    }
  }

  /* ===============================
     Delete-all semantics
  ================================ */
  async function clearChatAll(){
    if (isLoggedIn()){
      const tok = getAuthToken();
      try{
        const r = await fetch(API_CLEAR, { method:"POST", headers:{ Authorization:"Bearer " + tok } });
        if (r.ok){
          await loadLoggedInMessagesToUI();
          return;
        }
      }catch{}
      clearMessagesUI();
      removePrivacyNotice();
      return;
    }

    guestHistory = [];
    saveGuestHistory(guestHistory);
    await renderGuestHistoryToUI();
  }

  async function logout(){
    clearAuthToken();
    me = null;

    updateSessionLabel();
    updateLoginOutButtonLabel();

    chatInput.disabled = false;
    sendBtn.disabled = false;
    searchInput.disabled = false;
    setAttachmentUiDisabled(false);

    clearAttachments();
    showAttachTray();

    guestHistory = [];
    clearGuestHistory();
    resetGuestMeter();

    clearMessagesUI();
    await renderGuestHistoryToUI();
  }

  logoutYes.addEventListener("click", async ()=>{
    closeLogoutPrompt();
    await logout();
  });

  /* ===============================
     Render guest history
  ================================ */
  async function renderGuestHistoryToUI(){
    clearMessagesUI();
    for (const m of guestHistory){
      await addMessage({ type:m.type, text:m.text, images:m.images });
    }
    scrollToBottom(true);
    updateDeleteButtonVisibility();
    updateHeroState();
    showPrivacyNoticeIfNeeded();
  }

  /* ===============================
     Call Valki
  ================================ */
  let isSending = false;

  function getClientId(){
    try{
      const existing = localStorage.getItem(CLIENT_ID_KEY);
      if (existing) return existing;
    }catch{}
    const id = genId("valk-client");
    try{ localStorage.setItem(CLIENT_ID_KEY, id); }catch{}
    return id;
  }
  const clientId = getClientId();

  function setSendingState(on){
    sendBtn.disabled = !!on || chatInput.disabled;
    setAttachmentUiDisabled(!!on);
    updateDeleteButtonState(!!on);
  }

  async function askValki(text){
    if (isSending) return;
    const q = cleanText(text);
    const attachmentsSnapshot = attachments.slice();
    const hasImages = attachmentsSnapshot.length > 0;
    if (!q && !hasImages) return;

    if (DEBUG){
      console.log("[VALKI][send] attachments:start", {
        count: attachmentsSnapshot.length,
        urls: attachmentsSnapshot.map(a => String(a && a.url || ""))
      });
    }

    if (guestHardBlocked()){
      openAuthOverlay({ hard:true });
      return;
    }

    isSending = true;
    setSendingState(true);

    const imagesForUi = attachmentsSnapshot
      .filter(a => a && a.url)
      .map(a => ({
        url: a.url,
        name: a.name,
        type: a.type,
        size: a.size
      }));
    const normalizedImagesForHistory = normalizeImagesPayload(
      attachmentsSnapshot.map(a => ({
        url: String(a.url || ""),
        name: String(a.name || "image"),
        type: String(a.type || "image/jpeg")
      })).filter(x => x.url && !x.url.startsWith("data:"))
    );

    const messageText = q || (hasImages ? "[image]" : "");

    await addMessage({ type:"user", text:messageText, images: imagesForUi });

    if (!isLoggedIn()){
      guestHistory.push({ type:"user", text:messageText, images: normalizedImagesForHistory });
      saveGuestHistory(guestHistory);
      bumpGuestCount();
    }

    const typingRow = createTypingRow();

    const imagesForSend = attachmentsSnapshot.map(a => ({
      url: String(a.url || ""),
      name: String(a.name || "image"),
      type: String(a.type || "image/jpeg")
    })).filter(x => x.url && !x.url.startsWith("data:"));
    const normalizedImagesForSend = normalizeImagesPayload(imagesForSend);

    if (DEBUG){
      console.log("[VALKI][send] imagesForSend", imagesForSend);
      console.log("[VALKI][send] normalizedImagesForSend", normalizedImagesForSend);
    }

    const payload = {
      message: messageText,
      clientId,
      images: normalizedImagesForSend
    };

    if (DEBUG){
      try{
        const hosts = normalizedImagesForSend.map((img)=>{
          try{
            return new URL(img.url, window.location.href).host || "";
          }catch{
            return "";
          }
        }).filter(Boolean);
        const lengths = normalizedImagesForSend.map(img => (img.url ? img.url.length : 0));
        console.log("[widget] sending images", {
          imagesLen: normalizedImagesForSend.length,
          hosts,
          lengths
        });
      }catch{}
    }

    const headers = { "Content-Type":"application/json" };
    const tok = getAuthToken();
    if (tok) headers.Authorization = "Bearer " + tok;

    try{
      const body = buildSafeJsonBody(payload);
      if (DEBUG){
        console.log("[VALKI][send] payload", {
          length: typeof body === "string" ? body.length : 0,
          hasImages: typeof body === "string" ? body.includes("\"images\":[{") : false
        });
      }
      const res = await fetch(API_VALKI, {
        method:"POST",
        headers,
        body
      });

      try{ typingRow.remove(); }catch{}

      if (!res.ok){
        let errMsg = MSG_GENERIC_ERROR;
        try{
          const j = await res.json();
          if (j && typeof j.error === "string") errMsg = "ksshh… " + j.error;
        }catch{}
        await addMessage({ type:"bot", text:errMsg });

        if (!isLoggedIn()){
          guestHistory.push({ type:"bot", text:errMsg });
          saveGuestHistory(guestHistory);
          maybePromptLoginAfterSend();
        }
        return;
      }

      const data = await res.json().catch(()=>null);
      const answer = (data && data.reply) ? String(data.reply) : MSG_NO_RESPONSE;

      await addMessage({ type:"bot", text:answer });

      clearAttachments();
      showAttachTray();

      if (!isLoggedIn()){
        guestHistory.push({ type:"bot", text:answer });
        saveGuestHistory(guestHistory);
        maybePromptLoginAfterSend();
      }
    }catch(err){
      console.error(err);
      try{ typingRow.remove(); }catch{}
      await addMessage({ type:"bot", text:MSG_GENERIC_ERROR });

      if (!isLoggedIn()){
        guestHistory.push({ type:"bot", text:MSG_GENERIC_ERROR });
        saveGuestHistory(guestHistory);
        maybePromptLoginAfterSend();
      }
    }finally{
      isSending = false;
      setSendingState(false);

      updateDeleteButtonVisibility();
      clampComposer();
    }
  }

  /* ===============================
     Header actions
  ================================ */
  loginOutBtn.addEventListener("click", ()=>{
    openAuthOverlay({ hard:false });
  });

  deleteAllBtn.addEventListener("click", ()=>{
    if (!hasAnyRealMessages() || isSending) return;
    if (authOverlay.classList.contains("is-visible")) return;
    openConfirm();
  });

  confirmNo.addEventListener("click", closeConfirm);
  confirmOverlay.addEventListener("click", (e)=>{ if (e.target === confirmOverlay) closeConfirm(); });
  confirmYes.addEventListener("click", async ()=>{
    closeConfirm();
    await clearChatAll();
    updateDeleteButtonVisibility();
  });

  /* ===============================
     Search + chat form events
  ================================ */
  searchForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const q = cleanText(searchInput.value);
    if (!q) return;
    searchInput.value = "";
    searchInput.blur();
    openOverlay();
    askValki(q);
  });

  chatForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const q = cleanText(chatInput.value);
    if (!q && attachments.length === 0) return;

    chatInput.value = "";
    clampComposer();
    askValki(q);
  });

  // Enter to send, Shift+Enter newline
  chatInput.addEventListener("keydown", (e)=>{
    if (e.key === "Enter" && !e.shiftKey){
      e.preventDefault();
      chatForm.dispatchEvent(new Event("submit", { cancelable:true, bubbles:true }));
    }
  });

  // Auto-grow on input + paste
  chatInput.addEventListener("input", clampComposer);
  chatInput.addEventListener("paste", ()=> setTimeout(clampComposer, 0));

  // Attachments
  attachBtn.addEventListener("click", ()=>{
    if (chatInput.disabled || isSending) return;
    const stickToBottom = isNearBottom(messagesEl);
    pendingAttachRefocus = stickToBottom;
    if (isiOS){
      blurChatInputSafe("attach-blur");
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          setTimeout(()=>{
            fileInput.click();
          }, 70);
        });
      });
      return;
    }

    fileInput.click();
  });

  fileInput.addEventListener("change", async ()=>{
    const stickToBottom = isiOS ? pendingAttachRefocus : isNearBottom(messagesEl);
    await addFiles(fileInput.files);
    fileInput.value = "";
    clampComposer();
    if (isiOS){
      pendingAttachRefocus = false;
      focusChatInputSafe("attach-refocus", { stickToBottom });
      return;
    }
    pendingAttachRefocus = false;
    if (stickToBottom) scrollToBottom(true);
  });

  closeBtn.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e)=>{ if (e.target === overlay) closeOverlay("backdrop"); });

  document.addEventListener("keydown", (e)=>{
    if (e.key !== "Escape") return;

    if (logoutOverlay.classList.contains("is-visible")){
      closeLogoutPrompt(); return;
    }
    if (confirmOverlay.classList.contains("is-visible")){
      closeConfirm(); return;
    }
    if (authOverlay.classList.contains("is-visible")){
      if (!authHard) closeAuthOverlay();
      return;
    }
    if (isChatOpen()) closeOverlay();
  });

  startTermlyObserver();

  function attachAccountTrigger(el){
    if (!el) return;
    el.addEventListener("click", (e)=>{
      e.preventDefault(); e.stopPropagation();
      if (isLoggedIn()) openLogoutPrompt();
      else openAuthOverlay({ hard:false });
    });
  }
  attachAccountTrigger(headerAvatar);
  attachAccountTrigger(headerTitle);
  attachAccountTrigger(sessionLabel);
  attachAccountTrigger(heroLoginBtn);

  async function openFromBadge(e){
    if (e){ e.preventDefault(); e.stopPropagation(); }
    openOverlay();
    if (isLoggedIn()){
      try{
        await loadLoggedInMessagesToUI({ forceOpen:false });
      }catch{}
      return;
    }
    await renderGuestHistoryToUI();
    if (guestHardBlocked()) openAuthOverlay({ hard:true });
  }
  badge.addEventListener("click", openFromBadge);
  badge.addEventListener("keydown", (e)=>{ if (e.key==="Enter"||e.key===" ") openFromBadge(e); });

  /* ===============================
     Resize / fonts
  ================================ */
  function isEditingInput(){
    const el = document.activeElement;
    return el === chatInput || el === searchInput;
  }

  function handleViewportResize(){
    if (document.activeElement === chatInput) clampComposer();
    scrollToBottom(false);
  }

  window.addEventListener("resize", ()=>{
    if (isEditingInput()) return;
  }, { passive:true });

  window.addEventListener("orientationchange", ()=>{
  }, { passive:true });

  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(()=>{
      if (document.activeElement === chatInput) clampComposer();
    }).catch(()=>{});
  }

  /* ===============================
     Boot
  ================================ */
  (async function boot(){
    await fetchMe();
    updateSessionLabel();
    updateLoginOutButtonLabel();
    setAttachmentUiDisabled(false);

    if (isLoggedIn()){
      await loadLoggedInMessagesToUI({ forceOpen:false });
    } else {
      guestHistory = loadGuestHistory();
      await renderGuestHistoryToUI();
    }

    updateDeleteButtonVisibility();
    updateHeroState();
    clampComposer();
  })();
})();
