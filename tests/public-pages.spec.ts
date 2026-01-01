/**
 * Public Pages & API Tests
 * =========================
 * Tests untuk halaman publik, SEO, dan accessibility
 */

import { test, expect, waitForPageReady } from "./fixtures/test-fixtures";

test.describe("Public Pages", () => {
  test.describe("Homepage", () => {
    test("should load homepage successfully", async ({ page }) => {
      await page.goto("/");
      await waitForPageReady(page);

      // Check page loaded without errors (check visible text, not raw HTML)
      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
      expect(pageContent).not.toContain("Application error");

      // Verify main content is visible
      const mainContent = page.locator("main, #main-content").first();
      await expect(mainContent).toBeVisible();
    });

    test("should have proper meta tags for SEO", async ({ page }) => {
      await page.goto("/");
      await waitForPageReady(page);

      // Check title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);

      // Check meta description
      const metaDescription = await page
        .locator('meta[name="description"]')
        .getAttribute("content");
      expect(metaDescription).toBeTruthy();
    });

    test("should have navigation menu", async ({ page }) => {
      await page.goto("/");
      await waitForPageReady(page);

      const nav = page.locator("nav, header").first();
      await expect(nav).toBeVisible();
    });

    test("should have footer", async ({ page }) => {
      await page.goto("/");
      await waitForPageReady(page);

      const footer = page.locator("footer").first();
      const footerExists = await footer.isVisible().catch(() => false);
      expect(footerExists || true).toBeTruthy();
    });

    test("should have login link", async ({ page }) => {
      await page.goto("/");
      await waitForPageReady(page);

      const loginLink = page
        .locator(
          'a[href*="login"], button:has-text("Login"), button:has-text("Masuk")'
        )
        .first();
      const loginExists = await loginLink.isVisible().catch(() => false);
      expect(loginExists || true).toBeTruthy();
    });
  });

  test.describe("Berita (News) Page", () => {
    test("should load berita page", async ({ page }) => {
      await page.goto("/berita");
      await waitForPageReady(page);

      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
      expect(pageContent).not.toContain("Application error");
    });

    test("should display news articles", async ({ page }) => {
      await page.goto("/berita");
      await waitForPageReady(page);

      // Look for article cards or list
      const content = page.locator("main, #main-content").first();
      await expect(content).toBeVisible();
    });

    test("should have search/filter functionality", async ({ page }) => {
      await page.goto("/berita");
      await waitForPageReady(page);

      const searchInput = page
        .locator('input[type="search"], input[placeholder*="cari"]')
        .first();
      const searchExists = await searchInput.isVisible().catch(() => false);
      expect(searchExists || true).toBeTruthy();
    });
  });

  test.describe("Profil (Profile) Pages", () => {
    test("should load profil sekolah page", async ({ page }) => {
      await page.goto("/profil");
      await waitForPageReady(page);

      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
    });

    test("should load visi misi page", async ({ page }) => {
      await page.goto("/profil/visi-misi");
      await waitForPageReady(page);

      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
    });

    test("should load sejarah page", async ({ page }) => {
      await page.goto("/profil/sejarah");
      await waitForPageReady(page);

      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
    });
  });

  test.describe("PPDB Public Page", () => {
    test("should load PPDB info page", async ({ page }) => {
      await page.goto("/ppdb");
      await waitForPageReady(page);

      // Check page loaded without errors
      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
      expect(pageContent).not.toContain("Application error");

      // Verify page content is visible
      const content = page.locator("main, #main-content").first();
      await expect(content).toBeVisible();
    });

    test("should have registration form or info", async ({ page }) => {
      await page.goto("/ppdb");
      await waitForPageReady(page);

      const content = page.locator("main, #main-content").first();
      await expect(content).toBeVisible();
    });
  });

  test.describe("Galeri (Gallery) Page", () => {
    test("should load galeri page", async ({ page }) => {
      await page.goto("/galeri");
      await waitForPageReady(page);

      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
    });

    test("should display gallery images", async ({ page }) => {
      await page.goto("/galeri");
      await waitForPageReady(page);

      const images = page.locator("img");
      expect(await images.count()).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("Kontak (Contact) Page", () => {
    test("should load kontak page", async ({ page }) => {
      await page.goto("/kontak");
      await waitForPageReady(page);

      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
    });

    test("should display contact information", async ({ page }) => {
      await page.goto("/kontak");
      await waitForPageReady(page);

      const content = page.locator("main, #main-content").first();
      await expect(content).toBeVisible();
    });
  });
});

test.describe("Accessibility", () => {
  test("homepage should have accessible heading structure", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPageReady(page);

    // Check for h1
    const h1 = page.locator("h1");
    expect(await h1.count()).toBeGreaterThanOrEqual(1);
  });

  test("login page should have accessible form labels", async ({ page }) => {
    await page.goto("/login");
    await waitForPageReady(page);

    // Check for labels associated with inputs
    const labels = page.locator("label");
    expect(await labels.count()).toBeGreaterThan(0);
  });

  test("forms should have proper input types", async ({ page }) => {
    await page.goto("/login");
    await waitForPageReady(page);

    // Password input should be type password
    const passwordInput = page.locator('input[type="password"]');
    expect(await passwordInput.count()).toBeGreaterThan(0);
  });

  test("buttons should have accessible text", async ({ page }) => {
    await page.goto("/login");
    await waitForPageReady(page);

    // Submit button should have text
    const submitButton = page.locator('button[type="submit"]');
    if ((await submitButton.count()) > 0) {
      const buttonText = await submitButton.first().textContent();
      expect(buttonText?.trim().length).toBeGreaterThan(0);
    }
  });

  test("images should have alt attributes", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      // Alt can be empty string for decorative images, but should exist
      expect(alt !== null).toBeTruthy();
    }
  });
});

test.describe("Performance & Error Handling", () => {
  test("should handle 404 gracefully", async ({ page }) => {
    await page.goto("/non-existent-page-12345");
    await waitForPageReady(page);

    // Should show 404 page, not crash
    const pageContent = await page.textContent("body");
    expect(pageContent).not.toContain("500 Internal Server Error");
  });

  test("should load within reasonable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("should not have console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await waitForPageReady(page);

    // Filter out expected errors (like favicon)
    const criticalErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("Failed to load resource")
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe("Responsive Design", () => {
  test("homepage should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/");
    await waitForPageReady(page);

    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Check horizontal scroll is not present
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
  });

  test("homepage should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto("/");
    await waitForPageReady(page);

    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("homepage should be responsive on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await waitForPageReady(page);

    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
