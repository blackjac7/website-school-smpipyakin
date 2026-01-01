# Technology Stack

## Core
- **Framework:** Next.js 15.5.9 (App Router)
- **Language:** TypeScript 5.9.3
- **Library:** React 18.3.1
- **Runtime:** Node.js 20.x

## Styling & UI
- **CSS Engine:** Tailwind CSS v4.1.11 (PostCSS pipeline)
- **Icons:** Lucide React 0.525+ & Heroicons 2.2+
- **Animations:** Framer Motion 12.x (`framer-motion`)
- **Lottie:** `@lottiefiles/dotlottie-react` 0.17+
- **Charts:** Recharts 3.6+
- **Theme & UX:** `next-themes` 0.4+, `nextjs-toploader` 3.9+, `react-hot-toast` 2.5+
- **Media Delivery:** `next-cloudinary` 6.16+ for optimized Cloudinary assets

## Data & State
- **ORM:** Prisma 6.19 (`@prisma/client`)
- **Database:** PostgreSQL 15+ (all environments)
- **Validation:** Zod 4.x
- **Security helpers:** `jose` 6.x (JWT), `bcryptjs` 3.x (12 rounds), database-backed login audit, in-memory rate limiter for PPDB

## Infrastructure & Services
- **Hosting:** Vercel (frontend), PostgreSQL on managed/VPS
- **Image Storage:** Cloudinary 2.7+ (general + PPDB preset)
- **File Storage:** Cloudflare R2 (PPDB documents/archives) via `@aws-sdk/client-s3` 3.956+
- **Email:** EmailJS 4.4+ (front-end triggered)
- **Chatbot:** Flowise embed (`flowise-embed-react` 3.0+)
- **Monitoring:** Vercel Analytics 1.6+ & Speed Insights 1.3+
- **PWA & SEO:** `next-pwa` 5.6+, `next-sitemap` 4.2+, custom robots/sitemap routes

## Dev Tools
- **Node:** 20.x in CI (see `.github/workflows/ci.yml`)
- **Linting:** ESLint 9 (Flat Config)
- **Type Checking:** `tsc --noEmit`
- **Testing:** Playwright 1.57+ (critical path + POM utilities, network stubbing)
- **Package Management:** npm with `npm ci` for reproducible installs

## Database Models (25+ entities)
- **User Management:** User, Siswa, Kesiswaan (with role-based profiles)
- **Content:** News, Announcement, HeroSlide, SchoolStat, SchoolActivity, OsisActivity
- **Academic:** Facility, Extracurricular, Teacher
- **Student Output:** StudentAchievement, StudentWork, Notification
- **PPDB:** PPDBApplication (with retry/feedback system)
- **Security:** LoginAttempt, SiteSettings, MaintenanceSchedule
- **Religious Programs:** WorshipMenstruationRecord, WorshipAdzanSchedule, WorshipCarpetSchedule/Assignment
