# 🏫 SMP IP Yakin - School Management System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma)

**A modern, secure, and comprehensive school management system**

[Getting Started](#-getting-started) •
[Documentation](#-documentation) •
[Features](#-features) •
[Security](#-security)

</div>

---

## 📖 Overview

SMP IP Yakin Website is a full-featured school management platform designed to streamline administrative tasks, enhance communication, and provide a seamless digital experience for students, teachers, and administrators.

Built with modern web technologies and industry best practices, this system prioritizes **security**, **performance**, and **user experience**.

---

## ✨ Features

### 🎯 Core Modules

| Module                    | Description                                                               |
| ------------------------- | ------------------------------------------------------------------------- |
| **Multi-Role Dashboard**  | Dedicated dashboards for Admin, Kesiswaan, OSIS, PPDB Staff, and Students |
| **PPDB System**           | Complete digital admission workflow with document management              |
| **Content Management**    | News, announcements, and event management                                 |
| **Academic Calendar**     | School schedule and event planning                                        |
| **Student Works Gallery** | Showcase student achievements and projects                                |
| **Facility Management**   | School facilities and extracurricular activities                          |

### 🔐 Security Features

- **Database-backed Rate Limiting** - Prevents brute force attacks
- **JWT with HTTP-Only Cookies** - Secure session management
- **IP Binding** - Session hijacking prevention
- **Input Sanitization** - XSS protection
- **CAPTCHA & Honeypot** - Anti-bot measures
- **Role-Based Access Control** - Granular permission system

### 🚀 Performance

- **Progressive Web App (PWA)** - Installable and offline-capable
- **Image Optimization** - Cloudinary CDN integration
- **Responsive Design** - Mobile-first architecture
- **SEO Optimized** - Sitemap, robots.txt, structured data

---

## 🛠 Tech Stack

### Core Technologies

| Category       | Technology                                     |
| -------------- | ---------------------------------------------- |
| **Framework**  | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language**   | [TypeScript](https://www.typescriptlang.org/)  |
| **Styling**    | [Tailwind CSS v4](https://tailwindcss.com/)    |
| **Database**   | [PostgreSQL](https://www.postgresql.org/)      |
| **ORM**        | [Prisma](https://www.prisma.io/)               |
| **Validation** | [Zod](https://zod.dev/)                        |

### Authentication & Security

| Category          | Technology                                                |
| ----------------- | --------------------------------------------------------- |
| **JWT Library**   | [Jose](https://github.com/panva/jose) + HTTP-Only Cookies |
| **Password Hash** | [bcryptjs](https://www.npmjs.com/package/bcryptjs)        |

### Storage & Media

| Category          | Technology                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| **Image Storage** | [Cloudinary](https://cloudinary.com/) (CDN + Optimization)             |
| **File Storage**  | [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible) |

### Third-Party Services

| Category       | Technology                                   |
| -------------- | -------------------------------------------- |
| **Email**      | [EmailJS](https://www.emailjs.com/)          |
| **AI Chatbot** | [Flowise](https://flowiseai.com/) (Embedded) |

### UI/UX Libraries

| Category       | Technology                                                                |
| -------------- | ------------------------------------------------------------------------- |
| **Animations** | [Framer Motion](https://www.framer.com/motion/)                           |
| **Lottie**     | [@lottiefiles/dotlottie-react](https://lottiefiles.com/)                  |
| **Icons**      | [Lucide React](https://lucide.dev/) + [Heroicons](https://heroicons.com/) |
| **Charts**     | [Recharts](https://recharts.org/)                                         |
| **Theme**      | [next-themes](https://github.com/pacocoursey/next-themes)                 |
| **Toast**      | [react-hot-toast](https://react-hot-toast.com/)                           |

### Utilities

| Category         | Technology                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------- |
| **Date/Time**    | [date-fns](https://date-fns.org/) + [date-fns-tz](https://github.com/marnusw/date-fns-tz) |
| **Excel Export** | [xlsx (SheetJS)](https://sheetjs.com/)                                                    |
| **PWA**          | [next-pwa](https://github.com/shadowwalker/next-pwa)                                      |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14+ (or use a managed service like Neon, Supabase, or Railway)
- **npm** or **yarn**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/website-school-smpipyakin.git
cd website-school-smpipyakin

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
npm run db:generate    # Generate Prisma Client
npm run db:migrate     # Run migrations
npm run db:seed        # Seed sample data

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file from [.env.example](./.env.example) and fill in the values. The table below shows where each secret should live during development and deployment.

| Variable | Purpose | Where to set | How to obtain |
| --- | --- | --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | PostgreSQL connection for Prisma (app + migrations) | **Local .env**, **Vercel** (Preview & Production), **GitHub Actions** (only if running migrations/tests in CI) | From your Postgres provider (VPS or managed DB connection string) |
| `JWT_SECRET` | Signing key for login sessions | **Vercel**, local .env, optional GitHub for build checks | Generate with `openssl rand -base64 32` |
| `CRON_SECRET` | Protects scheduled API routes | **Vercel**, local .env | Generate with `openssl rand -hex 16` |
| `NEXT_PUBLIC_APP_URL` | Canonical URL for SEO & links | **Vercel** (Preview/Prod) and local .env | Use your site domain or `http://localhost:3000` locally |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary uploads for news/facilities/gallery | **Vercel**, local .env | Cloudinary Dashboard → Settings → API Keys |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_PPDB`, `CLOUDINARY_API_KEY_PPDB`, `CLOUDINARY_API_SECRET_PPDB`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PPDB` | Dedicated preset for PPDB & admin uploads | **Vercel**, local .env | Cloudinary Dashboard → Upload presets |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Cloudflare R2 for documents | **Vercel**, local .env | Cloudflare R2 → Create API token & bucket |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Contact form delivery (EmailJS) | **Vercel**, local .env | EmailJS Dashboard → Account → API Keys |
| `NEXT_PUBLIC_FLOWISE_API_URL`, `NEXT_PUBLIC_FLOWISE_CHATFLOW_ID` | Flowise chatbot embed | **Vercel**, local .env | Flowise deployment → Chatflow details |
| `NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS` | Enable Vercel analytics widgets | **Vercel**, local .env | Set to `1` to enable |
| `MAX_FILE_SIZE` | Upload limit (bytes) for file endpoints | **Vercel**, local .env | Keep default `5242880` or adjust as needed |

> GitHub Actions only needs `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` to trigger deployments; runtime application secrets stay in **Vercel Project Settings**. See [Deployment](#-deployment) for a CI/CD diagram and step-by-step setup.

---

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run postbuild` | Generate sitemap after build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint (flat config) |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Apply migrations locally (`prisma migrate dev`) |
| `npm run db:migrate-static` | Migrate static JSON content into the database |
| `npm run db:seed` | Seed database with base users and settings |
| `npm run db:seed-content` | Seed content (news, announcements, gallery) |
| `npm run db:seed-all` | Run both base and content seeders |
| `npm run db:reset` | Reset database (⚠️ destructive) |
| `npm run test` | Run full Playwright suite (headless) |
| `npm run test:critical` | Run critical-path Playwright spec used in CI |
| `npm run test:ui` | Open Playwright UI mode |
| `npm run test:report` | Open the latest Playwright HTML report |

---

## 👥 Default Accounts

> ⚠️ **Warning**: Change all default passwords before deploying to production!

| Role       | Username    | Password   | Dashboard Access       |
| ---------- | ----------- | ---------- | ---------------------- |
| Admin      | `admin`     | `admin123` | `/dashboard-admin`     |
| Kesiswaan  | `kesiswaan` | `admin123` | `/dashboard-kesiswaan` |
| Student    | `siswa001`  | `admin123` | `/dashboard-siswa`     |
| OSIS       | `osis001`   | `admin123` | `/dashboard-osis`      |
| PPDB Staff | `ppdb001`   | `admin123` | `/dashboard-ppdb`      |

---

## 📚 Documentation

| Document                                       | Description                            |
| ---------------------------------------------- | -------------------------------------- |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | REST API endpoints documentation       |
| [docs/DOCS.md](./docs/DOCS.md)                  | Technical deep dive (architecture, flows, API) |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)  | High-level system architecture & diagrams |
| [docs/PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) | Directory layout & module ownership |
| [docs/TECH_STACK.md](./docs/TECH_STACK.md)      | Frameworks, libraries, and services used |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)      | CI/CD, environments, and secret management |
| [docs/TESTING.md](./docs/TESTING.md)            | Playwright setup, commands, and fixtures |
| [docs/TEST_STRATEGY.md](./docs/TEST_STRATEGY.md)| How we tag and scope Playwright suites   |
| [docs/SECURITY.md](./docs/SECURITY.md)          | Security controls and recommendations    |
| [docs/VISUAL_ARCHITECTURE.md](./docs/VISUAL_ARCHITECTURE.md) | Visual diagrams & role matrix |

---

## 📁 Project Structure

```
├── .github/                # GitHub Actions CI/CD
│   └── workflows/
│       ├── ci.yml          # Main CI/CD pipeline
│       ├── backup.yml      # Database backup workflow
│       └── dependency-update.yml
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/                 # Static assets
│   ├── icons/              # PWA icons
│   └── manifest.json
├── tests/                  # E2E Tests (Playwright)
│   ├── fixtures/           # Test fixtures & helpers
│   ├── pages/              # Page Object Models
│   └── *.spec.ts           # Test specifications
├── src/
│   ├── actions/            # Server actions
│   │   ├── admin/
│   │   ├── osis/
│   │   ├── public/
│   │   └── student/
│   ├── app/                # Next.js App Router
│   │   ├── (dashboard)/    # Protected dashboard routes
│   │   ├── (public)/       # Public pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   │   └── validations.ts  # Zod schemas
│   ├── shared/             # Shared data & types
│   └── utils/              # Utility functions

└── lighthouserc.json       # Lighthouse CI config
```

---

## 🔐 Security

This application implements multiple layers of security:

### Authentication & Authorization

- JWT tokens with HTTP-Only cookies
- IP binding to prevent session hijacking
- Secure password hashing (bcrypt, 12 salt rounds)
- Role-based access control with 5 distinct roles

### Attack Prevention

- **Brute Force**: Database-backed rate limiting (5 attempts/15 min per IP)
- **SQL Injection**: Prisma ORM with prepared statements
- **XSS**: React auto-escaping + input sanitization
- **CSRF**: SameSite cookies + origin validation
- **Bot Attacks**: Math CAPTCHA + honeypot fields

For detailed security documentation, see [PENETRATION_TESTING_DOCUMENTATION.md](./PENETRATION_TESTING_DOCUMENTATION.md).

---

## 🧪 Testing

End-to-end tests use **Playwright** with a Page Object Model. The CI pipeline runs a **critical-path** spec that covers login, basic navigation, and admin news creation with direct database verification.

### Running Tests Locally

```bash
# Full suite (headless)
npm run test

# Critical path only (matches CI)
npm run test:critical

# Inspect and debug
npm run test:ui         # Interactive mode
npm run test:report     # Open the latest HTML report
```

---

## 📊 Monitoring & Analytics

- **Vercel Analytics** - Web analytics and user insights
- **Vercel Speed Insights** - Core Web Vitals tracking
- **Lighthouse CI** - Performance auditing in CI/CD

---

## 🚀 Deployment

### Recommended Stack

| Service           | Purpose                            |
| ----------------- | ---------------------------------- |
| **Vercel**        | Hosting (optimized for Next.js)    |
| **Neon/Supabase** | PostgreSQL with connection pooling |
| **Cloudflare**    | DNS, SSL, and DDoS protection      |
| **Cloudinary**    | Image storage and optimization     |

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions including:

- Which secrets stay in **GitHub Actions** (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) versus **Vercel Project** variables (database, JWT, Cloudinary, R2, Flowise, EmailJS).
- How the `.github/workflows/ci.yml` pipeline promotes builds from quality checks → tests → build → staged/production deploys.
- Step-by-step guidance for retrieving credentials from each provider.

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting a pull request.

---

## 📄 License

This project is proprietary software developed for SMP IP Yakin.

---

<div align="center">

**Built with ❤️ for SMP IP Yakin**

</div>
