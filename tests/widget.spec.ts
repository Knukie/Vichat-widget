// tests/widget.spec.ts
import { test, expect } from '@playwright/test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { maybeRouteBuildAssets } from './helpers/buildAssets';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We do NOT rely on a real server in CI. We fulfill the HTML via route().
const ORIGIN = 'http://localhost';

async function routeHtml(page: any, urlPath: string, candidatePaths: string[]) {
  const errors: string[] = [];
  let html: string | null = null;
  let resolvedPath: string | null = null;

  for (const candidate of candidatePaths) {
    try {
      html = await fs.readFile(candidate, 'utf8');
      resolvedPath = candidate;
      break;
    } catch (error: any) {
      errors.push(`${candidate} (${error?.code ?? 'unknown error'})`);
    }
  }

  if (!html || !resolvedPath) {
    throw new Error(
      `Unable to locate HTML fixture for ${urlPath}. Tried:\n${errors
        .map((line) => `- ${line}`)
        .join('\n')}`
    );
  }

  await page.route(`**${urlPath}`, async (route: any) => {
    await route.fulfill({
      status: 200,
      body: html,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  });
}

test('strict csp chat flow', async ({ page }) => {
  const strictCspHtmlCandidates = [
    path.join(__dirname, '..', 'public', 'test', 'strict-csp.html'),
    path.join(__dirname, '..', 'public', 'strict-csp.html'),
    path.join(__dirname, '..', 'test', 'strict-csp.html'),
    path.join(__dirname, '..', 'test', 'pages', 'strict-csp.html'),
    path.join(__dirname, '..', 'public', 'tests', 'strict-csp.html')
  ];
  await routeHtml(page, '/test/strict-csp.html', strictCspHtmlCandidates);
  await maybeRouteBuildAssets(page);

  await page.goto(`${ORIGIN}/test/strict-csp.html`, { waitUntil: 'domcontentloaded' });

  // Deterministic script load
  await page.addScriptTag({ src: '/widget/valki-talki.js' });

  // Ensure widget element exists
  await page.evaluate(() => {
    if (!document.querySelector('valki-talki-widget')) {
      const el = document.createElement('valki-talki-widget');
      document.body.appendChild(el);
    }
  });

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const badge = widget.locator('>>> .badge');
  await expect(badge).toBeVisible();
  await badge.click();

  const input = widget.locator('>>> .chat-input');
  await expect(input).toBeVisible();
  await input.fill('hello');
  await input.press('Enter');

  const botMessages = widget.locator('>>> .message-row.bot .bubble').filter({ hasText: /\S+/ });
  await expect(botMessages.first()).toBeVisible({ timeout: 30000 });

  await page.screenshot({ path: 'csp-chat-working.png', fullPage: true });
});
