(() => {
  if (customElements.get('valki-talki-widget')) return;

  const BASE_URL = window.__VALKI_BASE_URL__ || 'https://auth.valki.wiki';
  const HISTORY_KEY = 'valki_history_vNext';
  const CLIENT_ID_KEY = 'valki_client_id';
  const REQUEST_TIMEOUT_MS = 20000;
  const FALLBACK_REPLY = 'Thanks for your message.';

  class ValkiTalkiWidget extends HTMLElement {
    constructor() {
      super();
      this._open = false;
      this._lockState = null;
      this._messages = [];
      this._typing = false;
      this._confirmOpen = false;
      this._isSending = false;
      this._abortController = null;
      this._clientId = null;
      this._onKeyDown = (event) => {
        if (event.key !== 'Escape') return;
        if (this._confirmOpen) {
          this._hideConfirm();
        } else {
          this.close();
        }
      };
    }

    connectedCallback() {
      if (this.shadowRoot) return;
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          :host{all:initial;}*,*::before,*::after{box-sizing:border-box;}
          .badge{position:fixed;right:20px;bottom:20px;z-index:2147483645;border:0;border-radius:999px;background:#4b7bff;color:#fff;padding:10px 16px;font-size:13px;cursor:pointer;box-shadow:0 10px 24px rgba(0,0,0,.35);font-family:system-ui,sans-serif;}
          :host(.open) .badge{display:none;}
          .landing{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;z-index:2147483646;pointer-events:auto;font-family:system-ui,sans-serif;}
          :host(.open) .landing{display:none;}
          .landing-card{width:min(520px,92vw);background:#111;color:#fff;border-radius:20px;padding:24px;box-shadow:0 16px 40px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:16px;}
          .landing-title{margin:0;font-size:24px;line-height:1.2;}
          .landing-form{display:flex;gap:10px;}
          .landing-input{flex:1;border-radius:999px;border:1px solid #2a2a2a;background:#1c1c1c;color:#fff;padding:12px 16px;font-size:14px;outline:none;}
          .landing-input:focus{border-color:#4b7bff;}
          .landing-send{border:0;background:#4b7bff;color:#fff;border-radius:999px;padding:12px 18px;font-size:14px;cursor:pointer;}
          .landing-send[disabled]{opacity:.6;cursor:default;}
          .overlay{position:fixed;inset:0;display:none;background:#0b0b0b;z-index:2147483647;font-family:system-ui,sans-serif;color:#fff;}
          .overlay.open{display:flex;}
          .chat{width:100%;height:100%;display:flex;flex-direction:column;}
          .header{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.1);}
          .header-title{font-size:16px;font-weight:600;}
          .header-actions{display:flex;gap:8px;}
          .header-btn{border:0;background:#1d1d1d;color:#fff;padding:8px 12px;border-radius:999px;font-size:12px;cursor:pointer;}
          .messages{flex:1;overflow-y:auto;padding:20px 18px 12px;display:flex;flex-direction:column;gap:12px;}
          .message-row{display:flex;}
          .message-row.user{justify-content:flex-end;}
          .bubble{max-width:min(480px,78vw);padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.4;background:#1d1d1d;color:#fff;white-space:pre-wrap;word-break:break-word;}
          .message-row.user .bubble{background:#4b7bff;color:#fff;}
          .typing{display:inline-flex;gap:6px;align-items:center;font-size:13px;opacity:.7;}
          .typing-dot{width:6px;height:6px;border-radius:999px;background:#ccc;animation:blink 1s infinite ease-in-out;}
          .typing-dot:nth-child(2){animation-delay:.2s;}.typing-dot:nth-child(3){animation-delay:.4s;}
          @keyframes blink{0%,100%{opacity:.2;}50%{opacity:1;}}
          .composer{padding:12px 18px 18px;border-top:1px solid rgba(255,255,255,.1);display:flex;gap:10px;align-items:flex-end;}
          .composer textarea{flex:1;border-radius:16px;border:1px solid #2a2a2a;background:#151515;color:#fff;padding:10px 12px;font-size:14px;line-height:1.4;resize:none;outline:none;min-height:42px;max-height:140px;overflow-y:hidden;}
          .composer textarea:focus{border-color:#4b7bff;}
          .composer button{border:0;background:#4b7bff;color:#fff;border-radius:14px;padding:10px 16px;font-size:14px;cursor:pointer;}
          .composer button[disabled]{opacity:.6;cursor:default;}
          .confirm{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:2147483648;font-family:system-ui,sans-serif;}
          .confirm.open{display:flex;}
          .confirm-dialog{width:min(360px,90vw);background:#111;color:#fff;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:16px;}
          .confirm-actions{display:flex;justify-content:flex-end;gap:8px;}
          .confirm-btn{border:0;border-radius:999px;padding:8px 14px;font-size:13px;cursor:pointer;}
          .confirm-btn.cancel{background:#2a2a2a;color:#fff;}
          .confirm-btn.delete{background:#ff4b4b;color:#fff;}
        </style>
        <button class="badge" type="button" aria-label="Open Valki Talki">Valki</button>
        <div class="landing" aria-hidden="false">
          <div class="landing-card">
            <h1 class="landing-title">Crypto stuck? Explained.</h1>
            <form class="landing-form" autocomplete="off">
              <input class="landing-input" type="text" placeholder="Ask Valki..." />
              <button class="landing-send" type="submit">Send</button>
            </form>
          </div>
        </div>
        <div class="overlay" aria-hidden="true">
          <div class="chat" role="dialog" aria-modal="true">
            <div class="header">
              <div class="header-title">Valki Talki</div>
              <div class="header-actions">
                <button class="header-btn delete" type="button">Delete</button>
                <button class="header-btn close" type="button">Close</button>
              </div>
            </div>
            <div class="messages" role="log" aria-live="polite"></div>
            <form class="composer" autocomplete="off">
              <textarea class="chat-input" rows="1" placeholder="Type your message..."></textarea>
              <button class="send" type="submit">Send</button>
            </form>
          </div>
        </div>
        <div class="confirm" aria-hidden="true">
          <div class="confirm-dialog" role="dialog" aria-modal="true">
            <div>Delete all chat history?</div>
            <div class="confirm-actions">
              <button class="confirm-btn cancel" type="button">Cancel</button>
              <button class="confirm-btn delete" type="button">Delete</button>
            </div>
          </div>
        </div>
      `;

      this._badge = shadow.querySelector('.badge');
      this._landingForm = shadow.querySelector('.landing-form');
      this._landingInput = shadow.querySelector('.landing-input');
      this._landingSend = shadow.querySelector('.landing-send');
      this._overlay = shadow.querySelector('.overlay');
      this._messagesEl = shadow.querySelector('.messages');
      this._composerForm = shadow.querySelector('.composer');
      this._chatInput = shadow.querySelector('.chat-input');
      this._sendButton = shadow.querySelector('.send');
      this._close = shadow.querySelector('.close');
      this._delete = shadow.querySelector('.delete');
      this._confirm = shadow.querySelector('.confirm');
      this._confirmCancel = shadow.querySelector('.confirm-btn.cancel');
      this._confirmDelete = shadow.querySelector('.confirm-btn.delete');

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
      this._close.addEventListener('click', () => this.close());
      this._delete.addEventListener('click', () => this._showConfirm());
      this._confirmCancel.addEventListener('click', () => this._hideConfirm());
      this._confirmDelete.addEventListener('click', () => this._clearHistory());
      document.addEventListener('keydown', this._onKeyDown);

      this._loadHistory();
      this._renderMessages(true);
      this._autoGrow(this._chatInput);
    }

    disconnectedCallback() {
      document.removeEventListener('keydown', this._onKeyDown);
      if (this._open) this._unlockBody();
    }

    open() {
      if (this._open) return;
      this._open = true;
      this.classList.add('open');
      this._overlay.classList.add('open');
      this._overlay.setAttribute('aria-hidden', 'false');
      this._lockBody();
      this._chatInput.focus();
    }

    close() {
      if (!this._open) return;
      this._open = false;
      this.classList.remove('open');
      this._overlay.classList.remove('open');
      this._overlay.setAttribute('aria-hidden', 'true');
      this._unlockBody();
    }

    _handleChatSubmit() {
      if (this._isSending) return;
      const value = this._chatInput.value.trim();
      if (!value) return;
      this._chatInput.value = '';
      this._autoGrow(this._chatInput);
      void this._sendMessage(value);
    }

    async _sendMessage(value) {
      if (this._isSending) return;
      this._messages.push({ role: 'user', text: value });
      this._saveHistory();
      this._renderMessages();
      this._setTyping(true);
      this._setSendingState(true);
      try {
        const reply = await this._requestReply(value);
        this._messages.push({ role: 'bot', text: reply });
      } catch (error) {
        this._messages.push({ role: 'bot', text: 'Something went wrong talking to Valki.' });
      } finally {
        this._setTyping(false);
        this._setSendingState(false);
        this._saveHistory();
        this._renderMessages(true);
      }
    }

    _setTyping(isTyping) {
      if (this._typing === isTyping) return;
      this._typing = isTyping;
      this._renderMessages();
    }

    _setSendingState(isSending) {
      this._isSending = isSending;
      if (this._landingSend) this._landingSend.disabled = isSending;
      if (this._sendButton) this._sendButton.disabled = isSending;
    }

    async _requestReply(message) {
      const controller = new AbortController();
      this._abortController = controller;
      let logged = false;
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(`${BASE_URL}/api/valki`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message,
            clientId: this._getClientId()
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          const messageText = await response.text().catch(() => response.statusText);
          this._logApiError(response.status, messageText || response.statusText);
          logged = true;
          throw new Error('api error');
        }

        const data = await response.json().catch(() => ({}));
        const reply = typeof data.reply === 'string' ? data.reply.trim() : '';
        return reply || FALLBACK_REPLY;
      } catch (error) {
        if (!logged) {
          const status = error && error.name === 'AbortError' ? 'timeout' : 'network';
          const messageText = error && error.message ? error.message : 'Request failed';
          this._logApiError(status, messageText);
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
        if (this._abortController === controller) {
          this._abortController = null;
        }
      }
    }

    _logApiError(status, message) {
      console.error('[ValkiTalki] api error', { status, message });
    }

    _getClientId() {
      if (this._clientId) return this._clientId;
      try {
        const stored = localStorage.getItem(CLIENT_ID_KEY);
        if (stored) {
          this._clientId = stored;
          return stored;
        }
      } catch (error) {
        // Ignore storage errors.
      }
      const generated = window.crypto && window.crypto.randomUUID
        ? window.crypto.randomUUID()
        : `client_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      this._clientId = generated;
      try {
        localStorage.setItem(CLIENT_ID_KEY, generated);
      } catch (error) {
        // Ignore storage errors.
      }
      return generated;
    }

    _renderMessages(forceScroll = false) {
      if (!this._messagesEl) return;
      const shouldStick = forceScroll || this._isNearBottom();
      this._messagesEl.innerHTML = '';
      const fragment = document.createDocumentFragment();
      this._messages.forEach((message) => {
        const row = document.createElement('div');
        row.className = `message-row ${message.role}`;
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = message.text;
        row.appendChild(bubble);
        fragment.appendChild(row);
      });
      if (this._typing) {
        const row = document.createElement('div');
        row.className = 'message-row bot';
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const typing = document.createElement('div');
        typing.className = 'typing';
        typing.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        bubble.appendChild(typing);
        row.appendChild(bubble);
        fragment.appendChild(row);
      }
      this._messagesEl.appendChild(fragment);
      if (shouldStick) this._scrollToBottom();
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
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this._messages = parsed.reduce((acc, item) => {
            if (!item || (item.role !== 'user' && item.role !== 'bot')) return acc;
            const text = typeof item.text === 'string'
              ? item.text
              : typeof item.content === 'string'
                ? item.content
                : '';
            if (typeof text === 'string') {
              acc.push({ role: item.role, text });
            }
            return acc;
          }, []);
        }
      } catch (error) {
        this._messages = [];
      }
    }

    _saveHistory() {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(this._messages));
      } catch (error) {
        // Ignore storage errors.
      }
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

    _clearHistory() {
      this._messages = [];
      this._setTyping(false);
      try {
        localStorage.removeItem(HISTORY_KEY);
      } catch (error) {
        // Ignore storage errors.
      }
      this._hideConfirm();
      this._renderMessages(true);
    }

    _lockBody() {
      const body = document.body;
      const scrollY = window.scrollY || window.pageYOffset;
      this._lockState = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        width: body.style.width,
        overflow: body.style.overflow,
        scrollY
      };
      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      body.style.overflow = 'hidden';
    }

    _unlockBody() {
      const body = document.body;
      const state = this._lockState;
      if (!state) return;
      body.style.position = state.position;
      body.style.top = state.top;
      body.style.left = state.left;
      body.style.right = state.right;
      body.style.width = state.width;
      body.style.overflow = state.overflow;
      window.scrollTo(0, state.scrollY || 0);
      this._lockState = null;
    }
  }

  customElements.define('valki-talki-widget', ValkiTalkiWidget);

  if (!document.querySelector('valki-talki-widget')) {
    document.body.appendChild(document.createElement('valki-talki-widget'));
  }
})();
