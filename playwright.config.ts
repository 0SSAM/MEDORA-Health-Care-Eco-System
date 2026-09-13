import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 30000,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  reporter: 'list',
});
