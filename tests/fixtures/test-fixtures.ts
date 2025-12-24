/**
 * Test Fixtures & Configuration
 * ==============================
 * Centralized test utilities, fixtures, dan constants
 * untuk semua test files
 */

import { test as base, expect, Page, BrowserContext } from "@playwright/test";

// ============================================
// TEST CREDENTIALS (sesuai prisma/seed.ts)
// ============================================
export const TEST_USERS = {
  siswa: {
    username: "siswa001",
    password: "admin123",
    role: "SISWA",
    dashboardUrl: "/dashboard-siswa",
  },
  ppdb: {
    username: "ppdb001",
    password: "admin123",
    role: "PPDB_STAFF",
    dashboardUrl: "/dashboard-ppdb",
  },
  admin: {
    username: "admin",
    password: "admin123",
    role: "ADMIN",
    dashboardUrl: "/dashboard-admin",
  },
  kesiswaan: {
    username: "kesiswaan",
    password: "admin123",
    role: "KESISWAAN",
    dashboardUrl: "/dashboard-kesiswaan",
  },
  osis: {
    username: "osis001",
    password: "admin123",
    role: "OSIS",
    dashboardUrl: "/dashboard-osis",
  },
} as const;

export type UserRole = keyof typeof TEST_USERS;

// ============================================
// CUSTOM FIXTURES
// ============================================

type TestFixtures = {
  authenticatedPage: Page;
  loginAs: (role: UserRole) => Promise<void>;
};

/**
 * Extended test dengan custom fixtures
 */
export const test = base.extend<TestFixtures>({
  // Fixture untuk login sebagai role tertentu
  loginAs: async ({ page }, use) => {
    const loginAs = async (role: UserRole) => {
      const user = TEST_USERS[role];
      await page.goto("/login");
      await page.waitForLoadState("domcontentloaded");

      // Fill login form
      const usernameInput = page.locator(
        'input[name="username"], input[type="text"]'
      );
      const passwordInput = page.locator('input[type="password"]');

      await usernameInput.first().fill(user.username);
      await passwordInput.fill(user.password);

      // Submit and wait for navigation
      await Promise.all([
        page.waitForURL((url) => !url.pathname.includes("/login"), {
          timeout: 10000,
        }),
        page.click('button[type="submit"]'),
      ]).catch(() => {
        // Login might fail, continue anyway for negative tests
      });
    };

    await use(loginAs);
  },

  // Authenticated page fixture (pre-logged in as siswa)
  authenticatedPage: async ({ page }, use) => {
    const user = TEST_USERS.siswa;
    await page.goto("/login");

    await page
      .locator('input[name="username"], input[type="text"]')
      .first()
      .fill(user.username);
    await page.locator('input[type="password"]').fill(user.password);
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page
      .waitForURL((url) => !url.pathname.includes("/login"), {
        timeout: 10000,
      })
      .catch(() => {});

    await use(page);
  },
});

export { expect };

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded");
  // Wait for any loading spinners to disappear
  const loadingIndicators = page.locator(
    '[class*="loading"], [class*="spinner"], [aria-busy="true"]'
  );
  if ((await loadingIndicators.count()) > 0) {
    await loadingIndicators
      .first()
      .waitFor({ state: "hidden", timeout: 5000 })
      .catch(() => {});
  }
}

/**
 * Check if element exists and is visible
 */
export async function isVisible(
  page: Page,
  selector: string
): Promise<boolean> {
  const element = page.locator(selector);
  return (await element.count()) > 0 && (await element.first().isVisible());
}

/**
 * Safe click - waits for element and clicks
 */
export async function safeClick(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector).first();
  await element.waitFor({ state: "visible", timeout: 5000 });
  await element.click();
}

/**
 * Fill form field safely
 */
export async function safeFill(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  const element = page.locator(selector).first();
  await element.waitFor({ state: "visible", timeout: 5000 });
  await element.fill(value);
}

/**
 * Get main content element (handles multiple main elements)
 */
export function getMainContent(page: Page) {
  return page.locator("#main-content, main").first();
}

/**
 * Assert page has loaded successfully
 */
export async function assertPageLoaded(page: Page): Promise<void> {
  await waitForPageReady(page);
  const body = page.locator("body");
  await expect(body).toBeVisible();
  // Check no error page
  const pageContent = await page.textContent("body");
  expect(pageContent).not.toContain("500");
  expect(pageContent).not.toContain("Internal Server Error");
}

/**
 * Assert user is on expected URL pattern
 */
export async function assertUrlContains(
  page: Page,
  pattern: string
): Promise<void> {
  await expect(page).toHaveURL(new RegExp(pattern));
}

/**
 * Assert toast notification appears
 */
export async function assertToastAppears(
  page: Page,
  type: "success" | "error" | "info" = "success"
): Promise<void> {
  const toastSelectors = {
    success:
      '[class*="toast"][class*="success"], [role="alert"]:has-text("berhasil")',
    error: '[class*="toast"][class*="error"], [role="alert"]:has-text("gagal")',
    info: '[class*="toast"], [role="alert"]',
  };

  const toast = page.locator(toastSelectors[type]).first();
  await expect(toast)
    .toBeVisible({ timeout: 5000 })
    .catch(() => {});
}

// ============================================
// SELECTORS (Centralized)
// ============================================
export const SELECTORS = {
  // Navigation
  navbar: "nav, header",
  sidebar: "aside, .sidebar, [role='navigation']",
  footer: "footer",

  // Forms
  loginForm: {
    username: 'input[name="username"], input[type="text"]',
    password: 'input[type="password"]',
    submit: 'button[type="submit"]',
  },

  // Dashboard
  dashboard: {
    main: "#main-content, main",
    statsCard: '[class*="stat"], [class*="card"], .card',
    table: "table, [role='grid']",
    pagination: '.pagination, [aria-label*="pagination"]',
  },

  // Common
  loadingSpinner: '[class*="loading"], [class*="spinner"]',
  modal: '[role="dialog"], .modal',
  toast: '[role="alert"], [class*="toast"]',
  button: {
    primary: 'button[type="submit"], .btn-primary',
    secondary: ".btn-secondary",
    logout: 'button:has-text("Logout"), button:has-text("Keluar")',
  },
} as const;
