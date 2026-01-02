import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const widgetDir = path.join(__dirname, 'widget');
const cspTestPath = path.join(__dirname, 'test', 'csp-test.html');
const applyWidgetCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Allow', 'GET, OPTIONS');
};

app.options('/widget/*', (_req, res) => {
  applyWidgetCors(res);
  res.sendStatus(204);
});

app.use(
  '/widget',
  express.static(widgetDir, {
    setHeaders: (res) => {
      applyWidgetCors(res);
      res.setHeader('Cache-Control', 'public, max-age=60');
    }
  })
);

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
