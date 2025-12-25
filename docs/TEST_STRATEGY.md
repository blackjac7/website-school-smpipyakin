Test Strategy Overview

Goal: Keep E2E tests fast, reliable, and focused while preserving full coverage in nightly runs.

Tagging and Suites

- @smoke: Core user flows that must pass on every PR (Homepage, Login, PPDB gating).
- @nightly: Heavier or timing-sensitive tests (Performance, maintenance schedule, long pages).
- @slow / @external: Tests that rely on heavy external dependencies or long fixtures.

Local Commands

- Run smoke tests (fast):
  npx playwright test --grep "@smoke" --project=chromium

- Run full suite (nightly/full-run):
  npx playwright test

Best practices

- Avoid relying on external hosts in E2E; stub or route them in the global hook (`tests/_global-hooks.ts`).
- Mark long or flaky tests with @nightly and keep them out of PR runs.
- Keep smoke tests small (<= 20-30 tests) and independent.
- Use unique test data where needed and clean up resource after tests.

CI

- PRs: run lint + smoke E2E (single browser, minimal workers)
- Push/main & Nightly: run full E2E (matrix and higher workers)

If you'd like, I can move more heavy tests to @nightly or split large files into smaller focused test files.
