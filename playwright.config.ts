import { defineConfig } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  use: {
    baseURL,
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node tests/helpers/e2e-server.mjs',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: '3000'
    },
    timeout: 120_000
  }
});
