# 🚀 Deployment & Environment Guide

This guide explains how to manage environments, secrets, and the CI/CD workflow for the **SMP IP Yakin** project.

---

## 📋 Quick Reference

| Scope | Location | Purpose |
| --- | --- | --- |
| **Pipeline credentials** | GitHub → Settings → Secrets and variables → Actions | Authorize GitHub Actions to deploy to Vercel (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`). |
| **Runtime secrets** | Vercel Project → Settings → Environment Variables | Values required at build/runtime (DB, JWT, Cloudinary, R2, Flowise, EmailJS, cron). |
| **Local development** | `.env` (copy from `.env.example`) | Run the app locally and execute migrations/seeds. |

---

## 🛠 Prerequisites

- **Node.js** 20+
- **npm** (use `npm ci` for repeatable installs)
- **PostgreSQL 14+** (local or managed)
- Accounts: **Vercel**, **Cloudinary**, **Cloudflare R2**, **EmailJS**, and a **Flowise** instance (if the chatbot is enabled).

---

## 🌍 Environment Ownership & Sources

Use this table as a map for where each secret lives and how to obtain it:

| Variable | Used by | Store in Vercel? | Store in GitHub Actions? | How to obtain |
| --- | --- | --- | --- | --- |
| `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | GitHub Actions deploy step | No | ✅ | Vercel → Account Settings → Tokens (token) and Project Settings (ORG/PROJECT ID). |
| `DATABASE_URL`, `DIRECT_URL` | Prisma runtime & migrations | ✅ | Optional (only if CI runs migrations/tests) | From your Postgres provider (VPS/Aiven/Neon). Add `?sslmode=prefer` or `?sslmode=require` to match the host. |
| `JWT_SECRET` | JWT signing | ✅ | Optional (can use dummy for CI build) | `openssl rand -base64 32` |
| `CRON_SECRET` | Protects cron endpoints | ✅ | Optional | `openssl rand -hex 16` |
| `NEXT_PUBLIC_APP_URL` | SEO & canonical URL | ✅ | No | Vercel domain or custom domain |
| `NEXT_PUBLIC_CLOUDINARY_*`, `CLOUDINARY_API_KEY*` | Media uploads | ✅ | No | Cloudinary Dashboard → Settings → API Keys & Upload Preset |
| `R2_*` | Cloudflare R2 (PPDB documents) | ✅ | No | Cloudflare R2 → Create API Token & Bucket |
| `NEXT_PUBLIC_EMAILJS_*` | Contact form email | ✅ | No | EmailJS Dashboard → Account → API Keys & Template |
| `NEXT_PUBLIC_FLOWISE_*` | Chatbot embed | ✅ | No | Flowise → Chatflow detail & host URL |
| `NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS`, `MAX_FILE_SIZE` | Optional features | ✅ | No | Set `1` to enable Speed Insights; adjust upload limit as needed |

> **Tip:** Keep separate Vercel variable sets for **Preview (develop)** and **Production (main)**. Duplicate all required secrets unless the value differs by environment.

---

## 🔄 CI/CD Flow (`.github/workflows/ci.yml`)

```mermaid
flowchart LR
  A[Push / PR] --> Q(Code Quality: lint + tsc)
  Q --> T[Test: critical path + Postgres service]
  T --> B[Build check]
  B -->|develop| S[Deploy Staging (Vercel Preview)]
  B -->|main| P[Deploy Production]
```

1. **Quality:** `npm run lint` and `tsc --noEmit`.
2. **Test:** Start a PostgreSQL service in the runner, then `npm run db:reset` and `npm run test:critical`.
3. **Build:** `npm run build` with dummy env values to ensure the app compiles.
4. **Deploy:**
   - Branch `develop` → Vercel Preview/Staging (`https://staging.smpipyakin.sch.id`).
   - Branch `main` → Vercel Production (`https://www.smpipyakin.sch.id`).

Required **GitHub Secrets**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

---

## 🧭 Environment Setup Checklist

1. **Clone local template**
   ```bash
   cp .env.example .env
   # Fill with local Postgres credentials and dev API keys
   ```
2. **Vercel Project Settings**
   - Go to *Vercel Project → Settings → Environment Variables*.
   - Add all variables listed above for **Preview** and **Production**.
3. **GitHub Actions Secrets**
   - Go to *GitHub Repo → Settings → Secrets and variables → Actions*.
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
npm install
cp .env.example .env
# Set local Postgres credentials & API keys
npm run db:migrate
npm run db:seed && npm run db:seed-content
npm run dev
```

---

## 💾 Database Management

- Use `npm run db:migrate` locally to create migrations.
- Commit migration files before deployment.
- In production, run:
  ```bash
  DATABASE_URL="postgresql://user:pass@prod-host:5432/db?sslmode=prefer" npx prisma migrate deploy
  ```
- Additional scripts:
  - `npm run db:reset` (drop & recreate) – **local/CI only**.
  - `npm run db:migrate-static` (move static JSON content into the DB).

---

## 🔧 Troubleshooting

| Symptom | Likely Cause | Resolution |
| --- | --- | --- |
| Vercel 500 / build fails | Missing envs in Vercel | Verify **Environment Variables** for both Preview & Production |
| CI `test` job cannot connect DB | Postgres service not ready | Confirm `DATABASE_URL` in the `test` job matches the service and health checks pass |
| Deploy fails in GitHub Actions | Missing Vercel token/IDs | Populate `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` in GitHub Secrets |
| Production DB connection refused | VPS firewall blocks Vercel | Open port `5432` for Vercel IPs or allowlist appropriately |
| Uploads fail | Incorrect Cloudinary/R2 credentials | Regenerate API keys and update Vercel & `.env` |

---

_Last updated: 2025-12-30_ 
