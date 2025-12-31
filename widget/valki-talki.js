(() => {
  if (window.__VALKI_TALKI_LOADED__ || document.getElementById('valki-root')) {
    return;
  }
  window.__VALKI_TALKI_LOADED__ = true;

  const ensureViewportFitCover = () => {
    const headEl = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    if (!headEl) return;

    let meta = headEl.querySelector('meta[name="viewport"]');
    const content = (meta && meta.getAttribute('content')) || '';
    const parts = content.split(',').map((p) => p.trim()).filter(Boolean);

    const hasWidth = parts.some((p) => p.startsWith('width='));
    const hasInitialScale = parts.some((p) => p.startsWith('initial-scale'));
    const hasViewportFit = parts.some((p) => p.startsWith('viewport-fit'));

    if (!hasWidth) parts.unshift('width=device-width');
    if (!hasInitialScale) parts.unshift('initial-scale=1');
    if (!hasViewportFit) parts.push('viewport-fit=cover');

    const nextContent = parts.join(', ') || 'width=device-width, initial-scale=1, viewport-fit=cover';

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute('content', nextContent);
      headEl.prepend(meta);
    } else {
      meta.setAttribute('content', nextContent);
    }
  };

  const init = () => {
    if (document.getElementById('valki-root')) return;

    ensureViewportFitCover();

    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-valki-talki', '');
    styleTag.textContent = `:root{
  --bg:#050505;
  --glass-border: rgba(255,255,255,.16);
  --text-main:#f7f7f7;
  --text-muted:#a5a5a5;

  --btn-fill:#d6d6d6;
  --btn-hover-1:#f0f0f0;
  --btn-hover-2:#bebebe;

  --brand-orange:#f15a24;

  --valki-font: system-ui,-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;
  --valki-content-max: 860px;
  --valki-vh: 1vh;
  --valki-vh: 1dvh;
  --valki-chat-pad-bottom: calc(env(safe-area-inset-bottom) + 8px);
}

#valki-bg{
  position:fixed;
  inset:0;
  width:100vw;
  height:calc(var(--valki-vh, 1vh) * 100);
  z-index:0;
  pointer-events:none;
  background:var(--bg);
}

html.valki-chat-open #valki-bg{
  display:none !important;
}

.valki-container{
  width:100%;
  box-sizing:border-box;
}
@media (min-width: 1024px){
  .valki-container{
    max-width:var(--valki-content-max);
    margin:0 auto;
    padding:0 16px;
  }
}

html,body{
  background:var(--bg);
  font-family:var(--valki-font);
  color:var(--text-main);
  margin:0;
  padding:0;
  min-height:calc(var(--valki-vh, 1vh) * 100);
}

html.valki-landing-ready:not(.valki-chat-open),
body.valki-landing-ready:not(.valki-chat-open){
  height:calc(var(--valki-vh, 1vh) * 100);
  overflow:hidden !important;
  overscroll-behavior:none;
}

/* Geen scroll op landing (mobiel) */
@media (max-width: 640px){
  html:not(.valki-chat-open),
  body:not(.valki-chat-open){
    height:100%;
  }

  /* Zorg dat de landing netjes de viewport vult */
  .valki-landing-shell{
    min-height:calc(var(--valki-vh, 1vh) * 100);
    min-height:calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    justify-content:center;
  }
}

/* ===============================
   Selection (ChatGPT-ish)
================================*/
.valki-root ::selection{ background: rgba(140,170,255,.14); }
.valki-root ::-moz-selection{ background: rgba(140,170,255,.14); }

.valki-root .valki-messages ::selection,
.valki-root .valki-chat-input::selection,
.valki-root .valki-search-input::selection{
  background: rgba(241,90,36,.14);
}
.valki-root .valki-messages ::-moz-selection,
.valki-root .valki-chat-input::-moz-selection,
.valki-root .valki-search-input::-moz-selection{
  background: rgba(241,90,36,.14);
}

/* iOS Safari zoom fix + selection best-effort */
@supports (-webkit-touch-callout: none){
  .valki-root input,
  .valki-root textarea{
    font-size:16px; /* prevent iOS auto-zoom */
    -webkit-user-select:text;
    user-select:text;
    -webkit-touch-callout:default;
  }
  .valki-root input::selection,
  .valki-root textarea::selection{
    background: rgba(241,90,36,.18);
    color: inherit;
  }
}

/* ===============================
   ROOT (FULL WIDTH)
================================*/
.valki-root{
  width:100%;
  max-width:none;
  margin:0;
  padding:0;
  min-height:calc(var(--valki-vh, 1vh) * 100);
  min-height:100dvh;
  box-sizing:border-box;
  position:relative;
  z-index:1;
  padding-top:env(safe-area-inset-top);

  display:flex;
  flex-direction:column;
  align-items:center;
}

/* De landing container blijft in het midden */
.valki-landing-shell{
  width:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  min-height:calc(var(--valki-vh, 1vh) * 100);
  min-height:calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  padding:calc(18px + env(safe-area-inset-top)) 0 calc(26px + env(safe-area-inset-bottom));
  box-sizing:border-box;
  gap:18px;
}

/* Tablet/desktop zoals je al had (werkt prima op mobiel/iPad) */
@media (min-width: 641px){
  .valki-landing-shell{
    padding:calc(20px + env(safe-area-inset-top)) 0 calc(32px + env(safe-area-inset-bottom));
    box-sizing:border-box;
  }
}

/* ===============================
   DESKTOP ONLY (grote schermen)
   - signal/hero mag breder
   - search blijft smal
================================*/
@media (min-width: 1024px){
  /* Center écht de landing stack */
  .valki-landing-shell{
    padding:calc(24px + env(safe-area-inset-top)) 0 calc(40px + env(safe-area-inset-bottom));
  }

  /* Signal mag breder (full feel) */
  .valki-signal-lock{
    max-width:1200px;   /* breder dan 960 */
    padding:0 24px;
  }

  /* Landing wrap niet "duwen" naar beneden */
  .valki-landing-wrap{
    padding-top:24px;   /* i.p.v. 40px */
  }

  /* Search blijft smal zoals ChatGPT */
  .valki-search-form{
    max-width:720px; /* blijft smal */
  }
}

/* ===============================
   SIGNAL LOCK
================================*/
.valki-signal-lock{
  font-family:"Inter", system-ui, -apple-system, sans-serif;
  font-size:40px;
  line-height:1.08;
  letter-spacing:-0.01em;
  text-align:center;
  color:#f4f4f4;
  margin:0 auto;
  padding:0;
  max-width:960px;
  -webkit-user-select:none;
  user-select:none;
  -webkit-touch-callout:none;
  caret-color:transparent;
  cursor:default;
}
.valki-signal-line{ display:block; font-weight:500; }
.valki-signal-line.muted{ font-weight:400; color:rgba(255,255,255,0.55); }
@media (max-width:900px){ .valki-signal-lock{ font-size:40px; } }
@media (max-width:640px){ .valki-signal-lock{ font-size:32px; padding:0 14px; } }
@media (max-width:360px){ .valki-signal-lock{ font-size:28px; } }

/* ===============================
   LANDING SEARCH
================================*/
.valki-landing-wrap{
  width:100%;
  max-width:760px;
  margin:0 auto;
  padding:24px 10px 0;
  box-sizing:border-box;
  position:relative;
}

.valki-hero-actions{
  position:fixed;
  top:calc(10px + env(safe-area-inset-top));
  right:12px;
  display:flex;
  align-items:center;
  gap:12px;
  z-index:2;
  transition:opacity .16s ease, transform .16s ease;
}

.valki-hero-logo{
  width:36px;
  height:36px;
  border-radius:50%;
  background:transparent;
  border:none;
  box-shadow:0 10px 24px rgba(0,0,0,.55);
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}

.valki-hero-logo img{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%;
  display:block;
}

.valki-login-btn{
  appearance:none;
  -webkit-appearance:none;
  border:0;
  outline:0;

  padding:10px 22px;
  border-radius:999px;

  font-family:Inter,system-ui,-apple-system,sans-serif;
  font-size:15px;
  font-weight:500;

  background-color:#fff;
  color:#050505;

  cursor:pointer;
  user-select:none;
  -webkit-tap-highlight-color:transparent;

  box-shadow:
    0 8px 22px rgba(0,0,0,.35),
    0 0 0 1px rgba(255,255,255,.15) inset;

  transform:translateZ(0);
  backface-visibility:hidden;
  will-change:transform, box-shadow, background-color;

  transition:
    transform .15s ease,
    box-shadow .15s ease,
    background-color .15s ease;
}

.valki-login-btn:hover{
  transform:translate3d(0,-1px,0);
  background-color:#f2f2f2;
  box-shadow:
    0 12px 30px rgba(0,0,0,.45),
    0 0 0 1px rgba(255,255,255,.25) inset;
}

.valki-login-btn:active{
  transform:translate3d(0,0,0);
  background-color:#e6e6e6;
  box-shadow: 0 6px 16px rgba(0,0,0,.35);
}

.valki-login-btn:focus{ outline:none; }
.valki-login-btn:focus-visible{
  outline:none;
  box-shadow:
    0 8px 22px rgba(0,0,0,.35),
    0 0 0 1px rgba(255,255,255,.15) inset,
    0 0 0 3px rgba(241,90,36,.22);
}

.valki-login-btn[data-state="logout"]{
  background-color:#f4f4f4;
  color:#0f0f0f;
}

html.valki-chat-open .valki-hero-actions,
html.valki-chat-open .valki-login-btn{
  opacity:0;
  pointer-events:none;
  transform:translateY(-6px);
}

.valki-search-form{ width:100%; max-width:720px; margin:0 auto; padding: 0 14px; box-sizing:border-box; }

.valki-hero-actions + .valki-search-form{ margin-top:4px; }

@media (max-width:640px){
  .valki-landing-wrap{
    padding:16px 10px 0;
  }
  .valki-hero-logo{ width:32px; height:32px; }
  .valki-login-btn{ font-size:14px; padding:9px 20px; }
}

@media (prefers-reduced-motion: reduce){
  .valki-login-btn,
  .valki-hero-actions{
    transition:none;
  }
}

.valki-search-inner{
  position:relative;
  display:flex;
  align-items:center;
  gap:10px;
  padding:0 14px;
  height:56px;
  border-radius:999px;
  background:#101010;
  box-shadow:0 22px 45px rgba(0,0,0,.85);
  border:1px solid var(--glass-border);
  margin-top:14px;
}

.valki-search-icon{
  filter:grayscale(100%);
  font-size:18px;
  opacity:.9;
  flex:0 0 auto;
}

.valki-search-input{
  flex:1 1 auto;
  min-width:0;
  font-size:16px;
  font-family:var(--valki-font);
  background:transparent;
  border:none;
  outline:none;
  color:#f2f2f2;
  caret-color: var(--btn-fill);
  -webkit-user-select:text;
  user-select:text;
}
.valki-search-input::placeholder{ color:#555; }

.valki-search-button{
  flex:0 0 auto;
  width:42px;height:42px;border-radius:999px;
  border:none;
  cursor:pointer;

  background-color:var(--btn-fill);
  color:#050505;

  display:flex; align-items:center; justify-content:center;
  box-shadow:0 4px 10px rgba(0,0,0,.45);
  padding:0; line-height:0;

  transform:translateZ(0);
  backface-visibility:hidden;
  will-change:transform, box-shadow;
  -webkit-tap-highlight-color:transparent;

  transition:transform .15s ease-out, box-shadow .15s ease-out;

  position:relative;
  overflow:hidden;
}
.valki-search-button::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  background:linear-gradient(135deg,var(--btn-hover-1),var(--btn-hover-2));
  opacity:0;
  transition:opacity .15s ease-out;
  pointer-events:none;
}
.valki-search-button svg{
  position:relative; z-index:1;
  display:block; width:20px; height:20px;
}
.valki-search-button:hover{
  transform:translate3d(0,-1px,0);
  box-shadow:0 6px 14px rgba(0,0,0,.55);
}
.valki-search-button:hover::before{ opacity:1; }

/* ===============================
   BADGE
================================*/
.valki-top-badge{
  display:flex;
  align-items:center;
  gap:12px;
  padding:6px 14px;
  border-radius:999px;
  border:1px solid var(--glass-border);
  background:#101010;
  backdrop-filter:blur(12px) saturate(140%);
  font-size:12px;
  width:fit-content;
  margin:12px auto 0;
  cursor:pointer;
  transition:transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.valki-top-badge:hover{
  transform:translateY(-1px);
  box-shadow:0 12px 30px rgba(0,0,0,.8);
  border-color:rgba(255,255,255,.25);
}
.valki-version{ color:var(--text-muted)!important; font-style:italic; }

.valki-pulse-dot{
  width:7px;height:7px;border-radius:999px;
  background:var(--btn-fill);
  animation:valki-pulse 2s infinite;
}
@keyframes valki-pulse{
  0%{ box-shadow:0 0 0 0 rgba(255,255,255,.55); }
  70%{ box-shadow:0 0 0 10px rgba(255,255,255,0); }
  100%{ box-shadow:0 0 0 0 rgba(255,255,255,0); }
}

/* ===============================
   OVERLAYS + MODALS (FULLSCREEN CHAT)
================================*/
#valki-overlay,
#valki-auth-overlay,
#valki-confirm-overlay,
#valki-logout-overlay{
  z-index:2147483000 !important;
}

.valki-overlay,
.valki-auth-overlay,
.valki-confirm-overlay,
.valki-logout-overlay{
  position:fixed; inset:0;
  background:rgba(0,0,0,.88);
  display:none;
  pointer-events:none;
  align-items:center; justify-content:center;
  opacity:0;
  transition:opacity .18s ease-out;
  padding:0 !important; /* IMPORTANT: no card padding; modal can be fullscreen */
  isolation:isolate;
  transform:translate3d(0,0,0);
}

.valki-overlay{
  align-items:stretch;
  justify-content:center;
}

.valki-overlay.is-visible,
.valki-auth-overlay.is-visible,
.valki-confirm-overlay.is-visible,
.valki-logout-overlay.is-visible{
  display:flex;
  opacity:1;
  pointer-events:auto;
}

/* FULLSCREEN chat modal */
.valki-modal{
  width:100vw;
  max-width:none;
  height:calc(var(--valki-vh, 1vh) * 100);
  max-height:none;
  min-height:0;

  background:radial-gradient(circle at top, #101010 0, #050505 60%);
  border-radius:0;
  border:none;
  box-shadow:none;
  overflow:hidden;
  box-sizing:border-box;
  min-width:0;
  min-height:0;

  opacity:0;
  transform:translateY(10px);
  transition:.22s ease-out;
  display:flex;
  flex-direction:column;
  align-items:stretch;
  justify-content:flex-start;
  padding:0 16px;
}
.valki-overlay.is-visible .valki-modal{
  opacity:1;
  transform:translateY(0);
}

/* Hide a specific site header when modal open (kept narrow to avoid CMP clashes) */
html.valki-chat-open .site-header,
html.valki-chat-open header.valki-site-header{
  opacity:0 !important;
  pointer-events:none !important;
  transition:opacity 160ms ease;
}

/* ===============================
   MODAL HEADER (safe-area top)
================================*/
.valki-modal-header{
  padding: calc(10px + env(safe-area-inset-top)) 14px 10px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(to bottom,#111111,#0b0b0b);
  gap:10px;
  width:100%;
  max-width:none;
}
.valki-modal-header-inner{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.valki-header-left{ display:flex; align-items:center; gap:10px; min-width:0; }
.valki-header-avatar{
  width:32px;height:32px;border-radius:999px;
  border:1px solid rgba(255,255,255,.25);
  cursor:pointer;
  flex:0 0 auto;
}
.valki-modal-title-text{ display:flex; flex-direction:column; min-width:0; }
.valki-modal-title-text .name{
  font-weight:600; font-size:15px; cursor:pointer;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
.valki-modal-title-text .session{
  font-size:10px; color:rgba(255,255,255,.45); cursor:pointer;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}

.valki-header-actions{
  display:flex;
  align-items:center;
  gap:8px;
  flex:0 0 auto;
}
.valki-header-actions-left{
  display:flex;
  align-items:center;
  gap:8px;
  flex-direction:row-reverse;
}

.valki-pill{
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  color:#eaeaea;
  font-size:12px;
  padding:6px 10px;
  cursor:pointer;
  transition:transform .12s ease, background .12s ease, border-color .12s ease, opacity .12s ease;
  user-select:none;
}
.valki-pill:hover{
  transform:translateY(-1px);
  background:rgba(255,255,255,.07);
  border-color:rgba(255,255,255,.18);
}
.valki-pill[disabled]{ opacity:.55; pointer-events:none; }
.valki-pill.primary{
  background:linear-gradient(135deg,#fcfcfc,#d8d8d8);
  color:#111;
  border-color:rgba(255,255,255,.25);
}

.valki-close-btn{
  width:30px;height:30px;border-radius:999px;
  border:1px solid var(--glass-border);
  background:#141414;
  cursor:pointer;
  color:#fff;
  font-size:14px;
}

/* ===============================
   CHAT MESSAGES (FULL WIDTH)
================================*/
.valki-messages{
  flex:1 1 auto;
  min-height:0;
  padding:16px 0 10px;
  overflow-y:auto;
  overscroll-behavior:contain;
  background:radial-gradient(circle at top, #101010 0, #050505 60%);
  -webkit-overflow-scrolling:touch;

  scrollbar-width:thin;
  scrollbar-color: rgba(255,255,255,.25) transparent;
  width:100%;
  box-sizing:border-box;
  display:flex;
  justify-content:center;
}
.valki-messages-inner{
  width:100%;
  margin:0 auto;
  padding:0 16px 12px;
}
.valki-messages-inner:empty{ min-height:180px; }

.valki-msg-row{ display:flex; margin:10px 0; }
.valki-msg-row.user{ justify-content:flex-end; }
.valki-msg-row.bot{ justify-content:flex-start; gap:8px; }

.valki-bot-avatar-wrap{ flex:0 0 auto; margin-top:2px; }
.valki-bot-avatar{
  width:24px;height:24px;border-radius:999px;
  border:1px solid rgba(255,255,255,.25);
  cursor:pointer;
}

.valki-msg-bubble{
  max-width:74%;
  padding:11px 16px;
  border-radius:18px;
  line-height:1.6;
  font-size:15px;
  font-family:var(--valki-font);
  white-space:normal;
  word-wrap:break-word;
  position:relative;

  -webkit-user-select:text;
  user-select:text;
}
.valki-msg-row.user .valki-msg-bubble{
  background:#f6f6f6;
  color:#050505;
  border-radius:18px 18px 4px 18px;
  box-shadow:0 10px 24px rgba(0,0,0,.55);
}
.valki-msg-row.bot .valki-msg-bubble{
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.08);
  color:#eaeaea;
  border-radius:18px 18px 18px 4px;
}
.valki-msg-bubble a{ color:var(--brand-orange); text-decoration:none; font-weight:500; }
.valki-msg-bubble a:hover{ text-decoration:underline; }
.valki-msg-bubble code{
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
  font-size:13px;
  background:rgba(255,255,255,.06);
  padding:1px 4px;
  border-radius:4px;
}

/* typing */
.valki-typing-bar{ display:inline-flex; align-items:center; gap:8px; }
.valki-typing-dots{ display:inline-flex; gap:4px; }
.valki-typing-dots span{
  width:6px;height:6px;border-radius:999px;
  background:rgba(255,255,255,.7);
  animation:valki-bounce 1.2s infinite ease-in-out;
}
.valki-typing-dots span:nth-child(2){ animation-delay:.15s; }
.valki-typing-dots span:nth-child(3){ animation-delay:.3s; }
@keyframes valki-bounce{
  0%,60%,100%{ transform:translateY(0); opacity:.5; }
  30%{ transform:translateY(-3px); opacity:1; }
}
.valki-typing-label{ font-size:12px; color:var(--text-muted); }

/* ===============================
   COMPOSER (autogrow + attachments)
================================*/
.valki-chat-form{
  border-top:1px solid rgba(255,255,255,.08);
  background:linear-gradient(to top,#050505,#080808);
  --valki-cookie-reserve: 0px !important;
  padding:12px 0 var(--valki-chat-pad-bottom) !important;
  width:100%;
  margin-top:auto;
}
.valki-chat-form-inner{
  margin:0 auto;
  padding:0 16px;
  box-sizing:border-box;
  position:relative;
}

/* Message pill becomes more ChatGPT-ish on grow */
.valki-chat-inner{
  position:relative;
  display:flex;
  align-items:flex-end;
  gap:10px;
  padding:10px 12px;
  border-radius:22px; /* instead of 999px so it looks good when growing */
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.09);
  backdrop-filter:blur(24px);
  box-shadow:0 16px 40px rgba(0,0,0,.85);
}

/* Attach button */
.valki-chat-attach{
  flex:0 0 auto;
  width:40px;height:40px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06);
  color:#eaeaea;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  transition:transform .12s ease, background .12s ease, opacity .12s ease;
}
.valki-chat-attach:hover{
  transform:translateY(-1px);
  background:rgba(255,255,255,.09);
}
.valki-chat-attach[disabled]{ opacity:.55; pointer-events:none; }

/* textarea */
.valki-chat-input{
  flex:1; min-width:0;
  border:none; outline:none;
  background:transparent;
  color:#e6e6e6;
  font-size:16px;
  font-family:var(--valki-font);
  line-height:1.55;

  resize:none;
  padding:10px 0;
  margin:0;

  overflow-y:hidden;           /* JS flips to auto only when over 4 lines */
  white-space:pre-wrap;        /* nicer wrapping */
  word-break:break-word;

  -webkit-user-select:text;
  user-select:text;
  caret-color: rgba(214,214,214,.95);
}
.valki-chat-input::placeholder{ color:rgba(255,255,255,.22); }

/* textarea scrollbar (when >4 lines) */
.valki-chat-input::-webkit-scrollbar{ width:8px; }
.valki-chat-input::-webkit-scrollbar-track{ background:transparent; }
.valki-chat-input::-webkit-scrollbar-thumb{
  background:linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06));
  border-radius:999px;
  border:2px solid rgba(0,0,0,.55);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), 0 4px 10px rgba(0,0,0,.6);
}
.valki-chat-input::-webkit-scrollbar-thumb:hover{
  background:linear-gradient(180deg, rgba(241,90,36,.65), rgba(241,90,36,.35));
}

.valki-chat-send{
  flex:0 0 auto;
  width:44px;height:44px;border-radius:50%;
  border:1px solid rgba(255,255,255,.12);
  cursor:pointer;

  background-color:#eaeaea;
  color:#111;

  display:flex; align-items:center; justify-content:center;
  padding:0; line-height:0;
  box-shadow:0 4px 10px rgba(0,0,0,.35);

  transform:translateZ(0);
  backface-visibility:hidden;
  will-change:transform, box-shadow, filter;
  -webkit-tap-highlight-color:transparent;

  transition:transform .15s ease, box-shadow .15s ease, filter .15s ease, opacity .15s ease;

  position:relative;
  overflow:hidden;
}
.valki-chat-send::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  background:linear-gradient(135deg,#ffffff,#e6e6e6);
  opacity:0;
  transition:opacity .15s ease;
  pointer-events:none;
}
.valki-chat-send svg{ position:relative; z-index:1; display:block; width:24px; height:24px; }

.valki-chat-send:hover{
  transform:translate3d(0,-1px,0);
  box-shadow:0 6px 15px rgba(0,0,0,.45);
}
.valki-chat-send:hover::before{ opacity:1; }
.valki-chat-send:active{ transform:translate3d(0,0,0); }
.valki-chat-send[disabled]{ opacity:.55; cursor:default; pointer-events:none; }

/* Attachments tray */
.valki-attachments{
  margin:8px auto 0;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  padding:0 16px;
  box-sizing:border-box;
}
.valki-attachment{
  position:relative;
  width:72px;height:72px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  overflow:hidden;
  box-shadow:0 10px 24px rgba(0,0,0,.35);
}
.valki-attachment img{
  width:100%;height:100%;
  object-fit:cover;
  display:block;
}
.valki-attachment-remove{
  position:absolute;
  top:6px;right:6px;
  width:22px;height:22px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(0,0,0,.55);
  color:#fff;
  cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:14px;
}

/* disclaimer */
.valki-disclaimer{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:6px;
  text-align:center;
  font-size:11px;
  line-height:1.4;
  letter-spacing:.02em;
  color:rgba(200,200,200,.75);
  opacity:.92;
  font-family:var(--valki-font);
  margin:4px auto 0 !important;
  padding:0 16px 0 !important;
}
.valki-disclaimer-button{
  background:none;
  border:none;
  padding:0;
  margin:0;
  font:inherit;
  color:#d0d0d0;
  cursor:pointer;
  pointer-events:auto;
}
.valki-disclaimer-button:hover{ text-decoration:underline; }

/* ===============================
   Auth + Confirm modals (unchanged style)
================================*/
.valki-auth-modal,
.valki-confirm-modal{
  width:92%;
  max-width:420px;
  border-radius:22px;
  background:radial-gradient(circle at top, #262626 0, #050505 65%);
  box-shadow:0 18px 40px rgba(0,0,0,.9), 0 0 0 1px rgba(255,255,255,.07);
  text-align:center;
  font-family:var(--valki-font);
}

.valki-auth-modal{ padding:26px 26px 22px; }
.valki-confirm-modal{ padding:22px 22px 18px; }

.valki-auth-header{ display:flex; justify-content:center; margin-bottom:10px; }
.valki-auth-avatar{ width:54px;height:54px;border-radius:999px;border:1px solid rgba(255,255,255,.25); }

.valki-auth-title{
  margin:6px 0 6px;
  font-size:20px;
  font-weight:600;
  color:#fff;
}
.valki-auth-subtitle{
  margin:0 0 16px;
  font-size:14px;
  color:#b9b9b9;
  line-height:1.45;
}
.valki-auth-buttons{ display:flex; flex-direction:column; gap:10px; }

.valki-auth-note{
  margin-top:12px;
  font-size:11px;
  color:rgba(200,200,200,.55);
}
.valki-auth-dismiss{
  margin-top:10px;
  display:inline-block;
  font-size:12px;
  color:rgba(255,255,255,.65);
  cursor:pointer;
  user-select:none;
}
.valki-auth-dismiss:hover{ text-decoration:underline; }

.valki-confirm-title{
  margin:0 0 8px;
  font-size:18px;
  font-weight:650;
  color:#fff;
}
.valki-confirm-sub{
  margin:0 0 14px;
  font-size:13px;
  color:#b9b9b9;
  line-height:1.45;
}
.valki-confirm-actions{
  display:flex;
  gap:10px;
  justify-content:center;
}

.valki-confirm-btn{
  flex:1;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.15);

  background-color:#1f1f1f;
  color:#fff;

  padding:10px 12px;
  font-size:14px;
  cursor:pointer;

  transform:translateZ(0);
  backface-visibility:hidden;
  -webkit-tap-highlight-color:transparent;

  transition:background-color .15s ease, transform .15s ease, opacity .15s ease, box-shadow .15s ease;

  position:relative;
  overflow:hidden;

  isolation:isolate;
  z-index:0;
  -webkit-text-fill-color: currentColor;
}
.valki-confirm-btn:hover{
  background-color:#2a2a2a;
  transform:translate3d(0,-1px,0);
}
.valki-confirm-btn:active{ transform:translate3d(0,0,0); }

.valki-confirm-btn > span,
.valki-confirm-btn > *{
  position:relative;
  z-index:2;
}

.valki-confirm-btn.danger{
  background-color:var(--btn-fill);
  border-color:var(--btn-fill);
  color:#050505 !important;
  -webkit-text-fill-color:#050505 !important;
}
.valki-confirm-btn.danger::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  background:linear-gradient(135deg,var(--btn-hover-1),var(--btn-hover-2));
  opacity:0;
  transition:opacity .15s ease;
}
.valki-confirm-btn.danger:hover::before{ opacity:1; }

/* ===============================
   Valki scrollbars (messages)
================================*/
.valki-messages::-webkit-scrollbar{ width:8px; }
.valki-messages::-webkit-scrollbar-track{ background:transparent; }
.valki-messages::-webkit-scrollbar-thumb{
  background:linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06));
  border-radius:999px;
  border:2px solid rgba(0,0,0,.55);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), 0 4px 10px rgba(0,0,0,.6);
}
.valki-messages::-webkit-scrollbar-thumb:hover{
  background:linear-gradient(180deg, rgba(241,90,36,.65), rgba(241,90,36,.35));
}

/* ===============================
   Auth buttons
================================*/
.valki-auth-btn{
  width:100%;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.15);
  color:#fff;
  padding:11px 14px;
  font-size:15px;
  cursor:pointer;

  position:relative;
  overflow:hidden;
  -webkit-tap-highlight-color:transparent;
  outline:none !important;

  background-color:#1f1f1f !important;

  transform:translateZ(0);
  backface-visibility:hidden;
  transition:transform .15s ease, border-color .15s ease;

  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
}
.valki-auth-btn::before{
  content:"";
  position:absolute;
  inset:0;
  background:rgba(255,255,255,.06);
  opacity:0;
  transition:opacity .15s ease;
  pointer-events:none;
}
.valki-auth-btn:hover{
  transform:translateY(-1px);
  border-color:rgba(255,255,255,.22);
}
.valki-auth-btn:hover::before{ opacity:1; }
.valki-auth-btn:active{ transform:translateY(0); }
.valki-auth-btn:focus-visible{ box-shadow:0 0 0 2px rgba(241,90,36,.28) !important; }

.valki-auth-btn.primary{
  background-color:var(--btn-fill) !important;
  border-color:var(--btn-fill) !important;
  color:#050505 !important;
}
.valki-auth-btn.primary::before{ background:rgba(0,0,0,.06); }
.valki-auth-btn.primary:hover{ background-color:#e9e9e9 !important; }

.valki-auth-icon{
  width:16px;
  height:16px;
  flex:0 0 auto;
  display:inline-block;
}
.valki-auth-icon svg{
  width:16px;
  height:16px;
  display:block;
}

.valki-msg-bubble img.valki-inline-img{
  display:block;
  max-width:100%;
  height:auto;
  border-radius:14px;
  margin-top:8px;
  border:1px solid rgba(255,255,255,.10);
  cursor:pointer;
  object-fit:contain;
}
.valki-msg-bubble .valki-img-grid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap:8px;
  margin-top:8px;
}
@media (max-width:640px){
  .valki-msg-bubble .valki-img-grid{
    grid-template-columns: 1fr;
  }
}

/* Mobile tweaks */
@media (max-width:640px){
  .valki-search-inner{ height:52px; padding:0 12px; }
  .valki-search-button{ width:38px; height:38px; }
  .valki-chat-inner{ padding:8px 10px; }
  .valki-chat-send{ width:38px; height:38px; }
  .valki-chat-attach{ width:38px; height:38px; }
}
}`;
    (document.head || document.getElementsByTagName('head')[0] || document.documentElement).appendChild(styleTag);

    const headEl = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
    if (!headEl.querySelector('link[data-valki-inter-preconnect]')){
      const preconnect = document.createElement('link');
      preconnect.setAttribute('rel','preconnect');
      preconnect.setAttribute('href','https://fonts.googleapis.com');
      preconnect.setAttribute('data-valki-inter-preconnect','');
      headEl.appendChild(preconnect);
    }
    if (!headEl.querySelector('link[data-valki-inter-preconnect-gstatic]')){
      const preconnectGstatic = document.createElement('link');
      preconnectGstatic.setAttribute('rel','preconnect');
      preconnectGstatic.setAttribute('href','https://fonts.gstatic.com');
      preconnectGstatic.setAttribute('crossorigin','');
      preconnectGstatic.setAttribute('data-valki-inter-preconnect-gstatic','');
      headEl.appendChild(preconnectGstatic);
    }
    if (!headEl.querySelector('link[data-valki-inter-css]')){
      const interLink = document.createElement('link');
      interLink.setAttribute('rel','stylesheet');
      interLink.setAttribute('href','https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      interLink.setAttribute('data-valki-inter-css','');
      headEl.appendChild(interLink);
    }

    const container = document.createElement('div');
    container.innerHTML = `<canvas id="valki-bg" aria-hidden="true"></canvas>
<div class="valki-root" id="valki-root">
  <div class="valki-landing-shell">
    <!-- Valki Signal Lock -->
    <div class="valki-signal-lock" id="valki-signal-lock" aria-label="Valki Talki. Web3.">
      <div class="valki-signal-line" id="line-main">Crypto Stuck?</div>
      <div class="valki-signal-line muted" id="line-sub">Explained.</div>
    </div>

    <!-- Landing search -->
    <div class="valki-landing-wrap">
      <div class="valki-hero-actions" id="valki-hero-actions">
        <div class="valki-hero-logo" aria-hidden="true">
          <img src="https://valki.wiki/blogmedia/Valki%20Talki.jpg" alt="" loading="lazy" />
        </div>
        <button class="valki-login-btn" id="valki-hero-login-btn" type="button">Login</button>
      </div>

      <form id="valki-search-form" class="valki-search-form" autocomplete="off">
        <div class="valki-search-inner">
          <span class="valki-search-icon" aria-hidden="true">🔎</span>

          <input
            id="valki-search-input"
            class="valki-search-input"
            type="text"
            autocomplete="off"
            placeholder=""
            aria-label="Ask Valki"
            enterkeyhint="send"
          />

          <button class="valki-search-button" type="submit" aria-label="Ask Valki">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 19V5"></path>
              <path d="M5 12l7-7 7 7"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>

    <!-- Badge -->
    <div class="valki-top-badge" id="valki-top-badge" role="button" tabindex="0" aria-label="Open Valki">
      <span class="valki-pulse-dot" aria-hidden="true"></span>
      <span>Valki Talki • <span class="valki-version">v2.0</span></span>
    </div>
  </div>

  <!-- Chat overlay -->
  <div id="valki-overlay" class="valki-overlay" aria-hidden="true">
    <div class="valki-modal" role="dialog" aria-modal="true" aria-labelledby="valki-title">
      <div class="valki-modal-header">
        <div class="valki-modal-header-inner valki-container">
          <div class="valki-header-left">
            <img class="valki-header-avatar" id="valki-header-avatar" src="https://valki.wiki/blogmedia/Valki%20Talki.jpg" alt="Valki avatar" />
            <div class="valki-modal-title-text">
              <span class="name" id="valki-title">Valki Talki</span>
              <span class="session" id="valki-session-label">Valki-session-new</span>
            </div>
          </div>

          <div class="valki-header-actions">
            <div class="valki-header-actions-left">
              <button class="valki-pill primary" id="valki-loginout-btn" type="button" title="Login">Login</button>
              <button class="valki-pill" id="valki-deleteall-btn" type="button" title="Delete all messages">Delete</button>
            </div>
            <button id="valki-close" class="valki-close-btn" type="button" aria-label="Close chat">✕</button>
          </div>
        </div>
      </div>

      <div id="valki-messages" class="valki-messages" role="log" aria-live="polite">
        <div class="valki-messages-inner valki-container" id="valki-messages-inner"></div>
      </div>

      <form id="valki-chat-form" class="valki-chat-form" autocomplete="off">
        <div class="valki-chat-form-inner valki-container">
          <div class="valki-chat-inner">
            <!-- Attach button -->
            <button class="valki-chat-attach" id="valki-chat-attach" type="button" aria-label="Upload image">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.9-9.9a4 4 0 015.66 5.66l-9.9 9.9a2 2 0 01-2.83-2.83l9.19-9.19"></path>
              </svg>
            </button>

            <!-- hidden file input -->
            <input
              id="valki-file-input"
              type="file"
              accept="image/jpeg,image/png"
              multiple
              style="display:none"
            />

            <textarea
              id="valki-chat-input"
              class="valki-chat-input"
              rows="1"
              placeholder="Message Valki (text optional with images)"
              aria-label="Message Valki"
              enterkeyhint="send"
            ></textarea>

            <button class="valki-chat-send" id="valki-chat-send" type="submit" aria-label="Send message">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 19V5"></path>
                <path d="M5 12l7-7 7 7"></path>
              </svg>
            </button>
          </div>

          <!-- Attachments preview tray -->
          <div class="valki-attachments valki-container" id="valki-attachments" aria-label="Attachments" style="display:none;"></div>

          <div class="valki-disclaimer valki-container">
            <div>Valki signals may distort. Verify info.</div>
            <button
              type="button"
              class="valki-disclaimer-button"
              onclick="if (typeof openCookiePrefsSafe === 'function') { openCookiePrefsSafe(); }"
            >
              See cookie preferences.
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <!-- Auth / Login overlay -->
  <div id="valki-auth-overlay" class="valki-auth-overlay" aria-hidden="true">
    <div class="valki-auth-modal" role="dialog" aria-modal="true" aria-label="Login required">
      <div class="valki-auth-header">
        <img src="https://valki.wiki/blogmedia/Valki%20Talki.jpg" class="valki-auth-avatar" alt="Valki avatar" />
      </div>

      <h2 class="valki-auth-title" id="valki-auth-title">Log in to continue</h2>
      <p class="valki-auth-subtitle" id="valki-auth-subtitle">Sign in to keep your chat history and manage messages.</p>

      <div class="valki-auth-buttons">
        <button type="button" class="valki-auth-btn primary" id="valki-login-discord-btn">
          <span class="valki-auth-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.3 4.7a19.6 19.6 0 0 0-4.9-1.5l-.2.3c1.8.5 2.6 1.2 2.6 1.2a16.4 16.4 0 0 0-5.8-1.8 16.4 16.4 0 0 0-5.8 1.8s.8-.7 2.6-1.2l-.2-.3A19.6 19.6 0 0 0 3.7 4.7C1.4 8 1 11 1 14c1.4 2.1 3.5 3.4 5.7 4 .4-.6.9-1.4 1.2-2.1-.7-.3-1.4-.6-2-.9l.5-.4c1.2.6 2.5 1 3.8 1.2a15 15 0 0 0 3.6 0c1.3-.2 2.6-.6 3.8-1.2l.5.4c-.6.3-1.3.6-2 .9.4.8.8 1.5 1.2 2.1 2.2-.6 4.3-1.9 5.7-4 0-3-.4-6-2.7-9.3ZM9 13.4c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.4-1.4 1.6Zm6 0c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.4-1.4 1.6Z"></path>
            </svg>
          </span>
          <span>Continue with Discord</span>
        </button>

        <button type="button" class="valki-auth-btn" id="valki-login-google-btn">
          <span class="valki-auth-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.3 14.8 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c5.9 0 9.8-4.1 9.8-9.8 0-.7-.1-1.2-.2-1.8H12z"></path>
            </svg>
          </span>
          <span>Continue with Google</span>
        </button>

        <button type="button" class="valki-auth-btn" id="valki-join-discord-btn">Join Discord server</button>
      </div>

      <div class="valki-auth-note" id="valki-auth-note">Guest limits apply.</div>
      <div class="valki-auth-dismiss" id="valki-auth-dismiss">Not now</div>
    </div>
  </div>

  <!-- Confirm delete all -->
  <div id="valki-confirm-overlay" class="valki-confirm-overlay" aria-hidden="true">
    <div class="valki-confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm delete">
      <h3 class="valki-confirm-title">Delete all messages?</h3>
      <p class="valki-confirm-sub">This will remove your chat history for this session.</p>
      <div class="valki-confirm-actions">
        <button type="button" class="valki-confirm-btn" id="valki-confirm-no"><span>No</span></button>
        <button type="button" class="valki-confirm-btn danger" id="valki-confirm-yes"><span>Yes, delete</span></button>
      </div>
    </div>
  </div>

  <!-- Confirm logout -->
  <div id="valki-logout-overlay" class="valki-confirm-overlay" aria-hidden="true" style="display:none;">
    <div class="valki-confirm-modal" role="dialog" aria-modal="true" aria-label="Confirm logout">
      <h3 class="valki-confirm-title">Log out?</h3>
      <p class="valki-confirm-sub">You will switch back to guest mode on this device.</p>
      <div class="valki-confirm-actions">
        <button type="button" class="valki-confirm-btn" id="valki-logout-no"><span>Cancel</span></button>
        <button type="button" class="valki-confirm-btn danger" id="valki-logout-yes"><span>Yes, log out</span></button>
      </div>
    </div>
  </div>
</div>`;
    const bgNode = container.querySelector("#valki-bg");
    const root = container.querySelector("#valki-root");
    if (!root) return;

    const mount = document.getElementById('valki-mount') || document.body;
    if (bgNode) mount.appendChild(bgNode);
    mount.appendChild(root);

    const scriptTag = document.createElement('script');
    scriptTag.textContent = `(function(){
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

  const MSG_GENERIC_ERROR = "Something went wrong talking to Valki.";
  const MSG_NO_RESPONSE   = "…krrzzzt… no response received.";

  const CHAT_MAX_LINES = 4;
  const CHAT_PAD_BASE = "var(--valki-chat-pad-bottom)";

  /* Attachments */
  const MAX_FILES = 4;
  const MAX_BYTES = 5 * 1024 * 1024; // 5MB per file (client-side gate)

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
    root, searchForm, searchInput, heroLoginBtn, badge, overlay, closeBtn,
    messagesEl, messagesInner, chatForm, chatInput, sendBtn,
    attachBtn, fileInput, attachTray,
    authOverlay, loginOutBtn, deleteAllBtn,
    loginDiscordBtn, loginGoogleBtn, joinDiscordBtn,
    confirmOverlay, confirmNo, confirmYes,
    logoutOverlay, logoutNo, logoutYes
  ];

  if (required.some(el => !el)) return;

  document.documentElement.classList.add("valki-landing-ready");
  document.body.classList.add("valki-landing-ready");
  bindViewportUnitListeners();

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
      bgCanvas.style.height = "calc(var(--valki-vh, 1vh) * 100)";

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

  const DEBUG = !!window.__VALKI_DEBUG__;
  const overlayCleanupTimers = new WeakMap();

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

  function getViewportHeight(){
    return window.innerHeight ||
      (document.documentElement && document.documentElement.clientHeight) ||
      0;
  }

  function applyViewportUnit(){
    const h = getViewportHeight();
    if (!h) return;
    try{
      document.documentElement.style.setProperty("--valki-vh", (h * 0.01).toFixed(4) + "px");
    }catch{}
  }

  function bindViewportUnitListeners(){
    applyViewportUnit();
  }

  function isNearBottom(el, px=90){
    return (el.scrollHeight - el.scrollTop - el.clientHeight) < px;
  }
  function scrollToBottom(force=false){
    if (force || isNearBottom(messagesEl)) messagesEl.scrollTop = messagesEl.scrollHeight;
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

  const signalCopy = {
    en: ["Crypto Stuck?", "Explained."],
    nl: ["Crypto problemen?", "Uitgelegd."],
    de: ["Fest in Krypto?", "Erklärt."],
    fr: ["Bloqué en crypto ?", "Expliqué."],
    es: ["¿Atascado en cripto?", "Explicado."],
    it: ["Bloccato nel crypto?", "Spiegato."],
    pt: ["Preso no cripto?", "Explicado."],
    pl: ["Utknąłeś w krypto?", "Wyjaśnione."],
    ja: ["暗号資産で行き詰まってる？", "解説します。"],
    zh: ["加密货币卡住了？", "为你解释。"],
    ko: ["크립토에서 막혔나요?", "설명해드립니다."],
    ar: ["عالِق في عالم الكريبتو؟", "نوضّح لك."],
    tr: ["Kriptoda mı takıldın?", "Açıklıyoruz."]
  };

  function pickLocale(){
    const langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || "en"];
    for (const l of langs){
      const lang = String(l).toLowerCase();
      const base = lang.split("-")[0];
      if (searchCopy[lang]) return lang;
      if (searchCopy[base]) return base;
    }
    return "en";
  }

  function applySignalLockLocale(loc){
    if (!signalLock || !signalLineMain || !signalLineSub) return;
    const lang = (loc || "en").toLowerCase().split("-")[0];
    const txt = signalCopy[lang] || signalCopy.en;
    signalLineMain.textContent = txt[0];
    signalLineSub.textContent = txt[1];
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
    applySignalLockLocale(loc);
  }
  applyLocale();
  preventSignalLockCopy();
  window.addEventListener("languagechange", applyLocale);

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
      return true;
    }
    return false;
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
          images: Array.isArray(x.images) ? x.images : (Array.isArray(x.attachments) ? x.attachments : undefined)
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
     Markdown (lazy)
  ================================ */
  let mdReady = false;
  let mdLoading = null;

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function ensureMarkdownLibs(){
    if (mdReady) return;
    if (mdLoading) return mdLoading;
    mdLoading = (async()=>{
      await loadScript("https://cdn.jsdelivr.net/npm/marked/marked.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js");
      mdReady = true;
    })();
    return mdLoading;
  }

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
            const src = img.dataUrl || img.url || img.src;
            const alt = img.name || "uploaded image";
            if (src) return { src:String(src), alt };
            return null;
          }
          if (img) return { src:String(img), alt:"uploaded image" };
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

    // images (dataUrl or url)
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
            window.open(imgData.src, "_blank", "noopener,noreferrer");
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
    if (type === "bot") await ensureMarkdownLibs();
    messagesInner.appendChild(createMessageRow({ type, text, images }));
    scrollToBottom(stick);
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
  function isChatOpen(){ return overlay.classList.contains("is-visible"); }
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
      });
    });
  }

  function closeOverlay(reason){
    const why = (typeof reason === "string") ? reason : "closeOverlay";
    logDebug("closeOverlay:start", overlay);
    setVisible(overlay, false, why);
    unlockBodyScroll();
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
  let attachments = []; // { id, name, type, dataUrl }

  async function showAttachmentError(msg){
    if (!msg) return;
    await addMessage({ type:"bot", text:msg });
    if (!isLoggedIn()){
      guestHistory.push({ type:"bot", text:msg });
      saveGuestHistory(guestHistory);
    }
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
      img.src = a.dataUrl;
      img.alt = a.name || "attachment";

      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "valki-attachment-remove";
      rm.textContent = "×";
      rm.addEventListener("click", ()=>{
        attachments = attachments.filter(x => x.id !== a.id);
        showAttachTray();
        clampComposer();
      });

      wrap.appendChild(img);
      wrap.appendChild(rm);
      attachTray.appendChild(wrap);
    }
  }

  function readFileAsDataURL(file){
    return new Promise((resolve, reject)=>{
      const r = new FileReader();
      r.onload = ()=> resolve(String(r.result || ""));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
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

      const dataUrl = await readFileAsDataURL(f).catch(()=> "");
      if (!dataUrl){
        errors.add("Could not load " + (f.name || "image") + ".");
        continue;
      }

      attachments.push({
        id: genId("att"),
        name: f.name || "image",
        type: t,
        dataUrl
      });
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

  /* ===============================
     Load messages (logged-in)
  ================================ */
  async function loadLoggedInMessagesToUI({ forceOpen=false } = {}){
    const tok = getAuthToken();
    if (!tok) return false;

    try{
      const r = await fetch(API_MESSAGES, { headers:{ Authorization:"Bearer " + tok } });
      if (!r.ok) return false;

      const j = await r.json().catch(()=>null);
      if (!j || !Array.isArray(j.messages)) return false;

      clearMessagesUI();
      for (const m of j.messages){
        const type = (m.role === "assistant") ? "bot" : "user";
        const text = typeof m.message === "string"
          ? m.message
          : (typeof m.content === "string" ? m.content : "");
        const images = Array.isArray(m.images)
          ? m.images
          : (Array.isArray(m.attachments) ? m.attachments : undefined);
        await addMessage({ type, text, images });
      }

      scrollToBottom(true);
      updateDeleteButtonVisibility();
      updateHeroState();

      if (forceOpen && !isChatOpen()) openOverlay();
      return true;
    }catch{
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
      return;
    }

    guestHistory = [];
    saveGuestHistory(guestHistory);
    clearMessagesUI();
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

    attachments = [];
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
    const hasImages = attachments.length > 0;
    if (!q && !hasImages) return;

    if (guestHardBlocked()){
      openAuthOverlay({ hard:true });
      return;
    }

    isSending = true;
    setSendingState(true);

    const imagesForSend = attachments.map(a => ({
      name: a.name,
      type: a.type,
      dataUrl: a.dataUrl
    }));

    const messageText = q || (hasImages ? "[image]" : "");

    await addMessage({ type:"user", text:messageText, images: imagesForSend });

    if (!isLoggedIn()){
      guestHistory.push({ type:"user", text:messageText, images: imagesForSend });
      saveGuestHistory(guestHistory);
      bumpGuestCount();
    }

    const typingRow = createTypingRow();

    const payload = {
      message: messageText,
      clientId,
      images: imagesForSend
    };
    if (imagesForSend.length){
      payload.attachments = imagesForSend;
    }

    const headers = { "Content-Type":"application/json" };
    const tok = getAuthToken();
    if (tok) headers.Authorization = "Bearer " + tok;

    try{
      const res = await fetch(API_VALKI, {
        method:"POST",
        headers,
        body: JSON.stringify(payload)
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

      // clear attachments after send attempt
      attachments = [];
      showAttachTray();

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
    fileInput.click();
  });

  fileInput.addEventListener("change", async ()=>{
    await addFiles(fileInput.files);
    fileInput.value = "";
    clampComposer();
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
    if (isLoggedIn()){
      await loadLoggedInMessagesToUI({ forceOpen:true });
      return;
    }
    openOverlay();
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
    applyViewportUnit();
    if (document.activeElement === chatInput) clampComposer();
    scrollToBottom(false);
  }

  window.addEventListener("resize", ()=>{
    if (isEditingInput()) return;
    applyViewportUnit();
  }, { passive:true });

  window.addEventListener("orientationchange", ()=>{
    setTimeout(handleViewportResize, 120);
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
})();`;
    document.body.appendChild(scriptTag);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
