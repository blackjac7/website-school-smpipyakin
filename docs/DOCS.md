# 📘 Technical Documentation

This document provides comprehensive technical information about the SMP IP Yakin website architecture, including database design, authentication flow, security implementations, and third-party service integrations.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Design](#2-database-design)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Security Implementation](#4-security-implementation)
5. [Third-Party Services](#5-third-party-services)
6. [API Reference](#6-api-reference)

---

## 1. Architecture Overview

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Next.js 15 (App Router) │ React 18 │ TypeScript 5.9       │
│  Tailwind CSS v4         │ Framer Motion                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Server Actions  │  API Routes  │  Middleware               │
│  Authentication  │  Authorization  │  Validation            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  Prisma ORM      │  PostgreSQL   │  Connection Pooling      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
├─────────────────────────────────────────────────────────────┤
│  Cloudinary (Images) │ Cloudflare R2 (Files) │ EmailJS      │
│  Flowise (AI Chat)   │ Lottie (Animations)                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision                          | Rationale                                          |
| --------------------------------- | -------------------------------------------------- |
| **Next.js App Router**            | Server Components by default, improved performance |
| **Server Actions**                | Type-safe mutations without API boilerplate        |
| **Targeted API Routes**           | Auth + PPDB + cron keep compatibility for public flows |
| **Prisma + PostgreSQL**           | Single source of truth for relational data         |
| **JWT in HTTP-Only Cookies**      | Secure token storage with IP binding               |
| **Login Audit & Rate Limits**     | Database-backed logging with cron cleanup          |
| **Feature Flags & Maintenance**   | Runtime toggles via `siteSettings` and schedules   |

---

## 2. Database Design

### Schema Highlights

- **PostgreSQL only** (all environments) with UUID primary keys.
- **Core domain:** `User` + role profiles (`Siswa`, `Kesiswaan`), content (`News`, `Announcement`, `HeroSlide`, `SchoolStat`, `SchoolActivity`, `OsisActivity`), and academic data (`Facility`, `Extracurricular`, `Teacher`).
- **Student output:** `StudentAchievement`, `StudentWork`, and notifications per user.
- **PPDB:** `PPDBApplication` with retry counter, feedback, and document URLs (ijazah, akta, KK, pas foto).
- **Security:** `LoginAttempt` audit trail with IP/account limits; cron cleans records older than 30 days.
- **Settings:** `SiteSettings` (feature flags & maintenance) and `MaintenanceSchedule`.
- **Religious programs:** `WorshipMenstruationRecord`, `WorshipAdzanSchedule`, `WorshipCarpetSchedule/Assignment`.

### Key Models (Prisma excerpts)

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String?  @unique
  password  String
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  siswa         Siswa?
  kesiswaan     Kesiswaan?
  newsArticles  News[]           @relation("NewsAuthor")
  osisActivities OsisActivity[]  @relation("OsisActivityCreator")
}

model PPDBApplication {
  id               String     @id @default(uuid())
  name             String
  nisn             String     @unique
  gender           GenderType?
  birthPlace       String?
  birthDate        DateTime?
  address          String?
  asalSekolah      String?
  parentContact    String?
  parentName       String?
  parentEmail      String?
  status           PPDBStatus @default(PENDING)
  feedback         String?
  ijazahUrl        String?
  aktaKelahiranUrl String?
  kartuKeluargaUrl String?
  pasFotoUrl       String?
  retries          Int        @default(0)
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
}

model LoginAttempt {
  id            String   @id @default(uuid())
  ip            String
  username      String
  userAgent     String
  success       Boolean  @default(false)
  failureReason String?
  resolved      Boolean  @default(false)
  createdAt     DateTime @default(now())

  @@index([ip, createdAt])
  @@index([username, createdAt])
  @@index([success, createdAt])
}
```

### Database Scripts

```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Create and apply migration
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Seed additional content data
npm run db:seed-content

# Reset database (WARNING: destructive)
npm run db:reset
```

---

## 3. Authentication & Authorization

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │     │   Server    │     │  Database   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ POST /api/auth/login                  │
       │ (username, password, role)            │
       │──────────────────▶│                   │
       │                   │                   │
       │                   │ Rate-limit check  │
       │                   │ (IP + account)    │
       │                   │──────────────────▶│
       │                   │◀──────────────────│
       │                   │ Validate user +   │
       │                   │ role mapping      │
       │                   │──────────────────▶│
       │                   │◀──────────────────│
       │                   │                   │
       │                   │ Generate JWT      │
       │                   │ (includes IP +    │
       │                   │ permissions)      │
       │                   │                   │
       │ Set-Cookie: auth-token (HTTP-Only)    │
       │◀──────────────────│                   │
       │                   │                   │
```

### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  username: string;
  role: string;        // Lowercase token role (mapped from Prisma enum)
  permissions: string[];
  ip: string;          // IP binding for security
  iat: number;         // Issued at
  exp: number;         // Expiration (24 hours)
}
```

### Cookie Configuration

```typescript
// src/lib/jwt.ts
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours
};
```

### Role-Based Access Control

| Role         | Dashboard              | Permissions                                  |
| ------------ | ---------------------- | -------------------------------------------- |
| `admin`      | `/dashboard-admin`     | Full system access, user management, backups |
| `kesiswaan`  | `/dashboard-kesiswaan` | Student management, reports, announcements   |
| `siswa`      | `/dashboard-siswa`     | View profile, submit works, view grades      |
| `osis`       | `/dashboard-osis`      | Event management, OSIS news, religious tasks (adzan/karpet) |
| `ppdb_admin` | `/dashboard-ppdb`      | Application review, document verification    |

### Middleware Protection

```typescript
// middleware.ts - Enforces role boundaries
const PROTECTED_ROUTES = {
  "/dashboard-admin": ["admin"],
  "/dashboard-kesiswaan": ["kesiswaan"],
  "/dashboard-siswa": ["siswa"],
  "/dashboard-osis": ["osis"],
  "/dashboard-ppdb": ["ppdb_admin"],
};
```

---

## 4. Security Implementation

### Multi-Layer Protection

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 1: Client-Side                      │
├─────────────────────────────────────────────────────────────┤
│  • Math CAPTCHA (anti-bot)                                   │
│  • Honeypot fields (bot detection)                           │
│  • Input validation (immediate feedback)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 2: Server-Side                      │
├─────────────────────────────────────────────────────────────┤
│  • Rate limiting (login: DB-backed; PPDB: in-memory)        │
│  • Input sanitization (XSS prevention)                       │
│  • JWT validation (with IP binding)                          │
│  • Maintenance gating (feature flags + schedules)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 3: Database                         │
├─────────────────────────────────────────────────────────────┤
│  • Prisma ORM (SQL injection prevention)                     │
│  • Bcrypt hashing (12 salt rounds)                           │
│  • Login attempt logging (audit trail)                       │
└─────────────────────────────────────────────────────────────┘
```

### Rate Limiting Configuration

```typescript
const RATE_LIMITS = {
  login: {
    maxAttempts: 5, // Per IP
    windowMinutes: 15,
    accountMaxAttempts: 10, // Per username
    accountWindowHours: 24,
  },
  forms: {
    maxSubmissions: 10,
    windowMinutes: 60,
  },
};
```

- PPDB registration uses an in-memory limiter (5 submissions/hour/IP).
- PPDB uploads to R2 are limited to 20 uploads/hour/IP with 5MB + type validation.

### Input Sanitization

```typescript
// src/utils/security.ts
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .slice(0, 1000);
}
```

### Security Headers

Configured via `next.config.ts` and middleware:

```typescript
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Content-Security-Policy is applied in middleware for production, allowing maps/Flowise/CDN assets.
};
```

---

## 5. Third-Party Services

### Cloudinary (Image Storage)

#### Configuration

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# PPDB preset/credentials
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_PPDB=your-ppdb-cloud
CLOUDINARY_API_KEY_PPDB=your-ppdb-key
CLOUDINARY_API_SECRET_PPDB=your-ppdb-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PPDB=ppdb_uploads
```

#### Usage Example

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image
const result = await cloudinary.uploader.upload(file, {
  folder: "school/uploads",
  transformation: [{ width: 800, crop: "limit" }, { quality: "auto" }],
});
```

### Cloudflare R2 (File Storage)

R2 is used for storing larger files and documents with S3-compatible API.

#### Configuration

```env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-public-url.r2.dev
```

#### Usage Example

```typescript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 Client Configuration
export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

// Upload file to R2
const command = new PutObjectCommand({
  Bucket: process.env.R2_BUCKET_NAME,
  Key: `documents/${filename}`,
  Body: fileBuffer,
  ContentType: contentType,
});
await r2.send(command);

// Generate presigned URL for secure downloads
const signedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
```

#### Storage Strategy

| Content Type   | Storage       | Reason                                  |
| -------------- | ------------- | --------------------------------------- |
| Profile Images | Cloudinary    | Auto optimization, CDN, transformations |
| News Images    | Cloudinary    | Auto optimization, responsive images    |
| PPDB Documents | Cloudflare R2 | Larger files, cost-effective storage    |
| Excel Exports  | Cloudflare R2 | Generated files, temporary storage      |

---

### EmailJS (Notifications)

#### Configuration

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key
```

#### Email Templates

| Template              | Purpose           | Variables                                       |
| --------------------- | ----------------- | ----------------------------------------------- |
| `school_notification` | Notify admin      | `from_name`, `from_email`, `subject`, `message` |
| `user_autoresponse`   | User confirmation | `to_name`, `to_email`                           |

---

### Flowise (AI Chatbot)

Integrated AI chatbot for answering visitor questions.

#### Configuration

```env
NEXT_PUBLIC_FLOWISE_API_URL=your-flowise-url
NEXT_PUBLIC_FLOWISE_CHATFLOW_ID=your-chatflow-id

Note: If your Flowise host responds from a custom domain (e.g., https://flowise.zeabur.app), add that host to your Content Security Policy (CSP) script-src / connect-src / frame-src so the browser won't block chat requests or framing.
```

#### Implementation

```tsx
import { BubbleChat } from "flowise-embed-react";

export function ChatWidget() {
  return (
    <BubbleChat
      chatflowid={process.env.NEXT_PUBLIC_FLOWISE_CHATFLOW_ID}
      apiHost={process.env.NEXT_PUBLIC_FLOWISE_API_URL}
      theme={{
        button: { backgroundColor: "#1E40AF" },
        chatWindow: { title: "Asisten SMP IP Yakin" },
      }}
    />
  );
}
```

---

### Additional Libraries

#### Recharts (Data Visualization)

Used for dashboard charts and analytics.

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

<BarChart data={data}>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="value" fill="#3B82F6" />
</BarChart>;
```

#### XLSX (Excel Export)

Used for exporting data to Excel format.

```typescript
import * as XLSX from "xlsx";

function exportToExcel(data: any[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
```

#### Lottie Animations

Used for loading states and interactive animations.

```tsx
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

<DotLottieReact src="/animations/loading.lottie" loop autoplay />;
```

#### Zod (Validation)

Type-safe schema validation.

```typescript
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  role: z.enum(["admin", "kesiswaan", "siswa", "osis", "ppdb-officer"]),
});

// Validate data
const result = loginSchema.safeParse(formData);
if (!result.success) {
  return { errors: result.error.flatten() };
}
```

---

## 6. API Reference

See [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for full payload examples. Key endpoints:

### Authentication
- **POST `/api/auth/login`** — JSON body `{ username, password, role }`; sets `auth-token` cookie. Rate limited (5 attempts/15m per IP, 10/24h per account). Response includes `permissions` array.
- **POST `/api/auth/logout`** — Clears the `auth-token` cookie.
- **GET `/api/auth/verify`** — Validates session cookie, returns user info + `normalizedRole`.

### PPDB (Admissions)
- **GET `/api/ppdb/check-nisn?nisn=`** — Returns existence and retry allowance.
- **POST `/api/ppdb/register`** — JSON body with applicant data + optional `documents` array. Enforces PPDB open window via site settings; 5 submissions/hour/IP.
- **GET `/api/ppdb/status?nisn=`** — Returns status, feedback, and uploaded document URLs.
- **POST `/api/ppdb/upload`** — `multipart/form-data` (JPG/PNG/PDF ≤5MB) to Cloudinary PPDB preset.
- **POST `/api/ppdb/upload-r2`** — `multipart/form-data` to Cloudflare R2; 20 uploads/hour/IP.

### Cron / Maintenance
- **GET `/api/cron/cleanup-logs`** — Deletes login attempts older than 30 days; secured with `Authorization: Bearer <CRON_SECRET>`.
- **POST `/api/cron/maintenance-check`** — Toggles maintenance based on `maintenanceSchedule`; secured with the same header (test secret fallback for local).

---

## Additional Resources

- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Security Documentation](./SECURITY.md) - Detailed security implementation
- [Prisma Schema](../prisma/schema.prisma) - Complete database schema

---

_Last updated: January 2026_
