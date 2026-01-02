(() => {
  if (window.__VALKI_TALKI_LOADED__ || document.querySelector('valki-talki-widget, #valki-root')) return;
  console.log('[ValkiTalki] loader: start');
  window.__VALKI_TALKI_LOADED__ = true;
  const getMeta = (sel) => {
    const el = document.querySelector(sel);
    return el ? el.getAttribute('content') : null;
  };
  const nonce = window.__VALKI_NONCE__ || getMeta('meta[name="csp-nonce"]') || getMeta('meta[property="csp-nonce"]');
  const current = document.currentScript && document.currentScript.src;
  const baseUrl = current ? current.split('/').slice(0, -1).join('/') : '';
  const cssHref = `${baseUrl}/valki-talki.css`;
  const mainSrc = `${baseUrl}/valki-talki-main.js`;
  if (!document.querySelector('link[data-valki-widget="1"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    link.setAttribute('data-valki-widget', '1');
    (document.head || document.documentElement).appendChild(link);
  }
  if (!document.querySelector('script[data-valki-widget="1"]')) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = mainSrc;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-valki-widget', '1');
    if (nonce) script.nonce = nonce;
    script.onerror = () => console.error('[ValkiTalki] loader: failed to load', { src: mainSrc });
    (document.head || document.documentElement).appendChild(script);
  }
})();
