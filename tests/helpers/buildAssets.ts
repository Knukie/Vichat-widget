import { promises as fs } from 'fs';
import path from 'path';
import type { Page, Route } from '@playwright/test';

const useBuild = process.env.VALKI_USE_BUILD === '1' || process.env.VALKI_USE_BUILD === undefined;

const publicDir = path.join(__dirname, '..', '..', 'public');
const manifestPath = path.join(publicDir, 'valki-talki-manifest.json');

const contentTypeFor = (assetName: string) => {
  if (assetName.endsWith('.css')) return 'text/css';
  return 'application/javascript';
};

const fulfillAsset = async (route: Route, assetName: string) => {
  try {
    const filePath = path.join(publicDir, assetName);
    const body = await fs.readFile(filePath);
    await route.fulfill({
      status: 200,
      body,
      headers: {
        'content-type': contentTypeFor(assetName)
      }
    });
  } catch (error) {
    await route.continue();
  }
};

export const maybeRouteBuildAssets = async (page: Page) => {
  if (!useBuild) return;
  let manifest: { main?: string; css?: string } = {};
  try {
    const manifestRaw = await fs.readFile(manifestPath, 'utf8');
    manifest = JSON.parse(manifestRaw) as { main?: string; css?: string };
  } catch (error) {
    manifest = {};
  }

  await page.route('**/widget/valki-talki.js', async (route) => {
    await fulfillAsset(route, 'valki-talki.js');
  });

  if (manifest.main) {
    await page.route(`**/widget/${manifest.main}`, async (route) => {
      await fulfillAsset(route, manifest.main as string);
    });
  }

  if (manifest.css) {
    await page.route(`**/widget/${manifest.css}`, async (route) => {
      await fulfillAsset(route, manifest.css as string);
    });
  }
};
