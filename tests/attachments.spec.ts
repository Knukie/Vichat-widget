import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { maybeRouteBuildAssets } from './helpers/buildAssets';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('strict csp attachments flow', async ({ page }) => {
  const samplePath = path.join(__dirname, '../test/assets/sample.png');
  await maybeRouteBuildAssets(page);

  await page.goto('/test/strict-csp.html', { waitUntil: 'networkidle' });

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const badge = widget.locator('>>> .badge');
  await expect(badge).toBeVisible();
  await badge.click();

  const fileInput = widget.locator('>>> .file-input');
  await fileInput.setInputFiles(samplePath);

  const trayImage = widget.locator('>>> .attachments-tray img');
  await expect(trayImage.first()).toBeVisible({ timeout: 30000 });

  const sendButton = widget.locator('>>> .send');
  await expect(sendButton).toBeEnabled({ timeout: 30000 });
  await sendButton.click();

  const userImage = widget.locator('>>> .message-row.user img');
  await expect(userImage.first()).toBeVisible({ timeout: 30000 });

  const botMessages = widget.locator('>>> .message-row.bot .bubble').filter({ hasText: /\S+/ });
  await expect(botMessages.first()).toBeVisible({ timeout: 30000 });

  await page.screenshot({ path: 'csp-attachments-working.png', fullPage: true });
});
