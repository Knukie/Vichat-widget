import {
  BASE_URL,
  GUEST_FREE_ROUND_SIZE,
  GUEST_MAX_ROUNDS
} from '../core/config.js';
import {
  clearGuestMeter,
  clearHistory,
  clearToken,
  getToken,
  readClientId,
  readGuestHistory,
  readGuestMeter,
  readHistory,
  setToken,
  writeClientId,
  writeGuestMeter,
  writeHistory
} from '../core/storage.js';
import { clearServerHistory, importGuestHistory, loadMessages, requestReply } from '../services/api.js';
import { fetchMe, openOAuth } from '../services/auth.js';
import { handleImageFiles } from '../services/upload.js';
import { createCookieObserver, isCookieModalPresent } from '../platform/cmpTermly.js';
import { lockBody, unlockBody } from '../platform/scrollLock.js';
import { updateViewportHeight } from '../platform/viewport.js';
import { renderMarkdown, renderMessages } from './render.js';

const TEMPLATE = `<style>:host{all:initial;--valki-overlay-height:100dvh;font-family:system-ui,sans-serif;box-sizing:border-box;}*,*::before,*::after{box-sizing:border-box;}.badge{position:fixed;right:20px;bottom:20px;z-index:2147483645;border:0;border-radius:999px;background:#4b7bff;color:#fff;padding:10px 16px;font-size:13px;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.35);font-family:system-ui,sans-serif;}:host(.open) .badge{display:none;}.landing{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;z-index:2147483646;pointer-events:auto;font-family:system-ui,sans-serif;}:host(.open) .landing{display:none;}.landing-card{width:min(520px,92vw);background:#111;color:#fff;border-radius:20px;padding:24px;box-shadow:0 16px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:16px;}.landing-title{margin:0;font-size:24px;line-height:1.2;}.landing-form{display:flex;gap:10px;}.landing-input{flex:1;border-radius:999px;border:1px solid #2a2a2a;background:#1c1c1c;color:#fff;padding:12px 16px;font-size:14px;outline:none;}.landing-input:focus{border-color:#4b7bff;}.landing-send{border:0;background:#4b7bff;color:#fff;border-radius:999px;padding:12px 18px;font-size:14px;cursor:pointer;}.landing-send[disabled]{opacity:.6;cursor:default;}.overlay{position:fixed;left:0;right:0;top:0;height:var(--valki-overlay-height,100%);display:none;background:#0b0b0b;z-index:2147483647;font-family:system-ui,sans-serif;color:#fff;}.overlay.open{display:flex;}.chat{width:100%;height:100%;display:flex;flex-direction:column;}.header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.1);gap:12px;}.header-info{display:flex;flex-direction:column;gap:4px;}.header-title{font-size:16px;font-weight:600;}.header-session{font-size:12px;opacity:.75;}.header-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;}.header-btn{border:0;background:#1d1d1d;color:#fff;padding:8px 12px;border-radius:999px;font-size:12px;cursor:pointer;}.messages{flex:1;overflow-y:auto;padding:20px 18px 12px;display:flex;flex-direction:column;gap:12px;}.message-row{display:flex;}.message-row.user{justify-content:flex-end;}.bubble{max-width:min(480px,78vw);padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5;background:#1d1d1d;color:#fff;word-break:break-word;}.message-row.user .bubble{background:#4b7bff;color:#fff;}.bubble p{margin:0 0 8px;}.bubble p:last-child{margin-bottom:0;}.bubble a{color:#9db6ff;text-decoration:none;}.bubble a:hover{text-decoration:underline;}.bubble code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;font-size:12px;background:rgba(255,255,255,.1);padding:2px 4px;border-radius:4px;}.bubble pre{margin:8px 0 0;padding:10px 12px;background:#0f0f0f;border-radius:12px;overflow:auto;}.bubble pre code{display:block;background:transparent;padding:0;font-size:12px;}.message-attachments{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}.message-attachment{width:120px;height:120px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.1);background:#111;}.message-attachment img{width:100%;height:100%;object-fit:cover;display:block;}.typing{display:inline-flex;gap:6px;align-items:center;font-size:13px;opacity:.7;}.typing-dot{width:6px;height:6px;border-radius:999px;background:#ccc;animation:blink 1s infinite ease-in-out;}.typing-dot:nth-child(2){animation-delay:.2s;}.typing-dot:nth-child(3){animation-delay:.4s;}@keyframes blink{0%,100%{opacity:.2;}50%{opacity:1;}}.composer{padding:12px 18px 16px;border-top:1px solid rgba(255,255,255,.1);display:flex;flex-direction:column;gap:8px;}.composer-inner{display:flex;gap:10px;align-items:flex-end;}.composer textarea{flex:1;border-radius:16px;border:1px solid #2a2a2a;background:#151515;color:#fff;padding:10px 12px;font-size:14px;line-height:1.4;resize:none;outline:none;min-height:42px;max-height:140px;overflow-y:hidden;}.composer textarea:focus{border-color:#4b7bff;}.composer button{border:0;background:#4b7bff;color:#fff;border-radius:14px;padding:10px 16px;font-size:14px;cursor:pointer;}.composer button[disabled]{opacity:.6;cursor:default;}.attach{width:38px;height:38px;padding:0;border-radius:999px;background:#1d1d1d;color:#fff;display:flex;align-items:center;justify-content:center;}.file-input{display:none;}.attachments-tray{display:none;gap:8px;flex-wrap:wrap;}.attachments-tray.open{display:flex;}.attachment{width:64px;height:64px;border-radius:12px;overflow:hidden;position:relative;border:1px solid rgba(255,255,255,.12);background:#111;}.attachment img{width:100%;height:100%;object-fit:cover;display:block;}.attachment-remove{position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:999px;border:0;background:rgba(0,0,0,.6);color:#fff;cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;}.composer-disabled{display:none;font-size:12px;opacity:.7;}.composer-disabled.open{display:block;}.confirm{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:2147483650;font-family:system-ui,sans-serif;}.confirm.open{display:flex;}.confirm-dialog{width:min(360px,90vw);background:#111;color:#fff;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:16px;}.confirm-actions{display:flex;justify-content:flex-end;gap:8px;}.confirm-btn{border:0;border-radius:999px;padding:8px 14px;font-size:13px;cursor:pointer;}.confirm-btn.cancel{background:#2a2a2a;color:#fff;}.confirm-btn.delete{background:#ff4b4b;color:#fff;}.confirm-btn.logout{background:#4b7bff;color:#fff;}.auth-overlay{position:fixed;inset:0;background:rgba(10,10,10,.85);display:none;align-items:center;justify-content:center;z-index:2147483649;font-family:system-ui,sans-serif;color:#fff;}.auth-overlay.open{display:flex;}.auth-card{width:min(360px,92vw);background:#111;border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:14px;box-shadow:0 16px 40px rgba(0,0,0,.45);}.auth-title{margin:0;font-size:18px;}.auth-text{font-size:13px;opacity:.8;line-height:1.4;}.auth-actions{display:flex;flex-direction:column;gap:10px;}.auth-btn{border:0;border-radius:999px;padding:10px 14px;font-size:13px;cursor:pointer;background:#2a2a2a;color:#fff;}.auth-btn.primary{background:#4b7bff;}.auth-btn.cookie{background:#1d1d1d;}.auth-dismiss{background:transparent;border:0;color:#aaa;font-size:12px;cursor:pointer;}</style><button class="badge" type="button" aria-label="Open Valki Talki">Valki</button><div class="landing" aria-hidden="false"><div class="landing-card"><h1 class="landing-title">Crypto stuck? Explained.</h1><form class="landing-form" autocomplete="off"><input class="landing-input" type="text" placeholder="Ask Valki..." /><button class="landing-send" type="submit">Send</button></form></div></div><div class="overlay" aria-hidden="true"><div class="chat" role="dialog" aria-modal="true"><div class="header"><div class="header-info"><div class="header-title">Valki Talki</div><div class="header-session">Guest 🟠</div></div><div class="header-actions"><button class="header-btn auth" type="button">Login</button><button class="header-btn delete" type="button">Delete</button><button class="header-btn close" type="button">Close</button></div></div><div class="messages" role="log" aria-live="polite"></div><form class="composer" autocomplete="off"><div class="composer-inner"><button class="attach" type="button" aria-label="Attach image">+</button><textarea class="chat-input" rows="1" placeholder="Type your message..."></textarea><button class="send" type="submit">Send</button></div><input class="file-input" type="file" accept="image/*" multiple /><div class="attachments-tray"></div><div class="composer-disabled">Login required to continue chatting.</div></form></div></div><div class="confirm delete-confirm" aria-hidden="true"><div class="confirm-dialog" role="dialog" aria-modal="true"><div>Delete all chat history?</div><div class="confirm-actions"><button class="confirm-btn cancel" type="button">Cancel</button><button class="confirm-btn delete" type="button">Delete</button></div></div></div><div class="confirm logout-confirm" aria-hidden="true"><div class="confirm-dialog" role="dialog" aria-modal="true"><div>Log out of Valki Talki?</div><div class="confirm-actions"><button class="confirm-btn cancel" type="button">Cancel</button><button class="confirm-btn logout" type="button">Log out</button></div></div></div><div class="auth-overlay" aria-hidden="true"><div class="auth-card" role="dialog" aria-modal="true"><h2 class="auth-title">Log in to continue</h2><div class="auth-text auth-message">Sign in to keep chatting.</div><div class="auth-actions"><button class="auth-btn primary auth-discord" type="button">Continue with Discord</button><button class="auth-btn primary auth-google" type="button">Continue with Google</button><button class="auth-btn cookie cookie-prefs" type="button">See cookie preferences</button></div><button class="auth-dismiss" type="button">Not now</button></div></div>`;

class ValkiTalkiWidget extends HTMLElement {
  constructor() {
    super();
    this._open = false;
    this._lockState = null;
    this._messages = [];
    this._typing = false;
    this._confirmOpen = false;
    this._logoutConfirmOpen = false;
    this._isSending = false;
    this._abortController = null;
    this._clientId = null;
    this._token = getToken();
    this._me = null;
    this._authHard = false;
    this._authOpen = false;
    this._messageListenerAttached = false;
    this._embedMessageListenerAttached = false;
    this._globalListenersAttached = false;
    this._cookieObserver = null;
    this._cookieWarned = false;
    this._attachments = [];
    this._onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (this._logoutConfirmOpen) {
        this._hideLogoutConfirm();
      } else if (this._confirmOpen) {
        this._hideConfirm();
      } else if (this._authOpen) {
        this._closeAuthOverlay();
      } else {
        this.close();
      }
    };
    this._onAuthMessage = (event) => {
      this._handleAuthMessage(event);
    };
    this._onEmbedMessage = (event) => {
      this._handleEmbedMessage(event);
    };
    this._onViewportResize = () => {
      this._handleViewportResize();
    };
  }

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = TEMPLATE;
      this._badge = shadow.querySelector('.badge');
      this._landingForm = shadow.querySelector('.landing-form');
      this._landingInput = shadow.querySelector('.landing-input');
      this._landingSend = shadow.querySelector('.landing-send');
      this._overlay = shadow.querySelector('.overlay');
      this._sessionLabel = shadow.querySelector('.header-session');
      this._authButton = shadow.querySelector('.header-btn.auth');
      this._messagesEl = shadow.querySelector('.messages');
      this._composerForm = shadow.querySelector('.composer');
      this._composerInner = shadow.querySelector('.composer-inner');
      this._chatInput = shadow.querySelector('.chat-input');
      this._sendButton = shadow.querySelector('.send');
      this._attachButton = shadow.querySelector('.attach');
      this._fileInput = shadow.querySelector('.file-input');
      this._attachmentsTray = shadow.querySelector('.attachments-tray');
      this._composerDisabled = shadow.querySelector('.composer-disabled');
      this._close = shadow.querySelector('.close');
      this._delete = shadow.querySelector('.delete');
      this._confirm = shadow.querySelector('.delete-confirm');
      this._confirmCancel = shadow.querySelector('.delete-confirm .confirm-btn.cancel');
      this._confirmDelete = shadow.querySelector('.delete-confirm .confirm-btn.delete');
      this._logoutConfirm = shadow.querySelector('.logout-confirm');
      this._logoutCancel = shadow.querySelector('.logout-confirm .confirm-btn.cancel');
      this._logoutConfirmButton = shadow.querySelector('.logout-confirm .confirm-btn.logout');
      this._authOverlay = shadow.querySelector('.auth-overlay');
      this._authTitle = shadow.querySelector('.auth-title');
      this._authMessage = shadow.querySelector('.auth-message');
      this._authDiscord = shadow.querySelector('.auth-discord');
      this._authGoogle = shadow.querySelector('.auth-google');
      this._authDismiss = shadow.querySelector('.auth-dismiss');
      this._cookiePrefs = shadow.querySelector('.cookie-prefs');

      this._badge.addEventListener('click', () => this.open());
      this._landingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (this._isSending) return;
        const value = this._landingInput.value.trim();
        if (!value) return;
        this._landingInput.value = '';
        this.open();
        void this._sendMessage(value);
      });
      this._composerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        this._handleChatSubmit();
      });
      this._chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          this._handleChatSubmit();
        }
      });
      this._chatInput.addEventListener('input', () => this._autoGrow(this._chatInput));
      this._attachButton.addEventListener('click', () => {
        if (this._chatInput.disabled) return;
        this._fileInput.click();
      });
      this._fileInput.addEventListener('change', () => this._handleFileSelect());
      this._close.addEventListener('click', () => this.close());
      this._delete.addEventListener('click', () => this._showConfirm());
      this._confirmCancel.addEventListener('click', () => this._hideConfirm());
      this._confirmDelete.addEventListener('click', () => {
        void this._clearHistory();
      });
      this._logoutCancel.addEventListener('click', () => this._hideLogoutConfirm());
      this._logoutConfirmButton.addEventListener('click', () => {
        void this._logout();
        this._hideLogoutConfirm();
      });
      this._authButton.addEventListener('click', () => {
        if (this._token) {
          this._showLogoutConfirm();
        } else {
          this._openAuthOverlay({ hard: false });
        }
      });
      this._authDiscord.addEventListener('click', () => this._openOAuth('discord'));
      this._authGoogle.addEventListener('click', () => this._openOAuth('google'));
      this._authDismiss.addEventListener('click', () => this._closeAuthOverlay());
      this._authOverlay.addEventListener('click', (event) => {
        if (event.target === this._authOverlay) {
          this._closeAuthOverlay();
        }
      });
      this._cookiePrefs.addEventListener('click', () => this._openCookiePreferences());
      this._autoGrow(this._chatInput);
    }
    this._attachMessageListener();
    this._attachGlobalListeners();
    this._initCookieObserver();
    this._updateViewportHeight();
    void this._bootstrapState();
  }

  disconnectedCallback() {
    this._detachMessageListener();
    this._detachGlobalListeners();
    if (this._cookieObserver) {
      this._cookieObserver.disconnect();
      this._cookieObserver = null;
    }
    if (this._lockState) this._unlockBody();
  }

  open() {
    if (this._open) return;
    this._open = true;
    this.classList.add('open');
    this._overlay.classList.add('open');
    this._overlay.setAttribute('aria-hidden', 'false');
    this._lockBody();
    this._chatInput.focus();
    this._scrollToBottom();
    this._notifyParent('open');
  }

  close() {
    if (!this._open) return;
    this._open = false;
    this.classList.remove('open');
    this._overlay.classList.remove('open');
    this._overlay.setAttribute('aria-hidden', 'true');
    this._unlockBody();
    this._notifyParent('close');
  }

  _handleChatSubmit() {
    if (this._isSending) return;
    if (this._guestHardBlocked()) {
      this._openAuthOverlay({ hard: true });
      return;
    }
    const value = this._chatInput.value.trim();
    if (!value && this._attachments.length === 0) return;
    this._chatInput.value = '';
    this._autoGrow(this._chatInput);
    void this._sendMessage(value);
  }

  async _sendMessage(value) {
    if (this._isSending) return;
    if (this._guestHardBlocked()) {
      this._openAuthOverlay({ hard: true });
      return;
    }
    const attachments = this._attachments.slice();
    this._clearAttachments();
    this._messages.push({ role: 'user', text: value, attachments });
    this._saveHistory();
    this._renderMessages();
    if (!value) {
      this._maybePromptLoginAfterSend();
      return;
    }
    this._setTyping(true);
    this._setSendingState(true);
    if (!this._token) {
      this._bumpGuestCount();
    }
    try {
      const reply = await this._requestReply(value);
      this._messages.push({ role: 'bot', text: reply });
    } catch (error) {
      this._messages.push({ role: 'bot', text: this._getFriendlyErrorMessage(error) });
    } finally {
      this._setTyping(false);
      this._setSendingState(false);
      this._saveHistory();
      this._renderMessages(true);
      this._maybePromptLoginAfterSend();
    }
  }

  _setTyping(isTyping) {
    if (this._typing === isTyping) return;
    this._typing = isTyping;
    this._renderMessages();
  }

  _setSendingState(isSending) {
    this._isSending = isSending;
    if (this._landingSend) this._landingSend.disabled = isSending || this._landingInput.disabled;
    if (this._sendButton) this._sendButton.disabled = isSending || this._chatInput.disabled;
    if (this._attachButton) this._attachButton.disabled = isSending || this._chatInput.disabled;
  }

  _getFriendlyErrorMessage(error) {
    if (error && error.name === 'AbortError') {
      return 'Request timed out. Please try again.';
    }
    if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
      return 'You appear to be offline. Check your connection.';
    }
    if (error && error.code === 'api') {
      return 'Valki is having trouble right now.';
    }
    return 'Network error. Please try again.';
  }

  async _requestReply(message) {
    try {
      return await requestReply({
        baseUrl: BASE_URL,
        message,
        token: this._token,
        clientId: this._getClientId(),
        onController: (controller) => {
          this._abortController = controller;
        }
      });
    } finally {
      if (this._abortController) {
        this._abortController = null;
      }
    }
  }

  _getClientId() {
    if (this._clientId) return this._clientId;
    const stored = readClientId();
    if (stored) {
      this._clientId = stored;
      return stored;
    }
    const generated = window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `client_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    this._clientId = generated;
    writeClientId(generated);
    return generated;
  }

  _renderMessages(forceScroll = false) {
    renderMessages({
      container: this._messagesEl,
      messages: this._messages,
      typing: this._typing,
      renderMarkdown,
      isNearBottom: () => this._isNearBottom(),
      scrollToBottom: () => this._scrollToBottom(),
      updateDeleteVisibility: () => this._updateDeleteVisibility(),
      forceScroll
    });
  }

  _scrollToBottom() {
    this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
  }

  _isNearBottom() {
    const { scrollTop, scrollHeight, clientHeight } = this._messagesEl;
    return scrollHeight - (scrollTop + clientHeight) < 80;
  }

  _autoGrow(textarea) {
    const styles = getComputedStyle(textarea);
    const lineHeight = parseFloat(styles.lineHeight) || 20;
    const padding = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
    const maxHeight = lineHeight * 4 + padding;
    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  _loadHistory() {
    this._messages = readHistory();
  }

  _saveHistory() {
    if (this._token) return;
    writeHistory(this._messages);
  }

  _showConfirm() {
    this._confirmOpen = true;
    this._confirm.classList.add('open');
    this._confirm.setAttribute('aria-hidden', 'false');
  }

  _hideConfirm() {
    this._confirmOpen = false;
    this._confirm.classList.remove('open');
    this._confirm.setAttribute('aria-hidden', 'true');
  }

  _showLogoutConfirm() {
    this._logoutConfirmOpen = true;
    this._logoutConfirm.classList.add('open');
    this._logoutConfirm.setAttribute('aria-hidden', 'false');
  }

  _hideLogoutConfirm() {
    this._logoutConfirmOpen = false;
    this._logoutConfirm.classList.remove('open');
    this._logoutConfirm.setAttribute('aria-hidden', 'true');
  }

  async _clearHistory() {
    if (this._token) {
      const result = await clearServerHistory({
        baseUrl: BASE_URL,
        token: this._token,
        onUnauthorized: () => this._handleUnauthorized()
      });
      if (result.unauthorized) return;
      if (result.ok) {
        await this._loadLoggedInMessages();
        this._hideConfirm();
        return;
      }
      this._messages = [];
      this._renderMessages(true);
    } else {
      this._messages = [];
      this._setTyping(false);
      clearHistory();
      this._renderMessages(true);
    }
    this._hideConfirm();
  }

  _lockBody() {
    this._lockState = lockBody();
  }

  _unlockBody() {
    unlockBody(this._lockState);
    this._lockState = null;
  }

  async _bootstrapState() {
    this._updateSessionUI();
    if (this._token) {
      await this._loadLoggedInState();
    } else {
      this._loadHistory();
      this._renderMessages(true);
      this._applyGuestLimitState();
    }
  }

  _attachMessageListener() {
    if (this._messageListenerAttached) return;
    window.addEventListener('message', this._onAuthMessage);
    this._messageListenerAttached = true;
    if (this._embedMessageListenerAttached) return;
    window.addEventListener('message', this._onEmbedMessage);
    this._embedMessageListenerAttached = true;
  }

  _detachMessageListener() {
    if (!this._messageListenerAttached) return;
    window.removeEventListener('message', this._onAuthMessage);
    this._messageListenerAttached = false;
    if (!this._embedMessageListenerAttached) return;
    window.removeEventListener('message', this._onEmbedMessage);
    this._embedMessageListenerAttached = false;
  }

  _attachGlobalListeners() {
    if (this._globalListenersAttached) return;
    document.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('resize', this._onViewportResize);
    window.addEventListener('orientationchange', this._onViewportResize);
    this._globalListenersAttached = true;
  }

  _detachGlobalListeners() {
    if (!this._globalListenersAttached) return;
    document.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onViewportResize);
    window.removeEventListener('orientationchange', this._onViewportResize);
    this._globalListenersAttached = false;
  }

  _handleViewportResize() {
    const shouldStick = this._open && this._messagesEl && this._isNearBottom();
    this._updateViewportHeight();
    if (shouldStick) {
      this._scrollToBottom();
    }
  }

  _updateViewportHeight() {
    updateViewportHeight(this);
  }

  _handleAuthMessage(event) {
    void this._handleAuthMessageAsync(event);
  }

  async _handleAuthMessageAsync(event) {
    const origin = new URL(BASE_URL).origin;
    if (event.origin !== origin) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type !== 'valki_auth' || !data.token) return;
    this._token = String(data.token || '');
    setToken(this._token);
    await this._fetchMe();
    this._resetGuestMeter();
    this._authHard = false;
    this._closeAuthOverlay(true);
    this._setComposerDisabled(false);
    await this._importGuestHistory();
    await this._loadLoggedInMessages();
    this._updateSessionUI();
  }

  _getEmbedMessageOrigin() {
    if (typeof window.__VALKI_PARENT_ORIGIN__ === 'string' && window.__VALKI_PARENT_ORIGIN__) {
      return window.__VALKI_PARENT_ORIGIN__;
    }
    if (window.parent && window.parent !== window && document.referrer) {
      try {
        return new URL(document.referrer).origin;
      } catch (error) {
        return '';
      }
    }
    return window.location.origin;
  }

  _handleEmbedMessage(event) {
    const allowedOrigin = this._getEmbedMessageOrigin();
    if (!allowedOrigin || event.origin !== allowedOrigin) return;
    const data = event.data;
    if (!data || typeof data !== 'object' || data.type !== 'valki_embed') return;
    const action = data.action;
    if (action === 'open') {
      this.open();
    } else if (action === 'close') {
      this.close();
    } else if (action === 'toggle') {
      if (this._open) {
        this.close();
      } else {
        this.open();
      }
    } else if (action === 'send') {
      const text = typeof data.text === 'string'
        ? data.text
        : typeof data.message === 'string'
          ? data.message
          : '';
      if (!text && (!data.attachments || !data.attachments.length)) return;
      this.open();
      void this._sendMessage(text);
    }
  }

  _notifyParent(action) {
    if (!window.parent || window.parent === window) return;
    const origin = this._getEmbedMessageOrigin();
    if (!origin) return;
    window.parent.postMessage({ type: 'valki_embed', action }, origin);
  }

  async _fetchMe() {
    if (!this._token) {
      this._me = null;
      return null;
    }
    const me = await fetchMe({
      baseUrl: BASE_URL,
      token: this._token,
      onUnauthorized: () => this._handleUnauthorized()
    });
    this._me = me;
    return me;
  }

  async _loadLoggedInState() {
    await this._fetchMe();
    await this._loadLoggedInMessages();
    this._updateSessionUI();
  }

  async _loadLoggedInMessages() {
    if (!this._token) return false;
    const messages = await loadMessages({
      baseUrl: BASE_URL,
      token: this._token,
      onUnauthorized: () => this._handleUnauthorized()
    });
    if (!messages) return false;
    this._messages = messages;
    this._renderMessages(true);
    return true;
  }

  async _importGuestHistory() {
    if (!this._token) return;
    const guestMessages = this._readGuestHistory();
    if (!guestMessages.length) return;
    const ok = await importGuestHistory({
      baseUrl: BASE_URL,
      token: this._token,
      messages: guestMessages
    });
    if (ok) {
      this._clearGuestHistory();
    }
  }

  _handleUnauthorized() {
    clearToken();
    this._token = '';
    this._me = null;
    this._updateSessionUI();
    this._messages = [];
    this._loadHistory();
    this._renderMessages(true);
    this._applyGuestLimitState();
  }

  _isLoggedIn() {
    return !!this._token;
  }

  _updateSessionUI() {
    if (this._me && this._me.name) {
      this._sessionLabel.textContent = `${this._me.name} 🟢`;
    } else {
      this._sessionLabel.textContent = this._isLoggedIn() ? 'you 🟢' : 'Guest 🟠';
    }
    this._authButton.textContent = this._isLoggedIn() ? 'Log out' : 'Login';
    this._updateDeleteVisibility();
  }

  _updateDeleteVisibility() {
    if (!this._delete) return;
    const hasMessages = this._messages.length > 0;
    this._delete.style.display = hasMessages ? 'inline-flex' : 'none';
  }

  _openAuthOverlay({ hard }) {
    this._authHard = !!hard;
    this._authOpen = true;
    this._authTitle.textContent = this._authHard ? 'Login required' : 'Log in to continue';
    this._authMessage.textContent = this._authHard
      ? 'Guest limit reached. Login required.'
      : 'Sign in to keep your chat history and manage messages.';
    this._authDismiss.style.display = this._authHard ? 'none' : 'inline-block';
    this._authOverlay.classList.add('open');
    this._authOverlay.setAttribute('aria-hidden', 'false');
    if (this._authHard) {
      this._setComposerDisabled(true);
    }
  }

  _closeAuthOverlay(force = false) {
    if (this._authHard && !force) return;
    this._authOpen = false;
    this._authOverlay.classList.remove('open');
    this._authOverlay.setAttribute('aria-hidden', 'true');
  }

  _openOAuth(provider) {
    openOAuth(BASE_URL, provider);
  }

  _setComposerDisabled(disabled) {
    this._chatInput.disabled = disabled;
    this._sendButton.disabled = disabled;
    this._attachButton.disabled = disabled;
    this._fileInput.disabled = disabled;
    this._landingInput.disabled = disabled;
    this._landingSend.disabled = disabled;
    this._composerDisabled.classList.toggle('open', disabled);
  }

  _handleFileSelect() {
    const files = Array.from(this._fileInput.files || []);
    if (!files.length) return;
    handleImageFiles({
      files,
      onLoad: (dataUrl) => {
        this._attachments.push({ id: `${Date.now()}_${Math.random()}`, dataUrl });
        this._renderAttachments();
      },
      onError: () => {
        this._messages.push({ role: 'bot', text: 'Upload failed. Try a different image.' });
        this._renderMessages(true);
      }
    });
    this._fileInput.value = '';
  }

  _renderAttachments() {
    this._attachmentsTray.innerHTML = '';
    if (!this._attachments.length) {
      this._attachmentsTray.classList.remove('open');
      return;
    }
    this._attachmentsTray.classList.add('open');
    this._attachments.forEach((attachment) => {
      const wrap = document.createElement('div');
      wrap.className = 'attachment';
      const img = document.createElement('img');
      img.src = attachment.dataUrl;
      img.alt = 'attachment';
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'attachment-remove';
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        this._attachments = this._attachments.filter((item) => item.id !== attachment.id);
        this._renderAttachments();
      });
      wrap.appendChild(img);
      wrap.appendChild(remove);
      this._attachmentsTray.appendChild(wrap);
    });
  }

  _clearAttachments() {
    this._attachments = [];
    this._attachmentsTray.innerHTML = '';
    this._attachmentsTray.classList.remove('open');
  }

  _getGuestMeter() {
    if (typeof window.__VALKI_TEST_GUEST_COUNT__ === 'number') {
      const count = Math.max(0, window.__VALKI_TEST_GUEST_COUNT__);
      return { count, roundsShown: GUEST_MAX_ROUNDS };
    }
    return readGuestMeter();
  }

  _setGuestMeter(meter) {
    writeGuestMeter(meter);
  }

  _resetGuestMeter() {
    clearGuestMeter();
  }

  _bumpGuestCount() {
    if (this._isLoggedIn()) return;
    const meter = this._getGuestMeter();
    meter.count += 1;
    this._setGuestMeter(meter);
  }

  _guestHardBlocked() {
    if (this._isLoggedIn()) return false;
    const meter = this._getGuestMeter();
    return meter.count >= GUEST_FREE_ROUND_SIZE * GUEST_MAX_ROUNDS;
  }

  _maybePromptLoginAfterSend() {
    if (this._isLoggedIn()) return;
    const meter = this._getGuestMeter();
    const threshold = (meter.roundsShown + 1) * GUEST_FREE_ROUND_SIZE;
    if (meter.count >= threshold && meter.roundsShown < GUEST_MAX_ROUNDS) {
      meter.roundsShown += 1;
      this._setGuestMeter(meter);
      this._openAuthOverlay({ hard: meter.roundsShown >= GUEST_MAX_ROUNDS });
    }
    if (this._guestHardBlocked()) {
      this._openAuthOverlay({ hard: true });
    }
  }

  _applyGuestLimitState() {
    if (this._guestHardBlocked()) {
      this._openAuthOverlay({ hard: true });
      this._setComposerDisabled(true);
    } else {
      this._setComposerDisabled(false);
    }
  }

  _getGuestHistory() {
    return this._messages.slice();
  }

  _clearGuestHistory() {
    clearHistory();
  }

  _readGuestHistory() {
    return readGuestHistory();
  }

  async _logout() {
    clearToken();
    this._token = '';
    this._me = null;
    this._updateSessionUI();
    this._setComposerDisabled(false);
    this._messages = [];
    this._loadHistory();
    this._renderMessages(true);
    this._applyGuestLimitState();
  }

  _openCookiePreferences() {
    this._hideConfirm();
    this._hideLogoutConfirm();
    this._closeAuthOverlay(true);
    this.close();
    if (typeof window.displayPreferenceModal === 'function') {
      window.displayPreferenceModal();
      return;
    }
    if (!this._cookieWarned) {
      console.warn('[ValkiTalki] cookie preferences handler not found');
      this._cookieWarned = true;
    }
  }

  _initCookieObserver() {
    if (this._cookieObserver) return;
    this._cookieObserver = createCookieObserver(() => {
      if (!isCookieModalPresent()) return;
      this._hideConfirm();
      this._hideLogoutConfirm();
      this._closeAuthOverlay(true);
      this.close();
    });
  }
}

export default ValkiTalkiWidget;
