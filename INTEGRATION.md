# Valki Talki Integration Guide

## 30-second install

Paste this snippet where you want the widget loader to run (typically in `<head>`).

```html
<script>
  window.__VALKI_BASE_URL__ = "https://auth.valki.wiki";
  window.__VALKI_EMBED_MODE__ = "shadow";
  window.__VALKI_MOUNT_SELECTOR__ = "";
  window.__VALKI_DEBUG__ = false;
  window.__VALKI_FLAGS__ = { "enableUploads": true };
</script>
<script defer src="https://cdn.example.com/valki/valki-talki.js"></script>
```

If your CSP disallows inline scripts, configure via data attributes:

```html
<script
  defer
  src="https://cdn.example.com/valki/valki-talki.js"
  data-valki-base-url="https://auth.valki.wiki"
  data-valki-embed-mode="shadow"
  data-valki-mount-selector=""
  data-valki-debug="false"
  data-valki-flags='{"enableUploads":true}'
></script>
```

## Configuration options (globals)

These are read by the widget at load time. If you use data attributes, they are mapped to the same globals.

- `window.__VALKI_BASE_URL__` (string)
  - Base URL for API/auth calls. Default: `https://auth.valki.wiki`.
- `window.__VALKI_EMBED_MODE__` (string)
  - `"shadow"` (default) or `"iframe"`.
- `window.__VALKI_MOUNT_SELECTOR__` (string)
  - CSS selector for a container to mount into. Default is `<body>`.
- `window.__VALKI_FLAGS__` (object)
  - Feature flags object. Supported keys: `enableIframeMode`, `enableMarkdown`, `enableUploads`, `enableCmpObserver`, `enableAuth`.
- `window.__VALKI_DEBUG__` (boolean)
  - Enables debug logging and diagnostics.

## CSP requirements

You must allow the loader and bundled assets from your CDN, and allow the API origin defined by `__VALKI_BASE_URL__`.

### Shadow mode CSP

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  style-src 'self' https://cdn.example.com;
  connect-src 'self' https://auth.valki.wiki;
  img-src 'self' data: https://cdn.example.com;
  font-src 'self' https://cdn.example.com;
```

### Iframe mode CSP

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.example.com;
  style-src 'self' https://cdn.example.com;
  connect-src 'self' https://auth.valki.wiki;
  frame-src https://cdn.example.com https://auth.valki.wiki;
  img-src 'self' data: https://cdn.example.com;
  font-src 'self' https://cdn.example.com;
```

Notes:
- If you use a dedicated CDN hostname for widget assets, add it to `script-src`, `style-src`, `img-src`, and `font-src`.
- `frame-src` is required only for iframe mode.
