# 📋 Testing Documentation

## Website School SMPI Yakin - E2E Testing Guide

Dokumentasi ini menjelaskan cara menjalankan dan mengembangkan automated testing untuk website SMPI Yakin menggunakan **Playwright**.

---

## 📑 Daftar Isi

1. [Overview](#overview)
2. [Struktur Testing](#struktur-testing)
3. [Setup & Instalasi](#setup--instalasi)
4. [Menjalankan Test](#menjalankan-test)
5. [Test Credentials](#test-credentials)
6. [Penjelasan Test Files](#penjelasan-test-files)
7. [Menulis Test Baru](#menulis-test-baru)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [CI/CD Integration](#cicd-integration)

---

## Overview

### Teknologi Testing

| Teknologi      | Versi   | Deskripsi                                   |
| -------------- | ------- | ------------------------------------------- |
| **Playwright** | ^1.57.0 | Modern E2E testing framework dari Microsoft |
| **TypeScript** | 5.9.3   | Type safety untuk test scripts              |

### Kenapa Playwright?

- ✅ **Official Next.js recommendation** - Direkomendasikan oleh Next.js untuk E2E testing
- ✅ **Cross-browser testing** - Chromium, Firefox, WebKit dalam satu tool
- ✅ **Mobile testing** - Test responsive design dengan device emulation
- ✅ **Auto-wait** - Otomatis menunggu elemen ready
- ✅ **Parallel execution** - Test berjalan paralel untuk kecepatan
- ✅ **Built-in reporters** - HTML, JSON, dan custom reporters
- ✅ **Trace viewer** - Debug dengan visual timeline

---

## Struktur Testing

```
tests/
├── fixtures/
│   └── test-fixtures.ts     # Centralized test utilities & fixtures
├── pages/
│   ├── index.ts             # Page object exports
│   ├── LoginPage.ts         # Login page object model
│   ├── DashboardPage.ts     # Dashboard page objects
│   └── PublicPage.ts        # Public pages objects
├── public-pages.spec.ts     # Test halaman publik (homepage, news, dll)
├── auth.spec.ts             # Test login/logout & authorization
├── dashboard-siswa.spec.ts  # Test fitur dashboard siswa
└── dashboard-ppdb.spec.ts   # Test fitur dashboard PPDB

playwright.config.ts         # Konfigurasi Playwright
playwright-report/           # HTML report (auto-generated)
test-results/               # Artifacts & screenshots (auto-generated)
```

### Page Object Model (POM)

Testing menggunakan **Page Object Model** pattern untuk maintainability dan reusability:

#### Pages Tersedia

| Class                | File                   | Deskripsi                   |
| -------------------- | ---------------------- | --------------------------- |
| `LoginPage`          | pages/LoginPage.ts     | Handles login form, CAPTCHA |
| `DashboardPage`      | pages/DashboardPage.ts | Base dashboard class        |
| `DashboardSiswaPage` | pages/DashboardPage.ts | Siswa dashboard             |
| `DashboardPPDBPage`  | pages/DashboardPage.ts | PPDB dashboard              |
| `DashboardAdminPage` | pages/DashboardPage.ts | Admin dashboard             |
| `HomePage`           | pages/PublicPage.ts    | Homepage                    |
| `NewsPage`           | pages/PublicPage.ts    | News page                   |
| `ContactPage`        | pages/PublicPage.ts    | Contact page                |

#### Contoh Penggunaan POM

```typescript
import { LoginPage } from "./pages/LoginPage";
import { DashboardSiswaPage } from "./pages/DashboardPage";

test("should login successfully", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardSiswaPage(page);

  await loginPage.loginAs("siswa");
  await dashboardPage.goto();
  await dashboardPage.assertDisplayed();
});
```

---

## Setup & Instalasi

### Prerequisites

1. Node.js >= 18
2. npm atau yarn
3. Database sudah di-seed dengan data testing

### Instalasi

```bash
# Install dependencies (sudah termasuk di package.json)
npm install

# Install browser binaries (jika belum)
npx playwright install
```

### Persiapan Database

```bash
# Seed database dengan user testing
npm run db:seed
npm run db:seed-content
```

---

## Menjalankan Test

### NPM Scripts

| Command               | Deskripsi                            |
| --------------------- | ------------------------------------ |
| `npm run test`        | Jalankan semua test (headless)       |
| `npm run test:headed` | Jalankan test dengan browser visible |
| `npm run test:ui`     | Buka Playwright UI mode (interaktif) |
| `npm run test:debug`  | Jalankan test dengan debugger        |
| `npm run test:report` | Buka HTML report                     |
| `npm run test:public` | Test halaman publik saja             |
| `npm run test:auth`   | Test autentikasi saja                |
| `npm run test:siswa`  | Test dashboard siswa saja            |
| `npm run test:ppdb`   | Test dashboard PPDB saja             |

### Contoh Penggunaan

```bash
# Jalankan semua test
npm run test

# Jalankan test spesifik dengan headed mode
npm run test:auth -- --headed

# Jalankan test dengan browser tertentu
npx playwright test --project=chromium

# Jalankan test dengan filter nama
npx playwright test -g "login"

# Jalankan satu file test
npx playwright test tests/auth.spec.ts

# Debug mode dengan browser visible
npx playwright test --debug

# UI Mode (recommended untuk development)
npm run test:ui
```

---

## Test Credentials

Credentials untuk testing (sesuai dengan database seeder `prisma/seed.ts`):

| Role      | Username  | Password | Dashboard URL        |
| --------- | --------- | -------- | -------------------- |
| Siswa     | siswa001  | admin123 | /dashboard-siswa     |
| PPDB      | ppdb001   | admin123 | /dashboard-ppdb      |
| Admin     | admin     | admin123 | /dashboard-admin     |
| Kesiswaan | kesiswaan | admin123 | /dashboard-kesiswaan |
| OSIS      | osis001   | admin123 | /dashboard-osis      |

> ⚠️ **Penting**: Pastikan database sudah di-seed dengan menjalankan `npm run db:seed`

---

## Penjelasan Test Files

### 1. `public-pages.spec.ts`

Test untuk halaman yang dapat diakses tanpa login.

**Halaman yang ditest:**

- Homepage (`/`)
- Login page (`/login`)
- News (`/news`)
- Announcements (`/announcements`)
- Facilities (`/facilities`)
- Extracurricular (`/extracurricular`)
- Academic Calendar (`/academic-calendar`)
- Contact (`/contact`)
- PPDB (`/ppdb`)
- Profile pages (`/profile/*`)
- Karya Siswa (`/karya-siswa`)

**Test cases:**

- ✅ Page loads successfully
- ✅ Content displayed correctly
- ✅ Navigation works
- ✅ Responsive on mobile/tablet
- ✅ SEO elements present
- ✅ Performance check

### 2. `auth.spec.ts`

Test untuk fitur autentikasi.

**Test scenarios:**

- ✅ Login form displayed correctly
- ✅ Error on invalid credentials
- ✅ Successful login untuk setiap role
- ✅ Redirect ke dashboard yang benar
- ✅ Logout functionality
- ✅ Authorization (role-based access)
- ✅ Session persistence

### 3. `dashboard-siswa.spec.ts`

Test untuk dashboard siswa.

**Fitur yang ditest:**

- ✅ Dashboard overview
- ✅ Upload karya siswa
- ✅ Lihat pengumuman
- ✅ Notifikasi
- ✅ Responsive design
- ✅ Navigation

### 4. `dashboard-ppdb.spec.ts`

Test untuk dashboard PPDB officer.

**Fitur yang ditest:**

- ✅ Dashboard overview & statistik
- ✅ List pendaftar
- ✅ Detail pendaftar
- ✅ Verifikasi dokumen
- ✅ Update status
- ✅ Export data
- ✅ Pagination & sorting

---

## Menulis Test Baru

### Menggunakan Page Object Model (Recommended)

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { DashboardSiswaPage } from "./pages/DashboardPage";

test.describe("Dashboard Siswa Features", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardSiswaPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardSiswaPage(page);
  });

  test("should display dashboard after login", async ({ page }) => {
    // Login menggunakan POM
    await loginPage.loginAs("siswa");

    // Navigate dan assert menggunakan POM
    await dashboardPage.goto();
    await dashboardPage.assertDisplayed();
  });
});
```

### Membuat Page Object Baru

```typescript
// tests/pages/NewPage.ts
import { Page, Locator, expect } from "@playwright/test";
import { waitForPageReady } from "../fixtures/test-fixtures";

export class NewPage {
  readonly page: Page;
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainContent = page.locator("main").first();
  }

  async goto(): Promise<void> {
    await this.page.goto("/your-page");
    await waitForPageReady(this.page);
  }

  async assertDisplayed(): Promise<void> {
    await expect(this.mainContent).toBeVisible();
  }
}
```

### Struktur Dasar Test (Legacy)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  // Setup sebelum setiap test
  test.beforeEach(async ({ page }) => {
    await page.goto("/some-page");
  });

  test("should do something", async ({ page }) => {
    // Arrange - setup awal
    await page.fill('input[name="field"]', "value");

    // Act - lakukan aksi
    await page.click('button[type="submit"]');

    // Assert - verifikasi hasil
    await expect(page.locator(".success")).toBeVisible();
  });
});
```

### Contoh Test Dengan Login

```typescript
import { test, expect, Page } from "@playwright/test";

// Helper function
async function login(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.fill('input[name="username"]', username);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

test.describe("Protected Feature", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "siswa001", "siswa123");
  });

  test("should access protected page", async ({ page }) => {
    await page.goto("/dashboard-siswa/karya");
    await expect(page.locator("main")).toBeVisible();
  });
});
```

### Locator Strategies

```typescript
// By CSS selector
page.locator(".class-name");
page.locator("#element-id");
page.locator('button[type="submit"]');

// By text content
page.locator('text="Login"');
page.locator('button:has-text("Submit")');

// By role
page.locator('[role="button"]');
page.locator('[role="navigation"]');

// By attribute
page.locator('[aria-label="menu"]');
page.locator('[data-testid="submit-btn"]');

// Combining selectors
page.locator('form button[type="submit"]');
page.locator('.card:has-text("Title")');
```

### Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text content
await expect(element).toHaveText("expected text");
await expect(element).toContainText("partial text");

// Attributes
await expect(element).toHaveAttribute("href", "/path");
await expect(element).toHaveClass("active");

// URL
await expect(page).toHaveURL(/expected-path/);
await expect(page).toHaveTitle(/Page Title/);

// Count
const items = page.locator(".item");
await expect(items).toHaveCount(5);
expect(await items.count()).toBeGreaterThan(0);
```

---

## Best Practices

### 1. Gunakan Page Object Model

```typescript
// ✅ Good: Menggunakan POM
const loginPage = new LoginPage(page);
await loginPage.loginAs("siswa");

// ❌ Avoid: Direct page manipulation di test
await page.goto("/login");
await page.fill("#username", "siswa001");
await page.fill("#password", "admin123");
```

### 2. Centralized Test Data

```typescript
// ✅ Good: Gunakan fixtures
import { TEST_USERS } from "./fixtures/test-fixtures";
const user = TEST_USERS.siswa;

// ❌ Avoid: Hardcoded credentials
await page.fill("#username", "siswa001");
```

### 3. Test Organization

```typescript
// ✅ Good: Descriptive test names
test("should redirect to login when accessing protected page without auth", ...);

// ❌ Bad: Vague test names
test("test1", ...);
test("login test", ...);
```

### 4. Wait Strategies

```typescript
// ✅ Good: Use auto-wait dengan POM
await loginPage.loginAs("siswa");
await dashboardPage.waitForLoad();

// ✅ Good: Use Playwright assertions (auto-retry)
await expect(page.locator(".result")).toBeVisible();

// ❌ Avoid: Hardcoded waits
await page.waitForTimeout(5000);

// ✅ OK: Wait for network idle
await page.waitForLoadState("networkidle");
```

### 5. Reliable Selectors

```typescript
// ✅ Good: Data-testid (most reliable)
page.locator('[data-testid="submit-button"]');

// ✅ Good: Role + text combination
page.locator('button:has-text("Submit")');

// ❌ Avoid: Brittle CSS class selectors
page.locator(".btn-primary-v2-updated");
```

### 4. Test Independence

```typescript
// ✅ Good: Each test is independent
test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await login(page, credentials);
});

// ❌ Bad: Tests depend on each other's state
```

### 5. Error Handling

```typescript
// ✅ Good: Check element exists before interacting
const button = page.locator('button:has-text("Submit")');
if ((await button.count()) > 0) {
  await button.click();
}

// ✅ Good: Soft assertions for optional elements
const optional = page.locator(".optional-element");
expect((await optional.count()) >= 0).toBeTruthy();
```

---

## Troubleshooting

### Common Issues

#### 1. Tests failing due to timeout

```bash
# Increase timeout
npx playwright test --timeout=60000

# Or in test file
test.setTimeout(60000);
```

#### 2. Element not found

```typescript
// Increase wait time
await page.locator(".element").waitFor({ state: "visible", timeout: 10000 });

// Use networkidle for dynamic content
await page.waitForLoadState("networkidle");
```

#### 3. Authentication issues

```typescript
// Clear cookies before login
await page.context().clearCookies();

// Wait longer after login
await page.waitForTimeout(3000);
```

#### 4. Flaky tests

```typescript
// Add retry mechanism in config
{
  retries: 2,
  use: {
    actionTimeout: 10000,
  }
}
```

### Debug Commands

```bash
# Visual debug with Playwright Inspector
npx playwright test --debug

# Generate trace for failed tests
npx playwright test --trace on

# View trace
npx playwright show-trace test-results/path-to-trace.zip

# Take screenshot on failure (configured by default)
# Screenshots saved in test-results/
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Setup database
        run: |
          npm run db:migrate
          npm run db:seed
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Test Report

Setelah menjalankan test, HTML report akan di-generate di `playwright-report/`:

```bash
# Buka report
npm run test:report
```

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing Guide](https://nextjs.org/docs/testing#playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Locator Strategies](https://playwright.dev/docs/locators)

---

## 📝 Changelog

| Versi | Tanggal    | Perubahan                               |
| ----- | ---------- | --------------------------------------- |
| 1.0.0 | 2025-06-03 | Initial testing setup dengan Playwright |

---

## 🤝 Contributing

Untuk menambah test baru:

1. Identifikasi fitur yang perlu di-test
2. Buat file test baru atau tambahkan ke file existing
3. Ikuti naming convention: `feature-name.spec.ts`
4. Jalankan test secara lokal sebelum commit
5. Update dokumentasi ini jika ada fitur baru

---

_Dokumentasi ini di-maintain oleh Tim Development SMPI Yakin_
