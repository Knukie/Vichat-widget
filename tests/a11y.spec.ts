import { test, expect } from '@playwright/test';
import { maybeRouteBuildAssets } from './helpers/buildAssets';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

test('overlay focus and escape behavior', async ({ page }) => {
  const pageUrl = new URL('/test/step9.html', baseUrl).toString();
  await maybeRouteBuildAssets(page);

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const badge = widget.locator('>>> .badge');
  await expect(badge).toBeVisible();
  await badge.click();

  const input = widget.locator('>>> .chat-input');
  await expect(input).toBeVisible();
  await expect(input).toBeFocused();

  const deleteButton = widget.locator('>>> .header-btn.delete');
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();

  const confirm = widget.locator('>>> .delete-confirm');
  await expect(confirm).toHaveClass(/open/);

  await page.keyboard.press('Escape');
  await expect(confirm).not.toHaveClass(/open/);

  // Overlay should still be open (chat still active)
  await expect(widget.locator('>>> .overlay')).toHaveClass(/open/);

  const closeButton = widget.locator('>>> .header-btn.close');
  await expect(closeButton).toBeVisible();
  await closeButton.click();

  await expect(badge).toBeFocused();

  await page.screenshot({ path: 'step11-a11y.png', fullPage: true });
});