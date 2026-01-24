# 🏗️ Technical Architecture

## 📑 Table of Contents

1. [Overview](#overview)
2. [System Architecture Diagram](#system-architecture-diagram)
3. [Core Architecture](#core-architecture)
4. [Data Flow Architecture](#data-flow-architecture)
5. [Database Architecture](#database-architecture)
6. [Security Architecture](#security-architecture)
7. [Key Modules](#key-modules)
8. [External Services Integration](#external-services-integration)
9. [Deployment Architecture](#deployment-architecture)

---

## Overview

SMP IP Yakin adalah sistem manajemen sekolah modern yang dibangun dengan **Next.js 15 App Router**, menggunakan arsitektur hybrid rendering (Server Components + Client Components) dan sistem Role-Based Access Control (RBAC) untuk 5 role berbeda.

### 🎯 Design Principles

| Principle                  | Implementation                           |
| -------------------------- | ---------------------------------------- |
| **Server-First Rendering** | React Server Components sebagai default  |
| **Type Safety**            | TypeScript strict mode + Zod validation  |
| **Security by Design**     | JWT + IP binding, rate limiting, CAPTCHA |
| **Single Source of Truth** | PostgreSQL dengan Prisma ORM             |
| **Modular Architecture**   | Feature-based directory structure        |

---

## System Architecture Diagram

### High-Level Architecture

```mermaid
graph TB
    subgraph Client["🌐 Client Layer"]
        Browser[Web Browser]
        PWA[PWA Client]
    end

    subgraph Edge["⚡ Edge Layer - Vercel"]
        CDN[CDN Cache]
        Middleware[Next.js Middleware]
    end

    subgraph Application["🔧 Application Layer"]
        subgraph NextJS["Next.js 15 App Router"]
            RSC[React Server Components]
            RCC[React Client Components]
            ServerActions[Server Actions]
            APIRoutes[API Routes]
        end
    end

    subgraph Business["📊 Business Logic Layer"]
        Auth[Authentication Module]
        RBAC[RBAC Authorization]
        RateLimiter[Rate Limiter]
        Validation[Zod Validation]
    end

    subgraph Data["💾 Data Layer"]
        Prisma[Prisma ORM]
        PG[(PostgreSQL 15+)]
    end

    subgraph External["☁️ External Services"]
        Cloudinary[Cloudinary CDN]
        R2[Cloudflare R2]
        EmailJS[EmailJS]
        Flowise[Flowise AI]
    end

    Browser --> CDN
    PWA --> CDN
    CDN --> Middleware
    Middleware --> RSC
    Middleware --> RCC
    RSC --> ServerActions
    RCC --> APIRoutes
    ServerActions --> Auth
    APIRoutes --> Auth
    Auth --> RBAC
    Auth --> RateLimiter
    RBAC --> Validation
    Validation --> Prisma
    Prisma --> PG
    ServerActions --> Cloudinary
    ServerActions --> R2
    Browser --> EmailJS
    Browser --> Flowise

    style PG fill:#336791,color:#fff
    style Cloudinary fill:#3448C5,color:#fff
    style R2 fill:#F38020,color:#fff
```

### Component Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Middleware
    participant RSC as Server Component
    participant SA as Server Action
    participant P as Prisma
    participant DB as PostgreSQL

    U->>M: HTTP Request
    M->>M: Check Auth Cookie
    alt Authenticated
        M->>RSC: Forward Request
        RSC->>P: Fetch Data
        P->>DB: SQL Query
        DB-->>P: Result Set
        P-->>RSC: Typed Data
        RSC-->>U: Rendered HTML
    else Not Authenticated
        M-->>U: Redirect to /login
    end

    Note over U,SA: User Action (Form Submit)
    U->>SA: Invoke Server Action
    SA->>SA: Zod Validation
    SA->>P: Prisma Mutation
    P->>DB: INSERT/UPDATE
    DB-->>P: Confirmation
    P-->>SA: Result
    SA->>SA: revalidatePath()
    SA-->>U: Success Response
```

---

## Core Architecture

### 1. Framework & Routing

```mermaid
graph LR
    subgraph AppRouter["📁 src/app/"]
        Public["(public)/<br/>10+ Public Pages"]
        Dashboard["(dashboard)/<br/>5 Role Dashboards"]
        API["api/<br/>REST Endpoints"]
        Special["maintenance/<br/>not-found/<br/>unauthorized/"]
    end

    subgraph Routes["Route Types"]
        Static[Static Routes]
        Dynamic[Dynamic Routes]
        Catch[Catch-all Routes]
    end

    Public --> Static
    Dashboard --> Dynamic
    API --> Dynamic
```

**Route Groups:**

| Group         | Path                        | Description                | Auth Required |
| ------------- | --------------------------- | -------------------------- | ------------- |
| `(public)`    | `/`, `/news`, `/ppdb`, etc. | Public pages               | ❌            |
| `(dashboard)` | `/dashboard-*`              | Protected dashboard routes | ✅            |
| `api`         | `/api/*`                    | REST endpoints             | Varies        |

**Public Pages (10+):**

- Homepage, News (list + detail), Announcements
- PPDB (registration, status check, info)
- Karya Siswa, Facilities, Extracurricular
- Academic Calendar, Contact, Profile
- Login page

**Protected Dashboards (5):**

- `/dashboard-admin` - Full system administration
- `/dashboard-kesiswaan` - Student affairs management
- `/dashboard-siswa` - Student portal
- `/dashboard-osis` - Student council management
- `/dashboard-ppdb` - Admissions management

### 2. Data Fetching & State Architecture

```mermaid
flowchart TB
    subgraph Client["Client Components"]
        Form[Forms & Modals]
        Interactive[Interactive UI]
        Charts[Charts & Animations]
    end

    subgraph Server["Server Components"]
        Page[Page Components]
        Layout[Layouts]
        DataFetch[Data Fetching]
    end

    subgraph Actions["Server Actions"]
        Create[Create Actions]
        Update[Update Actions]
        Delete[Delete Actions]
    end

    subgraph Cache["Cache Layer"]
        Revalidate[revalidatePath]
        Tags[Cache Tags]
    end

    Page --> DataFetch
    DataFetch --> Prisma[(Prisma)]
    Form --> Actions
    Actions --> Prisma
    Actions --> Revalidate
    Interactive --> |Props| Server
```

| Pattern               | Use Case                           | Location                  |
| --------------------- | ---------------------------------- | ------------------------- |
| **Server Components** | Initial data fetch, static content | Page components, layouts  |
| **Server Actions**    | Data mutations (CRUD)              | `src/actions/**/*.ts`     |
| **Client Components** | Interactive UI, forms, charts      | `"use client"` components |
| **revalidatePath**    | Cache invalidation after mutations | Inside Server Actions     |

### 3. Authentication & Security Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant API as /api/auth/login
    participant RL as Rate Limiter
    participant DB as PostgreSQL
    participant JWT as Jose JWT

    C->>API: POST {username, password, role}
    API->>RL: Check IP Rate Limit
    alt Rate Limited
        RL-->>C: 429 Too Many Requests
    end
    API->>RL: Check Account Rate Limit
    alt Account Locked
        RL-->>C: 423 Account Locked
    end
    API->>DB: Find User by username
    API->>API: bcrypt.compare(password)
    API->>DB: Log LoginAttempt
    alt Success
        API->>JWT: Sign Token (userId, role, IP, permissions)
        API->>C: Set-Cookie: auth-token (HttpOnly)
        API-->>C: {success: true, user: {...}}
    else Failed
        API-->>C: {error: "Invalid credentials"}
    end
```

**RBAC (Role-Based Access Control):**

```mermaid
graph TB
    subgraph Roles["5 User Roles"]
        Admin[ADMIN<br/>Full Access]
        Kesiswaan[KESISWAAN<br/>Student Affairs]
        OSIS[OSIS<br/>Council]
        Siswa[SISWA<br/>Student]
        PPDB[PPDB_ADMIN<br/>Admissions]
    end

    subgraph Special["🔑 Special Access"]
        OsisAccess[SISWA + osisAccess=true<br/>Can access OSIS features]
    end

    subgraph Permissions["Permission Types"]
        Read[read]
        Write[write]
        Delete[delete]
        ManageUsers[manage_users]
        ViewReports[view_reports]
    end

    Admin --> Read & Write & Delete & ManageUsers & ViewReports
    Kesiswaan --> Read & Write & ViewReports
    OSIS --> Read & Write
    Siswa --> Read & Write
    PPDB --> Read & Write & ViewReports
    OsisAccess -.->|Same as OSIS| Read & Write

    style OsisAccess fill:#8b5cf6,color:#fff
```

> **Note:** Siswa dengan `osisAccess=true` di database dapat mengakses dashboard dan fitur OSIS melalui login dengan role OSIS. Ini memungkinkan anggota OSIS yang merupakan siswa aktif untuk mengelola program kerja dan berita OSIS.

**Security Measures:**

| Layer               | Implementation                    | Purpose                      |
| ------------------- | --------------------------------- | ---------------------------- |
| **Cookies**         | HttpOnly, SameSite=Strict, Secure | XSS & CSRF protection        |
| **JWT Payload**     | IP binding                        | Session hijacking prevention |
| **Rate Limiting**   | 5/15min IP, 10/24h account        | Brute force protection       |
| **Password**        | bcrypt 12 rounds                  | Password security            |
| **Validation**      | Zod schemas                       | Input sanitization           |
| **CAPTCHA**         | Math CAPTCHA + Honeypot           | Bot protection               |
| **Server Actions**  | Per-action role verification      | Defense-in-depth             |

### 4. Database Architecture

```mermaid
erDiagram
    User ||--o{ Siswa : "has profile"
    User ||--o{ Kesiswaan : "has profile"
    User ||--o{ News : "authors"
    User ||--o{ Notification : "receives"
    User ||--o{ SchoolActivity : "creates"
    User ||--o{ OsisActivity : "authors"

    Siswa ||--o{ StudentAchievement : "has"
    Siswa ||--o{ StudentWork : "has"
    Siswa ||--o{ WorshipMenstruationRecord : "logs"
    Siswa ||--o{ WorshipAdzanSchedule : "assigned"
    Siswa ||--o{ WorshipCarpetAssignment : "assigned"

    WorshipCarpetSchedule ||--o{ WorshipCarpetAssignment : "has"

    User {
        String id PK
        String username UK
        String email UK
        String password
        UserRole role
        DateTime createdAt
        DateTime updatedAt
    }

    Siswa {
        String id PK
        String userId FK
        String nisn UK
        String name
        Boolean osisAccess
        GenderType gender
    }

    PPDBApplication {
        String id PK
        String nisn UK
        String name
        PPDBStatus status
        Int retries
        String ijazahUrl
        String aktaKelahiranUrl
    }

    LoginAttempt {
        String id PK
        String ip
        String username
        Boolean success
        DateTime createdAt
    }
```

**25+ Database Models:**

| Category           | Models                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| **Auth & Users**   | User, Siswa, Kesiswaan                                                                          |
| **PPDB**           | PPDBApplication                                                                                 |
| **Content**        | News, Announcement, HeroSlide, SchoolStat                                                       |
| **Activities**     | SchoolActivity, OsisActivity                                                                    |
| **Student Output** | StudentAchievement, StudentWork                                                                 |
| **Facilities**     | Facility, Extracurricular, Teacher                                                              |
| **Notifications**  | Notification                                                                                    |
| **Security**       | LoginAttempt                                                                                    |
| **Religious**      | WorshipMenstruationRecord, WorshipAdzanSchedule, WorshipCarpetSchedule, WorshipCarpetAssignment |
| **Settings**       | SiteSettings, MaintenanceSchedule                                                               |

**14 Enums:**
UserRole, GenderType, PPDBStatus, StatusApproval, PriorityLevel, WorkType, BeritaKategori, SemesterType, NotificationType, TeacherCategory, PrayerTime, TaskStatus, CarpetZone, SettingType

---

## Key Modules

### 📱 Public Portal

```mermaid
flowchart LR
    subgraph Public["Public Pages"]
        Home[Homepage]
        News[News & Detail]
        PPDB[PPDB Registration]
        Karya[Karya Siswa]
        Calendar[Academic Calendar]
        Contact[Contact Form]
    end

    subgraph Features["Features"]
        Hero[Hero Slider]
        Stats[School Stats]
        Facilities[Facilities Gallery]
        Ekstrakurikuler[Extracurricular]
        Teachers[Teacher Profiles]
    end

    Home --> Hero & Stats
    News --> |Server Action| DB[(Database)]
    PPDB --> |API Route| Upload[Cloudinary/R2]
    Contact --> EmailJS[EmailJS]
```

| Module                 | Data Source                          | Features                                    |
| ---------------------- | ------------------------------------ | ------------------------------------------- |
| **Homepage**           | Hero slides, stats, featured content | Dynamic CMS content                         |
| **News/Announcements** | Server Actions                       | Category filtering, pagination              |
| **PPDB**               | API Routes + Server Actions          | Registration, status check, document upload |
| **Karya Siswa**        | Server Actions                       | Approved student works gallery              |
| **Contact**            | EmailJS (client-side)                | Math CAPTCHA, honeypot                      |

### 👥 Dashboard Modules

```mermaid
graph TB
    subgraph Admin["Admin Dashboard"]
        Users[User Management]
        Content[Content CMS]
        Settings[Site Settings]
        Maintenance[Maintenance Mode]
        Backup[Data Backup]
    end

    subgraph Kesiswaan["Kesiswaan Dashboard"]
        StudentValidation[Student Work Validation]
        AchievementReview[Achievement Review]
        StudentAffairs[Student Affairs]
        WorshipManage[Worship Management]
    end

    subgraph OSIS["OSIS Dashboard"]
        Activities[Activity Planning]
        OSISNews[News Management]
        ReligiousProgram[Religious Programs]
    end

    subgraph Siswa["Student Dashboard"]
        Profile[Profile Management]
        Works[Submit Works]
        Achievements[Submit Achievements]
        Notifications[Notifications]
    end

    subgraph PPDB["PPDB Dashboard"]
        Applications[Application Review]
        StatusUpdate[Status Updates]
        Analytics[Dashboard Analytics]
    end
```

### 🔗 External Services Integration

```mermaid
graph LR
    subgraph App["Next.js Application"]
        Upload[Upload Handler]
        Email[Contact Handler]
        Chat[Chatbot Component]
    end

    subgraph Storage["Storage Services"]
        Cloudinary[Cloudinary<br/>Images]
        R2[Cloudflare R2<br/>Documents]
    end

    subgraph Communication["Communication"]
        EmailJS[EmailJS<br/>Contact Form]
        Flowise[Flowise AI<br/>Chatbot]
    end

    Upload --> |next-cloudinary| Cloudinary
    Upload --> |AWS SDK v3| R2
    Email --> |Client SDK| EmailJS
    Chat --> |Embed React| Flowise
```

| Service           | SDK/Integration                 | Use Cases                                                                  |
| ----------------- | ------------------------------- | -------------------------------------------------------------------------- |
| **Cloudinary**    | `next-cloudinary`, `cloudinary` | News images, hero slides, profile photos, PPDB uploads                     |
| **Cloudflare R2** | `@aws-sdk/client-s3`            | PPDB documents (ijazah, akta, KK, pas foto)                                |
| **EmailJS**       | `@emailjs/browser`              | Contact form email delivery                                                |
| **Flowise**       | `flowise-embed-react`           | AI chatbot assistant (RAG-based, lihat [CHATBOT_RAG.md](./CHATBOT_RAG.md)) |

---

## Deployment Architecture

```mermaid
flowchart LR
    subgraph Dev["Development"]
        Local[Local Machine]
        DevDB[(Local PostgreSQL)]
    end

    subgraph CI["GitHub Actions"]
        Lint[Lint & TypeCheck]
        Test[Playwright Tests]
        Build[Build Check]
    end

    subgraph Staging["Staging Environment"]
        VercelPreview[Vercel Preview]
        StagingDB[(Managed PostgreSQL<br/>Neon/Aiven)]
    end

    subgraph Production["Production Environment"]
        VercelProd[Vercel Production]
        ProdDB[(VPS PostgreSQL)]
    end

    Local --> |git push| CI
    CI --> |develop branch| Staging
    CI --> |main branch| Production
    VercelPreview --> StagingDB
    VercelProd --> ProdDB

    style Production fill:#10b981,color:#fff
    style Staging fill:#3b82f6,color:#fff
```

### Environment Configuration

| Environment | Database                   | SSL Mode            | Branch     |
| ----------- | -------------------------- | ------------------- | ---------- |
| Development | Local PostgreSQL           | Optional (`prefer`) | feature/\* |
| Staging     | Managed Cloud (Neon/Aiven) | `require`           | develop    |
| Production  | VPS PostgreSQL             | `prefer`            | main       |

---

## 📊 Legacy/Interop Endpoints

API Routes yang masih digunakan untuk kompatibilitas:

| Endpoint                      | Method | Purpose                          |
| ----------------------------- | ------ | -------------------------------- |
| `/api/auth/login`             | POST   | Login authentication             |
| `/api/auth/logout`            | POST   | Session termination              |
| `/api/auth/verify`            | GET    | Session validation               |
| `/api/ppdb/check-nisn`        | GET    | NISN availability check          |
| `/api/ppdb/register`          | POST   | PPDB registration                |
| `/api/ppdb/status`            | GET    | Application status               |
| `/api/ppdb/upload`            | POST   | Cloudinary upload                |
| `/api/ppdb/upload-r2`         | POST   | R2 document upload               |
| `/api/cron/cleanup-logs`      | GET    | Login log cleanup (30 days)      |
| `/api/cron/maintenance-check` | POST   | Maintenance schedule enforcement |

---

## 📈 Performance Best Practices

| Practice                      | Implementation                          |
| ----------------------------- | --------------------------------------- |
| **Server Components Default** | Mengurangi bundle size client           |
| **Streaming SSR**             | Progressive page loading                |
| **Image Optimization**        | Cloudinary transformations + next/image |
| **Code Splitting**            | Dynamic imports untuk heavy components  |
| **Cache Strategy**            | revalidatePath untuk data freshness     |
| **PWA**                       | next-pwa untuk offline capability       |

---

## 📚 Related Documentation

| Document                                       | Description                     |
| ---------------------------------------------- | ------------------------------- |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Detailed directory structure    |
| [TECH_STACK.md](./TECH_STACK.md)               | Complete technology list        |
| [SECURITY.md](./SECURITY.md)                   | Security implementation details |
| [DEPLOYMENT.md](./DEPLOYMENT.md)               | CI/CD and deployment guide      |
| [TESTING.md](./TESTING.md)                     | Testing strategy and setup      |
| [diagrams/README.md](./diagrams/README.md)     | All system diagrams             |

---

_Last Updated: January 2026_
