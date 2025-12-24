/**
 * Dashboard Admin Tests (Best Practice Version)
 * ===============================================
 * Test untuk fitur dashboard Admin menggunakan Page Object Model
 *
 * Best Practices:
 * - Page Object Model (POM) pattern
 * - Proper wait strategies
 * - Test isolation
 * - Feature-based grouping
 */

import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { DashboardAdminPage } from "./pages/DashboardPage";

test.describe("Dashboard Admin - Overview", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should load dashboard admin successfully", async () => {
    await dashboardPage.goto();
    await dashboardPage.assertOnDashboard("admin");
  });

  test("should display main content", async () => {
    await dashboardPage.goto();
    await dashboardPage.assertDisplayed();
  });

  test("should have navigation menu", async () => {
    await dashboardPage.goto();
    await dashboardPage.assertHasNavigation();
  });

  test("should display statistics", async () => {
    await dashboardPage.goto();
    await dashboardPage.assertHasStats();
  });
});

test.describe("Dashboard Admin - Announcements Management", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should load announcements page", async () => {
    await dashboardPage.gotoAnnouncements();
    await dashboardPage.assertDisplayed();
  });

  test("should display announcements content", async ({ page }) => {
    await dashboardPage.gotoAnnouncements();
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

test.describe("Dashboard Admin - News Management", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should load news page", async () => {
    await dashboardPage.gotoNews();
    await dashboardPage.assertDisplayed();
  });

  test("should display news management content", async ({ page }) => {
    await dashboardPage.gotoNews();
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

test.describe("Dashboard Admin - Users Management", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should load users page", async () => {
    await dashboardPage.gotoUsers();
    await dashboardPage.assertDisplayed();
  });

  test("should display users list", async ({ page }) => {
    await dashboardPage.gotoUsers();
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

test.describe("Dashboard Admin - Teachers Management", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should load teachers page", async () => {
    await dashboardPage.gotoTeachers();
    await dashboardPage.assertDisplayed();
  });

  test("should display teachers content", async ({ page }) => {
    await dashboardPage.gotoTeachers();
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

test.describe("Dashboard Admin - Calendar Management", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should load calendar page", async () => {
    await dashboardPage.gotoCalendar();
    await dashboardPage.assertDisplayed();
  });

  test("should display calendar content", async ({ page }) => {
    await dashboardPage.gotoCalendar();
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

test.describe("Dashboard Admin - Hero Management", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should load hero page", async () => {
    await dashboardPage.gotoHero();
    await dashboardPage.assertDisplayed();
  });

  test("should display hero management content", async ({ page }) => {
    await dashboardPage.gotoHero();
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

test.describe("Dashboard Admin - Stats Management", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should load stats page", async () => {
    await dashboardPage.gotoStats();
    await dashboardPage.assertDisplayed();
  });

  test("should display stats management content", async ({ page }) => {
    await dashboardPage.gotoStats();
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

test.describe("Dashboard Admin - Notifications", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should load notifications page", async () => {
    await dashboardPage.gotoNotifications();
    await dashboardPage.assertDisplayed();
  });

  test("should display notifications content", async ({ page }) => {
    await dashboardPage.gotoNotifications();
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });
});

test.describe("Dashboard Admin - Responsive Design", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should be responsive on tablet", async () => {
    await dashboardPage.goto();
    await dashboardPage.assertResponsive(768, 1024);
  });

  test("should be responsive on mobile", async () => {
    await dashboardPage.goto();
    await dashboardPage.assertResponsive(375, 667);
  });
});

test.describe("Dashboard Admin - Navigation", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardAdminPage(page);
    await loginPage.loginAs("admin");
  });

  test("should have logout option", async () => {
    await dashboardPage.goto();
    const logoutButton = dashboardPage.logoutButton;
    const hasLogout = (await logoutButton.count()) > 0;
    expect(hasLogout).toBeTruthy();
  });

  test("should navigate between sections", async ({ page }) => {
    await dashboardPage.goto();

    // Navigate to different sections
    await dashboardPage.gotoNews();
    await expect(page).toHaveURL(/news/);

    await dashboardPage.gotoUsers();
    await expect(page).toHaveURL(/users/);
  });
});
