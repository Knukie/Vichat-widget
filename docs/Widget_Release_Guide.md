# Widget Release Guide v1

Why this exists: een gebroken `dist/`-bundle maakt de embed direct stuk in productie. Deze korte gids houdt releases licht, snel en verifieerbaar.

## Release Checklist
- Zorg voor een schone working tree en de juiste release branch/tag (Node >= 20 is vereist per `package.json`).
- Installeer dependencies met een clean/frozen lockfile (`npm ci`, `pnpm install --frozen-lockfile` of `yarn install --frozen-lockfile`).
- Build de widget (`npm|pnpm|yarn run build`) om `dist/vichat-widget.min.js` te genereren.
- Draai de JS-sanity check (`node --check dist/vichat-widget.min.js`) zodat syntaxfouten direct falen.
- Vergelijk `dist/` met de vorige release en bevestig dat alleen verwachte wijzigingen aanwezig zijn.
- Publiceer/deploy de nieuwe `dist/vichat-widget.min.js` naar de CDN/hosting.
- Pas cache-busting toe (hash of versie) en invalideer/purge de oude URL bij de CDN.
- Smoke-test met de snippet hieronder tegen de productie-URL: laadt, checkt `window.ViChat`, mount met `theme=valki` en `baseUrl=https://auth.valki.wiki`.
- Spot-check embedding in een testpagina op productie-URL.
- Tag de release en noteer changelog/release notes.

## Sanity Checks
- Primaire check: `node --check dist/vichat-widget.min.js` (Node >= 20). Fails fast op syntax/parsing fouten.
- Optioneel extra: `npx esbuild dist/vichat-widget.min.js --log-level=warning --analyze` om te bevestigen dat de bundel parsebaar blijft.

## Build & Verify Commands
- Install: `npm ci` (of `pnpm install --frozen-lockfile` / `yarn install --frozen-lockfile`).
- Build: `npm run build` (of `pnpm run build` / `yarn run build`), roept `node build/esbuild.mjs` aan.
- Syntax sanity: `node --check dist/vichat-widget.min.js` na de build.
- Optionele rook: `npm run test:e2e:smoke` (of `pnpm|yarn run test:e2e:smoke`) voor de snelle Playwright smoke-set.

## Cache-Busting
- Gebruik een hash of versie in de URL, bijv. `.../vichat-widget.min.js?v=2024-05-15` of een immutable hashnaam `vichat-widget.min.<hash>.js` plus een index die naar de laatste hash wijst.
- Na deploy: purge/ban de oude CDN-cache of werk met korte `max-age` in combinatie met de nieuwe query/hash.

## Mini Smoke Test (10s)
```html
<!doctype html>
<html>
  <body>
    <div id="vichat-root"></div>
    <script src="https://widget.valki.wiki/dist/vichat-widget.min.js" defer></script>
    <script>
      window.addEventListener('load', () => {
        if (!window.ViChat || typeof window.ViChat.mount !== 'function') {
          console.error('ViChat ontbreekt of mount() niet gevonden');
          return;
        }
        window.ViChat.mount({
          theme: 'valki',
          baseUrl: 'https://auth.valki.wiki'
        });
        console.log('ViChat mount gestart');
      });
    </script>
  </body>
</html>
```

### Later automatiseren (optioneel)
- Voeg in CI een stap toe die `npm run build` + `node --check dist/vichat-widget.min.js` + `npm run test:e2e:smoke` draait en de pipeline stopt bij fouten.
