import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const widgetPath = path.join(__dirname, 'widget', 'valki-talki.js');
const widgetMainPath = path.join(__dirname, 'widget', 'valki-talki-main.js');
const widgetCssPath = path.join(__dirname, 'widget', 'valki-talki.css');
const widgetManifestPath = path.join(__dirname, 'widget', 'valki-talki.manifest.json');
const cspTestPath = path.join(__dirname, 'test', 'csp-test.html');
const widgetAssetPaths = [
  '/valki-talki.js',
  '/valki-talki-main.js',
  '/valki-talki.css',
  '/valki-talki.manifest.json'
];

const applyWidgetCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

widgetAssetPaths.forEach((route) => {
  app.options(route, (_req, res) => {
    applyWidgetCors(res);
    res.sendStatus(204);
  });
});

app.get('/valki-talki.js', (_req, res) => {
  applyWidgetCors(res);
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.sendFile(widgetPath);
});

app.get('/valki-talki-main.js', (_req, res) => {
  applyWidgetCors(res);
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.sendFile(widgetMainPath);
});

app.get('/valki-talki.css', (_req, res) => {
  applyWidgetCors(res);
  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.sendFile(widgetCssPath);
});

app.get('/valki-talki.manifest.json', (_req, res) => {
  applyWidgetCors(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.sendFile(widgetManifestPath);
});

app.get('/test/csp', (_req, res) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src https://auth.valki.wiki; frame-ancestors 'none';"
  );
  res.sendFile(cspTestPath);
});

app.get('/', (_req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`Valki Talki widget server running on port ${PORT}`);
});
