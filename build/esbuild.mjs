import { mkdir, readFile, writeFile } from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const widgetDir = path.join(rootDir, "widget");
const publicDir = path.join(rootDir, "public");

const entryFile = path.join(widgetDir, "src", "index.js");
const cssSourcePath = path.join(widgetDir, "valki-talki.css");
const packageJsonPath = path.join(rootDir, "package.json");

const JS_FILE = "valki-talki.js";
const CSS_FILE = "valki-talki.css";

const isProd = process.env.NODE_ENV === "production";
const sourcemap = !isProd;

await mkdir(publicDir, { recursive: true });

/**
 * CSS auto-loader banner
 * - Resolves base URL from the <script src=".../valki-talki.js">
 * - Injects <link rel="stylesheet"> once
 * - CSP/nonce aware
 *
 * NEW:
 * - data-valki-version="..." (or window.__VALKI_WIDGET_VERSION__) adds ?v=... to CSS href (unless href already has ?)
 * - data-valki-debug="1" adds ?t=Date.now() to CSS href (unless href already has ?)
 */
const cssLoaderBanner = `
(() => {
  if (typeof document === 'undefined') return;

  const findScript = () => {
    if (document.currentScript && document.currentScript.tagName === 'SCRIPT') {
      return document.currentScript;
    }
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.find(s => (s.getAttribute('src') || '').includes('${JS_FILE}')) || null;
  };

  const resolveBaseUrl = (scriptEl) => {
    const override = scriptEl?.getAttribute('data-valki-src-base');
    if (override) {
      try {
        return new URL(override, document.baseURI).toString().replace(/\\/$/, '');
      } catch {
        return override.replace(/\\/$/, '');
      }
    }

    const src = scriptEl?.getAttribute('src');
    if (!src) return '';

    try {
      const url = new URL(src, document.baseURI);
      url.pathname = url.pathname.split('/').slice(0, -1).join('/');
      return url.origin + url.pathname;
    } catch {
      return src.split('/').slice(0, -1).join('/');
    }
  };

  const buildAssetUrl = (base, asset) => {
    if (!base) return '/' + asset;
    try {
      return new URL(asset, base + '/').toString();
    } catch {
      return base.replace(/\\/$/, '') + '/' + asset;
    }
  };

  const addCacheParam = (asset, { version, debug }) => {
    if (!asset) return asset;
    // If already has query string, don't touch it.
    if (asset.includes('?')) return asset;

    if (debug) return asset + '?t=' + Date.now();
    if (version) return asset + '?v=' + encodeURIComponent(version);

    return asset;
  };

  const scriptEl = findScript();
  const baseUrl = resolveBaseUrl(scriptEl);

  const cssOverride = scriptEl?.getAttribute('data-valki-css-href');

  const debug =
    scriptEl?.getAttribute('data-valki-debug') === '1' ||
    scriptEl?.getAttribute('data-valki-debug') === 'true';

  const version =
    scriptEl?.getAttribute('data-valki-version') ||
    window.__VALKI_WIDGET_VERSION__ ||
    '';

  const cssAsset = addCacheParam((cssOverride || '${CSS_FILE}'), { version, debug });
  const cssHref = buildAssetUrl(baseUrl, cssAsset);

  if (!document.querySelector('link[data-valki-widget="1"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    link.setAttribute('data-valki-widget', '1');

    const nonce =
      window.__VALKI_NONCE__ ||
      scriptEl?.getAttribute('nonce');

    if (nonce) link.nonce = nonce;

    (document.head || document.documentElement).appendChild(link);
  }
})();
`;

/**
 * Build JS – SINGLE classic bundle (IIFE)
 */
const jsBuild = await esbuild.build({
  entryPoints: [entryFile],
  bundle: true,
  format: "iife",
  splitting: false,
  platform: "browser",
  target: ["es2018"],
  minify: isProd,
  sourcemap,
  write: false,
  banner: {
    js: cssLoaderBanner,
  },
});

const jsOutput = jsBuild.outputFiles.find((f) => f.path.endsWith(".js"));
if (!jsOutput) {
  throw new Error("JS bundle not generated");
}

const pkg = JSON.parse(await readFile(packageJsonPath, "utf8"));
const version = pkg.version || "0.0.0";

const jsContent = jsOutput.text.replace(/__VALKI_VERSION__/g, version);
await writeFile(path.join(publicDir, JS_FILE), jsContent);

if (sourcemap) {
  const mapOutput = jsBuild.outputFiles.find((f) => f.path.endsWith(".js.map"));
  if (mapOutput) {
    await writeFile(path.join(publicDir, `${JS_FILE}.map`), mapOutput.text);
  }
}

/**
 * Build CSS (single file, no hash)
 */
const cssSource = await readFile(cssSourcePath, "utf8").catch(() => "");
const cssResult = await esbuild.transform(cssSource, {
  loader: "css",
  minify: isProd,
});

await writeFile(path.join(publicDir, CSS_FILE), cssResult.code || "");

/**
 * Manifest (stable, non-hashed)
 */
const manifest = {
  main: JS_FILE,
  css: CSS_FILE,
};

await writeFile(
  path.join(publicDir, "valki-talki-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n"
);
