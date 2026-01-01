# 🚀 Deployment & Environment Guide

Panduan lengkap untuk mengelola environments, secrets, dan CI/CD workflow untuk proyek **SMP IP Yakin**.

---

## 📑 Table of Contents

1. [Quick Reference](#-quick-reference)
2. [Deployment Architecture](#deployment-architecture)
3. [Prerequisites](#-prerequisites)
4. [Environment Configuration](#-environment-ownership--sources)
5. [CI/CD Pipeline](#-cicd-flow)
6. [Setup Checklist](#-environment-setup-checklist)
7. [Database Management](#-database-management)
8. [Troubleshooting](#-troubleshooting)

---

## 📋 Quick Reference

| Scope                    | Location                                          | Purpose                                        |
| ------------------------ | ------------------------------------------------- | ---------------------------------------------- |
| **Pipeline Credentials** | GitHub → Settings → Secrets                       | Authorize GitHub Actions to deploy to Vercel   |
| **Runtime Secrets**      | Vercel Project → Settings → Environment Variables | Build/runtime values (DB, JWT, Cloudinary, R2) |
| **Local Development**    | `.env` (copy from `.env.example`)                 | Run app locally                                |

---

## Deployment Architecture

### Infrastructure Overview

```mermaid
graph TB
    subgraph Developer["👨‍💻 Developer"]
        Local[Local Machine]
        Git[Git Push]
    end

    subgraph CI["🔄 GitHub Actions"]
        Lint[Lint & TypeCheck]
        Test[Playwright Tests]
        Build[Build Check]
    end

    subgraph Staging["🔵 Staging Environment"]
        VercelPreview[Vercel Preview]
        StagingDB[(Managed PostgreSQL<br/>Neon/Aiven)]
    end

    subgraph Production["🟢 Production Environment"]
        VercelProd[Vercel Production]
        ProdDB[(VPS PostgreSQL)]
    end

    subgraph External["☁️ External Services"]
        Cloudinary[Cloudinary]
        R2[Cloudflare R2]
        EmailJS[EmailJS]
        Flowise[Flowise AI]
    end

    Local --> Git
    Git --> CI
    CI --> |develop| Staging
    CI --> |main| Production

    VercelPreview --> StagingDB
    VercelPreview --> External

    VercelProd --> ProdDB
    VercelProd --> External

    style Staging fill:#3b82f6,color:#fff
    style Production fill:#10b981,color:#fff
```

### Environment Matrix

| Environment     | Database                   | SSL Mode            | Branch     | URL                       |
| --------------- | -------------------------- | ------------------- | ---------- | ------------------------- |
| **Development** | Local PostgreSQL           | Optional (`prefer`) | feature/\* | localhost:3000            |
| **Staging**     | Managed Cloud (Neon/Aiven) | `require`           | develop    | staging.smpipyakin.sch.id |
| **Production**  | VPS PostgreSQL             | `prefer`            | main       | www.smpipyakin.sch.id     |

---

## 🛠 Prerequisites

- **Node.js** 20+
- **npm** (use `npm ci` for repeatable installs)
- **PostgreSQL 14+** (local or managed)
- Accounts: **Vercel**, **Cloudinary**, **Cloudflare R2**, **EmailJS**, and a **Flowise** instance (if the chatbot is enabled).

---

## 🌍 Environment Ownership & Sources

Use this table as a map for where each secret lives and how to obtain it:

| Variable                                             | Used by                        | Store in Vercel? | Store in GitHub Actions?                    | How to obtain                                                                                                |
| ---------------------------------------------------- | ------------------------------ | ---------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | GitHub Actions deploy step     | No               | ✅                                          | Vercel → Account Settings → Tokens (token) and Project Settings (ORG/PROJECT ID).                            |
| `DATABASE_URL`, `DIRECT_URL`                         | Prisma runtime & migrations    | ✅               | Optional (only if CI runs migrations/tests) | From your Postgres provider (VPS/Aiven/Neon). Add `?sslmode=prefer` or `?sslmode=require` to match the host. |
| `JWT_SECRET`                                         | JWT signing                    | ✅               | Optional (can use dummy for CI build)       | `openssl rand -base64 32`                                                                                    |
| `CRON_SECRET`                                        | Protects cron endpoints        | ✅               | Optional                                    | `openssl rand -hex 16`                                                                                       |
| `NEXT_PUBLIC_APP_URL`                                | SEO & canonical URL            | ✅               | No                                          | Vercel domain or custom domain                                                                               |
| `NEXT_PUBLIC_CLOUDINARY_*`, `CLOUDINARY_API_KEY*`    | Media uploads                  | ✅               | No                                          | Cloudinary Dashboard → Settings → API Keys & Upload Preset                                                   |
| `R2_*`                                               | Cloudflare R2 (PPDB documents) | ✅               | No                                          | Cloudflare R2 → Create API Token & Bucket                                                                    |
| `NEXT_PUBLIC_EMAILJS_*`                              | Contact form email             | ✅               | No                                          | EmailJS Dashboard → Account → API Keys & Template                                                            |
| `NEXT_PUBLIC_FLOWISE_*`                              | Chatbot embed                  | ✅               | No                                          | Flowise → Chatflow detail & host URL                                                                         |
| `NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS`, `MAX_FILE_SIZE` | Optional features              | ✅               | No                                          | Set `1` to enable Speed Insights; adjust upload limit as needed                                              |

> **Tip:** Keep separate Vercel variable sets for **Preview (develop)** and **Production (main)**. Duplicate all required secrets unless the value differs by environment.

---

## 🔄 CI/CD Flow (`.github/workflows/ci.yml`)

### Pipeline Diagram

```mermaid
flowchart LR
    subgraph Trigger["🎯 Trigger"]
        Push[Push / PR]
    end

    subgraph Quality["✅ Quality Gate"]
        Lint[npm run lint]
        TSC[tsc --noEmit]
    end

    subgraph Test["🧪 Test Gate"]
        DB[(PostgreSQL Service)]
        Reset[npm run db:reset]
        Critical[npm run test:critical]
    end

    subgraph Build["🔨 Build Gate"]
        BuildCheck[npm run build]
    end

    subgraph Deploy["🚀 Deploy"]
        Staging[Vercel Preview<br/>develop branch]
        Prod[Vercel Production<br/>main branch]
    end

    Push --> Quality
    Quality --> Test
    Test --> Build
    Build --> |develop| Staging
    Build --> |main| Prod

    DB --> Reset
    Reset --> Critical

    style Quality fill:#f59e0b,color:#fff
    style Test fill:#3b82f6,color:#fff
    style Build fill:#8b5cf6,color:#fff
    style Deploy fill:#10b981,color:#fff
```

### Pipeline Stages

| Stage       | Commands                                    | Purpose                           |
| ----------- | ------------------------------------------- | --------------------------------- |
| **Quality** | `npm run lint`, `tsc --noEmit`              | Code quality & type safety        |
| **Test**    | `npm run db:reset`, `npm run test:critical` | E2E tests with PostgreSQL service |
| **Build**   | `npm run build`                             | Verify production build           |
| **Deploy**  | Vercel CLI                                  | Auto-deploy to Vercel             |

### Required GitHub Secrets

```mermaid
graph LR
    subgraph GitHub["🔐 GitHub Secrets"]
        Token[VERCEL_TOKEN]
        Org[VERCEL_ORG_ID]
        Project[VERCEL_PROJECT_ID]
    end

    subgraph Optional["🔧 Optional"]
        DBUrl[DATABASE_URL<br/>Only if CI runs migrations]
    end

    GitHub --> |Deploy| Vercel[Vercel Platform]
```

| Secret              | Required    | How to obtain                       |
| ------------------- | ----------- | ----------------------------------- |
| `VERCEL_TOKEN`      | ✅          | Vercel → Account Settings → Tokens  |
| `VERCEL_ORG_ID`     | ✅          | Vercel → Project Settings → General |
| `VERCEL_PROJECT_ID` | ✅          | Vercel → Project Settings → General |
| `DATABASE_URL`      | ❌ Optional | Only if CI runs migrations/tests    |

---

## 🧭 Environment Setup Checklist

1. **Clone local template**
   ```bash
   cp .env.example .env
   # Fill with local Postgres credentials and dev API keys
   ```
2. **Vercel Project Settings**
   - Go to _Vercel Project → Settings → Environment Variables_.
   - Add all variables listed above for **Preview** and **Production**.
3. **GitHub Actions Secrets**
   - Go to _GitHub Repo → Settings → Secrets and variables → Actions_.
   - Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
   - Add `DATABASE_URL` **only if** CI should run migrations/seeds (optional).
4. **Database access**
   - Staging (e.g., Aiven/Neon): ensure `?sslmode=require`.
   - Production (VPS): open firewall port `5432` for Vercel IPs or an allowlist; use `?sslmode=prefer`.

---

## 📦 Manual Deploy (if needed)

```bash
# Staging (Preview)
vercel --token $VERCEL_TOKEN --prod=false

# Production
vercel --token $VERCEL_TOKEN --prod
```

> GitHub Actions already deploys automatically on pushes to `develop` (staging) and `main` (production).

---

## 💻 Local Development

```bash
npm ci
cp .env.example .env
# Set local Postgres credentials & API keys
npm run db:migrate
npm run db:seed && npm run db:seed-content
npm run dev
```

---

## 💾 Database Management

### Database Operations Diagram

```mermaid
flowchart TB
    subgraph Local["💻 Local Development"]
        LocalPG[(Local PostgreSQL)]
        Migrate[npm run db:migrate]
        Seed[npm run db:seed]
    end

    subgraph CI["🔄 CI Environment"]
        CIPG[(PostgreSQL Service)]
        Reset[npm run db:reset]
    end

    subgraph Production["🚀 Production"]
        ProdPG[(VPS PostgreSQL)]
        ProdMigrate[prisma migrate deploy]
    end

    Migrate --> LocalPG
    Seed --> LocalPG
    Reset --> CIPG
    ProdMigrate --> ProdPG
```

### Database Commands

| Command                     | Environment | Purpose                    |
| --------------------------- | ----------- | -------------------------- |
| `npm run db:generate`       | All         | Generate Prisma Client     |
| `npm run db:migrate`        | Local       | Create & apply migrations  |
| `npm run db:seed`           | Local       | Seed base users & settings |
| `npm run db:seed-content`   | Local       | Seed content data          |
| `npm run db:seed-all`       | Local       | Run both seeders           |
| `npm run db:reset`          | Local/CI    | Drop & recreate database   |
| `npm run db:migrate-static` | Local       | Migrate static JSON to DB  |

### Production Migration

```bash
# SSH into VPS or run from local with production credentials
DATABASE_URL="postgresql://user:pass@prod-host:5432/db?sslmode=prefer" \
  npx prisma migrate deploy
```

### Connection String Formats

| Environment    | Format                                                               |
| -------------- | -------------------------------------------------------------------- |
| **Local**      | `postgresql://user:pass@localhost:5432/db?schema=public`             |
| **Staging**    | `postgres://user:pass@managed-host:5432/db?sslmode=require`          |
| **Production** | `postgresql://user:pass@vps-ip:5432/db?schema=public&sslmode=prefer` |

---

## 🔧 Troubleshooting

### Common Issues

```mermaid
flowchart TB
    subgraph Issues["🔴 Common Issues"]
        V500[Vercel 500 Error]
        DBConn[DB Connection Failed]
        Deploy[Deploy Failed]
        Upload[Upload Failed]
    end

    subgraph Solutions["🟢 Solutions"]
        CheckEnv[Check Environment Variables]
        CheckFirewall[Check Firewall Rules]
        CheckSecrets[Check GitHub Secrets]
        CheckKeys[Regenerate API Keys]
    end

    V500 --> CheckEnv
    DBConn --> CheckFirewall
    Deploy --> CheckSecrets
    Upload --> CheckKeys
```

| Symptom                          | Likely Cause                        | Resolution                                                |
| -------------------------------- | ----------------------------------- | --------------------------------------------------------- |
| Vercel 500 / build fails         | Missing envs in Vercel              | Verify **Environment Variables** for Preview & Production |
| CI `test` job cannot connect DB  | PostgreSQL service not ready        | Confirm `DATABASE_URL` matches the service container      |
| Deploy fails in GitHub Actions   | Missing Vercel token/IDs            | Populate secrets in GitHub                                |
| Production DB connection refused | VPS firewall blocks Vercel          | Open port `5432` for Vercel IPs                           |
| Uploads fail                     | Incorrect Cloudinary/R2 credentials | Regenerate API keys and update Vercel                     |
| Maintenance mode stuck           | Cron job not running                | Check `CRON_SECRET` and Vercel cron config                |

### Debug Checklist

- [ ] Verify all required environment variables are set
- [ ] Check Vercel deployment logs
- [ ] Verify database connection with `npx prisma db pull`
- [ ] Test API endpoints with curl/Postman
- [ ] Check GitHub Actions workflow logs

---

## 📦 Manual Deploy (if needed)

```bash
# Install Vercel CLI
npm i -g vercel

# Staging (Preview)
vercel --token $VERCEL_TOKEN --prod=false

# Production
vercel --token $VERCEL_TOKEN --prod
```

> **Note:** GitHub Actions automatically deploys on pushes to `develop` (staging) and `main` (production).

---

## 💻 Local Development Quick Start

```bash
# 1. Clone & install
git clone https://github.com/your-repo/website-school-smpipyakin.git
cd website-school-smpipyakin
npm ci

# 2. Setup environment
cp .env.example .env
# Edit .env with local credentials

# 3. Setup database
npm run db:generate
npm run db:migrate
npm run db:seed-all

# 4. Start development
npm run dev
```

---

## 📚 Related Documentation

| Document                             | Description            |
| ------------------------------------ | ---------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture    |
| [SECURITY.md](./SECURITY.md)         | Security configuration |
| [TESTING.md](./TESTING.md)           | E2E testing guide      |
| [.env.example](../.env.example)      | Environment template   |

---

_Last Updated: January 2026_
