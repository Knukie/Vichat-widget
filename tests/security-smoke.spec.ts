import { test, expect } from '@playwright/test';
import { getWidgetScriptName, maybeRouteBuildAssets } from './helpers/buildAssets';

declare global {
  interface Window {
    __VALKI_TEST_HOOKS__?: {
      securitySmoke?: boolean;
    };
  }
}

const injectBotMessage = async (page, message) => {
  await page.evaluate((text) => {
    const widget = document.querySelector('valki-talki-widget');
    if (!widget) throw new Error('Widget not found');
    const widgetAny = widget as any;
    widgetAny._messages = [{ role: 'bot', text }];
    widgetAny._renderMessages(true);
  }, message);
};

test('security smoke: bot content is escaped and links are hardened', async ({ page }) => {
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

  const hookEnabled = await page.evaluate(() => Boolean(window.__VALKI_TEST_HOOKS__?.securitySmoke));
  if (!hookEnabled) {
    test.skip(true, 'Security smoke test requires an explicit test hook.');
    return;
  }

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  await injectBotMessage(
    page,
    '<img src=x onerror=alert(1)> [bad](javascript:alert(1)) https://example.com'
  );

  const bubble = widget.locator('>>> .message-row.bot .bubble');
  await expect(bubble).toContainText('<img src=x onerror=alert(1)>');
  await expect(bubble.locator('img')).toHaveCount(0);
  await expect(bubble.locator('a[href^="javascript:"]')).toHaveCount(0);
  await expect(bubble.locator('a[href^="https://example.com"]')).toHaveCount(1);

  await page.screenshot({ path: 'step12-security.png', fullPage: true });
});
