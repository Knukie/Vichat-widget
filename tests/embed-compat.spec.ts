import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { maybeRouteBuildAssets } from './helpers/buildAssets';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const shellPath = path.join(__dirname, '..', 'public', 'shell.html');

const maybeRouteShell = async (page) => {
  await page.route('**/public/shell.html*', async (route) => {
    try {
      const body = await fs.readFile(shellPath);
      await route.fulfill({
        status: 200,
        body,
        headers: {
          'content-type': 'text/html'
        }
      });
    } catch (error) {
      await route.continue();
    }
  });
};

const openShadowWidget = async (page) => {
  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const badge = widget.locator('>>> .badge');
  await expect(badge).toBeVisible();
  await badge.click();

  const input = widget.locator('>>> .chat-input');
  await expect(input).toBeVisible();
  await input.fill('Embed compatibility test');
  await input.press('Enter');

  const userMessage = widget
    .locator('>>> .message-row.user .bubble')
    .filter({ hasText: 'Embed compatibility test' });
  await expect(userMessage).toBeVisible();
};

const openIframeWidget = async (frameLocator) => {
  const badge = frameLocator.locator('.badge');
  await expect(badge).toBeVisible();
  await badge.click();

  const input = frameLocator.locator('.chat-input');
  await expect(input).toBeVisible();
  await input.fill('Embed compatibility test');
  await input.press('Enter');

  const userMessage = frameLocator
    .locator('.message-row.user .bubble')
    .filter({ hasText: 'Embed compatibility test' });
  await expect(userMessage).toBeVisible();
};

test('embed host 1 strict csp', async ({ page }) => {
  await maybeRouteBuildAssets(page);
  await maybeRouteShell(page);
  await page.goto('/test/hosts/host1-strict-csp.html', { waitUntil: 'networkidle' });

  await openShadowWidget(page);
  await page.screenshot({ path: 'embed-host1.png', fullPage: true });
});

test('embed host 2 css hostile', async ({ page }) => {
  await maybeRouteBuildAssets(page);
  await maybeRouteShell(page);
  await page.goto('/test/hosts/host2-css-hostile.html', { waitUntil: 'networkidle' });

  await openShadowWidget(page);
  await page.screenshot({ path: 'embed-host2.png', fullPage: true });
});

test('embed host 3 z-index war', async ({ page }) => {
  await maybeRouteBuildAssets(page);
  await maybeRouteShell(page);
  await page.goto('/test/hosts/host3-zindex-war.html', { waitUntil: 'networkidle' });

  await openShadowWidget(page);
  await page.screenshot({ path: 'embed-host3.png', fullPage: true });
});

test('embed host 4 iframe sandbox', async ({ page }) => {
  await maybeRouteBuildAssets(page);
  await maybeRouteShell(page);
  await page.goto('/test/hosts/host4-iframe-sandbox.html', { waitUntil: 'networkidle' });

  const sandboxFrame = page.frameLocator('#sandbox-frame');
  const widgetFrame = sandboxFrame.frameLocator('iframe[data-valki-embed="iframe"]');

  await openIframeWidget(widgetFrame);
  await page.screenshot({ path: 'embed-host4.png', fullPage: true });
});
