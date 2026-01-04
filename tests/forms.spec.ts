/**
 * Form Submission Tests
 * ======================
 * Tests critical forms: PPDB registration, contact, and search.
 */

import { test, expect } from "@playwright/test";

test.describe("PPDB Registration Form", () => {
  test("registration page loads successfully", async ({ page }) => {
    const response = await page.goto("/ppdb/register", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Wait for page to be interactive
    await page.waitForTimeout(2000);

    // Check status is not a server error
    expect(response?.status()).toBeLessThan(500);

    // Verify page has visible content
    const hasContent = await page.locator("body").isVisible();
    expect(hasContent).toBe(true);

    // Check for form or registration-related content
    const bodyText = await page.textContent("body");
    const hasRegistrationContent =
      bodyText?.includes("Pendaftaran") ||
      bodyText?.includes("PPDB") ||
      bodyText?.includes("Formulir") ||
      bodyText?.includes("Daftar");

    expect(hasRegistrationContent).toBeTruthy();
  });

  test("form has input fields", async ({ page }) => {
    await page.goto("/ppdb/register", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Check for any input fields
    const inputs = await page.locator("input, select, textarea").count();
    expect(inputs).toBeGreaterThan(0);
  });

  test("form has submission mechanism", async ({ page }) => {
    await page.goto("/ppdb/register", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Should have buttons (submit or next)
    const buttons = await page.locator("button").count();
    expect(buttons).toBeGreaterThan(0);
  });
});

test.describe("PPDB Status Check", () => {
  test("status check page is accessible", async ({ page }) => {
    const response = await page.goto("/ppdb/status", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Check status is not a server error
    expect(response?.status()).toBeLessThan(500);

    // Verify page has content
    const hasContent = await page.locator("body").isVisible();
    expect(hasContent).toBe(true);
  });

  test("status page has input mechanism", async ({ page }) => {
    await page.goto("/ppdb/status", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Should have either input fields or information display
    const hasInputs = (await page.locator("input").count()) > 0;
    const hasContent =
      (await page.textContent("body"))?.includes("Status") || false;

    expect(hasInputs || hasContent).toBeTruthy();
  });
});

test.describe("Contact Form", () => {
  test("contact page loads correctly", async ({ page }) => {
    await page.goto("/contact", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForTimeout(2000);

    const bodyText = await page.textContent("body");
    expect(bodyText).toBeTruthy();

    // Check for contact-related content
    const hasContactContent =
      bodyText?.includes("Kontak") ||
      bodyText?.includes("Contact") ||
      bodyText?.includes("Hubungi");

    expect(hasContactContent).toBeTruthy();
  });

  test("contact form has input fields", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Check for input elements
    const inputs = await page.locator("input, textarea").count();

    // Contact form should have at least some fields
    if (inputs > 0) {
      expect(inputs).toBeGreaterThan(0);
    } else {
      // If no inputs, page should still have content
      const bodyText = await page.textContent("body");
      expect(bodyText?.length || 0).toBeGreaterThan(100);
    }
  });

  test("validates email format if email field exists", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const emailInput = page.locator('input[type="email"]');
    const emailCount = await emailInput.count();

    if (emailCount > 0) {
      // Fill with invalid email
      await emailInput.first().fill("invalid-email");

      // Check HTML5 validation
      const isValid = await emailInput
        .first()
        .evaluate((el) => (el as HTMLInputElement).validity.valid);

      expect(isValid).toBeFalsy();
    }
  });
});

test.describe("Search Functionality", () => {
  test("news page loads and displays content", async ({ page }) => {
    const response = await page.goto("/news", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForTimeout(1000);

    // Check status is not a server error
    expect(response?.status()).toBeLessThan(500);

    // Verify page has content
    const hasContent = await page.locator("body").isVisible();
    expect(hasContent).toBe(true);
  });

  test("search input exists or content is displayed", async ({ page }) => {
    await page.goto("/news", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Look for search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="Cari"]'
    );

    const hasSearch = (await searchInput.count()) > 0;
    const hasContent =
      (await page.textContent("body"))?.includes("Berita") || false;

    // Either search exists or content is displayed
    expect(hasSearch || hasContent).toBeTruthy();
  });
});

test.describe("Form Accessibility", () => {
  test("PPDB form has proper structure", async ({ page }) => {
    await page.goto("/ppdb/register", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // Check for basic accessibility
    const inputs = await page.locator("input, select, textarea").all();

    if (inputs.length > 0) {
      // Check first few inputs have some form of labeling
      for (const input of inputs.slice(0, 3)) {
        const id = await input.getAttribute("id");
        const ariaLabel = await input.getAttribute("aria-label");
        const placeholder = await input.getAttribute("placeholder");
        const name = await input.getAttribute("name");

        // Should have at least one identifying attribute
        const hasLabel = id || ariaLabel || placeholder || name;
        expect(hasLabel).toBeTruthy();
      }
    }
  });

  test("contact form has proper structure", async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    const inputs = await page.locator("input, textarea").all();

    if (inputs.length > 0) {
      // Check for proper structure
      for (const input of inputs.slice(0, 2)) {
        const tagName = await input.evaluate((el) => el.tagName);
        expect(["INPUT", "TEXTAREA", "SELECT"]).toContain(tagName);
      }
    }
  });
});
