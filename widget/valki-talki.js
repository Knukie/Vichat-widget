/* ==========================================================
   Valki Talki — SINGLE FILE EMBED (rewrite keyboard robustness)
   - Injects viewport meta, styles, DOM, and full widget engine
   - Keeps your DOM ids/classes & endpoints
   - Rewritten viewport/keyboard handling for robustness
========================================================== */
(() => {
  if (window.__VALKI_TALKI_LOADED__ || document.getElementById("valki-root")) return;
  window.__VALKI_TALKI_LOADED__ = true;

  /* ===============================
     Viewport meta helper
  ================================ */
  function ensureViewportFitCover() {
    const headEl =
      document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    if (!headEl) return;

    let meta = headEl.querySelector('meta[name="viewport"]');
    const content = (meta && meta.getAttribute("content")) || "";
    const parts = content
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const hasWidth = parts.some((p) => p.startsWith("width="));
    const hasInitialScale = parts.some((p) => p.startsWith("initial-scale"));
    const hasViewportFit = parts.some((p) => p.startsWith("viewport-fit"));

    if (!hasWidth) parts.unshift("width=device-width");
    if (!hasInitialScale) parts.unshift("initial-scale=1");
    if (!hasViewportFit) parts.push("viewport-fit=cover");

    const nextContent = parts.join(", ") || "width=device-width, initial-scale=1, viewport-fit=cover";

    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "viewport");
      meta.setAttribute("content", nextContent);
      headEl.prepend(meta);
    } else {
      meta.setAttribute("content", nextContent);
    }
  }

  function injectInterFont() {
    const headEl =
      document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    if (!headEl) return;

    if (!headEl.querySelector('link[data-valki-inter-preconnect]')) {
      const preconnect = document.createElement("link");
      preconnect.setAttribute("rel", "preconnect");
      preconnect.setAttribute("href", "https://fonts.googleapis.com");
      preconnect.setAttribute("data-valki-inter-preconnect", "");
      headEl.appendChild(preconnect);
    }
    if (!headEl.querySelector('link[data-valki-inter-preconnect-gstatic]')) {
      const preconnectGstatic = document.createElement("link");
      preconnectGstatic.setAttribute("rel", "preconnect");
      preconnectGstatic.setAttribute("href", "https://fonts.gstatic.com");
      preconnectGstatic.setAttribute("crossorigin", "");
      preconnectGstatic.setAttribute("data-valki-inter-preconnect-gstatic", "");
      headEl.appendChild(preconnectGstatic);
    }
    if (!headEl.querySelector('link[data-valki-inter-css]')) {
      const interLink = document.createElement("link");
      interLink.setAttribute("rel", "stylesheet");
      interLink.setAttribute(
        "href",
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
      );
      interLink.setAttribute("data-valki-inter-css", "");
      headEl.appendChild(interLink);
    }
  }

  /* ===============================
     CSS (your existing styling, kept)
     NOTE: This is large; but single-file requirement.
  ================================ */
  const STYLE_TEXT = `:root{
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
  --valki-chat-pad-bottom: calc(env(safe-area-inset-bottom) + 8px);
  --vvh: calc(var(--valki-vh, 1vh) * 100);
  --vvTop: 0px;
  --vvOffset: 0px;
  --valki-kb: 0px;
  --composer-h: 88px;
  --valki-chat-gap: calc(var(--composer-h) + var(--valki-kb));
}

#valki-bg{
  position:fixed;
  inset:0;
  width:100vw;
  height:var(--vvh);
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
  min-height:var(--vvh);
}

html.valki-landing-ready:not(.valki-chat-open),
body.valki-landing-ready:not(.valki-chat-open){
  height:var(--vvh);
  overflow:hidden !important;
  overscroll-behavior:none;
}

@media (max-width: 640px){
  html:not(.valki-chat-open),
  body:not(.valki-chat-open){
    height:100%;
  }
  .valki-landing-shell{
    min-height:calc(var(--vvh) - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    justify-content:center;
  }
}

/* selection */
.valki-root ::selection{ background: rgba(140,170,255,.14); }
.valki-root ::-moz-selection{ background: rgba(140,170,255,.14); }
.valki-root .valki-messages ::selection,
.valki-root .valki-chat-input::selection,
.valki-root .valki-search-input::selection{ background: rgba(241,90,36,.14); }
.valki-root .valki-messages ::-moz-selection,
.valki-root .valki-chat-input::-moz-selection,
.valki-root .valki-search-input::-moz-selection{ background: rgba(241,90,36,.14); }

@supports (-webkit-touch-callout: none){
  .valki-root input,
  .valki-root textarea{
    font-size:16px;
    -webkit-user-select:text;
    user-select:text;
    -webkit-touch-callout:default;
  }
}

/* root */
.valki-root{
  width:100%;
  max-width:none;
  margin:0;
  padding:0;
  min-height:var(--vvh);
  box-sizing:border-box;
  position:relative;
  z-index:1;
  padding-top:env(safe-area-inset-top);
  display:flex;
  flex-direction:column;
  align-items:center;
}

.valki-landing-shell{
  width:100%;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  min-height:calc(var(--vvh) - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  padding:calc(18px + env(safe-area-inset-top)) 0 calc(26px + env(safe-area-inset-bottom));
  box-sizing:border-box;
  gap:18px;
}

@media (min-width: 641px){
  .valki-landing-shell{
    padding:calc(20px + env(safe-area-inset-top)) 0 calc(32px + env(safe-area-inset-bottom));
    box-sizing:border-box;
  }
}

@media (min-width: 1024px){
  .valki-landing-shell{
    padding:calc(24px + env(safe-area-inset-top)) 0 calc(40px + env(safe-area-inset-bottom));
  }
  .valki-signal-lock{
    max-width:1200px;
    padding:0 24px;
  }
  .valki-landing-wrap{ padding-top:24px; }
  .valki-search-form{ max-width:720px; }
}

/* signal */
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
@media (max-width:640px){ .valki-signal-lock{ font-size:32px; padding:0 14px; } }

/* landing wrap */
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
  width:36px;height:36px;border-radius:50%;
  border:none;
  box-shadow:0 10px 24px rgba(0,0,0,.55);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
  background:transparent;
}
.valki-hero-logo img{
  width:100%;height:100%;
  object-fit:cover;border-radius:50%;
  display:block;
}

.valki-login-btn{
  appearance:none;-webkit-appearance:none;
  border:0;outline:0;
  padding:10px 22px;
  border-radius:999px;
  font-family:Inter,system-ui,-apple-system,sans-serif;
  font-size:15px;font-weight:500;
  background-color:#fff;color:#050505;
  cursor:pointer;
  user-select:none;
  -webkit-tap-highlight-color:transparent;
  box-shadow: 0 8px 22px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.15) inset;
  transition: transform .15s ease, box-shadow .15s ease, background-color .15s ease;
}
.valki-login-btn:hover{
  transform:translate3d(0,-1px,0);
  background-color:#f2f2f2;
  box-shadow: 0 12px 30px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.25) inset;
}
.valki-login-btn:active{
  transform:translate3d(0,0,0);
  background-color:#e6e6e6;
  box-shadow: 0 6px 16px rgba(0,0,0,.35);
}
.valki-login-btn:focus-visible{
  box-shadow:
    0 8px 22px rgba(0,0,0,.35),
    0 0 0 1px rgba(255,255,255,.15) inset,
    0 0 0 3px rgba(241,90,36,.22);
}
.valki-login-btn[data-state="logout"]{ background-color:#f4f4f4; color:#0f0f0f; }

html.valki-chat-open .valki-hero-actions,
html.valki-chat-open .valki-login-btn{
  opacity:0;
  pointer-events:none;
  transform:translateY(-6px);
}

.valki-search-form{ width:100%; max-width:720px; margin:0 auto; padding: 0 14px; box-sizing:border-box; }
.valki-hero-actions + .valki-search-form{ margin-top:4px; }

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
.valki-search-icon{ font-size:18px; opacity:.9; }
.valki-search-input{
  flex:1 1 auto; min-width:0;
  font-size:16px;
  font-family:var(--valki-font);
  background:transparent;border:none;outline:none;
  color:#f2f2f2;
  caret-color: var(--btn-fill);
}
.valki-search-input::placeholder{ color:#555; }

.valki-search-button{
  flex:0 0 auto;
  width:42px;height:42px;border-radius:999px;
  border:none;cursor:pointer;
  background-color:var(--btn-fill);color:#050505;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 10px rgba(0,0,0,.45);
  transition:transform .15s ease-out, box-shadow .15s ease-out;
  position:relative; overflow:hidden;
}
.valki-search-button::before{
  content:""; position:absolute; inset:0; border-radius:inherit;
  background:linear-gradient(135deg,var(--btn-hover-1),var(--btn-hover-2));
  opacity:0; transition:opacity .15s ease-out;
}
.valki-search-button svg{ position:relative; z-index:1; width:20px;height:20px; }
.valki-search-button:hover{ transform:translate3d(0,-1px,0); box-shadow:0 6px 14px rgba(0,0,0,.55); }
.valki-search-button:hover::before{ opacity:1; }

/* badge */
.valki-top-badge{
  display:flex; align-items:center; gap:12px;
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

/* overlays */
#valki-overlay, #valki-auth-overlay, #valki-confirm-overlay, #valki-logout-overlay{
  z-index:2147483000 !important;
}
.valki-overlay, .valki-auth-overlay, .valki-confirm-overlay, .valki-logout-overlay{
  position:fixed; top:0; right:0; bottom:0; left:0;
  background:rgba(0,0,0,.88);
  display:none;
  pointer-events:none;
  align-items:center; justify-content:center;
  opacity:0;
  transition:opacity .18s ease-out;
  padding:0 !important;
  isolation:isolate;
}
.valki-overlay{ align-items:stretch; justify-content:center; }
.valki-overlay.is-visible,
.valki-auth-overlay.is-visible,
.valki-confirm-overlay.is-visible,
.valki-logout-overlay.is-visible{
  display:flex;
  opacity:1;
  pointer-events:auto;
}
html.valki-chat-open .valki-overlay,
html.valki-chat-open .valki-auth-overlay,
html.valki-chat-open .valki-confirm-overlay,
html.valki-chat-open .valki-logout-overlay{
  top: var(--vvTop);
  height: var(--vvh);
  max-height: var(--vvh);
  bottom: auto;
}

/* modal fullscreen */
.valki-modal{
  width:100vw;
  max-width:none;
  height: var(--vvh);
  max-height: var(--vvh);
  background:radial-gradient(circle at top, #101010 0, #050505 60%);
  border-radius:0;
  border:none;
  box-shadow:none;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  padding:0 16px calc(var(--valki-kb) + env(safe-area-inset-bottom));
  opacity:0;
  transform:translateY(10px);
  transition:.22s ease-out;
}
.valki-overlay.is-visible .valki-modal{
  opacity:1;
  transform:translateY(0);
}
html.valki-chat-open .valki-overlay .valki-modal{
  position: fixed;
  top: var(--vvTop);
  left: 0; right: 0;
  height: var(--vvh);
  max-height: var(--vvh);
}

/* header */
.valki-modal-header{
  padding: calc(10px + env(safe-area-inset-top)) 14px 10px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(to bottom,#111111,#0b0b0b);
  gap:10px;
  width:100%;
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
.valki-header-actions{ display:flex; align-items:center; gap:8px; }
.valki-header-actions-left{ display:flex; align-items:center; gap:8px; flex-direction:row-reverse; }

.valki-pill{
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  color:#eaeaea;
  font-size:12px;
  padding:6px 10px;
  cursor:pointer;
  transition:transform .12s ease, background .12s ease, border-color .12s ease, opacity .12s ease;
}
.valki-pill:hover{ transform:translateY(-1px); background:rgba(255,255,255,.07); border-color:rgba(255,255,255,.18); }
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

/* messages */
.valki-messages{
  flex:1 1 auto;
  min-height:0;
  padding:16px 0 10px;
  overflow-y:auto;
  overscroll-behavior:contain;
  background:radial-gradient(circle at top, #101010 0, #050505 60%);
  -webkit-overflow-scrolling:touch;
  width:100%;
  display:flex;
  justify-content:center;
}
.valki-messages-inner{
  width:100%;
  margin:0 auto;
  padding:0 16px 12px;
}
html.valki-chat-open .valki-messages-inner{
  padding-bottom: calc(var(--valki-chat-gap, var(--composer-h)) + env(safe-area-inset-bottom) + 12px);
}

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
  word-wrap:break-word;
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

/* composer */
.valki-chat-form{
  border-top:1px solid rgba(255,255,255,.08);
  background:linear-gradient(to top,#050505,#080808);
  padding:12px 0 calc(var(--valki-chat-pad-bottom) + var(--valki-kb)) !important;
  width:100%;
  margin-top:auto;
}
.valki-chat-form-inner{ margin:0 auto; padding:0 16px; box-sizing:border-box; }
.valki-chat-inner{
  display:flex;
  align-items:flex-end;
  gap:10px;
  padding:10px 12px;
  border-radius:22px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.09);
  backdrop-filter:blur(24px);
  box-shadow:0 16px 40px rgba(0,0,0,.85);
}
.valki-chat-attach{
  width:40px;height:40px;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06);
  color:#eaeaea;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;
}
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
  overflow-y:hidden;
  white-space:pre-wrap;
  word-break:break-word;
}
.valki-chat-send{
  width:44px;height:44px;border-radius:50%;
  border:1px solid rgba(255,255,255,.12);
  cursor:pointer;
  background-color:#eaeaea;
  color:#111;
  display:flex;align-items:center;justify-content:center;
}
.valki-chat-send[disabled]{ opacity:.55; cursor:default; pointer-events:none; }

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
}
.valki-attachment img{ width:100%;height:100%;object-fit:cover;display:block; }
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

.valki-auth-modal,.valki-confirm-modal{
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
.valki-auth-title{ margin:6px 0 6px; font-size:20px; font-weight:600; color:#fff; }
.valki-auth-subtitle{ margin:0 0 16px; font-size:14px; color:#b9b9b9; line-height:1.45; }
.valki-auth-buttons{ display:flex; flex-direction:column; gap:10px; }
.valki-auth-btn{
  width:100%;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.15);
  color:#fff;
  padding:11px 14px;
  font-size:15px;
  cursor:pointer;
  background-color:#1f1f1f !important;
  display:flex; align-items:center; justify-content:center; gap:10px;
}
.valki-auth-btn.primary{
  background-color:var(--btn-fill) !important;
  border-color:var(--btn-fill) !important;
  color:#050505 !important;
}
.valki-confirm-title{ margin:0 0 8px; font-size:18px; font-weight:650; color:#fff; }
.valki-confirm-sub{ margin:0 0 14px; font-size:13px; color:#b9b9b9; line-height:1.45; }
.valki-confirm-actions{ display:flex; gap:10px; justify-content:center; }
.valki-confirm-btn{
  flex:1; border-radius:999px;
  border:1px solid rgba(255,255,255,.15);
  background-color:#1f1f1f;
  color:#fff;
  padding:10px 12px;
  font-size:14px;
  cursor:pointer;
}
.valki-confirm-btn.danger{
  background-color:var(--btn-fill);
  border-color:var(--btn-fill);
  color:#050505 !important;
}

/* images in messages */
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
  .valki-msg-bubble .valki-img-grid{ grid-template-columns: 1fr; }
}
`;

  /* ===============================
     HTML (your structure, kept)
  ================================ */
  const HTML_TEXT = `
<canvas id="valki-bg" aria-hidden="true"></canvas>
<div class="valki-root" id="valki-root">
  <div class="valki-landing-shell">
    <div class="valki-signal-lock" id="valki-signal-lock" aria-label="Valki Talki. Web3.">
      <div class="valki-signal-line" id="line-main">Crypto Stuck?</div>
      <div class="valki-signal-line muted" id="line-sub">Explained.</div>
    </div>

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
          <input id="valki-search-input" class="valki-search-input" type="text" autocomplete="off"
            placeholder="" aria-label="Ask Valki" enterkeyhint="send" />
          <button class="valki-search-button" type="submit" aria-label="Ask Valki">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.3"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 19V5"></path>
              <path d="M5 12l7-7 7 7"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>

    <div class="valki-top-badge" id="valki-top-badge" role="button" tabindex="0" aria-label="Open Valki">
      <span class="valki-pulse-dot" aria-hidden="true"></span>
      <span>Valki Talki • <span class="valki-version">v2.0</span></span>
    </div>
  </div>

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
          <div id="valki-notice-slot"></div>
          <div class="valki-chat-inner">
            <button class="valki-chat-attach" id="valki-chat-attach" type="button" aria-label="Upload image">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.9-9.9a4 4 0 015.66 5.66l-9.9 9.9a2 2 0 01-2.83-2.83l9.19-9.19"></path>
              </svg>
            </button>

            <input id="valki-file-input" type="file" accept="image/jpeg,image/png" multiple style="display:none" />

            <textarea id="valki-chat-input" class="valki-chat-input" rows="1"
              placeholder="Message Valki (text optional with images)" aria-label="Message Valki" enterkeyhint="send"></textarea>

            <button class="valki-chat-send" id="valki-chat-send" type="submit" aria-label="Send message">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 19V5"></path>
                <path d="M5 12l7-7 7 7"></path>
              </svg>
            </button>
          </div>

          <div class="valki-attachments valki-container" id="valki-attachments" aria-label="Attachments" style="display:none;"></div>
        </div>
      </form>
    </div>
  </div>

  <div id="valki-auth-overlay" class="valki-auth-overlay" aria-hidden="true">
    <div class="valki-auth-modal" role="dialog" aria-modal="true" aria-label="Login required">
      <div class="valki-auth-header" style="display:flex;justify-content:center;margin-bottom:10px;">
        <img src="https://valki.wiki/blogmedia/Valki%20Talki.jpg" class="valki-auth-avatar" alt="Valki avatar"
          style="width:54px;height:54px;border-radius:999px;border:1px solid rgba(255,255,255,.25);" />
      </div>

      <h2 class="valki-auth-title" id="valki-auth-title">Log in to continue</h2>
      <p class="valki-auth-subtitle" id="valki-auth-subtitle">Sign in to keep your chat history and manage messages.</p>

      <div class="valki-auth-buttons">
        <button type="button" class="valki-auth-btn primary" id="valki-login-discord-btn">
          <span>Continue with Discord</span>
        </button>

        <button type="button" class="valki-auth-btn" id="valki-login-google-btn">
          <span>Continue with Google</span>
        </button>

        <button type="button" class="valki-auth-btn" id="valki-join-discord-btn">Join Discord server</button>
      </div>

      <div class="valki-auth-note" id="valki-auth-note" style="margin-top:12px;font-size:11px;color:rgba(200,200,200,.55);">Guest limits apply.</div>
      <div class="valki-auth-dismiss" id="valki-auth-dismiss" style="margin-top:10px;display:inline-block;font-size:12px;color:rgba(255,255,255,.65);cursor:pointer;user-select:none;">Not now</div>
    </div>
  </div>

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
</div>
`;

  function injectStyle() {
    const headEl =
      document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    if (!headEl) return;
    if (headEl.querySelector("style[data-valki-talki]")) return;
    const styleTag = document.createElement("style");
    styleTag.setAttribute("data-valki-talki", "");
    styleTag.textContent = STYLE_TEXT;
    headEl.appendChild(styleTag);
  }

  function mountDOM() {
    const mount = document.getElementById("valki-mount") || document.body;
    if (!mount) return;

    // create a container to parse HTML
    const container = document.createElement("div");
    container.innerHTML = HTML_TEXT.trim();

    // move bg canvas + root
    const bgNode = container.querySelector("#valki-bg");
    const rootNode = container.querySelector("#valki-root");
    if (!rootNode) return;

    if (bgNode) mount.appendChild(bgNode);
    mount.appendChild(rootNode);
  }

  /* ===============================
     Engine (rewrite)
  ================================ */
  function startEngine() {
    const BASE_URL = "https://auth.valki.wiki";
    const API_VALKI = BASE_URL + "/api/valki";
    const API_ME = BASE_URL + "/api/me";
    const API_MESSAGES = BASE_URL + "/api/messages";
    const API_CLEAR = BASE_URL + "/api/clear";
    const API_IMPORT_GUEST = BASE_URL + "/api/import-guest";
    const API_UPLOAD = BASE_URL + "/api/upload";

    const AUTH_DISCORD_START = BASE_URL + "/auth/discord";
    const AUTH_GOOGLE_START = BASE_URL + "/auth/google";

    const DISCORD_INVITE_URL = "https://discord.com/invite/vqDJuGJN2u";
    const AVATAR_URL = "https://valki.wiki/blogmedia/Valki%20Talki.jpg";

    const AUTH_KEY = "valki_auth_token_v1";
    const HISTORY_KEY = "valki_history_v20";
    const GUEST_METER_KEY = "valki_guest_meter_v1";
    const CLIENT_ID_KEY = "valki_client_id_v20";

    const MSG_GENERIC_ERROR = "Something went wrong talking to Valki.";
    const MSG_NO_RESPONSE = "…krrzzzt… no response received.";

    const CHAT_MAX_LINES = 4;

    const MAX_FILES = 4;
    const MAX_BYTES = 5 * 1024 * 1024;

    const isiOS = /iP(ad|hone|od)/.test(navigator.userAgent);

    const $ = (id) => document.getElementById(id);
    const docEl = document.documentElement;

    const overlay = $("valki-overlay");
    const closeBtn = $("valki-close");

    const searchForm = $("valki-search-form");
    const searchInput = $("valki-search-input");

    const badge = $("valki-top-badge");
    const heroLoginBtn = $("valki-hero-login-btn");

    const headerAvatar = $("valki-header-avatar");
    const headerTitle = $("valki-title");
    const sessionLabel = $("valki-session-label");

    const loginOutBtn = $("valki-loginout-btn");
    const deleteAllBtn = $("valki-deleteall-btn");

    const messagesEl = $("valki-messages");
    const messagesInner = $("valki-messages-inner");

    const chatForm = $("valki-chat-form");
    const chatInput = $("valki-chat-input");
    const sendBtn = $("valki-chat-send");

    const attachBtn = $("valki-chat-attach");
    const fileInput = $("valki-file-input");
    const attachTray = $("valki-attachments");

    const authOverlay = $("valki-auth-overlay");
    const authTitle = $("valki-auth-title");
    const authSubtitle = $("valki-auth-subtitle");
    const authNote = $("valki-auth-note");
    const authDismiss = $("valki-auth-dismiss");

    const loginDiscordBtn = $("valki-login-discord-btn");
    const loginGoogleBtn = $("valki-login-google-btn");
    const joinDiscordBtn = $("valki-join-discord-btn");

    const confirmOverlay = $("valki-confirm-overlay");
    const confirmNo = $("valki-confirm-no");
    const confirmYes = $("valki-confirm-yes");

    const logoutOverlay = $("valki-logout-overlay");
    const logoutNo = $("valki-logout-no");
    const logoutYes = $("valki-logout-yes");

    if (
      [
        overlay, closeBtn,
        searchForm, searchInput,
        badge, heroLoginBtn,
        headerAvatar, headerTitle, sessionLabel,
        loginOutBtn, deleteAllBtn,
        messagesEl, messagesInner,
        chatForm, chatInput, sendBtn,
        attachBtn, fileInput, attachTray,
        authOverlay, authTitle, authSubtitle, authNote, authDismiss,
        loginDiscordBtn, loginGoogleBtn, joinDiscordBtn,
        confirmOverlay, confirmNo, confirmYes,
        logoutOverlay, logoutNo, logoutYes,
      ].some((x) => !x)
    ) return;

    document.documentElement.classList.add("valki-landing-ready");
    document.body.classList.add("valki-landing-ready");

    /* ---------- utils ---------- */
    const cleanText = (v) => String(v ?? "").replace(/\u0000/g, "").trim();
    const safeJsonParse = (s, fallback) => { try { return JSON.parse(s); } catch { return fallback; } };
    const clamp = (v, min, max) => Math.min(Math.max(Number.isFinite(v) ? v : min, min), max);

    function genId(prefix) {
      try {
        if (crypto && crypto.getRandomValues) {
          const a = new Uint32Array(2);
          crypto.getRandomValues(a);
          return prefix + "-" + Array.from(a).map(n => n.toString(16).padStart(8, "0")).join("");
        }
      } catch {}
      return prefix + "-" + Math.random().toString(16).slice(2) + Date.now().toString(16);
    }

    function isChatOpen() {
      return overlay.classList.contains("is-visible") || overlay.getAttribute("aria-hidden") === "false";
    }
    function isNearBottom(px = 140) {
      return (messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight) < px;
    }
    function scrollToBottom(force = false) {
      if (force || isNearBottom(160)) messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    /* ---------- viewport / keyboard manager (robust) ---------- */
    const Viewport = (() => {
      let t1 = null, t2 = null, raf = null;
      let lastKb = 0;
      const jitterThreshold = 24;

      function compute() {
        const vv = window.visualViewport;
        const innerH = Math.max(0, window.innerHeight || 0);
        const layoutH = Math.max(innerH, (docEl && docEl.clientHeight) || 0, 320);

        let vvH = (vv && Number.isFinite(vv.height)) ? vv.height : layoutH;
        let vvTop = (vv && Number.isFinite(vv.offsetTop)) ? vv.offsetTop : 0;
        vvTop = clamp(vvTop, 0, layoutH);

        const vvh = clamp(vvH, layoutH * 0.35, layoutH * 1.15);

        let kb = 0;
        if (vv && Number.isFinite(vv.height)) {
          kb = (innerH - vvh - vvTop);
          kb = clamp(kb, 0, layoutH * 0.85);
        }
        if (Math.abs(kb - lastKb) < jitterThreshold) kb = lastKb;

        const composerRect = chatForm.getBoundingClientRect();
        const composerH = composerRect ? composerRect.height : 0;
        const gap = Math.max(0, composerH + kb);

        return { vvh, vvTop, kb, composerH, gap };
      }

      function apply(m, stick) {
        if (!m) return;
        docEl.style.setProperty("--vvh", m.vvh + "px");
        docEl.style.setProperty("--vvTop", m.vvTop + "px");
        docEl.style.setProperty("--valki-kb", m.kb + "px");
        docEl.style.setProperty("--composer-h", m.composerH + "px");
        docEl.style.setProperty("--valki-chat-gap", m.gap + "px");

        const unit = m.vvh ? (m.vvh * 0.01) : 0;
        if (unit) docEl.style.setProperty("--valki-vh", unit.toFixed(4) + "px");

        lastKb = m.kb;

        if (stick && isChatOpen()) requestAnimationFrame(() => scrollToBottom(true));
      }

      function sync({ forceStick = false } = {}) {
        if (!isChatOpen()) return;
        const stick = forceStick || isNearBottom(160);
        apply(compute(), stick);
      }

      function schedule({ delay = 0, late = 260, forceStick = false } = {}) {
        if (!isChatOpen()) return;
        if (t1) clearTimeout(t1);
        if (t2) clearTimeout(t2);
        if (raf) cancelAnimationFrame(raf);

        t1 = setTimeout(() => {
          raf = requestAnimationFrame(() => sync({ forceStick }));
        }, Math.max(0, delay));

        t2 = setTimeout(() => {
          sync({ forceStick });
        }, Math.max(0, delay + late));
      }

      function bind() {
        if (window.visualViewport) {
          window.visualViewport.addEventListener("resize", () => schedule({ delay: 0, late: 300, forceStick: true }), { passive: true });
          window.visualViewport.addEventListener("scroll", () => schedule({ delay: 0, late: 300, forceStick: true }), { passive: true });
        }
        window.addEventListener("resize", () => schedule({ delay: 20, late: 280 }), { passive: true });
        window.addEventListener("orientationchange", () => schedule({ delay: 80, late: 340, forceStick: true }), { passive: true });

        chatInput.addEventListener("focus", () => schedule({ delay: 0, late: 320, forceStick: true }), true);
        chatInput.addEventListener("blur", () => schedule({ delay: 40, late: 280 }), true);
        chatInput.addEventListener("input", () => schedule({ delay: 0, late: 180, forceStick: true }));

        if (isiOS) {
          document.addEventListener("selectionchange", () => schedule({ delay: 0, late: 240, forceStick: true }));
          document.addEventListener("touchend", () => schedule({ delay: 0, late: 240, forceStick: true }), { passive: true });
        }

        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") schedule({ delay: 30, late: 300, forceStick: true });
        });
      }

      return { bind, sync, schedule };
    })();

    Viewport.bind();

    /* ---------- scroll lock ---------- */
    function isBodyLocked() { return document.body.dataset.valkiScrollLocked === "1"; }
    function lockBody() {
      if (isBodyLocked()) return;
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
      docEl.classList.add("valki-chat-open");
      Viewport.schedule({ delay: 0, late: 300, forceStick: true });
    }
    function unlockBody() {
      const y = parseInt(document.body.dataset.valkiScrollY || "0", 10) || 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      delete document.body.dataset.valkiScrollLocked;
      delete document.body.dataset.valkiScrollY;
      docEl.classList.remove("valki-chat-open");
      try { window.scrollTo({ top: y, behavior: "auto" }); } catch { window.scrollTo(0, y); }
    }

    /* ---------- auth & storage ---------- */
    function getAuthToken() { try { return localStorage.getItem(AUTH_KEY) || ""; } catch { return ""; } }
    function setAuthToken(tok) { try { localStorage.setItem(AUTH_KEY, String(tok || "")); } catch {} }
    function clearAuthToken() { try { localStorage.removeItem(AUTH_KEY); } catch {} }
    function isLoggedIn() { return !!getAuthToken(); }

    let me = null;
    async function fetchMe() {
      const tok = getAuthToken();
      if (!tok) { me = null; return null; }
      try {
        const r = await fetch(API_ME, { headers: { Authorization: "Bearer " + tok } });
        const j = await r.json().catch(() => null);
        if (j && j.loggedIn && j.user) { me = j.user; return me; }
      } catch {}
      me = null;
      return null;
    }
    function updateSessionLabel() {
      if (me && me.name) sessionLabel.textContent = me.name + " 🟢";
      else sessionLabel.textContent = isLoggedIn() ? "you 🟢" : "Guest 🟠";
    }
    function updateHeroLoginButton() {
      const logged = isLoggedIn();
      heroLoginBtn.textContent = logged ? "Log out" : "Login";
      heroLoginBtn.dataset.state = logged ? "logout" : "login";
    }
    function updateLoginOutButtonLabel() {
      if (isLoggedIn()) {
        loginOutBtn.style.display = "none";
      } else {
        loginOutBtn.style.display = "inline-flex";
        loginOutBtn.textContent = "Login";
      }
      updateHeroLoginButton();
    }

    /* ---------- guest meter/history ---------- */
    function getGuestMeter() {
      const raw = (() => { try { return localStorage.getItem(GUEST_METER_KEY) || ""; } catch { return ""; } })();
      const m = safeJsonParse(raw, null) || { count: 0, roundsShown: 0 };
      m.count = Number(m.count) || 0;
      m.roundsShown = Number(m.roundsShown) || 0;
      return m;
    }
    function setGuestMeter(m) { try { localStorage.setItem(GUEST_METER_KEY, JSON.stringify(m)); } catch {} }
    function resetGuestMeter() { try { localStorage.removeItem(GUEST_METER_KEY); } catch {} }
    function guestHardBlocked() {
      if (isLoggedIn()) return false;
      const m = getGuestMeter();
      return m.count >= (3 * 2);
    }
    function bumpGuestCount() {
      if (isLoggedIn()) return;
      const m = getGuestMeter();
      m.count += 1;
      setGuestMeter(m);
    }
    function maybePromptLoginAfterSend() {
      if (isLoggedIn()) return;
      const m = getGuestMeter();
      const threshold = (m.roundsShown + 1) * 3;
      if (m.count >= threshold && m.roundsShown < 2) {
        m.roundsShown += 1;
        setGuestMeter(m);
        openAuthOverlay({ hard: (m.roundsShown >= 2) });
      }
    }

    function sanitizeImageMeta(img) {
      if (!img || typeof img !== "object") return null;
      const rawUrl = img.url || img.src;
      if (!rawUrl || String(rawUrl).startsWith("data:")) return null;
      const meta = { url: String(rawUrl) };
      if (img.name) meta.name = String(img.name);
      if (img.type) meta.type = String(img.type);
      if (Number.isFinite(Number(img.size))) meta.size = Number(img.size);
      return meta;
    }
    function sanitizeImagesList(images) {
      return Array.isArray(images) ? images.map(sanitizeImageMeta).filter(Boolean) : [];
    }
    function loadGuestHistory() {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const arr = safeJsonParse(raw, []);
        if (!Array.isArray(arr)) return [];
        return arr
          .filter(x => x && (x.type === "user" || x.type === "bot"))
          .map(x => ({
            type: x.type === "bot" ? "bot" : "user",
            text: (typeof x.text === "string") ? x.text : "",
            images: sanitizeImagesList(Array.isArray(x.images) ? x.images : (Array.isArray(x.attachments) ? x.attachments : undefined))
          }))
          .filter(x => (x.text && x.text.length) || (Array.isArray(x.images) && x.images.length));
      } catch { return []; }
    }
    function saveGuestHistory(arr) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); } catch {} }
    function clearGuestHistory() { try { localStorage.removeItem(HISTORY_KEY); } catch {} }
    let guestHistory = loadGuestHistory();

    /* ---------- markdown lazy ---------- */
    let mdReady = false, mdLoading = null;
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    async function ensureMarkdownLibs() {
      if (mdReady) return;
      if (mdLoading) return mdLoading;
      mdLoading = (async () => {
        await loadScript("https://cdn.jsdelivr.net/npm/marked/marked.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js");
        mdReady = true;
      })();
      return mdLoading;
    }
    function renderMarkdown(text) {
      if (!text) return "";
      if (window.marked) {
        let html = window.marked.parse(text, { breaks: true });
        if (window.DOMPurify) html = window.DOMPurify.sanitize(html);
        return html;
      }
      return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    }
    function hardenLinks(containerEl) {
      if (!containerEl) return;
      containerEl.querySelectorAll("a").forEach(a => {
        const href = (a.getAttribute("href") || "").trim();
        if (/^javascript:/i.test(href)) a.removeAttribute("href");
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      });
    }

    /* ---------- messages UI ---------- */
    function hasAnyRealMessages() {
      const rows = messagesInner.querySelectorAll(".valki-msg-row");
      for (const r of rows) {
        if (r.querySelector(".valki-typing-bar")) continue;
        if (r.getAttribute("data-valki-system")) continue;
        return true;
      }
      return false;
    }
    function updateDeleteButtonVisibility() {
      deleteAllBtn.style.display = hasAnyRealMessages() ? "inline-flex" : "none";
    }
    function updateDeleteButtonState(isBusy) {
      if (!hasAnyRealMessages()) return;
      deleteAllBtn.disabled = !!isBusy;
      deleteAllBtn.style.opacity = isBusy ? ".55" : "";
      deleteAllBtn.style.pointerEvents = isBusy ? "none" : "";
    }

    function createMessageRow({ type, text, images }) {
      const row = document.createElement("div");
      row.className = "valki-msg-row " + (type === "user" ? "user" : "bot");

      if (type === "bot") {
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
        ? images.map((img) => {
            if (img && typeof img === "object") {
              const rawUrl = img.url || img.src;
              const previewUrl = img.previewUrl;
              const safeUrl = rawUrl && !String(rawUrl).startsWith("data:") ? String(rawUrl) : "";
              const safePreview = previewUrl && !String(previewUrl).startsWith("data:") ? String(previewUrl) : "";
              const src = safeUrl || safePreview;
              if (!src) return null;
              const alt = img.name || "uploaded image";
              return { src, alt, clickUrl: safeUrl || safePreview };
            }
            if (img) {
              const safeSrc = String(img);
              if (safeSrc.startsWith("data:")) return null;
              return { src: safeSrc, alt: "uploaded image", clickUrl: safeSrc };
            }
            return null;
          }).filter(Boolean)
        : [];

      if (type === "bot") {
        bubble.innerHTML = renderMarkdown(typeof text === "string" ? text : "");
        hardenLinks(bubble);
      } else {
        bubble.textContent = typeof text === "string" ? text : "";
      }

      if (normalizedImages.length) {
        const grid = document.createElement("div");
        grid.className = "valki-img-grid";
        for (const imgData of normalizedImages) {
          const img = document.createElement("img");
          img.className = "valki-inline-img";
          img.src = imgData.src;
          img.alt = imgData.alt || "uploaded image";
          img.loading = "lazy";
          img.addEventListener("click", () => {
            try { window.open(imgData.clickUrl || imgData.src, "_blank", "noopener,noreferrer"); } catch {}
          });
          grid.appendChild(img);
        }
        bubble.appendChild(grid);
      }

      row.appendChild(bubble);
      return row;
    }

    async function addMessage({ type, text, images } = {}) {
      const stick = isNearBottom(160);
      if (type === "bot") await ensureMarkdownLibs();
      messagesInner.appendChild(createMessageRow({ type, text, images }));
      if (stick) scrollToBottom(true);
      updateDeleteButtonVisibility();
      Viewport.schedule({ delay: 0, late: 220, forceStick: stick });
    }

    function clearMessagesUI() {
      messagesInner.innerHTML = "";
      updateDeleteButtonVisibility();
    }

    function createTypingRow() {
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
        "</div>";

      typingRow.appendChild(bubble);
      messagesInner.appendChild(typingRow);
      scrollToBottom(true);
      return typingRow;
    }

    /* ---------- composer autogrow ---------- */
    function parsePx(v) { const n = parseFloat(String(v || "").replace("px", "")); return Number.isFinite(n) ? n : 0; }
    function computeLineHeightPx(el) {
      const cs = getComputedStyle(el);
      const fontSize = parsePx(cs.fontSize) || 16;
      const lh = cs.lineHeight;
      if (!lh || lh === "normal") return Math.round(fontSize * 1.35);
      if (String(lh).endsWith("px")) return Math.round(parsePx(lh));
      const asNum = parseFloat(lh);
      if (Number.isFinite(asNum)) return Math.round(fontSize * asNum);
      return Math.round(fontSize * 1.35);
    }
    function clampComposer() {
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
      Viewport.schedule({ delay: 0, late: 160, forceStick: true });
    }

    /* ---------- overlay visibility ---------- */
    function setVisible(el, on) {
      if (!el) return;
      if (on) {
        el.style.display = "flex";
        el.style.pointerEvents = "auto";
        el.setAttribute("aria-hidden", "false");
        requestAnimationFrame(() => el.classList.add("is-visible"));
      } else {
        el.setAttribute("aria-hidden", "true");
        el.classList.remove("is-visible");
        el.style.pointerEvents = "none";
        setTimeout(() => {
          if (el.getAttribute("aria-hidden") === "true") el.style.display = "none";
        }, 260);
      }
    }
    function openOverlay() {
      setVisible(overlay, true);
      lockBody();
      Viewport.schedule({ delay: 0, late: 320, forceStick: true });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try { chatInput.focus({ preventScroll: true }); } catch { try { chatInput.focus(); } catch {} }
          clampComposer();
          scrollToBottom(true);
        });
      });
    }
    function closeOverlay() {
      try { chatInput.blur(); } catch {}
      setVisible(overlay, false);
      unlockBody();
      Viewport.schedule({ delay: 0, late: 240 });
    }

    /* ---------- auth overlay ---------- */
    let authHard = false;
    function openAuthOverlay({ hard }) {
      authHard = !!hard;
      authTitle.textContent = authHard ? "Login required" : "Log in to continue";
      authSubtitle.textContent = authHard
        ? "You’ve reached the guest limit. Log in to keep chatting."
        : "Sign in to keep your chat history and manage messages.";
      authNote.textContent = authHard ? "Guest limit reached." : "Guest limits apply.";
      authDismiss.style.display = authHard ? "none" : "inline-block";
      setVisible(authOverlay, true);

      if (authHard) {
        chatInput.disabled = true;
        sendBtn.disabled = true;
        searchInput.disabled = true;
        attachBtn.disabled = true;
        updateDeleteButtonState(true);
      }
    }
    function closeAuthOverlay(force = false) {
      if (authHard && !force) return;
      setVisible(authOverlay, false);
      if (force && authHard) {
        chatInput.disabled = false;
        sendBtn.disabled = false;
        searchInput.disabled = false;
        attachBtn.disabled = false;
        updateDeleteButtonState(false);
        authHard = false;
      }
    }

    function openConfirm() { setVisible(confirmOverlay, true); }
    function closeConfirm() { setVisible(confirmOverlay, false); }
    function openLogoutPrompt() { setVisible(logoutOverlay, true); }
    function closeLogoutPrompt() { setVisible(logoutOverlay, false); }

    /* ---------- OAuth popup ---------- */
    function openOAuthPopup(authStartUrl, popupName) {
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
      if (!popup) { window.location.href = url; return; }
      try { popup.focus(); } catch {}
    }
    const openDiscordLoginPopup = () => openOAuthPopup(AUTH_DISCORD_START, "valki_discord_login");
    const openGoogleLoginPopup = () => openOAuthPopup(AUTH_GOOGLE_START, "valki_google_login");

    async function importGuestIntoAccount(authToken) {
      try {
        if (!Array.isArray(guestHistory) || !guestHistory.length) return;
        const payload = {
          messages: guestHistory.slice(-80).map(m => ({
            role: (m.type === "bot") ? "assistant" : "user",
            content: String(m.text || "")
          }))
        };
        await fetch(API_IMPORT_GUEST, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + authToken },
          body: JSON.stringify(payload)
        }).catch(() => {});
        guestHistory = [];
        clearGuestHistory();
      } catch {}
    }

    const BACKEND_ORIGIN = new URL(BASE_URL).origin;
    window.addEventListener("message", async (ev) => {
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
      attachBtn.disabled = false;

      authHard = false;
      setVisible(authOverlay, false);

      await importGuestIntoAccount(data.token);
      await loadLoggedInMessagesToUI({ forceOpen: true });
    });

    /* ---------- attachments ---------- */
    let attachments = []; // {id,name,type,url,size,dataUrl,previewUrl}

    function revokePreview(a) { if (a && a.previewUrl) { try { URL.revokeObjectURL(a.previewUrl); } catch {} } }
    function clearAttachments() { for (const a of attachments) revokePreview(a); attachments = []; }

    function showAttachTray() {
      if (!attachments.length) {
        attachTray.style.display = "none";
        attachTray.innerHTML = "";
        Viewport.schedule({ delay: 0, late: 160, forceStick: true });
        return;
      }
      attachTray.style.display = "flex";
      attachTray.innerHTML = "";
      for (const a of attachments) {
        const wrap = document.createElement("div");
        wrap.className = "valki-attachment";

        const img = document.createElement("img");
        img.src = a.previewUrl || a.url || a.dataUrl;
        img.alt = a.name || "attachment";

        const rm = document.createElement("button");
        rm.type = "button";
        rm.className = "valki-attachment-remove";
        rm.textContent = "×";
        rm.addEventListener("click", () => {
          attachments = attachments.filter(x => x.id !== a.id);
          revokePreview(a);
          showAttachTray();
          clampComposer();
        });

        wrap.appendChild(img);
        wrap.appendChild(rm);
        attachTray.appendChild(wrap);
      }
      Viewport.schedule({ delay: 0, late: 200, forceStick: true });
    }

    async function uploadFile(file) {
      const form = new FormData();
      form.append("file", file);

      const headers = {};
      const tok = getAuthToken();
      if (tok) headers.Authorization = "Bearer " + tok;

      const res = await fetch(API_UPLOAD, { method: "POST", headers, body: form });
      if (!res.ok) throw new Error("Upload failed (" + res.status + ")");

      const j = await res.json().catch(() => null);
      const fileMeta = (j && j.file) ? j.file : j;
      if (!fileMeta || !fileMeta.url) throw new Error("Upload response missing url");

      const rawUrl = (typeof fileMeta.url === "string") ? fileMeta.url : "";
      const dataUrlFromResponse = (typeof fileMeta.dataUrl === "string") ? fileMeta.dataUrl : "";
      const safeDataUrl = dataUrlFromResponse || (rawUrl.startsWith("data:") ? rawUrl : "");
      const safeUrl = rawUrl.startsWith("data:") ? "" : rawUrl;

      return {
        url: safeUrl,
        name: fileMeta.name || file.name || "image",
        type: fileMeta.type || file.type || "image/jpeg",
        size: Number.isFinite(Number(fileMeta.size)) ? Number(fileMeta.size) : file.size,
        dataUrl: safeDataUrl
      };
    }

    async function addFiles(fileList) {
      const files = Array.from(fileList || []);
      const errors = [];

      for (const f of files) {
        if (attachments.length >= MAX_FILES) { errors.push("Image limit reached (max 4)."); break; }

        const t = String(f.type || "").toLowerCase();
        const ok = (t === "image/jpeg" || t === "image/png" || t === "image/jpg");
        if (!ok) { errors.push((f.name || "File") + " is not a supported image (JPEG/PNG)."); continue; }

        if (f.size > MAX_BYTES) { errors.push((f.name || "Image") + " is too large (max 5MB)."); continue; }

        const previewUrl = (() => { try { return URL.createObjectURL(f); } catch { return ""; } })();
        try {
          const uploaded = await uploadFile(f);
          attachments.push({
            id: genId("att"),
            name: uploaded.name,
            type: uploaded.type,
            url: uploaded.url,
            size: uploaded.size,
            dataUrl: uploaded.dataUrl,
            previewUrl
          });
        } catch (e) {
          if (previewUrl) revokePreview({ previewUrl });
          errors.push("Could not upload " + (f.name || "image") + " (" + (e && e.message ? e.message : "network") + ").");
        }
      }

      showAttachTray();
      clampComposer();
      for (const msg of errors) {
        await addMessage({ type: "bot", text: msg });
        if (!isLoggedIn()) {
          guestHistory.push({ type: "bot", text: msg });
          saveGuestHistory(guestHistory);
        }
      }
    }

    /* ---------- call valki ---------- */
    let isSending = false;

    function getClientId() {
      try {
        const existing = localStorage.getItem(CLIENT_ID_KEY);
        if (existing) return existing;
      } catch {}
      const id = genId("valk-client");
      try { localStorage.setItem(CLIENT_ID_KEY, id); } catch {}
      return id;
    }
    const clientId = getClientId();

    function setSendingState(on) {
      sendBtn.disabled = !!on || chatInput.disabled;
      attachBtn.disabled = !!on || chatInput.disabled;
      updateDeleteButtonState(!!on);
    }

    function normalizeImagesPayload(images) {
      return Array.isArray(images)
        ? images.map(img => {
            if (!img || typeof img !== "object") return null;
            const name = String(img.name || "image");
            const type = String(img.type || "image/jpeg");
            const dataUrl = (typeof img.dataUrl === "string") ? img.dataUrl : "";
            if (!dataUrl && !img.url) return null;
            const out = { name, type };
            if (dataUrl) out.dataUrl = dataUrl;
            if (img.url) out.url = String(img.url);
            return out;
          }).filter(Boolean)
        : [];
    }

    function buildSafeJsonBody(payload) {
      try { return JSON.stringify(payload); }
      catch { return JSON.stringify({ message: String(payload.message || ""), clientId: String(payload.clientId || ""), images: [] }); }
    }

    async function askValki(text) {
      if (isSending) return;

      const q = cleanText(text);
      const hasImages = attachments.length > 0;
      if (!q && !hasImages) return;

      if (guestHardBlocked()) {
        openAuthOverlay({ hard: true });
        return;
      }

      isSending = true;
      setSendingState(true);

      const imagesForSend = attachments.map(a => ({
        name: String(a.name || "image"),
        type: String(a.type || "image/jpeg"),
        dataUrl: String(a.dataUrl || "")
      })).filter(x => x.dataUrl && x.dataUrl.startsWith("data:image/"));

      const normalizedImagesForSend = normalizeImagesPayload(imagesForSend);

      const imagesForUi = attachments.map(a => ({
        url: a.url || a.dataUrl || "",
        name: a.name,
        type: a.type,
        size: a.size,
        previewUrl: a.previewUrl
      }));

      const messageText = q || (hasImages ? "[image]" : "");

      await addMessage({ type: "user", text: messageText, images: imagesForUi });

      if (!isLoggedIn()) {
        guestHistory.push({ type: "user", text: messageText, images: normalizedImagesForSend });
        saveGuestHistory(guestHistory);
        bumpGuestCount();
      }

      const typingRow = createTypingRow();

      const payload = { message: messageText, clientId, images: normalizedImagesForSend };
      const headers = { "Content-Type": "application/json" };
      const tok = getAuthToken();
      if (tok) headers.Authorization = "Bearer " + tok;

      try {
        const res = await fetch(API_VALKI, { method: "POST", headers, body: buildSafeJsonBody(payload) });
        try { typingRow.remove(); } catch {}

        if (!res.ok) {
          let errMsg = MSG_GENERIC_ERROR;
          try {
            const j = await res.json();
            if (j && typeof j.error === "string") errMsg = "ksshh… " + j.error;
          } catch {}
          await addMessage({ type: "bot", text: errMsg });
          if (!isLoggedIn()) {
            guestHistory.push({ type: "bot", text: errMsg });
            saveGuestHistory(guestHistory);
            maybePromptLoginAfterSend();
          }
          return;
        }

        const data = await res.json().catch(() => null);
        const answer = (data && data.reply) ? String(data.reply) : MSG_NO_RESPONSE;

        await addMessage({ type: "bot", text: answer });

        if (!isLoggedIn()) {
          guestHistory.push({ type: "bot", text: answer });
          saveGuestHistory(guestHistory);
          maybePromptLoginAfterSend();
        }
      } catch {
        try { typingRow.remove(); } catch {}
        await addMessage({ type: "bot", text: MSG_GENERIC_ERROR });
        if (!isLoggedIn()) {
          guestHistory.push({ type: "bot", text: MSG_GENERIC_ERROR });
          saveGuestHistory(guestHistory);
          maybePromptLoginAfterSend();
        }
      } finally {
        isSending = false;
        setSendingState(false);
        clearAttachments();
        showAttachTray();
        clampComposer();
        Viewport.schedule({ delay: 0, late: 220, forceStick: true });
      }
    }

    /* ---------- load messages (logged in) ---------- */
    async function loadLoggedInMessagesToUI({ forceOpen = false } = {}) {
      const tok = getAuthToken();
      if (!tok) return false;

      try {
        const r = await fetch(API_MESSAGES, { headers: { Authorization: "Bearer " + tok } });
        if (r.status === 401) {
          clearAuthToken();
          me = null;
          updateSessionLabel();
          updateLoginOutButtonLabel();
          return false;
        }
        if (!r.ok) return false;

        const j = await r.json().catch(() => null);
        if (!j || !Array.isArray(j.messages)) return false;

        clearMessagesUI();
        for (const m of j.messages) {
          const type = (m.role === "assistant") ? "bot" : "user";
          const text = typeof m.message === "string" ? m.message : (typeof m.content === "string" ? m.content : "");
          const images = sanitizeImagesList(Array.isArray(m.images) ? m.images : (Array.isArray(m.attachments) ? m.attachments : undefined));
          await addMessage({ type, text, images });
        }

        scrollToBottom(true);
        updateDeleteButtonVisibility();
        Viewport.schedule({ delay: 0, late: 260, forceStick: true });

        if (forceOpen && !isChatOpen()) openOverlay();
        return true;
      } catch {
        return false;
      }
    }

    async function renderGuestHistoryToUI() {
      clearMessagesUI();
      for (const m of guestHistory) {
        await addMessage({ type: m.type, text: m.text, images: m.images });
      }
      scrollToBottom(true);
      updateDeleteButtonVisibility();
      Viewport.schedule({ delay: 0, late: 260, forceStick: true });
    }

    /* ---------- delete & logout ---------- */
    async function clearChatAll() {
      if (isLoggedIn()) {
        const tok = getAuthToken();
        try {
          const r = await fetch(API_CLEAR, { method: "POST", headers: { Authorization: "Bearer " + tok } });
          if (r.ok) { await loadLoggedInMessagesToUI(); return; }
        } catch {}
        clearMessagesUI();
        return;
      }
      guestHistory = [];
      saveGuestHistory(guestHistory);
      await renderGuestHistoryToUI();
    }

    async function logout() {
      clearAuthToken();
      me = null;

      updateSessionLabel();
      updateLoginOutButtonLabel();

      chatInput.disabled = false;
      sendBtn.disabled = false;
      searchInput.disabled = false;
      attachBtn.disabled = false;

      clearAttachments();
      showAttachTray();

      guestHistory = [];
      clearGuestHistory();
      resetGuestMeter();

      clearMessagesUI();
      await renderGuestHistoryToUI();
    }

    /* ---------- event wiring ---------- */
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = cleanText(searchInput.value);
      if (!q) return;
      searchInput.value = "";
      searchInput.blur();
      openOverlay();
      askValki(q);
    });

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = cleanText(chatInput.value);
      if (!q && attachments.length === 0) return;
      chatInput.value = "";
      clampComposer();
      askValki(q);
    });

    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }
    });

    attachBtn.addEventListener("click", () => {
      if (chatInput.disabled || isSending) return;
      if (isiOS) {
        try { chatInput.blur(); } catch {}
        Viewport.schedule({ delay: 0, late: 280, forceStick: true });
        setTimeout(() => fileInput.click(), 80);
        return;
      }
      fileInput.click();
    });

    fileInput.addEventListener("change", async () => {
      await addFiles(fileInput.files);
      fileInput.value = "";
      if (isiOS) {
        requestAnimationFrame(() => {
          try { chatInput.focus({ preventScroll: true }); } catch { try { chatInput.focus(); } catch {} }
          Viewport.schedule({ delay: 0, late: 300, forceStick: true });
        });
      }
    });

    closeBtn.addEventListener("click", closeOverlay);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });

    async function openFromBadge(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      openOverlay();
      if (isLoggedIn()) {
        await loadLoggedInMessagesToUI({ forceOpen: false });
      } else {
        guestHistory = loadGuestHistory();
        await renderGuestHistoryToUI();
        if (guestHardBlocked()) openAuthOverlay({ hard: true });
      }
    }
    badge.addEventListener("click", openFromBadge);
    badge.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openFromBadge(e); });

    function attachAccountTrigger(el) {
      el.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        if (isLoggedIn()) openLogoutPrompt();
        else openAuthOverlay({ hard: false });
      });
    }
    attachAccountTrigger(headerAvatar);
    attachAccountTrigger(headerTitle);
    attachAccountTrigger(sessionLabel);
    attachAccountTrigger(heroLoginBtn);

    loginDiscordBtn.addEventListener("click", openDiscordLoginPopup);
    loginGoogleBtn.addEventListener("click", openGoogleLoginPopup);
    joinDiscordBtn.addEventListener("click", () => window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer"));
    authDismiss.addEventListener("click", () => closeAuthOverlay(false));
    authOverlay.addEventListener("click", (e) => { if (e.target === authOverlay) closeAuthOverlay(false); });

    loginOutBtn.addEventListener("click", () => openAuthOverlay({ hard: false }));

    deleteAllBtn.addEventListener("click", () => {
      if (!hasAnyRealMessages() || isSending) return;
      openConfirm();
    });
    confirmNo.addEventListener("click", closeConfirm);
    confirmOverlay.addEventListener("click", (e) => { if (e.target === confirmOverlay) closeConfirm(); });
    confirmYes.addEventListener("click", async () => {
      closeConfirm();
      await clearChatAll();
      updateDeleteButtonVisibility();
    });

    logoutNo.addEventListener("click", closeLogoutPrompt);
    logoutOverlay.addEventListener("click", (e) => { if (e.target === logoutOverlay) closeLogoutPrompt(); });
    logoutYes.addEventListener("click", async () => { closeLogoutPrompt(); await logout(); });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (logoutOverlay.classList.contains("is-visible")) { closeLogoutPrompt(); return; }
      if (confirmOverlay.classList.contains("is-visible")) { closeConfirm(); return; }
      if (authOverlay.classList.contains("is-visible")) { if (!authHard) closeAuthOverlay(false); return; }
      if (isChatOpen()) closeOverlay();
    });

    /* ---------- hero login state ---------- */
    function openLogoutPrompt() { setVisible(logoutOverlay, true); }
    function closeLogoutPrompt() { setVisible(logoutOverlay, false); }

    /* ---------- boot ---------- */
    (async function boot() {
      if (!searchInput.placeholder) searchInput.placeholder = "What went wrong?";
      if (!chatInput.placeholder) chatInput.placeholder = "Message Valki (text optional with images)";

      await fetchMe();
      updateSessionLabel();
      updateLoginOutButtonLabel();

      if (isLoggedIn()) {
        await loadLoggedInMessagesToUI({ forceOpen: false });
      } else {
        guestHistory = loadGuestHistory();
        await renderGuestHistoryToUI();
      }

      updateDeleteButtonVisibility();
      clampComposer();

      Viewport.schedule({ delay: 0, late: 320, forceStick: true });
    })();
  }

  function init() {
    if (document.getElementById("valki-root")) return;

    ensureViewportFitCover();
    injectStyle();
    injectInterFont();
    mountDOM();
    startEngine();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();