import { test, expect } from '@playwright/test';
import { getWidgetScriptName, maybeRouteBuildAssets } from './helpers/buildAssets';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

test('strict csp chat flow', async ({ page }) => {
  const pageUrl = new URL('/test/strict-csp.html', baseUrl).toString();
  await maybeRouteBuildAssets(page);

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

  const widgetScriptName = await getWidgetScriptName();
  const scriptUrl = `/widget/${widgetScriptName}`;

  // Ensure the script is actually reachable (and routed) before continuing.
  await Promise.all([
    page.waitForResponse((r) => r.url().includes(scriptUrl) && r.status() === 200, { timeout: 10_000 }),
    page.addScriptTag({ url: scriptUrl })
  ]);

  // Wait for custom element registration before mounting.
  await page.waitForFunction(() => !!window.customElements?.get('valki-talki-widget'), null, { timeout: 10_000 });

  await page.evaluate(() => {
    if (!document.querySelector('valki-talki-widget')) {
      document.body.appendChild(document.createElement('valki-talki-widget'));
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
  await expect(botMessages.first()).toBeVisible({ timeout: 30_000 });

  await page.screenshot({ path: 'csp-chat-working.png', fullPage: true });
});