# 📋 Testing Documentation

## SMP IP Yakin — E2E Testing Guide

This document explains how to run and extend automated testing for the SMP IP Yakin website using **Playwright**.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Test Structure](#test-structure)
3. [Setup & Installation](#setup--installation)
4. [Running Tests](#running-tests)
5. [Test Credentials](#test-credentials)
6. [Test Files](#test-files)
7. [Writing New Tests](#writing-new-tests)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [CI/CD Integration](#cicd-integration)

---

## Overview

### Testing Stack

| Technology     | Version  | Description                                 |
| -------------- | -------- | ------------------------------------------- |
| **Playwright** | ^1.57.0  | Modern E2E testing framework by Microsoft   |
| **TypeScript** | 5.9.3    | Type safety for test scripts                |
| **Node.js**    | 20.x     | Matches CI configuration                    |
| **PostgreSQL** | 15+      | Database for test environment               |

### Why Playwright?

- ✅ **Official Next.js recommendation** for E2E testing
- ✅ **Cross-browser testing** - Chromium, Firefox, and WebKit in one tool
- ✅ **Mobile testing** - Device emulation for responsive checks
- ✅ **Auto-wait** - Smart waiting for ready elements
- ✅ **Parallel execution** - Faster suites through parallelism
- ✅ **Built-in reporters** - HTML, JSON, and custom reporters
- ✅ **Trace viewer** - Visual timeline for debugging

> External image/analytics requests are stubbed in `tests/_global-hooks.ts` to keep runs deterministic and fast.

---

## Test Structure

```
tests/
├── _global-hooks.ts           # Global setup/teardown with network stubs
├── critical-path.spec.ts      # Critical user flows (CI priority)
├── authentication.spec.ts     # Login/auth flow tests
├── admin-dashboard.spec.ts    # Admin dashboard features
├── student-dashboard.spec.ts  # Student portal tests
├── kesiswaan-dashboard.spec.ts# Kesiswaan features
├── osis-dashboard.spec.ts     # OSIS dashboard tests
├── ppdb-dashboard.spec.ts     # PPDB functionality tests
├── public-pages.spec.ts       # Public page smoke tests
├── fixtures/
│   └── test-fixtures.ts       # Utilities & data (POM helpers, waiters)
└── pages/                     # Page Object Model helpers
    ├── DashboardPage.ts       # Dashboard POMs for all roles
    ├── LoginPage.ts           # Login form handling
    ├── PublicPage.ts          # Public page helpers
    └── index.ts               # Export aggregator

playwright.config.ts           # Playwright configuration
playwright-report/             # HTML report (auto-generated)
test-results/                  # Artifacts & screenshots (auto-generated)
```

### Page Object Model (POM)

Tests use the **Page Object Model** pattern for maintainability and reuse:

#### Available Pages

| Class                | File                   | Description                          |
| -------------------- | ---------------------- | ------------------------------------ |
| `LoginPage`          | pages/LoginPage.ts     | Handles login form, CAPTCHA          |
| `DashboardAdminPage` | pages/DashboardPage.ts | Common actions for the Admin dashboard |
| `DashboardSiswaPage` | pages/DashboardPage.ts | Common actions for the Student dashboard |
| `DashboardPPDBPage`  | pages/DashboardPage.ts | Common actions for the PPDB dashboard  |
| `HomePage`           | pages/PublicPage.ts    | Homepage & public navigation           |
| `NewsPage`           | pages/PublicPage.ts    | News page helpers                      |
| `ContactPage`        | pages/PublicPage.ts    | Contact page helpers                   |

#### Example POM Usage

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

## Setup & Installation

### Prerequisites

1. Node.js >= 20
2. npm (use `npm ci` for parity with CI)
3. PostgreSQL accessible locally; database seeded/reset with testing data

### Installation

```bash
# Install dependencies (included in package-lock.json)
npm ci

# Install browser binaries (if not yet installed)
npx playwright install --with-deps chromium
```

### Database Preparation

```bash
# Seed database with testing users/content
npm run db:seed
npm run db:seed-content
```

---

## Running Tests

### NPM Scripts

| Command               | Description |
| --------------------- | ----------- |
| `npm run test`        | Run all Playwright specs (headless) |
| `npm run test:critical` | Run only `critical-path.spec.ts` (used in CI) |
| `npm run test:ui`     | Open Playwright UI mode (interactive) |
| `npm run test:report` | Open the latest HTML report |

### Example Usage

```bash
# Run all tests
npm run test

# Run only the critical path
npm run test:critical

# Run with a specific browser
npx playwright test --project=chromium

# Run with a test name filter
npx playwright test -g "login"

# Run a single file in headed mode
npx playwright test tests/critical-path.spec.ts --headed

# Debug mode with visible browser
npx playwright test --debug

# UI Mode (recommended for development)
npm run test:ui

# Open the latest HTML report
npm run test:report
```

---

## Test Credentials

Credentials for testing (matches the `prisma/seed.ts` seeder):

| Role      | Username  | Password | Dashboard URL        |
| --------- | --------- | -------- | -------------------- |
| Siswa (Student) | siswa001  | admin123 | /dashboard-siswa     |
| PPDB      | ppdb001   | admin123 | /dashboard-ppdb      |
| Admin     | admin     | admin123 | /dashboard-admin     |
| Kesiswaan | kesiswaan | admin123 | /dashboard-kesiswaan |
| OSIS      | osis001   | admin123 | /dashboard-osis      |

> ⚠️ **Important:** Seed the database first with `npm run db:seed`.

---

## Test Files

### 1. `critical-path.spec.ts`

Focuses on high-value and stable flows:

- **Public smoke:** homepage and login page load with key elements visible.
- **Admin news flow:** login as admin, open news management, create news, verify it in the DB (direct Prisma check), then clean up the test data.
- **RBAC check:** student cannot force access to `/dashboard-admin`.

---

## Writing New Tests

### Using the Page Object Model (Recommended)

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
    // Login via POM
    await loginPage.loginAs("siswa");

    // Navigate and assert via POM
    await dashboardPage.goto();
    await dashboardPage.assertDisplayed();
  });
});
```

### Creating a New Page Object

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

### Basic Test Structure (Legacy)

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  // Setup before each test
  test.beforeEach(async ({ page }) => {
    await page.goto("/some-page");
  });

  test("should do something", async ({ page }) => {
    // Arrange - initial setup
    await page.fill('input[name="field"]', "value");

    // Act - perform action
    await page.click('button[type="submit"]');

    // Assert - verify result
    await expect(page.locator(".success")).toBeVisible();
  });
});
```

### Example Test With Login

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

### 1. Use the Page Object Model

```typescript
// ✅ Good: Use POM helpers
const loginPage = new LoginPage(page);
await loginPage.loginAs("siswa");

// ❌ Avoid: Direct page manipulation in the test
await page.goto("/login");
await page.fill("#username", "siswa001");
await page.fill("#password", "admin123");
```

### 2. Centralize Test Data

```typescript
// ✅ Good: Use fixtures
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
// ✅ Good: Use auto-wait with POM
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

### 6. Test Independence

```typescript
// ✅ Good: Each test is independent
test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await login(page, credentials);
});

// ❌ Bad: Tests depend on each other's state
```

### 7. Error Handling

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

- Primary workflow: `.github/workflows/ci.yml`.
- The `test` job starts a PostgreSQL service in the runner, runs `npm run db:reset`, then `npm run test:critical`.
- Playwright reports are uploaded as artifacts on failure; locally, open with `npm run test:report`.

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Next.js Testing Guide](https://nextjs.org/docs/testing#playwright)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Locator Strategies](https://playwright.dev/docs/locators)

---

## 📝 Changelog

| Version | Date       | Changes                          |
| ------- | ---------- | -------------------------------- |
| 1.2.0   | 2026-01-01 | Added all spec files documentation, updated test structure |
| 1.1.0   | 2026-02-19 | Align docs with Node 20 CI, chromium install flags, and network stubbing expectations |
| 1.0.0   | 2025-06-03 | Initial testing setup with Playwright |

---

## 🤝 Contributing

To add new tests:

1. Identify the feature to cover.
2. Create a new spec file or extend an existing one.
3. Follow the naming convention: `feature-name.spec.ts`.
4. Run tests locally before committing.
5. Update this document when new suites or patterns are added.

---

_Maintained by the SMP IP Yakin Development Team._
