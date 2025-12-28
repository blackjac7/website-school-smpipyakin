import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Playwright Test Configuration
 * =============================
 * Konfigurasi untuk E2E testing website SMPI Yakin
 *
 * Dokumentasi: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Direktori test files
  testDir: "./tests",

  // Parallel execution untuk performa
  fullyParallel: true,

  // Gagalkan build jika ada test.only di CI
  forbidOnly: !!process.env.CI,

  // Retry strategy
  retries: process.env.CI ? 2 : 1,

  // Worker threads
  workers: process.env.CI ? 1 : undefined,

  // Reporter - HTML untuk local, GitHub Actions compatible untuk CI
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    ...(process.env.CI ? [["github"] as const] : []),
  ],

  // Global settings untuk semua tests
  use: {
    // Base URL untuk testing
    baseURL: "http://localhost:3000",

    // Collect trace untuk debugging failed tests
    trace: "on-first-retry",

    // Screenshot pada failure
    screenshot: "only-on-failure",

    // Video recording pada retry
    video: "on-first-retry",

    // Timeout settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Global timeout per test
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Browser configurations
  projects: [
    // Desktop Browsers
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Auto-start development server sebelum testing
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Output directory untuk test artifacts
  outputDir: path.join(__dirname, "test-results"),
});
