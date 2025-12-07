# Deployment & Production Guide

This guide covers the necessary steps to deploy this Next.js application to Vercel with a production-ready configuration, optimized for free-tier usage.

## 1. Hosting (Vercel) & DNS (Cloudflare)

### Why this combination?
- **Vercel:** Best-in-class hosting for Next.js. The free tier is generous but has limits (serverless function execution time, database connections).
- **Cloudflare:** Free DNS, SSL, and DDoS protection. It sits *in front* of Vercel to cache static assets and block bad traffic before it hits your Vercel limits.

### Setup Steps:
1.  **Vercel:**
    - Connect your GitHub repository to Vercel.
    - Add the Environment Variables (see section 3).
    - Deploy.
2.  **Cloudflare:**
    - Add your domain to Cloudflare.
    - Set SSL/TLS encryption mode to **Full (Strict)**. This is critical because Vercel provides its own SSL.
    - In DNS settings, point your domain (CNAME/A records) to Vercel (follow Vercel's domain instructions).

## 2. Database Connection Pooling (Critical)

Since Vercel uses **Serverless Functions**, every API call spins up a new instance. If you connect directly to a standard Postgres database, you will quickly hit the "Too many connections" error.

### Solution:
You **must** use a Connection Pooler.
- **Neon / Supabase / Railway:** These providers offer a special "Pooling URL" (usually port 6543 or similar, or a specific transaction mode string).
- **Action:** In your `.env` (and Vercel Env Vars), set `DATABASE_URL` to this **pooled connection string**, not the direct one.

Example (Supabase):
```env
# Use the "Transaction" pooler string
DATABASE_URL="postgres://user:pass@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## 3. Environment Variables

Ensure these are set in your Vercel Project Settings:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | The **pooled** Postgres connection string. |
| `JWT_SECRET` | A long, random string for signing tokens. |
| `CRON_SECRET` | A secure random string to protect your Cron Jobs. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name. |
| `CLOUDINARY_API_KEY` | Cloudinary API Key. |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret. |
| `EMAILJS_SERVICE_ID` | (Optional) EmailJS Service ID. |
| `EMAILJS_TEMPLATE_ID` | (Optional) EmailJS Template ID. |
| `EMAILJS_PUBLIC_KEY` | (Optional) EmailJS Public Key. |
| `EMAILJS_PRIVATE_KEY` | (Optional) EmailJS Private Key. |

## 4. Automated Cleanup (Cron Jobs)

To keep your free database clean, we implemented a log cleanup job.

1.  This app uses `vercel.json` (created automatically or implicitly by Next.js) to schedule cron jobs.
2.  The job runs at `src/app/api/cron/cleanup-logs`.
3.  **Security:** You must set the `CRON_SECRET` environment variable in Vercel. Vercel's cron scheduler will automatically send this token in the header.

## 5. Manual Backup Strategy

Since there is no automated database backup on the free tier (usually), use the built-in **Data Export** feature.
- **Role:** Admin only.
- **Action:** Go to the Admin Dashboard (you may need to implement the UI button calling `exportDataAction`).
- **Frequency:** Download the JSON export once a week or after major data entry.

## 6. Security Checklist
- [ ] `JWT_SECRET` is strong (use `openssl rand -base64 32`).
- [ ] `CRON_SECRET` is set.
- [ ] Database is using a Pooled URL.
- [ ] Cloudflare SSL is "Full (Strict)".
