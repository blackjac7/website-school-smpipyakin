# Project Directory Structure

## Root Files
- `package.json` — Dependencies and scripts (Next.js 15.5.9, Prisma 6.19, Playwright 1.57)
- `next.config.ts` — Next.js configuration with PWA and security headers
- `tsconfig.json` — TypeScript configuration
- `eslint.config.mjs` — ESLint 9 flat config
- `playwright.config.ts` — Playwright E2E test configuration
- `lighthouserc.json` — Lighthouse CI performance config
- `vercel.json` — Vercel deployment configuration

## Root Directories
- `src/` — Next.js application code (main source)
- `prisma/` — Prisma schema, migrations, seeders, and data files
- `public/` — Static assets (PWA icons, manifests, images, service worker)
- `docs/` — Project documentation and diagrams
- `tests/` — Playwright E2E tests with Page Object Model
- `scripts/` — Data utilities and migration scripts

## Source (`src/`)

### `app/` — Next.js App Router
- `(public)/` — **10+ Public pages:**
  - `page.tsx` — Homepage
  - `news/` — News listing and detail pages
  - `announcements/` — Announcements listing
  - `ppdb/` — PPDB registration, status check, and info
  - `contact/` — Contact form with EmailJS
  - `facilities/` — School facilities showcase
  - `extracurricular/` — Extracurricular activities
  - `karya-siswa/` — Student works gallery
  - `academic-calendar/` — Academic calendar
  - `profile/` — School profile pages
  - `login/` — Multi-role login page
- `(dashboard)/` — **5 Role-based dashboards:**
  - `dashboard-admin/` — Full system administration
  - `dashboard-kesiswaan/` — Student affairs management
  - `dashboard-siswa/` — Student portal
  - `dashboard-osis/` — Student council management
  - `dashboard-ppdb/` — Admissions management
- `api/` — **REST API endpoints:**
  - `auth/` — login, logout, verify endpoints
  - `ppdb/` — check-nisn, register, status, upload, upload-r2
  - `cron/` — cleanup-logs, maintenance-check (secured by CRON_SECRET)
- `maintenance/`, `not-found.tsx`, `unauthorized/` — Application status pages
- `global-error.tsx` — Global error boundary
- `layout.tsx`, `globals.css` — Root layout and global styles
- `robots.ts`, `sitemap.ts` — Dynamic SEO files

### `actions/` — Server Actions (15+ files)
Organized per domain for type-safe mutations:
- `admin/` — Users, teachers, facilities, extracurriculars, backups, settings, dashboard stats
- `osis/` — Activities, news, stats for OSIS dashboard
- `ppdb/` — Dashboard stats, notifications, status updates
- `student/` — Profile, works, achievements, notifications
- `public/` — Data for public pages (news, announcements, facilities, extracurriculars, teachers, calendar, karya)
- `auth.ts` — Authentication and session helpers
- `kesiswaan.ts` — Student affairs validation
- `announcements.ts`, `hero.ts`, `news.ts`, `stats.ts` — Content management
- `calendar.ts` — Academic calendar data
- `worship.ts` — Religious program management
- `upload.ts` — File upload handlers

### `components/` — React Components (16 directories)
Feature-focused organization:
- `layout/` — Global layouts (Navbar, Footer, Sidebar)
- `common/` — Shared UI utilities (buttons, modals, loading states)
- `shared/` — Reusable elements across features
- `dashboard/` — Dashboard widgets for all roles
- `home/` — Homepage sections (Hero, Stats, Features)
- `news/` — News cards and detail views
- `announcements/` — Announcement components
- `facilities/` — Facility showcase components
- `extracurricular/` — Extracurricular display
- `contact/` — Contact form with anti-bot
- `ppdb/` — PPDB registration forms and status
- `calendar/` — Academic calendar views
- `profile/` — School profile components
- `auth/` — Login form with CAPTCHA
- `public/` — Public page utilities
- `script/` — Embed/utility scripts (Flowise chatbot)

### `lib/` — Backend Utilities (12 files)
- `prisma.ts` — Prisma client singleton
- `auth.ts`, `jwt.ts`, `roles.ts` — Authentication & RBAC
- `rateLimiter.ts` — Database-backed and in-memory rate limiting
- `cloudinary.ts`, `r2.ts` — Storage integrations
- `siteSettings.ts` — Feature flags and maintenance mode
- `notificationService.ts` — Notification system
- `validations.ts` — Zod schemas
- `env.ts` — Environment configuration
- `data/` — Static fallback data

### `hooks/` — Custom React Hooks (5 files)
- `useAuth.ts` — Authentication state management
- `useAntiBot.ts` — CAPTCHA and honeypot logic
- `useSidebar.ts` — Sidebar state for dashboards
- `useToastConfirm.ts` — Confirmation dialogs
- `useNotifications.ts` — Real-time notification handling

### `shared/` & `utils/`
- `shared/` — Shared types and data across modules
- `utils/` — General helpers (formatting, guards, security)
- `types/` — Type-only helpers for actions/components
- `assets/` — Static asset references (Lottie paths)

## Prisma (`prisma/`)
- `schema.prisma` — **25+ models** with full relationship mapping
- `seed.ts` — Base users and settings seeder
- `seedContent.ts` — Content seeder (news, announcements, gallery)
- `seedNotifications.ts` — Notification test data
- `importStudentsFromExcel.ts` — Excel import utility
- `migrations/` — Database migration history
- `data/` — Seed data files

## Tests (`tests/`)
Playwright Page Object Model & fixtures:
- `_global-hooks.ts` — Global setup with network stubs
- `critical-path.spec.ts` — Primary CI test suite
- `authentication.spec.ts` — Login/auth tests
- `admin-dashboard.spec.ts` — Admin features
- `student-dashboard.spec.ts` — Student portal tests
- `public-pages.spec.ts` — Public page smoke tests
- `ppdb-dashboard.spec.ts` — PPDB functionality
- `kesiswaan-dashboard.spec.ts` — Kesiswaan features
- `osis-dashboard.spec.ts` — OSIS features
- `fixtures/` — Test fixtures & helpers
- `pages/` — Page Object Models (LoginPage, DashboardPage, PublicPage)
