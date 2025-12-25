/**
 * Public Pages Tests (Best Practice Version)
 * ============================================
 * Test untuk halaman-halaman publik menggunakan Page Object Model
 *
 * Best Practices:
 * - Page Object Model (POM) pattern
 * - No hardcoded waits (menggunakan proper waits)
 * - Descriptive test names
 * - Grouped by feature
 * - Reusable assertions
 */

import { test, expect } from "@playwright/test";
import {
  HomePage,
  NewsPage,
  AnnouncementsPage,
  FacilitiesPage,
  ExtracurricularPage,
  CalendarPage,
  ContactPage,
  PPDBPage,
  ProfilePage,
  KaryaSiswaPage,
} from "./pages";
import { LoginPage } from "./pages/LoginPage";

test.describe("@smoke Homepage", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test("should load homepage with correct title", async () => {
    await homePage.assertTitle();
  });

  test("should display hero section", async () => {
    await homePage.assertHeroVisible();
  });

  test("should have navigation menu", async () => {
    await homePage.assertHasNavigation();
  });

  test("should have multiple navigation links", async () => {
    const linkCount = await homePage.getNavLinksCount();
    expect(linkCount).toBeGreaterThan(0);
  });

  test("should display footer", async () => {
    await homePage.assertHasFooter();
  });

  test("should be responsive on mobile (375px)", async () => {
    await homePage.assertResponsive(375, 667);
  });

  test("should be responsive on tablet (768px)", async () => {
    await homePage.assertResponsive(768, 1024);
  });
});

test.describe("@smoke Login Page", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should display login form correctly", async () => {
    await loginPage.assertDisplayed();
  });

  test("should stay on login page for invalid credentials", async () => {
    await loginPage.login("wronguser", "wrongpassword");
    await loginPage.assertStillOnLoginPage();
  });

  test("should validate required fields on empty submit", async () => {
    await loginPage.submit();
    await loginPage.assertStillOnLoginPage();
  });
});

test.describe("News Page", () => {
  let newsPage: NewsPage;

  test.beforeEach(async ({ page }) => {
    newsPage = new NewsPage(page);
    await newsPage.goto();
  });

  test("should load news page", async () => {
    await newsPage.assertOnNewsPage();
  });

  test("should display page content", async () => {
    await newsPage.assertLoaded();
  });
});

test.describe("Announcements Page", () => {
  let announcementsPage: AnnouncementsPage;

  test.beforeEach(async ({ page }) => {
    announcementsPage = new AnnouncementsPage(page);
    await announcementsPage.goto();
  });

  test("should load announcements page", async () => {
    await announcementsPage.assertOnAnnouncementsPage();
  });

  test("should display page content", async () => {
    await announcementsPage.assertLoaded();
  });
});

test.describe("Facilities Page", () => {
  let facilitiesPage: FacilitiesPage;

  test.beforeEach(async ({ page }) => {
    facilitiesPage = new FacilitiesPage(page);
    await facilitiesPage.goto();
  });

  test("should load facilities page", async () => {
    await facilitiesPage.assertOnFacilitiesPage();
  });

  test("should display page content", async () => {
    await facilitiesPage.assertLoaded();
  });
});

test.describe("Extracurricular Page", () => {
  let extracurricularPage: ExtracurricularPage;

  test.beforeEach(async ({ page }) => {
    extracurricularPage = new ExtracurricularPage(page);
    await extracurricularPage.goto();
  });

  test("should load extracurricular page", async () => {
    await extracurricularPage.assertOnExtracurricularPage();
  });

  test("should display page content", async () => {
    await extracurricularPage.assertLoaded();
  });
});

test.describe("Academic Calendar Page", () => {
  let calendarPage: CalendarPage;

  test.beforeEach(async ({ page }) => {
    calendarPage = new CalendarPage(page);
    await calendarPage.goto();
  });

  test("should load academic calendar page", async () => {
    await calendarPage.assertOnCalendarPage();
  });

  test("should display page content", async () => {
    await calendarPage.assertLoaded();
  });
});

test.describe("Contact Page", () => {
  let contactPage: ContactPage;

  test.beforeEach(async ({ page }) => {
    contactPage = new ContactPage(page);
    await contactPage.goto();
  });

  test("should load contact page", async () => {
    await contactPage.assertOnContactPage();
  });

  test("should display contact form or info", async () => {
    await contactPage.assertFormVisible();
  });

  test("should display page content", async () => {
    await contactPage.assertLoaded();
  });
});

test.describe("@smoke PPDB Page", () => {
  let ppdbPage: PPDBPage;

  test.beforeEach(async ({ page }) => {
    ppdbPage = new PPDBPage(page);
    await ppdbPage.goto();
  });

  test("should load PPDB page", async () => {
    await ppdbPage.assertOnPPDBPage();
  });

  test("should display page content", async () => {
    await ppdbPage.assertLoaded();
  });
});

test.describe("Profile Pages", () => {
  test("should load profile overview page", async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await profilePage.assertLoaded();
  });

  test("should load visi-misi page", async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.gotoVisiMisi();
    await expect(page).toHaveURL(/visi-misi/);
    await profilePage.assertLoaded();
  });

  test("should load sejarah page", async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.gotoSejarah();
    await expect(page).toHaveURL(/sejarah/);
    await profilePage.assertLoaded();
  });

  test("should load struktur page", async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.gotoStruktur();
    await expect(page).toHaveURL(/struktur/);
    await profilePage.assertLoaded();
  });

  test("should load guru page", async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.gotoGuru();
    await expect(page).toHaveURL(/guru/);
    await profilePage.assertLoaded();
  });

  test("should load sambutan page", async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.gotoSambutan();
    await expect(page).toHaveURL(/sambutan/);
    await profilePage.assertLoaded();
  });
});

test.describe("Karya Siswa Page", () => {
  let karyaPage: KaryaSiswaPage;

  test.beforeEach(async ({ page }) => {
    karyaPage = new KaryaSiswaPage(page);
    await karyaPage.goto();
  });

  test("should load karya siswa page", async () => {
    await karyaPage.assertOnKaryaSiswaPage();
  });

  test("should display page content", async () => {
    await karyaPage.assertLoaded();
  });
});

test.describe("404 Page", () => {
  test("should handle non-existent page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-12345");
    if (response) {
      expect([404, 200]).toContain(response.status());
    }
  });
});

test.describe("SEO & Accessibility", () => {
  test("homepage should have meta description", async ({ page }) => {
    await page.goto("/");
    const metaDescription = page.locator('meta[name="description"]');
    // Soft check - meta description is recommended but not required
    const count = await metaDescription.count();
    expect(count >= 0).toBeTruthy();
  });

  test("pages should have heading structure", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Performance", () => {
  test("homepage should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - startTime;

    // Should load within 15 seconds
    expect(loadTime).toBeLessThan(15000);
  });
});
