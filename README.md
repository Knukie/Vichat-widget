# Vichat Widget

Self-injecting ViChat chat widget built from the legacy single-file implementation.

## Legacy source (reference)

- `legacy/valki-talki-single.html` remains the source of truth for HTML structure, CSS, and runtime behavior.
- The refactored bundle preserves the same backend endpoints, request/response schema, and UX flows.

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the distributable bundle:
   ```bash
   npm run build
   ```
   Outputs are written to `dist/vichat-widget.min.js` and `dist/vichat-widget.css`.
3. Start the local server:
   ```bash
   npm start
   ```
   The server responds to:
   - `GET /` → `OK` (health check)
   - `GET /dist/vichat-widget.min.js` → serves the bundled widget
   - `GET /widget/demo.html` → interactive demo for both themes

## Railway deployment notes

- No database or secrets required; the service is frontend-only.
- Deploy the repository to Railway using the default Node runtime and `npm start`.
- Serve the built assets from `/dist`.

## Embed snippets

### ViChat (default theme)
```html
<script src="https://YOUR-RAILWAY-URL/dist/vichat-widget.min.js" defer></script>
<script>
  window.ViChat.mount({
    theme: 'vichat',
    baseUrl: 'https://auth.valki.wiki'
  });
</script>
```

### Valki Talki theme
```html
<script src="https://YOUR-RAILWAY-URL/dist/vichat-widget.min.js" defer></script>
<script>
  window.ViChat.mount({
    theme: 'valki',
    baseUrl: 'https://auth.valki.wiki'
  });
</script>
```

Tip: clear your browser cache if you don't see the latest widget updates after deployment.
