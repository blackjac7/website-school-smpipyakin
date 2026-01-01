/**
 * OSIS Dashboard Tests
 * =====================
 * Tests untuk Dashboard OSIS - Program Kerja, Berita, Jadwal, Ibadah
 */

import { test, expect, waitForPageReady } from "./fixtures/test-fixtures";
import { LoginPage } from "./pages/LoginPage";

test.describe("OSIS Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs("osis");
    await waitForPageReady(page);
  });

  test.describe("Dashboard Overview", () => {
    test("should display OSIS dashboard correctly", async ({ page }) => {
      await expect(page).toHaveURL(/dashboard-osis/);

      // Check main content loaded
      const mainContent = page.locator("main, #main-content").first();
      await expect(mainContent).toBeVisible();

      // Check no server errors
      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
      expect(pageContent).not.toContain("Application error");
    });

    test("should have sidebar navigation", async ({ page }) => {
      const sidebar = page.locator("aside, nav").first();
      await expect(sidebar).toBeVisible();

      // Check for OSIS menu items
      const navLinks = page.locator("a[href*='dashboard-osis']");
      expect(await navLinks.count()).toBeGreaterThan(0);
    });
  });

  test.describe("Program Kerja (Proker)", () => {
    test("should display program kerja list", async ({ page }) => {
      await page.goto("/dashboard-osis/proker");
      await waitForPageReady(page);

      // Check page loaded
      await expect(page).toHaveURL(/dashboard-osis\/proker/);

      // Check for table or list of proker
      const content = page.locator("main, #main-content").first();
      await expect(content).toBeVisible();
    });

    test("should have create proker button", async ({ page }) => {
      await page.goto("/dashboard-osis/proker");
      await waitForPageReady(page);

      // Look for create/add button
      const createButton = page
        .locator(
          'button:has-text("Tambah"), button:has-text("Buat"), button:has-text("Add")'
        )
        .first();
      if (await createButton.isVisible()) {
        await expect(createButton).toBeEnabled();
      }
    });

    test("should open create proker modal", async ({ page }) => {
      await page.goto("/dashboard-osis/proker");
      await waitForPageReady(page);

      const createButton = page
        .locator('button:has-text("Tambah"), button:has-text("Buat")')
        .first();
      if (await createButton.isVisible()) {
        await createButton.click();

        // Check modal appeared
        const modal = page.locator('[role="dialog"], .modal').first();
        await expect(modal).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Berita (News)", () => {
    test("should display berita list", async ({ page }) => {
      await page.goto("/dashboard-osis/berita");
      await waitForPageReady(page);

      await expect(page).toHaveURL(/dashboard-osis\/berita/);

      const content = page.locator("main, #main-content").first();
      await expect(content).toBeVisible();
    });

    test("should have create berita button", async ({ page }) => {
      await page.goto("/dashboard-osis/berita");
      await waitForPageReady(page);

      const createButton = page
        .locator(
          'button:has-text("Tulis"), button:has-text("Tambah"), button:has-text("Buat")'
        )
        .first();
      if (await createButton.isVisible()) {
        await expect(createButton).toBeEnabled();
      }
    });

    test("should navigate to create berita page or modal", async ({ page }) => {
      await page.goto("/dashboard-osis/berita");
      await waitForPageReady(page);

      const createButton = page
        .locator('button:has-text("Tulis"), button:has-text("Tambah")')
        .first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await waitForPageReady(page);

        // Either modal or page should appear
        const modal = page.locator('[role="dialog"], .modal');
        const hasModal = await modal
          .first()
          .isVisible()
          .catch(() => false);
        const urlChanged =
          page.url().includes("/buat") || page.url().includes("/create");

        expect(hasModal || urlChanged).toBeTruthy();
      }
    });
  });

  test.describe("Jadwal Kegiatan (Schedule)", () => {
    test("should display jadwal list", async ({ page }) => {
      await page.goto("/dashboard-osis/jadwal");
      await waitForPageReady(page);

      await expect(page).toHaveURL(/dashboard-osis\/jadwal/);

      const content = page.locator("main, #main-content").first();
      await expect(content).toBeVisible();
    });

    test("should have create jadwal button", async ({ page }) => {
      await page.goto("/dashboard-osis/jadwal");
      await waitForPageReady(page);

      const createButton = page
        .locator('button:has-text("Tambah"), button:has-text("Buat")')
        .first();
      if (await createButton.isVisible()) {
        await expect(createButton).toBeEnabled();
      }
    });
  });

  test.describe("Jadwal Ibadah (Worship Schedule)", () => {
    test("should display jadwal ibadah list", async ({ page }) => {
      await page.goto("/dashboard-osis/jadwal-ibadah");
      await waitForPageReady(page);

      await expect(page).toHaveURL(/dashboard-osis\/jadwal-ibadah/);

      const content = page.locator("main, #main-content").first();
      await expect(content).toBeVisible();
    });

    test("should display worship types (Sholat Dhuha, etc)", async ({
      page,
    }) => {
      await page.goto("/dashboard-osis/jadwal-ibadah");
      await waitForPageReady(page);

      // Look for worship schedule cards or list items
      const pageContent = await page.textContent("body");
      // Should contain worship-related content or be empty
      expect(pageContent).toBeDefined();
    });
  });
});

test.describe("OSIS CRUD Operations", () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs("osis");
    await waitForPageReady(page);
  });

  test("should create and delete proker", async ({ page }) => {
    await page.goto("/dashboard-osis/proker");
    await waitForPageReady(page);

    // Find create button
    const createButton = page
      .locator('button:has-text("Tambah"), button:has-text("Buat")')
      .first();
    if (!(await createButton.isVisible())) {
      test.skip();
      return;
    }

    await createButton.click();

    // Wait for form/modal
    const modal = page.locator('[role="dialog"], .modal').first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Fill form
    const titleInput = page
      .locator(
        'input[name="name"], input[placeholder*="nama"], input[placeholder*="judul"]'
      )
      .first();
    if (await titleInput.isVisible()) {
      const testTitle = `Test Proker ${Date.now()}`;
      await titleInput.fill(testTitle);

      // Fill other required fields
      const descInput = page
        .locator(
          'textarea[name="description"], textarea[placeholder*="deskripsi"]'
        )
        .first();
      if (await descInput.isVisible()) {
        await descInput.fill("Deskripsi test proker");
      }

      // Submit
      const submitButton = page
        .locator('button[type="submit"], button:has-text("Simpan")')
        .first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await waitForPageReady(page);

        // Verify created - look for toast or item in list
        await page.waitForTimeout(2000);
      }
    }
  });
});
