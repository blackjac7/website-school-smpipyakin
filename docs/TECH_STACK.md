# Technology Stack

## Core
- **Framework:** Next.js 15.5.9 (App Router)
- **Language:** TypeScript 5.9
- **Library:** React 18.3

## Styling & UI
- **CSS Engine:** Tailwind CSS v4 (postcss pipeline)
- **Icons:** Lucide React + Heroicons
- **Animations:** Framer Motion (`framer-motion`)
- **Lottie:** `@lottiefiles/dotlottie-react`
- **Charts:** Recharts
- **Theme & UX:** `next-themes`, `nextjs-toploader`, `react-hot-toast`

## Data & State
- **ORM:** Prisma (`@prisma/client`)
- **Database:** PostgreSQL (all environments)
- **Validation:** Zod
- **Security helpers:** `jose` (JWT), custom rate limiter, bcryptjs

## Infrastructure & Services
- **Hosting:** Vercel (frontend), Postgres on managed/VPS
- **Image Storage:** Cloudinary (two credential sets: general & PPDB preset)
- **File Storage:** Cloudflare R2 (PPDB documents and archives)
- **Email:** EmailJS (front-end triggered)
- **Chatbot:** Flowise embed
- **Monitoring:** Vercel Analytics & Speed Insights
- **PWA:** `next-pwa` + manifest/icon setup

## Dev Tools
- **Linting:** ESLint 9 (Flat Config)
- **Type Checking:** `tsc --noEmit`
- **Testing:** Playwright (critical path + POM utilities)
