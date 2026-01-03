import { test, expect } from '@playwright/test';
import { getWidgetScriptName, maybeRouteBuildAssets } from './helpers/buildAssets';

test('strict csp chat flow', async ({ page }) => {
  await maybeRouteBuildAssets(page);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const scriptName = await getWidgetScriptName();
  const scriptUrl = `/widget/${scriptName}`;
  const res = await page.request.get(scriptUrl);
  if (res.status() !== 200) {
    throw new Error(`Widget script not reachable: ${scriptUrl} status=${res.status()}`);
  }
  await page.addScriptTag({ url: scriptUrl });
  await page.waitForFunction(() => !!window.customElements?.get('valki-talki-widget'), null, {
    timeout: 10000,
  });
  await page.evaluate(() => {
    if (!document.querySelector('valki-talki-widget')) {
      document.body.appendChild(document.createElement('valki-talki-widget'));
    }
  });
  await expect(page.locator('valki-talki-widget')).toHaveCount(1);

  const widget = page.locator('valki-talki-widget');
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
