import { promises as fs } from ‘fs’;
import path from ‘path’;
import { fileURLToPath } from ‘node:url’;
import type { Page, Route } from ‘@playwright/test’;

const useBuild = process.env.VALKI_USE_BUILD === ‘1’ || process.env.VALKI_USE_BUILD === undefined;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, ‘..’, ‘..’, ‘public’);
const manifestPath = path.join(publicDir, ‘valki-talki-manifest.json’);

const defaultWidgetScript = ‘valki-talki.js’;

const contentTypeFor = (assetName: string) => {
if (assetName.endsWith(’.css’)) return ‘text/css’;
return ‘application/javascript’;
};

const fulfillAsset = async (route: Route, assetName: string) => {
try {
const filePath = path.join(publicDir, assetName);
const body = await fs.readFile(filePath);
await route.fulfill({
status: 200,
body,
headers: {
‘content-type’: contentTypeFor(assetName)
}
});
} catch {
await route.continue();
}
};

export const maybeRouteBuildAssets = async (page: Page) => {
if (!useBuild) return;

let manifest: { main?: string; css?: string } = {};
try {
const manifestRaw = await fs.readFile(manifestPath, ‘utf8’);
manifest = JSON.parse(manifestRaw) as { main?: string; css?: string };
} catch {
manifest = {};
}

// Always support the stable, non-hashed entry name.
await page.route(’**/widget/valki-talki.js’, async (route) => {
await fulfillAsset(route, defaultWidgetScript);
});

// If a build manifest exists, route hashed assets too.
if (manifest.main) {
await page.route(**/widget/${manifest.main}, async (route) => {
await fulfillAsset(route, manifest.main as string);
});
}

if (manifest.css) {
await page.route(**/widget/${manifest.css}, async (route) => {
await fulfillAsset(route, manifest.css as string);
});
}
};

export const getWidgetScriptName = async (): Promise => {
try {
const manifestRaw = await fs.readFile(manifestPath, ‘utf8’);
const manifest = JSON.parse(manifestRaw) as { main?: string };
return manifest.main || defaultWidgetScript;
} catch {
return defaultWidgetScript;
}
};