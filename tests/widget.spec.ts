import { test, expect } from '@playwright/test';
import { maybeRouteBuildAssets } from './helpers/buildAssets';

test('strict csp chat flow', async ({ page }) => {
  await maybeRouteBuildAssets(page);

  await page.goto('/test/strict-csp.html', { waitUntil: 'networkidle' });

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
