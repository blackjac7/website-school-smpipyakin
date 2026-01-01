# 🧪 Testing Documentation

## SMP IP Yakin — E2E Testing Guide

Dokumentasi lengkap untuk automated testing menggunakan **Playwright**.

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Test Architecture Diagram](#test-architecture-diagram)
3. [Test Structure](#test-structure)
4. [Setup & Installation](#setup--installation)
5. [Running Tests](#running-tests)
6. [Test Files Explained](#test-files-explained)
7. [Page Object Model](#page-object-model)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [CI/CD Integration](#cicd-integration)

---

## Overview

### Testing Philosophy

```mermaid
graph TB
    subgraph Pyramid["🔺 Testing Pyramid"]
        E2E["E2E Tests (11 tests)<br/>Critical user flows"]
        Smoke["Smoke Tests<br/>Dashboard accessibility"]
        Unit["Unit Tests<br/>(Future: Component tests)"]
    end

    subgraph Focus["Focus Areas"]
        Critical["✅ Critical Paths"]
        DB["✅ Database Integration"]
        RBAC["✅ RBAC Security"]
        Speed["✅ Fast Execution"]
    end

    E2E --> Critical
    E2E --> DB
    E2E --> RBAC
    Smoke --> Speed
```

```
┌─────────────────────────────────────────────────────────────────┐
│                    Testing Pyramid                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         ▲                                       │
│                        ╱ ╲                                      │
│                       ╱   ╲     E2E Tests (11 tests)            │
│                      ╱─────╲    - Critical user flows           │
│                     ╱       ╲   - Database integration          │
│                    ╱─────────╲                                  │
│                   ╱           ╲  Smoke Tests                    │
│                  ╱─────────────╲ - All dashboards load          │
│                 ╱               ╲- Public pages accessible      │
│                ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔                                │
│                                                                 │
│   Focus: High-value flows, not comprehensive UI coverage        │
└─────────────────────────────────────────────────────────────────┘
```

### Testing Stack

| Technology     | Version | Purpose                            |
| -------------- | ------- | ---------------------------------- |
| **Playwright** | ^1.57.0 | E2E testing framework by Microsoft |
| **TypeScript** | 5.9.3   | Type safety for test scripts       |
| **Prisma**     | 6.19    | Direct database verification       |
| **Node.js**    | 20.x    | Runtime environment                |

### Why This Approach?

| Benefit                  | Implementation                               |
| ------------------------ | -------------------------------------------- |
| ✅ **Fast & Focused**    | 11 tests instead of 100+, runs in ~2 minutes |
| ✅ **Reliable**          | Explicit waits, no flaky `waitForTimeout`    |
| ✅ **Maintainable**      | Page Object Model pattern                    |
| ✅ **CI-Ready**          | Optimized for GitHub Actions                 |
| ✅ **Database Verified** | Tests confirm data persistence               |

---

## Test Architecture Diagram

```mermaid
flowchart TB
    subgraph TestFiles["📁 Test Files"]
        CP[critical-path.spec.ts<br/>6 tests]
        DS[dashboards.spec.ts<br/>5 tests]
    end

    subgraph PageObjects["📦 Page Objects"]
        LP[LoginPage.ts]
        DP[DashboardPage.ts]
        PP[PublicPage.ts]
    end

    subgraph Fixtures["🔧 Fixtures"]
        TF[test-fixtures.ts]
        GH[_global-hooks.ts]
    end

    subgraph Application["🌐 Application"]
        APP[Next.js App<br/>localhost:3000]
        DB[(PostgreSQL)]
    end

    subgraph External["☁️ External Services"]
        Cloudinary[Cloudinary]
        Analytics[Analytics]
    end

    CP --> LP
    CP --> DP
    DS --> LP

    LP --> TF
    DP --> TF

    GH -.->|stubs| External

    CP -->|verifies| DB
    DS --> APP

    style CP fill:#10b981,color:#fff
    style DS fill:#3b82f6,color:#fff
    style DB fill:#f59e0b,color:#fff
```

### Test Flow Sequence

```mermaid
sequenceDiagram
    participant T as Test Runner
    participant B as Browser (Chromium)
    participant A as Next.js App
    participant D as PostgreSQL

    Note over T,D: 🔧 Setup Phase
    T->>B: Launch Chromium
    T->>A: Start dev server (port 3000)
    T->>D: Reset database (if needed)

    Note over T,D: 🧪 Critical Path Test
    B->>A: Navigate to /login
    B->>A: Fill form + solve CAPTCHA
    B->>A: Submit login
    A->>D: Verify credentials
    A-->>B: Redirect to dashboard

    B->>A: Create news article
    A->>D: INSERT INTO news
    T->>D: Verify record exists (Prisma)

    Note over T,D: 🧹 Cleanup Phase
    T->>D: DELETE test records

    Note over T,D: 💨 Dashboard Smoke Test
    loop For each role (5x)
        B->>A: Login as role
        B->>A: Navigate to dashboard
        T->>B: Assert no errors
    end
```

---

## Test Structure

```
tests/
├── critical-path.spec.ts      # 🎯 Critical user flows (6 tests)
├── dashboards.spec.ts         # 🚀 Dashboard smoke tests (5 tests)
├── _global-hooks.ts           # 🔧 Network stubs for external requests
├── fixtures/
│   └── test-fixtures.ts       # 📦 Utilities, test users, helpers
└── pages/
    ├── LoginPage.ts           # 🔐 Login form handling + CAPTCHA
    ├── DashboardPage.ts       # 📊 Dashboard actions for all roles
    ├── PublicPage.ts          # 🌐 Public page helpers
    └── index.ts               # 📤 Export aggregator
```

### Test Count Summary

| File                    | Tests  | Description                        |
| ----------------------- | ------ | ---------------------------------- |
| `critical-path.spec.ts` | 6      | Core flows + DB integration        |
| `dashboards.spec.ts`    | 5      | Smoke test for all role dashboards |
| **Total**               | **11** | Focused, fast, reliable            |

---

## Setup & Installation

### Prerequisites

```bash
# Required
- Node.js >= 20
- PostgreSQL 15+ (running)
- npm (use npm ci for lockfile parity)
```

### Installation

```bash
# 1. Install all dependencies
npm ci

# 2. Install Playwright browser
npx playwright install --with-deps chromium

# 3. Setup database
npm run db:push
npm run db:seed
npm run db:seed-content
```

### Environment Variables

Create `.env.local` with:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/smpipyakin"
JWT_SECRET="your-secret-key"
```

---

## Running Tests

### NPM Scripts

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run test`          | Run ALL tests (11 tests)              |
| `npm run test:critical` | Run critical path only (6 tests) — CI |
| `npm run test:ui`       | Interactive Playwright UI             |
| `npm run test:report`   | Open HTML report                      |

### Quick Commands

```bash
# Run specific test file
npx playwright test tests/dashboards.spec.ts

# Run with headed browser (visible)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Run single test by name
npx playwright test -g "Homepage loads correctly"
```

---

## Test Files Explained

### 1. `critical-path.spec.ts` — Core Flows

```typescript
// What it tests:
describe("Public Pages Smoke Test")
  ✓ Homepage loads correctly
  ✓ Login page loads with form elements
  ✓ Login fails with invalid credentials

describe("Admin Critical Flow")
  ✓ Admin can create news and it persists to DB

describe("Security & RBAC")
  ✓ Student cannot access Admin Dashboard
  ✓ Unauthenticated user is redirected from dashboard
```

**Key Features:**

- Database verification with Prisma
- Automatic cleanup with `afterEach`
- Extended timeout (120s) for login flows

### 2. `dashboards.spec.ts` — Smoke Tests

```typescript
// What it tests:
describe("Dashboard Smoke Tests")
  ✓ admin dashboard loads correctly
  ✓ siswa dashboard loads correctly
  ✓ kesiswaan dashboard loads correctly
  ✓ osis dashboard loads correctly
  ✓ ppdb dashboard loads correctly
```

**Key Features:**

- Parameterized tests for all 5 roles
- Verifies no server errors
- Simple but comprehensive coverage

---

## Page Object Model

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Page Object Pattern                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│   │  LoginPage  │    │ Dashboard   │    │ PublicPage  │     │
│   │             │    │    Page     │    │             │     │
│   │ - goto()    │    │ - gotoNews()│    │ - goto()    │     │
│   │ - loginAs() │    │ - waitFor   │    │ - assert    │     │
│   │ - solveCap  │    │   Load()    │    │   Displayed │     │
│   │   tcha()    │    │             │    │             │     │
│   └─────────────┘    └─────────────┘    └─────────────┘     │
│          │                  │                  │             │
│          └──────────────────┴──────────────────┘             │
│                            │                                 │
│                     ┌──────┴──────┐                         │
│                     │   Fixtures   │                         │
│                     │              │                         │
│                     │ TEST_USERS   │                         │
│                     │ waitForPage  │                         │
│                     │   Ready()    │                         │
│                     └──────────────┘                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Usage Example

```typescript
import { LoginPage } from "./pages/LoginPage";
import { DashboardAdminPage } from "./pages/DashboardPage";

test("Admin creates news", async ({ page }) => {
  // Initialize page objects
  const loginPage = new LoginPage(page);
  const dashboard = new DashboardAdminPage(page);

  // Use page object methods
  await loginPage.loginAs("admin");
  await dashboard.gotoNews();

  // Interact with page
  await page.click('button:has-text("Tambah Berita")');
});
```

### Available Page Objects

| Class                | Methods                                      |
| -------------------- | -------------------------------------------- |
| `LoginPage`          | `goto()`, `loginAs(role)`, `solveCaptcha()`  |
| `DashboardAdminPage` | `gotoNews()`, `gotoUsers()`, `waitForLoad()` |
| `DashboardSiswaPage` | `goto()`, `waitForLoad()`                    |
| `DashboardPPDBPage`  | `goto()`, `waitForLoad()`                    |

---

## Best Practices

### ✅ DO

```typescript
// 1. Use explicit waits
await element.waitFor({ state: "visible", timeout: 15000 });

// 2. Use Page Objects
const loginPage = new LoginPage(page);
await loginPage.loginAs("admin");

// 3. Clean up test data
test.afterEach(async () => {
  await prisma.news.deleteMany({
    where: { title: { startsWith: "Test" } },
  });
});

// 4. Use first() for multiple elements
await page.locator("h1").first().toBeVisible();

// 5. Set appropriate timeouts
test.setTimeout(120000); // For login flows
```

### ❌ DON'T

```typescript
// 1. Don't use arbitrary timeouts
await page.waitForTimeout(5000); // ❌ Flaky

// 2. Don't hardcode selectors inline
await page.click("#btn-xyz"); // ❌ Put in Page Object

// 3. Don't leave test data behind
// ❌ Missing cleanup

// 4. Don't use strict mode violating selectors
await page.locator("h1").toBeVisible(); // ❌ Multiple h1s
```

### Timeout Guidelines

| Scenario               | Recommended Timeout |
| ---------------------- | ------------------- |
| Element visibility     | 10-15s              |
| Page navigation        | 30-60s              |
| Login flow (with anim) | 120s (test timeout) |
| API responses          | 10-15s              |

---

## Troubleshooting

### Common Issues

#### 1. "Timeout waiting for element"

```bash
# Solution: Increase timeout or use explicit wait
await element.waitFor({ state: "visible", timeout: 20000 });
```

#### 2. "Strict mode violation"

```bash
# Solution: Use .first() or more specific selector
await page.locator("h1").first().toBeVisible();
```

#### 3. "ECONNRESET" in terminal

```bash
# This is NORMAL - happens when browser closes
# Tests still pass ✅
```

#### 4. Login animation timeout

```bash
# Solution: Increase test timeout for login flows
test.setTimeout(120000);
```

### Debug Tools

```bash
# Open Playwright Inspector
npx playwright test --debug

# View trace file
npx playwright show-trace test-results/.../trace.zip

# See HTML report
npm run test:report
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Setup Database
        run: npm run db:reset
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run Critical Tests
        run: npm run test:critical
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload Report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### CI Best Practices

1. **Run only critical tests in CI** — `npm run test:critical`
2. **Use single browser** — Chromium only for speed
3. **Reset database before tests** — `npm run db:reset`
4. **Upload artifacts on failure** — HTML report for debugging
5. **Parallelize with workers** — Set `workers: 1` in CI for stability

---

## Quick Reference

### 📋 Test Commands Cheatsheet

```bash
# 🚀 Primary Commands
npm run test              # Run ALL tests (11 tests)
npm run test:critical     # Run critical path only (6 tests) — CI
npm run test:ui           # Interactive Playwright UI
npm run test:report       # Open HTML report

# 🔍 Debug Commands
npx playwright test --debug              # Inspector mode
npx playwright test --headed             # Visible browser
npx playwright test -g "test name"       # Run single test

# 📁 File-specific Commands
npx playwright test tests/dashboards.spec.ts
npx playwright test tests/critical-path.spec.ts
```

### 🧪 Test Coverage Summary

```mermaid
pie title Test Distribution
    "Critical Path Tests" : 6
    "Dashboard Smoke Tests" : 5
```

| File                    | Tests  | Coverage                       |
| ----------------------- | ------ | ------------------------------ |
| `critical-path.spec.ts` | 6      | Public pages, Admin CRUD, RBAC |
| `dashboards.spec.ts`    | 5      | All 5 role dashboards          |
| **Total**               | **11** | ~2 min runtime                 |

---

## 📚 Related Documentation

| Document                                        | Description               |
| ----------------------------------------------- | ------------------------- |
| [TEST_STRATEGY.md](./TEST_STRATEGY.md)          | Testing strategy overview |
| [ARCHITECTURE.md](./ARCHITECTURE.md)            | System architecture       |
| [playwright.config.ts](../playwright.config.ts) | Playwright configuration  |

---

_Last Updated: January 2026_
