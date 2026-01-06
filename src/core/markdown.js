function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = resolve;
    el.onerror = reject;
    document.head.appendChild(el);
  });
}

let markdownReady = false;
let markdownLoading = null;

export async function ensureMarkdownLibs() {
  if (markdownReady) return;
  if (markdownLoading) return markdownLoading;
  markdownLoading = (async () => {
    await loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js');
    markdownReady = true;
  })();
  return markdownLoading;
}

export function renderMarkdown(text) {
  if (!text) return '';
  if (window.marked) {
    let html = window.marked.parse(text, { breaks: true });
    if (window.DOMPurify) html = window.DOMPurify.sanitize(html);
    return html;
  }
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

export function hardenLinks(containerEl) {
  if (!containerEl) return;
  containerEl.querySelectorAll('a').forEach((a) => {
    const href = (a.getAttribute('href') || '').trim();
    if (/^javascript:/i.test(href)) a.removeAttribute('href');
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
}
