# Vichat Widget

Self-injecting Vichat chat widget served as a single script for easy embedding.

## Legacy source (reference)

- `legacy/valki-talki-single.html` holds the original production-ready single-file widget.
- It is the source of truth for HTML structure, CSS, and JavaScript behavior used by the generated widget script.

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm start
   ```
   The server responds to:
   - `GET /` → `OK` (health check)
   - `GET /widget/vichat-widget.js` → serves the widget script with appropriate headers

## Railway deployment notes

- No database or secrets required; the service is frontend-only.
- Deploy the repository to Railway using the default Node runtime and `npm start`.
- The Express server serves `widget/vichat-widget.js` directly for embedding.

## Embed snippet

Add this to any HTML page (update the host to your Railway deployment URL):

```html
<script src="https://YOUR-RAILWAY-URL/widget/vichat-widget.js" data-vichat-tenant="valki" defer></script>
<script src="https://YOUR-RAILWAY-URL/widget/vichat-widget.js" data-vichat-tenant="valki-tanki" defer></script>
```

Tip: clear your browser cache if you don't see the latest widget updates after deployment.
