import ValkiTalkiWidget from './ui/widgetElement.js';

(() => {
  if (customElements.get('valki-talki-widget')) return;
  customElements.define('valki-talki-widget', ValkiTalkiWidget);
  if (!document.querySelector('valki-talki-widget')) {
    document.body.appendChild(document.createElement('valki-talki-widget'));
  }
})();
