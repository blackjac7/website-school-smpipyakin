import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { DashboardAdminPage } from "./pages/DashboardPage";
import { prisma } from "../src/lib/prisma";

/**
 * Critical Path Tests
 * ===================
 * Focuses on high-value user flows and database integration.
 * Best practices applied:
 * - Explicit waits instead of waitForTimeout
 * - afterEach cleanup for database operations
 * - Proper timeout configuration per test group
 */

// Wrap the entire critical path suite serially to avoid flakiness caused by
// parallel tests (resource contention / server-side rate limiting / shared state).
test.describe.serial("Critical Path Suite", () => {
  // ============================================================================
  // PUBLIC PAGES - No authentication needed
  // ============================================================================
  test.describe("Public Pages Smoke Test", () => {
    test("Homepage loads correctly", async ({ page }) => {
      await page.goto("/", { timeout: 60000 });
      await expect(page).toHaveTitle(/SMP IP YAKIN/i);
      await expect(page.locator("nav")).toBeVisible();
    });

    test("Login page loads with form elements", async ({ page }) => {
      await page.goto("/login", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // Wait for form to be fully rendered using explicit waits
      const usernameInput = page.locator("#username");
      await usernameInput.waitFor({ state: "attached", timeout: 20000 });
      await usernameInput.waitFor({ state: "visible", timeout: 15000 });

      // Verify all form elements are present
      await expect(usernameInput).toBeVisible();
      await expect(page.locator("#password")).toBeVisible();
      await expect(page.locator("#role")).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("Login fails with invalid credentials", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      // Wait for form to be ready
      await page
        .locator("#username")
        .waitFor({ state: "visible", timeout: 20000 });

      // Fill with invalid credentials
      await page.fill("#username", "invalid_user");
      await page.fill("#password", "wrong_password");
      await page.selectOption("#role", "siswa");

      // Solve captcha
      await loginPage.solveCaptcha();

      // Submit
      await page.click('button[type="submit"]');

      // Should show error - stay on login page
      await expect(page).toHaveURL(/login/, { timeout: 10000 });
    });
  });

  // ============================================================================
  // ADMIN CRITICAL FLOW
  // ============================================================================
  test.describe("Admin Critical Flow", () => {
    test.setTimeout(120000); // 2 minutes for admin flows

    let loginPage: LoginPage;
    let dashboardPage: DashboardAdminPage;
    const uniqueId = Date.now().toString();
    const newsTitle = `Automation Test News ${uniqueId}`;

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      dashboardPage = new DashboardAdminPage(page);
      await loginPage.loginAs("admin");
    });

    // Cleanup after each test - always runs even if test fails
    test.afterEach(async () => {
      await prisma.news.deleteMany({
        where: { title: { startsWith: "Automation Test" } },
      });
    });

    test("Admin can create news and it persists to DB", async ({ page }) => {
      // 1. Navigate to News Management
      await dashboardPage.gotoNews();

      // 2. Ensure News page is ready and open "Tambah Berita" Modal
      const heading = page.locator('h1:has-text("Manajemen Berita")');
      await heading.waitFor({ state: "visible", timeout: 20000 });

      // Use role-based query which is more robust to whitespace/markup changes
      const addButton = page
        .getByRole("button", { name: /Tambah Berita/i })
        .first();

      try {
        await addButton.waitFor({ state: "visible", timeout: 20000 });
        await addButton.click();
      } catch (err) {
        // Capture diagnostics to help triage intermittent failures
        await page.screenshot({
          path: `test-debug-addbutton-${Date.now()}.png`,
          fullPage: true,
        });
        console.error(`Add button not visible. Current URL: ${page.url()}`);
        // Output a snippet of body text to help identify redirects or auth issues
        const bodyText = (await page.textContent("body")) || "";
        console.error("Page body snippet:", bodyText.substring(0, 2000));
        throw err; // re-throw so test still fails but with extra logs/artifacts
      }

      // 3. Wait for modal using explicit selector
      const modal = page.locator('h2:has-text("Tambah Berita")');
      await modal.waitFor({ state: "visible", timeout: 10000 });

      // 4. Fill Form
      await page.fill('input[name="title"]', newsTitle);
      await page.fill(
        'textarea[name="content"]',
        "This is a test content generated by automation testing.",
      );

      // Date is required
      const today = new Date().toISOString().split("T")[0];
      await page.fill('input[name="date"]', today);

      // Category selection
      const categorySelect = page.locator('select[name="kategori"]');
      if (await categorySelect.isVisible()) {
        await categorySelect.selectOption("ACTIVITY");
      }

      // 5. Submit
      await page.click('button:has-text("Simpan Berita")');

      // 6. Wait for success toast
      await expect(page.locator("text=News created")).toBeVisible({
        timeout: 15000,
      });

      // 7. VERIFY IN DATABASE
      await expect(async () => {
        const newsItem = await prisma.news.findFirst({
          where: { title: newsTitle },
        });
        expect(newsItem).not.toBeNull();
        expect(newsItem?.title).toBe(newsTitle);
      }).toPass({ timeout: 5000 });
    });
  });

  // ============================================================================
  // STUDENT CRITICAL FLOW
  // ============================================================================
  test.describe("Student Critical Flow", () => {
    test("Student can login and access their dashboard", async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.loginAs("siswa");

      await expect(page).toHaveURL(/\/dashboard-siswa/);

      // Verify key dashboard elements
      await expect(page.getByText("SISWA AREA")).toBeVisible();
    });
  });

  // ============================================================================
  // PPDB CRITICAL FLOW
  // ============================================================================
  test.describe("PPDB Critical Flow", () => {
    test("PPDB Landing page loads correctly", async ({ page }) => {
      await page.goto("/ppdb", { timeout: 60000 });

      // Check for common elements regardless of Open/Closed status
      await expect(page).toHaveTitle(/PPDB/);

      // Verify it didn't crash
      const content = await page.textContent("body");
      expect(content).not.toContain("Internal Server Error");
      expect(content).not.toContain("Application error");
    });
  });

  // ============================================================================
  // SECURITY & RBAC TESTS
  // ============================================================================
  test.describe("Security & RBAC", () => {
    test.setTimeout(120000);

    test("Student cannot access Admin Dashboard", async ({ page }) => {
      // Login as student
      const loginPage = new LoginPage(page);
      await loginPage.loginAs("siswa");

      // Try to force navigate to admin dashboard
      await page.goto("/dashboard-admin", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      // Should be redirected away from /dashboard-admin
      await page.waitForLoadState("domcontentloaded");
      const currentUrl = new URL(page.url());
      expect(currentUrl.pathname).not.toBe("/dashboard-admin");
    });

    test("Unauthenticated user is redirected from dashboard", async ({
      page,
    }) => {
      // Try to access protected page without login
      await page.goto("/dashboard-admin", { waitUntil: "domcontentloaded" });

      // Should redirect to login
      await expect(page).toHaveURL(/login/, { timeout: 15000 });
    });
  });

  // Close the top-level serial describe
});
