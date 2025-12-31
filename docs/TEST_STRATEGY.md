# Test Strategy Overview

Goal: keep E2E tests fast, deterministic, and focused on the highest-value flows.

## Current Scope
- **Critical path only** (`tests/critical-path.spec.ts`) runs in CI after `npm run db:reset`.
- Covers: homepage/login smoke, admin news creation with DB verification, and RBAC guard (student vs admin).
- **Browser:** Chromium only (installed with `npx playwright install --with-deps chromium` in CI).
- **Network stubbing:** `tests/_global-hooks.ts` fulfills Cloudinary/Unsplash/UI-Avatars requests with a tiny SVG and aborts analytics calls.

## Local Commands
- Run CI-equivalent suite: `npm run test:critical`
- Explore interactively: `npm run test:ui`
- View latest report: `npm run test:report`

## When Adding More Coverage
- Keep PR suites small and deterministic; add heavier specs behind tags (e.g., `@nightly`) if needed.
- Use seeded users from `prisma/seed.ts` and clean up any created records inside the spec.
- Prefer Page Objects under `tests/pages/` and shared helpers in `tests/fixtures/test-fixtures.ts`.

## CI Expectations
- Database is reset (`npm run db:reset`) before running the critical path.
- Chromium binaries are installed in the workflow; no additional browsers are required.
- Failures upload the Playwright HTML report as an artifact.
