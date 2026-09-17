import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173";

const localServerCommand = [
  "export DATABASE_URL='mysql://medora:medora@127.0.0.1:3306/medora'",
  "export MEDORA_ADMIN_USERNAME='admin'",
  "export MEDORA_ADMIN_PASSWORD='admin'",
  "export PORT='4173'",
  "export NODE_ENV='production'",
  "pnpm build",
  "pnpm db:push",
  "node scripts/provision-medora.mjs --admin admin:admin",
  "node dist/index.js",
].join(" && ");

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results/playwright",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `bash -lc \"${localServerCommand}\"`,
        url: "http://127.0.0.1:4173/",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
