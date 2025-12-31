# Project Directory Structure

## Root
- `src/` — Next.js application code.
- `prisma/` — Prisma schema, migrations, and seeders.
- `public/` — Static assets (icons, manifests, images, Flowise embed helpers).
- `docs/` — Project documentation and diagrams.
- `tests/` — Playwright tests (critical path) and fixtures.
- `scripts/` — Data utilities (e.g., migrate static JSON to DB).

## Source (`src/`)

### `app/`
Next.js App Router structure.
- `(public)/` — Public pages (homepage, news, announcements, PPDB, contact, facilities, extracurriculars, karya siswa, academic calendar, profile).
- `(dashboard)/` — Protected routes by role:
  - `dashboard-admin/`
  - `dashboard-kesiswaan/`
  - `dashboard-siswa/`
  - `dashboard-osis/`
  - `dashboard-ppdb/`
- `api/` — Auth (`/auth/login|logout|verify`), PPDB (`check-nisn`, `register`, `status`, `upload`, `upload-r2`), and cron endpoints.
- `maintenance/`, `not-found.tsx`, `unauthorized/` — Application status pages.

### `actions/`
Server Actions for data mutations and fetches, organized per domain:
- `admin/` (users, teachers, facilities, extracurriculars, backups, settings, dashboard stats)
- `osis/` (activities, news, stats)
- `ppdb/` (dashboard stats, notifications) and `ppdb.ts` (status updates/listing)
- `student/` (profile, works, achievements, notifications)
- `kesiswaan.ts`, `announcements.ts`, `hero.ts`, `news.ts`, `worship.ts`, `stats.ts`, `calendar.ts`, `upload.ts`
- `auth.ts` — authentication and session helpers
- `public/` — data for public pages (news, announcements, facilities, extracurriculars, teachers, calendar, karya)

### `components/`
Feature-focused React components.
- `layout/`, `common/`, `shared/` — global layouts, UI utilities, and reusable elements
- `dashboard/` — dashboard widgets across roles
- Public feature sets: `home/`, `news/`, `announcements/`, `facilities/`, `extracurricular/`, `contact/`, `ppdb/`, `calendar/`, `profile/`, `karya-siswa/`
- `script/` — embed/utility scripts (e.g., Flowise)

### `lib/`
Backend utilities and configuration:
- `prisma.ts`, `siteSettings.ts`, `notificationService.ts` — data access, feature flags, and system helpers
- `auth.ts`, `jwt.ts`, `roles.ts`, `rateLimiter.ts` — security and RBAC
- `cloudinary.ts`, `ppdbCloudinary.ts`, `r2.ts` — storage integrations
- `env.ts`, `data/`, `validations.ts` — validation, configuration, and fallback data

### `hooks/`
React-specific hooks: `useAuth`, `useAntiBot`, `useSidebar`, `useToastConfirm`, `useNotifications`.

### `shared/` & `utils/`
- `shared/` — shared types and data across modules.
- `utils/` — general helpers (formatting, guards, etc.).
- `types/` — type-only helpers for actions/components.
- `assets/` — static asset references (e.g., lottie paths).

### `tests/`
Playwright Page Object Model & fixtures:
- `_global-hooks.ts` — global setup with network stubs.
- `critical-path.spec.ts` — primary flow (login, admin news).
- `fixtures/test-fixtures.ts`, `pages/*.ts` — Page Object Models.
