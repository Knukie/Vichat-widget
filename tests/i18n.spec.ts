import { test, expect } from '@playwright/test';
import { maybeRouteBuildAssets } from './helpers/buildAssets';

const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

test('nl locale strings', async ({ page }) => {
  await page.addInitScript(() => {
    window.__VALKI_LOCALE__ = 'nl';
  });

  const pageUrl = new URL('/test/step9.html', baseUrl).toString();
  await maybeRouteBuildAssets(page);

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const badge = widget.locator('>>> .badge');
  await expect(badge).toBeVisible();
  await badge.click();

  await expect(widget.locator('>>> .landing-input')).toHaveAttribute('placeholder', 'Vraag Valki...');
  await expect(widget.locator('>>> .chat-input')).toHaveAttribute('placeholder', 'Typ je bericht...');
  await expect(widget.locator('>>> .header-btn.auth')).toHaveText('Inloggen');

  await page.screenshot({ path: 'step11-nl.png', fullPage: true });
});

test('ar locale sets rtl', async ({ page }) => {
  await page.addInitScript(() => {
    window.__VALKI_LOCALE__ = 'ar';
  });

  const pageUrl = new URL('/test/step9.html', baseUrl).toString();
  await maybeRouteBuildAssets(page);

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const root = widget.locator('>>> .root');
  await expect(root).toHaveAttribute('dir', 'rtl');

  await page.screenshot({ path: 'step11-ar.png', fullPage: true });
});