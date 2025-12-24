# 🚀 Deployment Guide

This guide covers deploying the SMP IP Yakin website to production using Vercel with a PostgreSQL database.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Environment Variables](#environment-variables)
5. [DNS & SSL Configuration](#dns--ssl-configuration)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Maintenance](#maintenance)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with repository access
- [ ] Vercel account (free tier available)
- [ ] PostgreSQL database (Neon, Supabase, or Railway recommended)
- [ ] Cloudinary account for image storage
- [ ] Domain name (optional, for custom domain)

---

## Database Setup

### Recommended Providers

| Provider     | Free Tier | Connection Pooling | Notes               |
| ------------ | --------- | ------------------ | ------------------- |
| **Neon**     | 0.5GB     | ✅ Built-in        | Best for serverless |
| **Supabase** | 500MB     | ✅ Built-in        | Feature-rich        |
| **Railway**  | $5 credit | ✅ Available       | Easy setup          |

### Connection Pooling (Critical)

Vercel uses serverless functions that create new database connections on each request. Without connection pooling, you'll hit "Too many connections" errors.

#### Neon Setup

```env
# Use the pooled connection string (port 5432 → 6543)
DATABASE_URL="postgresql://user:pass@ep-xxx.region.neon.tech:5432/neondb?sslmode=require"

# Neon automatically handles pooling
```

#### Supabase Setup

```env
# Use the "Transaction" pooler connection string
DATABASE_URL="postgres://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Initialize Database

After setting up your database:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npm run db:seed
```

---

## Vercel Deployment

### Step 1: Connect Repository

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel auto-detects Next.js configuration

### Step 2: Configure Build Settings

Vercel should auto-detect these, but verify:

| Setting          | Value           |
| ---------------- | --------------- |
| Framework Preset | Next.js         |
| Build Command    | `npm run build` |
| Output Directory | `.next`         |
| Install Command  | `npm install`   |

### Step 3: Add Environment Variables

Add all required environment variables in Vercel dashboard:

```
# Database
DATABASE_URL=your-pooled-database-url

# Authentication
JWT_SECRET=your-jwt-secret
CRON_SECRET=your-cron-secret

# Cloudinary (Images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Cloudflare R2 (Files)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev

# EmailJS (Optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key

# Flowise AI Chatbot (Optional)
NEXT_PUBLIC_FLOWISE_API_URL=your-flowise-url
NEXT_PUBLIC_FLOWISE_CHATFLOW_ID=your-chatflow-id
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

---

## Environment Variables

### Required Variables

| Variable       | Description                    | Example                       |
| -------------- | ------------------------------ | ----------------------------- |
| `DATABASE_URL` | PostgreSQL connection (pooled) | `postgresql://...`            |
| `JWT_SECRET`   | JWT signing key (min 32 chars) | Use `openssl rand -base64 32` |
| `CRON_SECRET`  | Cron job authentication        | Use `openssl rand -hex 16`    |

### Cloudinary Variables

| Variable                            | Description     |
| ----------------------------------- | --------------- |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your cloud name |
| `CLOUDINARY_API_KEY`                | API key         |
| `CLOUDINARY_API_SECRET`             | API secret      |

### Cloudflare R2 Variables

| Variable                | Description                      |
| ----------------------- | -------------------------------- |
| `R2_ACCOUNT_ID`         | Cloudflare account ID            |
| `R2_ACCESS_KEY_ID`      | R2 API access key ID             |
| `R2_SECRET_ACCESS_KEY`  | R2 API secret access key         |
| `R2_BUCKET_NAME`        | R2 bucket name                   |
| `R2_PUBLIC_URL`         | Public URL for R2 bucket (if enabled) |

### EmailJS Variables (Optional)

| Variable                          | Description        |
| --------------------------------- | ------------------ |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID`  | EmailJS service ID |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Email template ID  |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`  | Public key         |

### Flowise Variables (Optional)

| Variable                           | Description                |
| ---------------------------------- | -------------------------- |
| `NEXT_PUBLIC_FLOWISE_API_URL`      | Flowise API endpoint URL   |
| `NEXT_PUBLIC_FLOWISE_CHATFLOW_ID`  | Chatflow ID for the widget |

### Generating Secure Secrets

```bash
# Generate JWT_SECRET (strong, 32+ characters)
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -hex 16
```

---

## DNS & SSL Configuration

### Custom Domain Setup

#### Vercel DNS (Recommended)

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Configure DNS records at your registrar:

```
Type  Name    Value
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

### Cloudflare Setup (Optional)

If using Cloudflare for additional protection:

1. Add your domain to Cloudflare
2. **Critical**: Set SSL/TLS to "Full (Strict)"
3. Configure DNS records pointing to Vercel
4. Enable the following:
   - Auto HTTPS Rewrites
   - Always Use HTTPS
   - Automatic HTTPS Rewrites

#### Cloudflare Security Settings

| Setting          | Value         | Purpose               |
| ---------------- | ------------- | --------------------- |
| SSL/TLS Mode     | Full (Strict) | End-to-end encryption |
| Always Use HTTPS | On            | Force HTTPS           |
| TLS 1.3          | On            | Latest TLS version    |
| HSTS             | On            | HTTP Strict Transport |

---

## Post-Deployment Checklist

### Security

- [ ] All default passwords changed (especially `admin123`)
- [ ] `JWT_SECRET` is unique and secure
- [ ] `CRON_SECRET` is configured
- [ ] SSL certificate is active (HTTPS)
- [ ] Environment variables don't leak in client code

### Database

- [ ] Connection pooling is enabled
- [ ] Initial data is seeded
- [ ] Backup strategy is in place

### Functionality

- [ ] Login/logout works correctly
- [ ] All dashboard roles accessible
- [ ] Image uploads work (Cloudinary)
- [ ] Contact form works (EmailJS)
- [ ] PWA manifests correctly

### Performance

- [ ] Build completes without errors
- [ ] Page load times are acceptable
- [ ] Images are optimized via Cloudinary

---

## Maintenance

### Cron Jobs

The application includes automated cleanup jobs configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-logs",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs daily at 2 AM UTC to clean up old login attempt logs.

### Database Backups

Since free database tiers don't include automated backups:

1. Use the Admin Dashboard export feature regularly
2. Download JSON exports weekly
3. Store backups securely (encrypted)

### Manual Export Command

```bash
# Using Prisma
npx prisma db pull   # Pull schema
npx prisma studio    # Visual editor for data export
```

### Monitoring

Monitor your deployment via:

- **Vercel Dashboard**: Function logs, analytics
- **Database Dashboard**: Connection count, query performance
- **Cloudinary Dashboard**: Bandwidth usage, storage

---

## Troubleshooting

### Common Issues

#### "Too many connections"

**Solution**: Ensure you're using a pooled database URL.

#### Build fails with Prisma error

**Solution**: Add build command:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

#### JWT verification fails

**Solution**: Ensure `JWT_SECRET` is identical in all environments.

#### Images not loading

**Solution**: Verify Cloudinary environment variables are set correctly.

---

## Support

For deployment issues:

1. Check Vercel deployment logs
2. Review database connection status
3. Verify all environment variables are set

---

_Last updated: December 2024_
