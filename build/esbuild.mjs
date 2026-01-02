import { createHash } from 'crypto';
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
const loaderTemplatePath = path.join(widgetDir, 'valki-talki.js');
const cssSourcePath = path.join(widgetDir, 'valki-talki.css');

const isProd = process.env.NODE_ENV === 'production';
const sourcemap = !isProd;

const hashContent = (content) => createHash('sha256').update(content).digest('hex').slice(0, 8);

await mkdir(publicDir, { recursive: true });

const jsBuild = await esbuild.build({
  entryPoints: [entryFile],
  bundle: true,
  format: 'iife',
  minify: isProd,
  sourcemap,
  write: false,
  target: ['es2018']
});

const jsOutput = jsBuild.outputFiles.find((file) => file.path.endsWith('.js'));
if (!jsOutput) {
  throw new Error('Missing JS bundle output');
}
const jsContent = jsOutput.text;
const jsHash = hashContent(jsContent);
const jsFileName = `valki-talki-main.${jsHash}.js`;
await writeFile(path.join(publicDir, jsFileName), jsContent);

if (sourcemap) {
  const mapOutput = jsBuild.outputFiles.find((file) => file.path.endsWith('.js.map'));
  if (mapOutput) {
    await writeFile(path.join(publicDir, `${jsFileName}.map`), mapOutput.text);
  }
}

const cssSource = await readFile(cssSourcePath, 'utf8').catch(() => '');
const cssTransform = await esbuild.transform(cssSource, {
  loader: 'css',
  minify: isProd
});
const cssContent = cssTransform.code || '';
const cssHash = hashContent(cssContent);
const cssFileName = `valki-talki.${cssHash}.css`;
await writeFile(path.join(publicDir, cssFileName), cssContent);

const manifest = {
  main: jsFileName,
  css: cssFileName
};
await writeFile(path.join(publicDir, 'valki-talki-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const loaderTemplate = await readFile(loaderTemplatePath, 'utf8');
const loaderContent = loaderTemplate
  .replace(/__MAIN__/g, jsFileName)
  .replace(/__CSS__/g, cssFileName);
await writeFile(path.join(publicDir, 'valki-talki.js'), loaderContent);
