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

---

## 🛠 Tech Stack

### Core Technologies

| Category           | Technology                                                      |
| ------------------ | --------------------------------------------------------------- |
| **Framework**      | [Next.js 15](https://nextjs.org/) (App Router)                  |
| **Language**       | [TypeScript](https://www.typescriptlang.org/)                   |
| **Styling**        | [Tailwind CSS v4](https://tailwindcss.com/)                     |
| **Database**       | [PostgreSQL](https://www.postgresql.org/)                       |
| **ORM**            | [Prisma](https://www.prisma.io/)                                |
| **Validation**     | [Zod](https://zod.dev/)                                         |

### Authentication & Security

| Category           | Technology                                                      |
| ------------------ | --------------------------------------------------------------- |
| **JWT Library**    | [Jose](https://github.com/panva/jose) + HTTP-Only Cookies       |
| **Password Hash**  | [bcryptjs](https://www.npmjs.com/package/bcryptjs)              |

### Storage & Media

| Category           | Technology                                                      |
| ------------------ | --------------------------------------------------------------- |
| **Image Storage**  | [Cloudinary](https://cloudinary.com/) (CDN + Optimization)      |
| **File Storage**   | [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible) |

### Third-Party Services

| Category           | Technology                                                      |
| ------------------ | --------------------------------------------------------------- |
| **Email**          | [EmailJS](https://www.emailjs.com/)                             |
| **AI Chatbot**     | [Flowise](https://flowiseai.com/) (Embedded)                    |

### UI/UX Libraries

| Category           | Technology                                                      |
| ------------------ | --------------------------------------------------------------- |
| **Animations**     | [Framer Motion](https://www.framer.com/motion/)                 |
| **Lottie**         | [@lottiefiles/dotlottie-react](https://lottiefiles.com/)        |
| **Icons**          | [Lucide React](https://lucide.dev/) + [Heroicons](https://heroicons.com/) |
| **Charts**         | [Recharts](https://recharts.org/)                               |
| **Theme**          | [next-themes](https://github.com/pacocoursey/next-themes)       |
| **Toast**          | [react-hot-toast](https://react-hot-toast.com/)                 |

### Utilities

| Category           | Technology                                                      |
| ------------------ | --------------------------------------------------------------- |
| **Date/Time**      | [date-fns](https://date-fns.org/) + [date-fns-tz](https://github.com/marnusw/date-fns-tz) |
| **Excel Export**   | [xlsx (SheetJS)](https://sheetjs.com/)                          |
| **PWA**            | [next-pwa](https://github.com/shadowwalker/next-pwa)            |

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

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smpipyakin"

# Authentication
JWT_SECRET="your-super-secret-key-min-32-characters"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# EmailJS (Optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your-service-id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your-template-id"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your-public-key"

# Cron Jobs (Production)
CRON_SECRET="your-cron-secret"
```

---

## 📜 Available Scripts

| Command                   | Description                     |
| ------------------------- | ------------------------------- |
| `npm run dev`             | Start development server        |
| `npm run build`           | Build for production            |
| `npm run start`           | Start production server         |
| `npm run lint`            | Run ESLint                      |
| `npm run db:generate`     | Generate Prisma Client          |
| `npm run db:migrate`      | Run database migrations         |
| `npm run db:seed`         | Seed database with sample data  |
| `npm run db:seed-content` | Seed content data               |
| `npm run db:reset`        | Reset database (⚠️ destructive) |

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

| Document                              | Description                            |
| ------------------------------------- | -------------------------------------- |
| [DOCS.md](./docs/DOCS.md)             | Technical documentation & architecture |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Production deployment guide            |
| [SECURITY.md](./docs/SECURITY.md)     | Security implementation details        |
| [CONTRIBUTING.md](./CONTRIBUTING.md)  | Contribution guidelines                |

---

## 📁 Project Structure

```
├── prisma/                 # Database schema & migrations
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/                 # Static assets
│   ├── icons/              # PWA icons
│   └── manifest.json
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
│   ├── shared/             # Shared data & types
│   └── utils/              # Utility functions
└── docs/                   # Documentation
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

For detailed security documentation, see [SECURITY.md](./docs/SECURITY.md).

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

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

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
