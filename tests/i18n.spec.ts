import { test, expect } from '@playwright/test';
import { maybeRouteBuildAssets } from './helpers/buildAssets';

test('nl locale strings', async ({ page }) => {
  await page.addInitScript(() => {
    window.__VALKI_LOCALE__ = 'nl';
  });
  await maybeRouteBuildAssets(page);

  await page.goto('/test/step9.html', { waitUntil: 'networkidle' });

  const widget = page.locator('valki-talki-widget');
  const badge = widget.locator('>>> .badge');
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
  await maybeRouteBuildAssets(page);

  await page.goto('/test/step9.html', { waitUntil: 'networkidle' });

  const widget = page.locator('valki-talki-widget');
  const root = widget.locator('>>> .root');
  await expect(root).toHaveAttribute('dir', 'rtl');

  await page.screenshot({ path: 'step11-ar.png', fullPage: true });
});
