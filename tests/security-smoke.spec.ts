// tests/security-smoke.spec.ts
import { test, expect } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { maybeRouteBuildAssets } from './helpers/buildAssets';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORIGIN = process.env.BASE_URL || 'http://localhost:3000';

declare global {
  interface Window {
    __VALKI_TEST_HOOKS__?: { securitySmoke?: boolean };
  }
}

async function routeHtml(page: any, urlPath: string, filePath: string) {
  const html = await fs.readFile(filePath, 'utf8');
  await page.route(`**${urlPath}`, async (route: any) => {
    await route.fulfill({
      status: 200,
      body: html,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  });
}

test('security smoke: bot content is escaped and links are hardened', async ({ page }) => {
  const strictCspHtmlPath = path.join(__dirname, '..', 'public', 'test', 'strict-csp.html');
  await routeHtml(page, '/test/strict-csp.html', strictCspHtmlPath);
  await maybeRouteBuildAssets(page);

  await page.goto(`${ORIGIN}/test/strict-csp.html`, { waitUntil: 'domcontentloaded' });

  // Keep this evaluate; it should be harmless. If this ever becomes flaky too,
  // we can remove it and just rely on presence of the inject button.
  const hookEnabled = await page.evaluate(() => Boolean(window.__VALKI_TEST_HOOKS__?.securitySmoke));
  if (!hookEnabled) test.skip(true, 'Security smoke test requires an explicit test hook on the page.');

  // Wait until test inject controls exist
  await expect(page.locator('#valki-test-inject-btn')).toHaveCount(1);

  // Set payload and click inject (no page.evaluate needed)
  await page.fill('#valki-test-inject-text', '<img src=x onerror=alert(1)> [bad](javascript:alert(1)) https://example.com');
  await page.click('#valki-test-inject-btn');

  const bubble = page.locator('.valki-msg-row.bot .valki-msg-bubble');
  await expect(bubble).toContainText('<img src=x onerror=alert(1)>');
  await expect(bubble.locator('img')).toHaveCount(0);
  await expect(bubble.locator('a[href^="javascript:"]')).toHaveCount(0);
  await expect(bubble.locator('a[href="https://example.com"]')).toHaveCount(1);

  await page.screenshot({ path: 'step12-security.png', fullPage: true });
});
