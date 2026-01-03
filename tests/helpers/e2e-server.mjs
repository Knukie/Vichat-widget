import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');
const publicDir = path.join(rootDir, 'public');
const testDir = path.join(rootDir, 'test');

const contentTypeFor = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.js':
      return 'application/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
};

const sendNotFound = (res) => {
  res.statusCode = 404;
  res.end('Not found');
};

const serveStatic = async (res, root, urlPath) => {
  const decodedPath = decodeURIComponent(urlPath);
  const filePath = path.normalize(path.join(root, decodedPath));
  if (!filePath.startsWith(root)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sendNotFound(res);
      return;
    }
    const body = await fs.readFile(filePath);
    res.statusCode = 200;
    res.setHeader('content-type', contentTypeFor(filePath));
    res.end(body);
  } catch (error) {
    sendNotFound(res);
  }
};

const applyWidgetCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Allow', 'GET, OPTIONS');
};

const server = createServer(async (req, res) => {
  if (!req.url) {
    sendNotFound(res);
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS' && url.pathname.startsWith('/widget/')) {
    applyWidgetCors(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  if (url.pathname === '/') {
    res.statusCode = 200;
    res.end('OK');
    return;
  }

  if (url.pathname.startsWith('/widget/')) {
    applyWidgetCors(res);
    const relPath = url.pathname.replace('/widget/', '');
    await serveStatic(res, publicDir, relPath);
    return;
  }

  if (url.pathname.startsWith('/test/')) {
    const relPath = url.pathname.replace('/test/', '');
    await serveStatic(res, testDir, relPath);
    return;
  }

  sendNotFound(res);
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`Playwright E2E server running on port ${port}`);
});
