import ValkiTalkiWidget from './ui/widgetElement.js';
import {
  attachIframeBridge,
  createWidgetElement,
  createWidgetIframe,
  findExistingEmbed,
  getEmbedMode,
  resolveMountTarget,
  resolveShellUrl
} from './platform/embed.js';

(() => {
  if (!customElements.get('valki-talki-widget')) {
    customElements.define('valki-talki-widget', ValkiTalkiWidget);
  }

  if (findExistingEmbed()) return;

  const mountWidget = () => {
    if (findExistingEmbed()) return;
    const mountTarget = resolveMountTarget();
    if (!mountTarget) return;

    const mode = getEmbedMode();
    if (mode === 'iframe') {
      const shellUrl = resolveShellUrl();
      if (!shellUrl) {
        console.warn('[ValkiTalki] iframe mode unavailable, falling back to shadow mode');
      } else {
        const iframe = createWidgetIframe(shellUrl);
        mountTarget.appendChild(iframe);
        attachIframeBridge(iframe);
        return;
      }
    }

    mountTarget.appendChild(createWidgetElement());
  };

  if (document.body || document.documentElement) {
    mountWidget();
  } else {
    window.addEventListener('DOMContentLoaded', mountWidget, { once: true });
  }
})();
