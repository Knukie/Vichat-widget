import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { maybeRouteBuildAssets } from './helpers/buildAssets';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// tests/ -> repo root is one level up, then test/assets/sample.png
const samplePath = path.join(__dirname, '..', 'test', 'assets', 'sample.png');

test('strict csp attachments flow', async ({ page }) => {
  const pageUrl = new URL('/test/strict-csp.html', baseUrl).toString();
  await maybeRouteBuildAssets(page);

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const badge = widget.locator('>>> .badge');
  await expect(badge).toBeVisible();
  await badge.click();

  const fileInput = widget.locator('>>> .file-input');
  await expect(fileInput).toHaveCount(1);
  await fileInput.setInputFiles(samplePath);

  const trayImage = widget.locator('>>> .attachments-tray img');
  await expect(trayImage.first()).toBeVisible({ timeout: 30_000 });

  const sendButton = widget.locator('>>> .send');
  await expect(sendButton).toBeVisible();
  await expect(sendButton).toBeEnabled({ timeout: 30_000 });
  await sendButton.click();

  const userImage = widget.locator('>>> .message-row.user img');
  await expect(userImage.first()).toBeVisible({ timeout: 30_000 });

  const botMessages = widget.locator('>>> .message-row.bot .bubble').filter({ hasText: /\S+/ });
  await expect(botMessages.first()).toBeVisible({ timeout: 30_000 });

  await page.screenshot({ path: 'csp-attachments-working.png', fullPage: true });
});