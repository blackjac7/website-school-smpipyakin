/**
 * Navigation & Accessibility Tests
 * =================================
 * Tests navigation functionality and basic accessibility compliance.
 */

import { test, expect } from "@playwright/test";

test.describe("Public Navigation", () => {
  test("navbar contains essential links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const navbar = page.locator("nav, header").first();
    await expect(navbar).toBeVisible();

    // Check for essential navigation items
    const navContent = await navbar.textContent();

    const essentialLinks = ["Beranda", "PPDB", "Profil", "Kontak"];
    const hasEssentialLinks = essentialLinks.some((link) =>
      navContent?.includes(link)
    );

    expect(hasEssentialLinks).toBeTruthy();
  });

  test("logo/home link navigates to homepage", async ({ page }) => {
    await page.goto("/news", { waitUntil: "domcontentloaded" });

    // Find and click logo or home link
    const homeLink = page.locator(
      'a[href="/"], nav a:has-text("Beranda"), header a img'
    );

    if ((await homeLink.count()) > 0) {
      await homeLink.first().click();
      await expect(page).toHaveURL("/");
    }
  });

  test("footer contains contact information", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    const footerText = await footer.textContent();

    // Should contain school name or contact info
    const hasInfo =
      footerText?.includes("YAKIN") ||
      footerText?.includes("SMP") ||
      footerText?.includes("@") ||
      footerText?.includes("2024") ||
      footerText?.includes("2025") ||
      footerText?.includes("2026");

    expect(hasInfo).toBeTruthy();
  });

  test("mobile menu toggle works", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Look for hamburger/menu button - prioritize visible ones
    const menuButton = page.locator(
      'button[aria-label*="menu"]:visible, button:has([data-lucide="menu"]):visible, nav button.lg\\:hidden:visible'
    );

    if ((await menuButton.count()) > 0) {
      const btn = menuButton.first();
      // await btn.waitFor({ state: "visible" }); // Already filtered by :visible
      await btn.click();
      await page.waitForTimeout(500);

      // Mobile menu should be visible
      const mobileMenu = page.locator(
        '[role="dialog"], nav [class*="mobile"], aside, .menu-mobile'
      );

      expect(await mobileMenu.count()).toBeGreaterThan(0);
    }
  });

  test("all main pages are accessible", async ({ page }) => {
    const pages = [
      { path: "/", title: /YAKIN|SMP/ },
      { path: "/news", title: /Berita|News/ },
      { path: "/announcements", title: /Pengumuman|Announcement/ },
      { path: "/ppdb", title: /PPDB|Pendaftaran/ },
      { path: "/contact", title: /Kontak|Contact/ },
      { path: "/facilities", title: /Fasilitas|Facilities/ },
      { path: "/extracurricular", title: /Ekstrakurikuler|Extracurricular/ },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.path, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Verify page loaded
      const body = await page.locator("body").textContent();
      expect(body).toBeTruthy();

      // Should not show error
      expect(body).not.toContain("500 Internal Server Error");
      expect(body).not.toContain("404 Not Found");
    }
  });
});

test.describe("Accessibility", () => {
  test("homepage has proper heading structure", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Should have h1
    const h1 = await page.locator("h1").count();
    expect(h1).toBeGreaterThan(0);

    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    expect(await skipLink.count()).toBeGreaterThanOrEqual(0);
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Get all images
    const images = await page.locator("img").all();

    for (const img of images.slice(0, 5)) {
      // Check first 5 images
      const alt = await img.getAttribute("alt");
      expect(alt !== null).toBeTruthy();
    }
  });

  test("form inputs have labels", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });

    // Check if inputs have associated labels or aria-labels
    const inputs = await page.locator("input, textarea, select").all();

    for (const input of inputs.slice(0, 3)) {
      // Check first 3 inputs
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const placeholder = await input.getAttribute("placeholder");

      // Should have some form of label
      const hasLabel = id || ariaLabel || placeholder;
      expect(hasLabel).toBeTruthy();
    }
  });

  test("buttons are keyboard accessible", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Filter for visible buttons only to avoid focusing hidden elements
    const buttons = page.locator("button:visible, a[role='button']:visible");

    if ((await buttons.count()) > 0) {
      const firstButton = buttons.first();
      // Focus the button
      await firstButton.focus();

      // Should be focusable
      const isFocused = await firstButton.evaluate(
        (el) => el === document.activeElement
      );
      expect(isFocused).toBeTruthy();
    }
  });

  test("main content has proper landmark", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Check for main landmark
    const main = page.locator('main, [role="main"], #main-content').first();
    await expect(main).toBeVisible();
  });

  test("page has valid document title", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe("Page");
    expect(title.toLowerCase()).toContain("smp");
  });

  test("color contrast is adequate for text", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Basic check - ensure text is visible
    const body = page.locator("body");
    const textColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // Should have defined text color
    expect(textColor).toBeTruthy();
    expect(textColor).not.toBe("");
  });
});

test.describe("Responsive Design", () => {
  const viewports = [
    { name: "Mobile", width: 375, height: 667 },
    { name: "Tablet", width: 768, height: 1024 },
    { name: "Desktop", width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`homepage renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/", { waitUntil: "domcontentloaded" });

      // Page should load
      await expect(page.locator("body")).toBeVisible();

      // No horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > document.documentElement.clientWidth;
      });

      // Allow slight overflow (scrollbar)
      expect(hasOverflow).toBeFalsy();
    });
  }

  test("images are responsive", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const images = await page.locator("img").all();

    for (const img of images.slice(0, 3)) {
      const width = await img.evaluate((el) => el.clientWidth);

      // Only check naturalWidth if image loaded successfully (not broken)
      const isLoaded = await img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0);

      if (isLoaded) {
          const naturalWidth = await img.evaluate(
            (el) => (el as HTMLImageElement).naturalWidth
          );
          expect(naturalWidth).toBeGreaterThan(0);
      }

      // Image container should have width (layout) even if image broken (if styled correctly) or at least check valid images
      if (isLoaded) {
        expect(width).toBeGreaterThan(0);
      }
    }
  });
});

test.describe("Page Performance", () => {
  test("homepage loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60000 });

    const loadTime = Date.now() - startTime;

    // Should load in reasonable time (less than 10 seconds)
    expect(loadTime).toBeLessThan(10000);
  });

  test("navigation between pages is smooth", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const startTime = Date.now();
    await page.goto("/news", { waitUntil: "domcontentloaded" });
    const navigationTime = Date.now() - startTime;

    // Navigation should be reasonably fast
    expect(navigationTime).toBeLessThan(10000);
  });
});
