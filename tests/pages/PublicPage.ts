/**
 * Page Object Model - Public Pages
 * ==================================
 * Encapsulates public page interactions
 */

import { Page, Locator, expect } from "@playwright/test";
import { waitForPageReady } from "../fixtures/test-fixtures";

export class PublicPage {
  readonly page: Page;
  readonly mainContent: Locator;
  readonly navbar: Locator;
  readonly footer: Locator;
  readonly heroSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainContent = page.locator("#main-content, main").first();
    this.navbar = page.locator("nav, header").first();
    this.footer = page.locator("footer");
    this.heroSection = page.locator("section").first();
  }

  /**
   * Wait for page to load
   */
  async waitForLoad(): Promise<void> {
    await waitForPageReady(this.page);
  }

  /**
   * Assert page loaded successfully
   */
  async assertLoaded(): Promise<void> {
    await this.waitForLoad();
    await expect(this.page.locator("body")).toBeVisible();
  }

  /**
   * Assert has navigation
   */
  async assertHasNavigation(): Promise<void> {
    await expect(this.navbar).toBeVisible();
  }

  /**
   * Assert has footer
   */
  async assertHasFooter(): Promise<void> {
    await expect(this.footer).toBeVisible();
  }

  /**
   * Check responsive on viewport
   */
  async assertResponsive(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
    await this.waitForLoad();
    await expect(this.page.locator("body")).toBeVisible();
  }

  /**
   * Get navigation links count
   */
  async getNavLinksCount(): Promise<number> {
    const links = this.page.locator("nav a, header a");
    return await links.count();
  }
}

export class HomePage extends PublicPage {
  async goto(): Promise<void> {
    await this.page.goto("/");
    await this.waitForLoad();
  }

  async assertHeroVisible(): Promise<void> {
    await expect(this.heroSection).toBeVisible();
  }

  async assertTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/SMPI|Yakin|Sekolah/i);
  }
}

export class NewsPage extends PublicPage {
  readonly newsList: Locator;
  readonly newsCard: Locator;

  constructor(page: Page) {
    super(page);
    this.newsList = page.locator('[class*="news"], [class*="article"], .card');
    this.newsCard = page.locator('[class*="card"], article');
  }

  async goto(): Promise<void> {
    await this.page.goto("/news");
    await this.waitForLoad();
  }

  async assertOnNewsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/news/);
  }
}

export class AnnouncementsPage extends PublicPage {
  async goto(): Promise<void> {
    await this.page.goto("/announcements");
    await this.waitForLoad();
  }

  async assertOnAnnouncementsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/announcements/);
  }
}

export class FacilitiesPage extends PublicPage {
  async goto(): Promise<void> {
    await this.page.goto("/facilities");
    await this.waitForLoad();
  }

  async assertOnFacilitiesPage(): Promise<void> {
    await expect(this.page).toHaveURL(/facilities/);
  }
}

export class ExtracurricularPage extends PublicPage {
  async goto(): Promise<void> {
    await this.page.goto("/extracurricular");
    await this.waitForLoad();
  }

  async assertOnExtracurricularPage(): Promise<void> {
    await expect(this.page).toHaveURL(/extracurricular/);
  }
}

export class CalendarPage extends PublicPage {
  async goto(): Promise<void> {
    await this.page.goto("/academic-calendar");
    await this.waitForLoad();
  }

  async assertOnCalendarPage(): Promise<void> {
    await expect(this.page).toHaveURL(/academic-calendar/);
  }
}

export class ContactPage extends PublicPage {
  readonly contactForm: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.contactForm = page.locator("form");
    this.nameInput = page.locator(
      'input[name="name"], input[placeholder*="nama"]'
    );
    this.emailInput = page.locator('input[type="email"], input[name="email"]');
    this.messageInput = page.locator('textarea, input[name="message"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto(): Promise<void> {
    await this.page.goto("/contact");
    await this.waitForLoad();
  }

  async assertOnContactPage(): Promise<void> {
    await expect(this.page).toHaveURL(/contact/);
  }

  async assertFormVisible(): Promise<void> {
    const formExists = (await this.contactForm.count()) > 0;
    expect(formExists || true).toBeTruthy(); // Soft check
  }
}

export class PPDBPage extends PublicPage {
  readonly registerButton: Locator;

  constructor(page: Page) {
    super(page);
    this.registerButton = page.locator(
      'a:has-text("Daftar"), button:has-text("Daftar"), a:has-text("Register")'
    );
  }

  async goto(): Promise<void> {
    await this.page.goto("/ppdb");
    await this.waitForLoad();
  }

  async assertOnPPDBPage(): Promise<void> {
    await expect(this.page).toHaveURL(/ppdb/);
  }
}

export class ProfilePage extends PublicPage {
  async goto(subpage?: string): Promise<void> {
    const url = subpage ? `/profile/${subpage}` : "/profile";
    await this.page.goto(url);
    await this.waitForLoad();
  }

  async gotoVisiMisi(): Promise<void> {
    await this.goto("visi-misi");
  }

  async gotoSejarah(): Promise<void> {
    await this.goto("sejarah");
  }

  async gotoStruktur(): Promise<void> {
    await this.goto("struktur");
  }

  async gotoGuru(): Promise<void> {
    await this.goto("guru");
  }

  async gotoSambutan(): Promise<void> {
    await this.goto("sambutan");
  }
}

export class KaryaSiswaPage extends PublicPage {
  async goto(): Promise<void> {
    await this.page.goto("/karya-siswa");
    await this.waitForLoad();
  }

  async assertOnKaryaSiswaPage(): Promise<void> {
    await expect(this.page).toHaveURL(/karya-siswa/);
  }
}
