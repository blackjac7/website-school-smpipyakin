# 🚀 Deployment & Environment Guide

This document provides a comprehensive guide for deploying the **SMP IP Yakin** web application and managing its environments (Local, Staging, Production).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Architecture](#project-architecture)
3. [Environment Configuration](#environment-configuration)
4. [Local Development Setup](#local-development-setup)
5. [Deployment Strategy (CI/CD)](#deployment-strategy-cicd)
6. [Platform-Specific Deployment](#platform-specific-deployment)
   - [Vercel (Recommended)](#option-1-vercel-recommended)
   - [Docker / VPS](#option-2-docker--vps)
7. [Database Management](#database-management)
8. [Troubleshooting](#troubleshooting)

---

## 🛠 Prerequisites

Before you begin, ensure you have the following:

- **Node.js**: Version 20.x or later (`node -v`)
- **Package Manager**: npm (v9+) or bun
- **Database**: PostgreSQL (v14+)
  - *Local:* Local Postgres server or Docker container.
  - *Production:* Managed Postgres (Neon, Supabase, Railway, or AWS RDS).
- **Accounts**:
  - [Cloudinary](https://cloudinary.com) (for Image Storage)
  - [EmailJS](https://www.emailjs.com) (for Contact Form)
  - [Vercel](https://vercel.com) (for Hosting)

---

## 🏗 Project Architecture

This is a **Next.js 15** application using **App Router** and **Server Actions**.

- **Frontend**: React 18, Tailwind CSS v4, Framer Motion.
- **Backend**: Next.js Server Actions (No separate API server required).
- **Database**: Prisma ORM with PostgreSQL.
- **Auth**: Custom JWT-based authentication (`src/actions/auth.ts`).

---

## 🌍 Environment Configuration

The application relies on environment variables for configuration. **Never commit `.env` files.**

### File Structure
- `.env`: Used for Local Development (Git ignored).
- `.env.example`: Template file (Committed).

### Key Variables
Refer to `.env.example` for the complete list. Below are the critical ones:

| Variable | Description | Local Example | Production Note |
|----------|-------------|---------------|-----------------|
| `DATABASE_URL` | Prisma Connection | `postgresql://user:pass@localhost:5432/db` | Use **Pooled** URL (port 6543 for Neon/Supabase) |
| `DIRECT_URL` | Migration Connection | Same as `DATABASE_URL` | Use **Direct** URL (port 5432) for migrations |
| `NEXT_PUBLIC_APP_URL` | Base URL | `http://localhost:3000` | Real Domain (e.g., `https://smpipyakin.sch.id`) |
| `JWT_SECRET` | Auth Token Secret | `openssl rand -base64 32` | **Must** be strong and unique per env |

---

## 💻 Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/your-org/smp-ip-yakin.git
cd smp-ip-yakin
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and fill in your local postgres credentials and API keys
```

### 3. Setup Database
Ensure your local PostgreSQL server is running.

```bash
# 1. Run Migrations (Create Tables)
npm run db:migrate

# 2. Seed Initial Data (Admin User, Settings)
npm run db:seed
```

> **Default Admin Credentials:**
> - Email: `admin@sekolah.sch.id`
> - Password: `admin123` (Change immediately in dashboard)

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🚀 Deployment Strategy (CI/CD)

The project follows a **Gitflow-lite** workflow using **GitHub Actions**.

### Branches
- **`develop`** → Deploys to **Staging** Environment
  - URL: `https://staging.smpipyakin.sch.id` (or Vercel Preview)
  - Purpose: Internal testing, UAT.
- **`main`** → Deploys to **Production** Environment
  - URL: `https://www.smpipyakin.sch.id`
  - Purpose: Live public site.

### GitHub Configuration
To enable the CI/CD pipeline defined in `.github/workflows/ci.yml`:

1. Go to **Settings > Environments** in your GitHub Repo.
2. Create environments: `staging` and `production`.
3. Add Environment Secrets for each (e.g., `DATABASE_URL`, `JWT_SECRET`).
   - *Note:* The CI pipeline uses `vercel-action`. You need to set `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as **Repository Secrets**.

---

## ☁️ Platform-Specific Deployment

### Option 1: Vercel (Recommended)

Vercel is the native platform for Next.js and offers the best performance.

1.  **Import Project:**
    - Go to Vercel Dashboard → Add New Project → Import from GitHub.
    - Select the `smp-ip-yakin` repository.

2.  **Build Configuration:**
    - Framework: **Next.js**
    - Build Command: `npm run build` (or `prisma generate && next build` if schema changes often)
    - Output Directory: `.next`

3.  **Environment Variables:**
    - Copy all values from your `.env` (Production values) into the Vercel Environment Variables UI.
    - **Crucial:** For `DATABASE_URL`, use the **Pooled** connection string if using Neon or Supabase to prevent connection exhaustion.

4.  **Deploy:**
    - Click **Deploy**. Vercel will build and serve the site.

---

### Option 2: Docker / VPS

For self-hosting on a VPS (Ubuntu/Debian) using Docker.

#### 1. Build the Docker Image
Create a `Dockerfile` (standard Next.js standalone build):

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1
# Generate Prisma Client
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

#### 2. Run with Docker Compose
Create `docker-compose.yml`:

```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    env_file: .env.production
    restart: always
```

#### 3. Start Service
```bash
docker-compose up -d --build
```

---

## 💾 Database Management

### Migrations
In production, **do not** run `prisma migrate dev`. Instead, use `prisma migrate deploy` which applies pending migrations without resetting the DB.

**On Vercel:**
Add a "Build Command" override or use a `postinstall` script in `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma migrate deploy && next build"
}
```
*Warning: Running migrations during build can be risky if the DB is live. It's often safer to run migrations manually or via a separate CI job.*

### Seeding Production Data
To seed initial data (Roles, Admin) in production:
```bash
# Locally, pointing to Prod DB (Be careful!)
DATABASE_URL="postgresql://user:pass@prod-host..." npm run db:seed
```

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **Prisma Client Error** | Schema changed but client not updated | Run `npx prisma generate` (or add to build script). |
| **504 Gateway Timeout** | Database connection slow/full | Use Connection Pooling (`pgbouncer`). |
| **Images 404** | Cloudinary vars missing | Check `NEXT_PUBLIC_CLOUDINARY_...` vars. |
| **Build Fail: Type Error** | TypeScript issues | Run `npm run lint` locally and fix errors before pushing. |
| **Auth Fails (Login)** | Invalid Secret/Cookie | Ensure `JWT_SECRET` matches across pods (if scaled). |

---

_Documentation v1.1 - Updated for Next.js 15 & Prisma 6_
