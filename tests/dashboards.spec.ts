/**
 * Dashboard Smoke Tests
 * ======================
 * Simple smoke tests for all role dashboards.
 * Verifies that each dashboard loads without errors.
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";

// All roles to test
const ROLES = ["admin", "siswa", "kesiswaan", "osis", "ppdb"] as const;
type Role = (typeof ROLES)[number];

const DASHBOARD_URLS: Record<Role, string> = {
  admin: "/dashboard-admin",
  siswa: "/dashboard-siswa",
  kesiswaan: "/dashboard-kesiswaan",
  osis: "/dashboard-osis",
  ppdb: "/dashboard-ppdb",
};

// Run dashboard smoke tests serially to avoid flakiness caused by parallel
// resource contention and server-side rate-limiting during CI/local runs.
test.describe.serial("Dashboard Smoke Tests", () => {
  test.setTimeout(120000);

  for (const role of ROLES) {
    test(`${role} dashboard loads correctly`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.loginAs(role);

      // Verify on correct dashboard
      await expect(page).toHaveURL(new RegExp(DASHBOARD_URLS[role]));

      // Verify no server errors
      const pageContent = await page.textContent("body");
      expect(pageContent).not.toContain("500 Internal Server Error");
      expect(pageContent).not.toContain("Application error");

      // Verify main content loaded
      const mainContent = page.locator("main, #main-content").first();
      await expect(mainContent).toBeVisible();
    });
  }
});
