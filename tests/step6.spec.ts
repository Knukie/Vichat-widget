import { test, expect } from '@playwright/test';
import path from 'path';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

test('step6 overlay open/close with escape', async ({ page }) => {
  const pageUrl = new URL('/test/step6.html', baseUrl).toString();
  await page.goto(pageUrl, { waitUntil: 'networkidle' });

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const badge = widget.locator('>>> .badge');
  await expect(badge).toBeVisible();
  await badge.click();

  const overlay = widget.locator('>>> .overlay');
  await expect(overlay).toHaveClass(/open/);

  await page.keyboard.press('Escape');
  await expect(overlay).not.toHaveClass(/open/);

  await page.screenshot({ path: 'step6-open-close.png', fullPage: true });
});

test('step6 text chat flow', async ({ page }) => {
  const pageUrl = new URL('/test/step6.html', baseUrl).toString();
  await page.goto(pageUrl, { waitUntil: 'networkidle' });

  const widget = page.locator('valki-talki-widget');
  const badge = widget.locator('>>> .badge');
  await badge.click();

  const input = widget.locator('>>> .chat-input');
  await expect(input).toBeVisible();
  await input.fill('Hello from step 6');
  await input.press('Enter');

  const botMessages = widget.locator('>>> .message-row.bot .bubble').filter({ hasText: /\S+/ });
  await expect(botMessages.first()).toBeVisible({ timeout: 30000 });

  await page.screenshot({ path: 'step6-text.png', fullPage: true });
});

test('step6 attachments flow', async ({ page }) => {
  const pageUrl = new URL('/test/step6.html', baseUrl).toString();
  const samplePath = path.join(__dirname, '../test/assets/sample.png');
  await page.goto(pageUrl, { waitUntil: 'networkidle' });

  const widget = page.locator('valki-talki-widget');
  const badge = widget.locator('>>> .badge');
  await badge.click();

  const fileInput = widget.locator('>>> .file-input');
  await fileInput.setInputFiles(samplePath);

  const trayImage = widget.locator('>>> .attachments-tray img');
  await expect(trayImage.first()).toBeVisible({ timeout: 30000 });

  const sendButton = widget.locator('>>> .send');
  await sendButton.click();

  const userImage = widget.locator('>>> .message-row.user img');
  await expect(userImage.first()).toBeVisible({ timeout: 30000 });

  await page.screenshot({ path: 'step6-attach.png', fullPage: true });
});

test('step6 guest hard block disables composer', async ({ page }) => {
  await page.addInitScript(() => {
    window.__VALKI_TEST_GUEST_COUNT__ = 999;
  });
  const pageUrl = new URL('/test/step6.html', baseUrl).toString();
  await page.goto(pageUrl, { waitUntil: 'networkidle' });

  const widget = page.locator('valki-talki-widget');
  const badge = widget.locator('>>> .badge');
  await badge.click();

  const authOverlay = widget.locator('>>> .auth-overlay');
  await expect(authOverlay).toHaveClass(/open/);

  const input = widget.locator('>>> .chat-input');
  await expect(input).toBeDisabled();

  await page.screenshot({ path: 'step6-guest-block.png', fullPage: true });
});
