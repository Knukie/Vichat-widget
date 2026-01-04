import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const widgetDir = path.join(rootDir, 'widget');
const publicDir = path.join(rootDir, 'public');
const entryFile = path.join(widgetDir, 'src', 'index.js');
const cssSourcePath = path.join(widgetDir, 'valki-talki.css');
const packageJsonPath = path.join(rootDir, 'package.json');
const cssFileName = 'valki-talki.css';

const isProd = process.env.NODE_ENV === 'production';
const sourcemap = !isProd;

await mkdir(publicDir, { recursive: true });

const cssLoaderBanner = `
(() => {
  if (typeof document === 'undefined') return;
  const findScript = () => {
    if (document.currentScript && document.currentScript.tagName === 'SCRIPT') {
      return document.currentScript;
    }
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.find((script) => (script.getAttribute('src') || '').includes('valki-talki.js')) || null;
  };
  const resolveBaseUrl = (scriptEl) => {
    const override = scriptEl ? scriptEl.getAttribute('data-valki-src-base') : null;
    if (override) {
      try {
        return new URL(override, document.baseURI).toString().replace(/\\/$/, '');
      } catch (error) {
        return override.replace(/\\/$/, '');
      }
    }
    const src = scriptEl ? scriptEl.getAttribute('src') : null;
    if (!src) return '';
    try {
      const resolved = new URL(src, document.baseURI);
      resolved.pathname = resolved.pathname.split('/').slice(0, -1).join('/');
      return \`\${resolved.origin}\${resolved.pathname}\`;
    } catch (error) {
      return src.split('/').slice(0, -1).join('/');
    }
  };
  const buildAssetUrl = (base, asset) => {
    if (!base) return \`/\${asset}\`;
    try {
      return new URL(asset, \`\${base}/\`).toString();
    } catch (error) {
      return \`\${base.replace(/\\/$/, '')}/\${asset}\`;
    }
  };
  const scriptEl = findScript();
  const baseUrl = resolveBaseUrl(scriptEl);
  const cssOverride = scriptEl ? scriptEl.getAttribute('data-valki-css-href') : null;
  const cssHref = buildAssetUrl(baseUrl, cssOverride || '${cssFileName}');
  if (!document.querySelector('link[data-valki-widget="1"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssHref;
    link.setAttribute('data-valki-widget', '1');
    const nonce = window.__VALKI_NONCE__ || (scriptEl ? scriptEl.getAttribute('nonce') : null);
    if (nonce) link.nonce = nonce;
    (document.head || document.documentElement).appendChild(link);
  }
})();
`;

const jsBuild = await esbuild.build({
  entryPoints: [entryFile],
  bundle: true,
  format: 'iife',
  splitting: false,
  platform: 'browser',
  minify: isProd,
  sourcemap,
  write: false,
  target: ['es2018'],
  outfile: path.join(publicDir, 'valki-talki.js'),
  banner: {
    js: cssLoaderBanner
  }
});

const jsOutput = jsBuild.outputFiles.find((file) => file.path.endsWith('.js'));
if (!jsOutput) {
  throw new Error('Missing JS bundle output');
}
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
const jsContent = jsOutput.text;
const versionStamp = packageJson.version || '0.0.0';
const stampedContent = jsContent.replace(/__VALKI_VERSION__/g, versionStamp);
const jsFileName = 'valki-talki.js';
await writeFile(path.join(publicDir, jsFileName), stampedContent);

if (sourcemap) {
  const mapOutput = jsBuild.outputFiles.find((file) => file.path.endsWith('.js.map'));
  if (mapOutput) {
    await writeFile(path.join(publicDir, 'valki-talki.js.map'), mapOutput.text);
  }
}

const cssSource = await readFile(cssSourcePath, 'utf8').catch(() => '');
const cssTransform = await esbuild.transform(cssSource, {
  loader: 'css',
  minify: isProd
});
const cssContent = cssTransform.code || '';
await writeFile(path.join(publicDir, cssFileName), cssContent);

const manifest = {
  main: jsFileName,
  css: cssFileName
};
await writeFile(path.join(publicDir, 'valki-talki-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
