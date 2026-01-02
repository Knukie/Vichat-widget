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
const cspTestPath = path.join(__dirname, 'test', 'csp-test.html');

app.get('/valki-talki.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.sendFile(widgetPath);
});

app.get('/valki-talki-main.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.sendFile(widgetMainPath);
});

app.get('/valki-talki.css', (_req, res) => {
  res.setHeader('Content-Type', 'text/css; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.sendFile(widgetCssPath);
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
