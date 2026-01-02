(() => {
  if (customElements.get('valki-talki-widget')) return;

  class ValkiTalkiWidget extends HTMLElement {
    constructor() {
      super();
      this._open = false;
      this._lockState = null;
      this._onKeyDown = (event) => {
        if (event.key === 'Escape') this.close();
      };
    }

    connectedCallback() {
      if (this.shadowRoot) return;
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          :host { all: initial; }
          .badge {
            position: fixed;
            left: 50%;
            bottom: 20px;
            transform: translateX(-50%);
            z-index: 2147483646;
            background: #111;
            color: #fff;
            border: 0;
            border-radius: 999px;
            padding: 10px 16px;
            font: 14px/1.2 system-ui, sans-serif;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
            cursor: pointer;
          }
          .overlay {
            position: fixed;
            inset: 0;
            display: none;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2147483647;
          }
          .overlay.open { display: flex; }
          .modal {
            width: min(600px, 92vw);
            background: #fff;
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            font: 16px/1.4 system-ui, sans-serif;
            color: #111;
          }
          .close {
            position: absolute;
            top: 16px;
            right: 16px;
            border: 0;
            background: #111;
            color: #fff;
            border-radius: 999px;
            width: 32px;
            height: 32px;
            cursor: pointer;
            font: 16px/1 system-ui, sans-serif;
          }
          .modal-wrap { position: relative; width: 100%; }
        </style>
        <button class="badge" type="button">Valki Talki</button>
        <div class="overlay" aria-hidden="true">
          <div class="modal" role="dialog" aria-modal="true">
            <div class="modal-wrap">
              <button class="close" type="button" aria-label="Close">×</button>
              <div>Skeleton running ✅</div>
            </div>
          </div>
        </div>
      `;

      this._badge = shadow.querySelector('.badge');
      this._overlay = shadow.querySelector('.overlay');
      this._close = shadow.querySelector('.close');

      this._badge.addEventListener('click', () => this.open());
      this._close.addEventListener('click', () => this.close());
      this._overlay.addEventListener('click', (event) => {
        if (event.target === this._overlay) this.close();
      });
      document.addEventListener('keydown', this._onKeyDown);
    }

    disconnectedCallback() {
      document.removeEventListener('keydown', this._onKeyDown);
      if (this._open) this._unlockBody();
    }

    open() {
      if (this._open) return;
      this._open = true;
      this._overlay.classList.add('open');
      this._overlay.setAttribute('aria-hidden', 'false');
      this._lockBody();
    }

    close() {
      if (!this._open) return;
      this._open = false;
      this._overlay.classList.remove('open');
      this._overlay.setAttribute('aria-hidden', 'true');
      this._unlockBody();
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
