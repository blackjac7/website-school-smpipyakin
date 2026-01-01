/**
 * Authentication & Authorization Tests
 * =====================================
 * Tests for login, logout, and role-based access control
 */

import {
  test,
  expect,
  TEST_USERS,
  waitForPageReady,
} from "./fixtures/test-fixtures";
import { LoginPage } from "./pages/LoginPage";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login form correctly", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.roleSelect).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.fillCredentials("wronguser", "wrongpass");
    await loginPage.selectRole("admin");
    await loginPage.submit();

    // Should stay on login page or show error
    await page.waitForTimeout(2000);
    const url = new URL(page.url());
    expect(url.pathname).toMatch(/login|error/);
  });

  test("should show error for empty form submission", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.submitButton.click();

    // Form should have required validation
    await page.waitForTimeout(1000);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/login");
  });
});

test.describe("Role-Based Login & Dashboard Access", () => {
  // Test login untuk setiap role
  const roles = Object.keys(TEST_USERS) as Array<keyof typeof TEST_USERS>;

  for (const role of roles) {
    test(`should login as ${role} and access correct dashboard`, async ({
      page,
    }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.loginAs(role);

      await waitForPageReady(page);

      // Should be on correct dashboard
      const expectedUrl = TEST_USERS[role].dashboardUrl;
      await expect(page).toHaveURL(new RegExp(expectedUrl));

      // Dashboard should load without error
      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
      expect(pageContent).not.toContain("Application error");
    });
  }
});

test.describe("Role-Based Access Control (RBAC)", () => {
  test("Siswa cannot access Admin Dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs("siswa");

    // Try to force navigate to admin dashboard
    await page.goto("/dashboard-admin");
    await waitForPageReady(page);

    const url = new URL(page.url());
    expect(url.pathname).not.toBe("/dashboard-admin");
  });

  test("Siswa cannot access Kesiswaan Dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs("siswa");

    await page.goto("/dashboard-kesiswaan");
    await waitForPageReady(page);

    const url = new URL(page.url());
    expect(url.pathname).not.toBe("/dashboard-kesiswaan");
  });

  test("Siswa cannot access OSIS Dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs("siswa");

    await page.goto("/dashboard-osis");
    await waitForPageReady(page);

    const url = new URL(page.url());
    expect(url.pathname).not.toBe("/dashboard-osis");
  });

  test("OSIS cannot access Admin Dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs("osis");

    await page.goto("/dashboard-admin");
    await waitForPageReady(page);

    const url = new URL(page.url());
    expect(url.pathname).not.toBe("/dashboard-admin");
  });

  test("PPDB cannot access Admin Dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs("ppdb");

    await page.goto("/dashboard-admin");
    await waitForPageReady(page);

    const url = new URL(page.url());
    expect(url.pathname).not.toBe("/dashboard-admin");
  });

  test("Unauthenticated user should redirect to login", async ({ page }) => {
    // Clear cookies first
    await page.context().clearCookies();

    await page.goto("/dashboard-admin");
    await waitForPageReady(page);

    const url = new URL(page.url());
    expect(url.pathname).toMatch(/login/);
  });

  test("Unauthenticated user should not access protected routes", async ({
    page,
  }) => {
    await page.context().clearCookies();

    const protectedRoutes = [
      "/dashboard-admin",
      "/dashboard-siswa",
      "/dashboard-osis",
      "/dashboard-kesiswaan",
      "/dashboard-ppdb",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await waitForPageReady(page);
      const url = new URL(page.url());
      expect(url.pathname).not.toBe(route);
    }
  });
});

test.describe("Logout Functionality", () => {
  test("should logout successfully from Admin dashboard", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs("admin");

    await waitForPageReady(page);

    // Find and click logout
    const logoutButton = page
      .locator(
        'button:has-text("Logout"), button:has-text("Keluar"), a:has-text("Logout")'
      )
      .first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await waitForPageReady(page);

      // Should be on login page
      const url = new URL(page.url());
      expect(url.pathname).toMatch(/login/);
    }
  });
});
