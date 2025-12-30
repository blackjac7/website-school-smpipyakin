# Project Directory Structure

## Root
- `src/` — Next.js application code.
- `prisma/` — Prisma schema, migrations, and seeders.
- `public/` — Static assets (icons, manifests, images, Flowise embed helpers).
- `docs/` — Project documentation and diagrams.
- `tests/` — Playwright tests (critical path) and fixtures.

## Source (`src/`)

### `app/`
Next.js App Router structure.
- `(public)/` — Public pages (homepage, news, announcements, PPDB, contact, facilities, extracurriculars).
- `(dashboard)/` — Protected routes by role:
  - `dashboard-admin/`
  - `dashboard-kesiswaan/`
  - `dashboard-siswa/`
  - `dashboard-osis/`
  - `dashboard-ppdb/`
- `api/` — Legacy endpoints (auth, upload, ppdb) plus cron/maintenance handlers.
- `maintenance/`, `not-found.tsx`, `unauthorized/` — Application status pages.

### `actions/`
Server Actions for data mutations and fetches, organized per domain:
- `admin/`, `kesiswaan.ts`, `osis/`, `ppdb/`, `student/`
- `announcements.ts`, `hero.ts`, `news.ts`, `worship.ts`, `stats.ts`, `upload.ts`
- `auth.ts` — authentication and session helpers
- `public/` — data for public pages

### `components/`
Feature-focused React components.
- `layout/`, `common/`, `shared/` — global layouts, UI utilities, and reusable elements
- `dashboard/` — dashboard widgets across roles
- Public feature sets: `home/`, `news/`, `announcements/`, `facilities/`, `extracurricular/`, `contact/`, `ppdb/`, `calendar/`, `profile/`
- `script/` — embed/utility scripts (e.g., Flowise)

### `lib/`
Backend utilities and configuration:
- `prisma.ts`, `siteSettings.ts`, `notificationService.ts` — data access and system helpers
- `auth.ts`, `jwt.ts`, `roles.ts`, `rateLimiter.ts` — security and RBAC
- `cloudinary.ts`, `ppdbCloudinary.ts`, `r2.ts` — storage integrations
- `env.ts`, `data/`, `validations.ts` — validation, configuration, and fallback data

### `hooks/`
React-specific hooks: `useAuth`, `useAntiBot`, `useSidebar`, `useToastConfirm`, `useNotifications`.

### `shared/` & `utils/`
- `shared/` — shared types and data across modules.
- `utils/` — general helpers (formatting, guards, etc.).

### `tests/`
Playwright Page Object Model & fixtures:
- `_global-hooks.ts` — global setup.
- `critical-path.spec.ts` — primary flow (login, admin news).
- `fixtures/test-fixtures.ts`, `pages/*.ts` — Page Object Models.
