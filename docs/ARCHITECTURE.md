# Technical Architecture

## Overview

This project is a modern school management system built with Next.js 15, utilizing the App Router architecture. It features a hybrid rendering model (Server Components + Client Components) and a role-based access control (RBAC) system.

## Core Architecture

### 1. Framework & Routing

- **Next.js 15 (App Router):** The application uses the directory-based routing system in `src/app`.
  - `(public)`: Public pages (Homepage, News, Announcements, PPDB, Karya Siswa, Contact, Academic Calendar).
  - `(dashboard)`: Protected routes requiring authentication by role.
  - `api`: REST endpoints for authentication, PPDB (check/register/status/uploads), and cron/maintenance hooks.

### 2. Data Fetching & State

- **Server Actions:** Primary method for dashboard and public data mutations (admin/osis/student/ppdb/worship) in `src/actions/`, with `revalidatePath` for freshness.
- **Server Components:** Used for initial data fetch on dashboards and public pages to keep payloads small.
- **Hybrid Approach:** Client Components are used for interactive flows (forms, modals, charts) while data flows through Server Actions/props.

### 3. Authentication & Security

- **Custom Auth System:** Implemented via `/api/auth/login` using `jose` for JWT handling and `bcryptjs` for password hashing (12 rounds in seed data). Cookies are set via `JWT_CONFIG` (`auth-token`).
- **RBAC:** 5 distinct roles:
  - `ADMIN`: Full system access.
  - `KESISWAAN`: Student affairs management.
  - `SISWA`: Student portal access.
  - `OSIS`: Student council management (including OSIS-access students).
  - `PPDB_ADMIN`: Admission system management.
- **Security Measures:**
  - HttpOnly cookies with SameSite Strict in production + IP binding in JWT payloads.
  - Zod validation on Server Actions and API routes.
  - Honeypot fields & Math Captcha on forms.
  - Database-backed login attempt logging with IP/account rate limiting; in-memory limiter for PPDB register/upload.
  - Maintenance mode support with admin bypass and cron-driven schedule enforcement.

### 4. Database

- **Prisma ORM:** Type-safe database client.
- **Database:** PostgreSQL for all environments (configured via `DATABASE_URL` / `DIRECT_URL`).
- **Schema Highlights:** Users + role-specific profiles, PPDB applications (with retries & document URLs), news/announcements/hero slides/stats, facilities/extracurriculars/teachers, notifications, login attempts, site settings & maintenance schedules, worship modules (menstruation/adzan/carpet assignments), and student achievements/works.

## Key Modules

### Public Portal

- **CMS:** News, announcements, hero slides, stats, facilities, extracurriculars, and teacher profiles curated by Admin/OSIS.
- **PPDB (Admissions):** Public registration flow with Cloudinary/R2 uploads, retries for rejected applicants, and status tracking by NISN.
- **Karya Siswa & Calendar:** Public gallery and academic calendar data sourced from Server Actions.

### Dashboards

- **Student:** Profile management, achievements, works submissions, and notification center.
- **Admin:** User management, content modules, site settings/feature flags, maintenance schedules, and backups.
- **Kesiswaan:** Validation of student submissions and student affairs data.
- **OSIS:** Activity planning, news, and religious program management (menstruation/adzan/carpet schedules).
- **PPDB Admin:** Applicant review, status updates, and dashboard analytics.

## Legacy/Interop Endpoints

- **`src/app/api/auth`**: Central login/logout/verify endpoints used by the login page and middleware.
- **`src/app/api/ppdb`**: Public PPDB operations (check, register, status, uploads to Cloudinary/R2).
- **`src/app/api/cron`**: Cleanup of login logs and maintenance schedule enforcement (secured by `CRON_SECRET`).

## File Storage

- **Cloudinary:** General image hosting (news, profiles, hero) plus dedicated PPDB preset.
- **Cloudflare R2:** Private/secure document storage for PPDB (via AWS SDK v3).

---

### ERD (Entity-Relationship Diagram) ✅

A compact ERD is included for use in your thesis proposal (clean, focused view of the main domain entities and relations). Editable source files are added to `docs/diagrams/` in three formats: **Mermaid** (`erd.mmd`), **PlantUML** (`erd.puml`), and **Graphviz DOT** (`erd.dot`). Use the instructions in `docs/diagrams/README.md` to export PNG/SVG for inclusion in documents. The simplified ERD omits some auxiliary tables (notifications, worship schedules, maintenance/site settings) that are present in the Prisma schema.

You can embed the Mermaid directly below (renders where Mermaid is supported):

```mermaid
%% ERD (embedded)
%% For full source: docs/diagrams/erd.mmd

erDiagram
  USER {
    String id PK
    String username
    String email
    String role
    DateTime createdAt
  }

  SISWA {
    String id PK
    String userId FK
    String nisn
    String name
    String class
  }

  KESISWAAN {
    String id PK
    String userId FK
    String nip
    String name
  }

  NEWS {
    String id PK
    String title
    DateTime date
    String authorId FK
  }

  PPDBAPPLICATION {
    String id PK
    String name
    String nisn
    PPDBStatus status
  }

  STUDENT_ACHIEVEMENT {
    String id PK
    String siswaId FK
    String title
  }

  STUDENT_WORK {
    String id PK
    String siswaId FK
    String title
  }

  NOTIFICATION {
    String id PK
    String userId FK
    NotificationType type
    String title
    Boolean read
  }

  LOGIN_ATTEMPT {
    String id PK
    String ip
    String username
    Boolean success
  }

  SITE_SETTINGS {
    String id PK
    String key
    String value
  }

  MAINTENANCE_SCHEDULE {
    String id PK
    String title
    DateTime startTime
    DateTime endTime
  }

  SCHOOL_ACTIVITY {
    String id PK
    String title
    DateTime date
    String createdBy FK
  }

  OSIS_ACTIVITY {
    String id PK
    String title
    DateTime date
    String authorId FK
  }

  USER ||--o{ SISWA : "has profile"
  USER ||--o{ KESISWAAN : "has staff profile"
  USER ||--o{ NEWS : "authors"
  USER ||--o{ SCHOOL_ACTIVITY : "creates"
  USER ||--o{ OSIS_ACTIVITY : "authors"
  SISWA ||--o{ STUDENT_ACHIEVEMENT : "has"
  SISWA ||--o{ STUDENT_WORK : "has"
  USER ||--o{ NOTIFICATION : "receives"
  USER ||--o{ LOGIN_ATTEMPT : "has attempts"
  PPDBAPPLICATION ||--o{ "(documents)" : "stores docs (Cloudinary)"
```

Below are two additional diagrams useful for the thesis proposal and developer documentation.

### Runtime Flow (recommended for design & diagrams in the proposal) 🔁

This diagram shows the typical runtime interactions between the user's browser, the Next.js app (Server / Client components, Server Actions), and external services (Postgres via Prisma, Cloudinary, Cloudflare R2). See `docs/diagrams/runtime_flow.mmd` (Mermaid), `runtime_flow.puml` (PlantUML), and `runtime_flow.dot` (Graphviz) for editable sources and export instructions.

```mermaid
%% Runtime flow embedded
flowchart LR
  Browser[Browser (User)] --> EdgeLayer[Vercel / CDN]
  EdgeLayer --> App[Next.js App]
  App -->|Prisma| Postgres[(Postgres DB)]
  App --> Cloudinary[Cloudinary]
  App --> R2[Cloudflare R2]
```

### Deployment & Infrastructure (recommended for ops / security section) 🏗️

This diagram highlights how the app is deployed (Vercel), where secrets live (Vercel environment variables), and the external services that must be configured and secured (DB, Cloudinary, R2). Use `docs/diagrams/infra.mmd`, `infra.puml`, or `infra.dot` for editable sources.

```mermaid
%% Infra embedded (compact)
flowchart LR
  GitHub[GitHub (push)] --> Vercel[Vercel Platform]
  Vercel --> App[Next.js App]
  App --> Postgres[(Postgres DB)]
  App --> Cloudinary[Cloudinary]
  App --> R2[Cloudflare R2]
```

For full editable sources and export instructions, see `docs/diagrams/README.md`.

### Sequence Diagrams (Auth & PPDB) 🔁

Sequence diagrams for the **Login/Auth** flow and the **PPDB** upload-and-register flow are included in `docs/diagrams/` in Mermaid/PlantUML/DOT formats. Use these in your proposal to show step-by-step interactions (recommended for the methodology/implementation chapters).
