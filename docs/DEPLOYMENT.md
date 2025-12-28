# 🚀 Deployment & Environment Guide

This document provides a comprehensive guide for deploying the **SMP IP Yakin** web application and managing its environments (Local, Staging, Production).

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Architecture](#project-architecture)
3. [Environment Configuration](#environment-configuration)
   - [Where to Configure Variables?](#where-to-configure-variables)
4. [Deployment Strategy (CI/CD)](#deployment-strategy-cicd)
   - [Hybrid Infrastructure Setup](#hybrid-infrastructure-setup-aiven--vps)
5. [Local Development Setup](#local-development-setup)
6. [Platform-Specific Deployment](#platform-specific-deployment)
7. [Database Management](#database-management)
8. [Troubleshooting](#troubleshooting)

---

## 🛠 Prerequisites

Before you begin, ensure you have the following:

- **Node.js**: Version 20.x or later (`node -v`)
- **Package Manager**: npm (v9+) or bun
- **Database**: PostgreSQL (v14+)
  - *Staging:* Aiven PostgreSQL.
  - *Production:* Self-hosted VPS PostgreSQL.
- **Accounts**:
  - [Cloudinary](https://cloudinary.com) (for Image Storage)
  - [EmailJS](https://www.emailjs.com) (for Contact Form)
  - [Vercel](https://vercel.com) (for Hosting)
  - [Flowise](https://flowiseai.com) (for AI Chatbot)

---

## 🏗 Project Architecture

This is a **Next.js 15** application using **App Router** and **Server Actions**.

- **Frontend**: Hosted on Vercel.
- **Database**: Hybrid (Aiven for Staging, VPS for Production).
- **Storage**: Cloudinary (Images) + Cloudflare R2 (Documents).

---

## 🌍 Environment Configuration

The application relies on environment variables for configuration. **Never commit `.env` files.**

### Where to Configure Variables?

**Best Practice:** Separate your *Pipeline Credentials* from your *Application Secrets*.

#### 1. GitHub Secrets (CI/CD Pipeline)
These are required for GitHub Actions to **authorize** the deployment to Vercel.
*Go to: GitHub Repo > Settings > Secrets and variables > Actions*

| Secret Name | Value Description |
|-------------|-------------------|
| `VERCEL_TOKEN` | Generate in Vercel Account Settings > Tokens. |
| `VERCEL_ORG_ID` | Found in Vercel Dashboard > Settings. |
| `VERCEL_PROJECT_ID` | Found in Vercel Project > Settings. |
| `DATABASE_URL` | (Optional) If you run integration tests against a real DB in CI. |

#### 2. Vercel Project Settings (Application Runtime)
These are required for the **application** to run (connect to DB, send emails, etc.).
*Go to: Vercel Project > Settings > Environment Variables*

**Staging Environment (Preview Branch: `develop`)**
- `DATABASE_URL`: `postgresql://avnadmin:pass@aiven-host:port/db?sslmode=require`
- `NODE_ENV`: `production` (Vercel sets this automatically)
- `NEXT_PUBLIC_APP_URL`: `https://staging.smpipyakin.sch.id`

**Production Environment (Production Branch: `main`)**
- `DATABASE_URL`: `postgresql://postgres:pass@YOUR_VPS_IP:5432/db?schema=public&sslmode=prefer`
- `NEXT_PUBLIC_APP_URL`: `https://www.smpipyakin.sch.id`

> **Note:** Variables like `CLOUDINARY_*`, `JWT_SECRET`, and `CRON_SECRET` should be set for **both** environments.

---

## 🚀 Deployment Strategy (CI/CD)

The project follows a **Gitflow-lite** workflow using **GitHub Actions** (`.github/workflows/ci.yml`).

### Workflow Overview
1.  **Push to `develop`**
    - Runs Linter & Type Check.
    - Runs Tests (Critical Path).
    - Deploys to **Vercel Preview** (Staging).
2.  **Push to `main`**
    - Runs Linter, Type Check, & Tests.
    - Deploys to **Vercel Production**.

### Hybrid Infrastructure Setup (Aiven + VPS)

Since your production database is on a **VPS**, Vercel (Cloud) needs to reach it.

1.  **VPS Firewall (Production)**
    - You must allow incoming connections on port `5432` from Vercel's IP addresses.
    - *Alternative (Easier/Safer):* Allow `0.0.0.0/0` (All IPs) but enforce strong passwords and **SSL** (`sslmode=prefer` or `require`).

2.  **Aiven (Staging)**
    - Aiven usually enforces SSL by default (`sslmode=require`).
    - Copy the "Service URI" directly from the Aiven Console.

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

### 4. Run Development Server
```bash
npm run dev
```

---

## 💾 Database Management

### Migrations
In production, **do not** run `prisma migrate dev`. Instead, use `prisma migrate deploy`.

**Recommended Workflow:**
1.  **Local:** Change `schema.prisma` -> `npm run db:migrate` (Creates migration file).
2.  **Commit:** Push migration file to GitHub.
3.  **Deploy:**
    - Vercel builds the app.
    - **You manually run migration** (safest for VPS) or configure a `postdeploy` script.
    - *Command:* `DATABASE_URL="prod_url" npx prisma migrate deploy`

---

## 🔧 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| **Connection Refused (VPS)** | Firewall blocking Vercel | Check VPS `ufw` or Security Group settings. |
| **SSL Error (Aiven)** | Missing SSL mode | Add `?sslmode=require` to connection string. |
| **Deployment Fails** | Missing Secrets | Check GitHub Secrets for `VERCEL_TOKEN`. |
| **App 500 Error** | Missing Env Vars | Check Vercel Project Settings for `DATABASE_URL`. |

---

_Documentation v1.2 - Updated for Hybrid Infrastructure (Aiven/VPS)_
