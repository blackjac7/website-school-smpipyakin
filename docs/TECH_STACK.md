# Technology Stack

## Core
- **Framework:** Next.js 15.5.9 (App Router)
- **Language:** TypeScript 5.9.3
- **Library:** React 18.3.1

## Styling & UI
- **CSS Engine:** Tailwind CSS v4.1 (PostCSS pipeline)
- **Icons:** Lucide React + Heroicons
- **Animations:** Framer Motion (`framer-motion`)
- **Lottie:** `@lottiefiles/dotlottie-react`
- **Charts:** Recharts
- **Theme & UX:** `next-themes`, `nextjs-toploader`, `react-hot-toast`
- **Media Delivery:** `next-cloudinary` for optimized Cloudinary assets

## Data & State
- **ORM:** Prisma 6.19 (`@prisma/client`)
- **Database:** PostgreSQL (all environments)
- **Validation:** Zod
- **Security helpers:** `jose` (JWT), bcryptjs (12 rounds), database-backed login audit, in-memory rate limiter for PPDB

## Infrastructure & Services
- **Hosting:** Vercel (frontend), Postgres on managed/VPS
- **Image Storage:** Cloudinary (general + PPDB preset)
- **File Storage:** Cloudflare R2 (PPDB documents/archives) via `@aws-sdk/client-s3`
- **Email:** EmailJS (front-end triggered)
- **Chatbot:** Flowise embed (`flowise-embed-react`)
- **Monitoring:** Vercel Analytics & Speed Insights
- **PWA & SEO:** `next-pwa`, `next-sitemap`, custom robots/sitemap routes

## Dev Tools
- **Node:** 20.x in CI (see `.github/workflows/ci.yml`)
- **Linting:** ESLint 9 (Flat Config)
- **Type Checking:** `tsc --noEmit`
- **Testing:** Playwright 1.57 (critical path + POM utilities, network stubbing)
