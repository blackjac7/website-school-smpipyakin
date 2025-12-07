# Technical Documentation Manual

This document provides a comprehensive technical overview of the SMP IP Yakin website. It consolidates setup instructions, security implementations, authentication details, and testing guidelines into a single reference.

---

## Table of Contents

1. [Development Setup](#1-development-setup)
2. [Database Architecture](#2-database-architecture)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Security Implementations](#4-security-implementations)
5. [Third-Party Services](#5-third-party-services)
6. [Testing Guide](#6-testing-guide)

---

## 1. Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL Database

### Installation
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Database Scripts
```bash
# Generate Prisma Client
npm run db:generate

# Run Migrations
npm run db:migrate

# Seed Database
npm run db:seed

# Reset Database (Caution!)
npm run db:reset
```

### Running the App
```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

---

## 2. Database Architecture

The project uses **Prisma ORM** with **PostgreSQL**.

### Core Schema Overview
- **User**: Central identity table handling authentication.
- **Siswa / Kesiswaan / Guru**: Profiles linked to the User table.
- **PPDBApplication**: Manages new student applications.
- **LoginAttempt**: Logs for rate limiting and security auditing.

### Key Relations
- `User` 1:1 `Siswa` / `Kesiswaan`
- `User` 1:N `News` (Author)

For the full schema, refer to `prisma/schema.prisma`.

---

## 3. Authentication & Authorization

The system implements a custom authentication solution designed for security and flexibility.

### Architecture
- **Method**: API Routes (`/api/auth/login`) with `jose` for JWT handling.
- **Storage**: HTTP-Only, Secure, SameSite Cookies.
- **Hashing**: `bcryptjs` (Salt rounds: 12).

### Roles & Access Control
| Role | Dashboard Access | Permissions |
|------|------------------|-------------|
| `admin` | `/dashboard-admin` | Full system access, user management |
| `kesiswaan` | `/dashboard-kesiswaan` | Student management, reports |
| `siswa` | `/dashboard-siswa` | Profile view, assignments |
| `osis` | `/dashboard-osis` | Event management |
| `ppdb-officer`| `/dashboard-ppdb` | Application management |

### Middleware Protection
`middleware.ts` enforces role boundaries. Any attempt to access a dashboard not matching the user's role results in a redirect to `/unauthorized`.

### Default Credentials (Dev Only)
- **Admin**: `admin` / `admin123`
- **Kesiswaan**: `kesiswaan` / `admin123`
- **Siswa**: `siswa001` / `admin123`

---

## 4. Security Implementations

### Anti-Bot Measures
Implemented in `src/hooks/useAntiBot.ts` and `src/app/api/auth/login/route.ts`.

1.  **Math Captcha**: Simple challenge (1-10 addition) for forms.
2.  **Honeypot Fields**: Hidden input fields to trap bots.
3.  **Rate Limiting**:
    *   **Login**: Database-backed. 5 attempts/15 mins (IP), 10 attempts/24 hours (Account).
    *   **Forms**: In-memory/Client-side limits for PPDB and Contact forms.

### Data Protection
-   **JWT Security**: Tokens include Client IP binding to prevent session hijacking.
-   **Input Sanitization**: Utility functions to strip XSS vectors (`<script>`, `javascript:`).
-   **Secure Headers**: Application applies standard security headers.

---

## 5. Third-Party Services

### Cloudinary (Image Storage)
Used for storing profile pictures, PPDB documents, and news images.
-   **Setup**: Requires `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
-   **Folder Structure**: `school/uploads/`, `school/profiles/`.

### EmailJS (Notifications)
Used for contact forms and notifications.
-   **Setup**: Requires `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `TEMPLATE_ID`, `PUBLIC_KEY`.
-   **Templates**:
    -   `school_notification`: Sent to admin.
    -   `user_autoresponse`: Sent to the user.

---

## 6. Testing Guide

### Security Testing
Refer to `src/utils/security.ts` for validation logic.
-   **SQL Injection**: Prevented by Prisma ORM.
-   **XSS**: React automatically escapes content; manual sanitization used for rich inputs.
-   **CSRF**: Handled by Next.js and SameSite cookies.

### Manual Testing Checklist
1.  **Auth**: Try logging in with wrong password (should lock after 5 attempts).
2.  **RBAC**: Login as Student, try accessing `/dashboard-admin` (should redirect).
3.  **Forms**: Submit forms rapidly to test rate limiting.

### Penetration Testing Notes
-   **Rate Limiting**: Verified working (return 429).
-   **Session Management**: Verified HTTP-Only cookies.
-   **Bot Protection**: Captcha and Honeypot active on public forms.
