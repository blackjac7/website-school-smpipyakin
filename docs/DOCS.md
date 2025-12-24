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
│  Cloudinary (Images)  │  EmailJS (Notifications)            │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision                          | Rationale                                          |
| --------------------------------- | -------------------------------------------------- |
| **Next.js App Router**            | Server Components by default, improved performance |
| **Server Actions**                | Type-safe mutations without API boilerplate        |
| **Prisma ORM**                    | Type-safe database queries, migration management   |
| **JWT in HTTP-Only Cookies**      | Secure token storage, XSS protection               |
| **Database-backed Rate Limiting** | Persistent protection across restarts              |

---

## 2. Database Design

### Entity Relationship Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │────▶│    Siswa     │     │    News      │
│              │     │              │     │              │
│ - id         │     │ - userId     │     │ - authorId   │
│ - username   │     │ - nisn       │     │ - title      │
│ - password   │     │ - nama       │     │ - content    │
│ - role       │     │ - kelas      │     │ - createdAt  │
└──────────────┘     └──────────────┘     └──────────────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ LoginAttempt │     │   PPDBApp    │     │ Announcement │
│              │     │              │     │              │
│ - ip         │     │ - status     │     │ - title      │
│ - username   │     │ - documents  │     │ - content    │
│ - success    │     │ - createdAt  │     │ - priority   │
│ - createdAt  │     └──────────────┘     └──────────────┘
└──────────────┘
```

### Core Models

#### User Model

```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?
  password  String
  role      Role     @default(siswa)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  siswa     Siswa?
  news      News[]
}

enum Role {
  admin
  kesiswaan
  siswa
  osis
  ppdb_officer @map("ppdb-officer")
}
```

#### LoginAttempt Model (Security)

```prisma
model LoginAttempt {
  id        String   @id @default(cuid())
  ip        String
  username  String
  success   Boolean
  userAgent String?
  createdAt DateTime @default(now())

  @@index([ip, createdAt])
  @@index([username, createdAt])
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
       │ (username, password)                  │
       │──────────────────▶│                   │
       │                   │                   │
       │                   │ Check rate limit  │
       │                   │──────────────────▶│
       │                   │◀──────────────────│
       │                   │                   │
       │                   │ Validate user     │
       │                   │──────────────────▶│
       │                   │◀──────────────────│
       │                   │                   │
       │                   │ Generate JWT      │
       │                   │ (includes IP)     │
       │                   │                   │
       │ Set-Cookie: token │                   │
       │ (HTTP-Only)       │                   │
       │◀──────────────────│                   │
       │                   │                   │
```

### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  clientIp: string; // IP binding for security
  iat: number; // Issued at
  exp: number; // Expiration (24 hours)
}
```

### Cookie Configuration

```typescript
const cookieOptions = {
  httpOnly: true, // Prevent XSS access
  secure: true, // HTTPS only in production
  sameSite: "lax", // CSRF protection
  path: "/",
  maxAge: 60 * 60 * 24, // 24 hours
};
```

### Role-Based Access Control

| Role           | Dashboard              | Permissions                                  |
| -------------- | ---------------------- | -------------------------------------------- |
| `admin`        | `/dashboard-admin`     | Full system access, user management, backups |
| `kesiswaan`    | `/dashboard-kesiswaan` | Student management, reports, announcements   |
| `siswa`        | `/dashboard-siswa`     | View profile, submit works, view grades      |
| `osis`         | `/dashboard-osis`      | Event management, OSIS news                  |
| `ppdb-officer` | `/dashboard-ppdb`      | Application review, document verification    |

### Middleware Protection

```typescript
// middleware.ts - Enforces role boundaries
const PROTECTED_ROUTES = {
  "/dashboard-admin": ["admin"],
  "/dashboard-kesiswaan": ["kesiswaan"],
  "/dashboard-siswa": ["siswa"],
  "/dashboard-osis": ["osis"],
  "/dashboard-ppdb": ["ppdb-officer"],
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
│  • Rate limiting (database-backed)                           │
│  • Input sanitization (XSS prevention)                       │
│  • JWT validation (with IP binding)                          │
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

### Input Sanitization

```typescript
// src/utils/security.ts
export function sanitizeInput(input: string): string {
  return input
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
```

#### Folder Structure

```
school/
├── uploads/          # General uploads
├── profiles/         # User profile pictures
├── news/             # News article images
├── ppdb/             # PPDB application documents
└── works/            # Student work submissions
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

## 6. API Reference

### Authentication Endpoints

#### POST `/api/auth/login`

```typescript
// Request
{
  username: string;
  password: string;
  role: string;
  captchaAnswer?: string;
}

// Response (Success)
{
  success: true;
  message: "Login berhasil";
  data: {
    role: string;
    username: string;
  }
}

// Response (Error)
{
  success: false;
  error: string;
  remainingAttempts?: number;
}
```

#### POST `/api/auth/logout`

```typescript
// Response
{
  success: true;
  message: "Logout berhasil";
}
```

#### GET `/api/auth/me`

```typescript
// Response (Authenticated)
{
  user: {
    userId: string;
    username: string;
    role: string;
  }
}

// Response (Not Authenticated)
{
  user: null;
}
```

### Rate Limit Headers

All API responses include rate limit information:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1703577600
```

---

## Additional Resources

- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [Security Documentation](./SECURITY.md) - Detailed security implementation
- [Prisma Schema](../prisma/schema.prisma) - Complete database schema

---

_Last updated: December 2024_
