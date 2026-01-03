import { test, expect } from '@playwright/test';
import { maybeRouteBuildAssets } from './helpers/buildAssets';

test('step9 migrates legacy storage safely', async ({ page }) => {
  await maybeRouteBuildAssets(page);
  await page.goto('/test/step9.html', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    const legacy = [
      {
        role: 'user',
        text: 'Legacy question',
        attachments: [
          { dataUrl: 'https://cdn.example.com/images/sample.png' },
          { dataUrl: 'data:image/png;base64,AAAA' },
          { dataUrl: 'blob:https://example.com/1234' }
        ]
      },
      {
        role: 'bot',
        content: 'Legacy reply'
      }
    ];
    localStorage.setItem('valki_history_v20', JSON.stringify(legacy));
    localStorage.setItem('valki_client_id_v20', 'legacy-client-123');
    localStorage.removeItem('valki_history_vNext');
    localStorage.removeItem('valki_client_id');
    localStorage.removeItem('valki_migrated_v1');
  });

  await page.reload({ waitUntil: 'networkidle' });

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const migration = await page.evaluate(() => {
    const historyRaw = localStorage.getItem('valki_history_vNext');
    const marker = localStorage.getItem('valki_migrated_v1');
    const clientId = localStorage.getItem('valki_client_id');
    let hasUnsafe = false;
    let parsedLength = 0;
    if (historyRaw) {
      const parsed = JSON.parse(historyRaw);
      parsedLength = Array.isArray(parsed) ? parsed.length : 0;
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          const attachments = Array.isArray(item.attachments) ? item.attachments : [];
          attachments.forEach((attachment) => {
            const url = attachment && attachment.dataUrl ? String(attachment.dataUrl) : '';
            if (url.startsWith('data:') || url.startsWith('blob:')) {
              hasUnsafe = true;
            }
          });
        });
      }
    }
    return { marker, clientId, parsedLength, hasUnsafe };
  });

  expect(migration.marker).toBe('1');
  expect(migration.clientId).toBe('legacy-client-123');
  expect(migration.parsedLength).toBeGreaterThan(0);
  expect(migration.hasUnsafe).toBe(false);

  await page.screenshot({ path: 'step9-migration.png', fullPage: true });
});

test('step9 flags disable uploads and auth UI', async ({ page }) => {
  await page.addInitScript(() => {
    window.__VALKI_FLAGS__ = {
      enableUploads: false,
      enableAuth: false
    };
  });
  await maybeRouteBuildAssets(page);
  await page.goto('/test/step9.html', { waitUntil: 'networkidle' });

  const widget = page.locator('valki-talki-widget');
  await expect(widget).toHaveCount(1);

  const badge = widget.locator('>>> .badge');
  await badge.click();

  const attachButton = widget.locator('>>> .attach');
  await expect(attachButton).toBeHidden();

  const authButton = widget.locator('>>> .header-btn.auth');
  await expect(authButton).toBeHidden();

  await page.screenshot({ path: 'step9-flags.png', fullPage: true });
});
