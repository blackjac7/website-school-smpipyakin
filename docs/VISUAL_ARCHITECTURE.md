# Visual Project Architecture

## 1. Infrastructure Overview
This diagram illustrates how the Next.js application connects to different environments (Staging vs. Production) and external services.

```mermaid
graph TD
    subgraph Client ["Client Side"]
        UserBrowser["User Browser"]
    end

    subgraph Frontend ["Frontend Hosting (Vercel)"]
        NextJS["Next.js 15 (App Router)"]
        ServerActions["Server Actions"]
        APIRoutes["Legacy API Routes"]
    end

    subgraph Database_Prod ["Production Database (VPS)"]
        PostgresProd[("PostgreSQL 15 (VPS)\n2 Core, 2GB RAM")]
    end

    subgraph Database_Staging ["Staging Database (Aiven)"]
        PostgresStaging[("PostgreSQL (Aiven Cloud)\nManaged Service")]
    end

    subgraph External_Services ["External Services"]
        Cloudinary["Cloudinary\n(Images)"]
        R2["Cloudflare R2\n(Private Files / PPDB)"]
        EmailJS["EmailJS\n(Notifications)"]
    end

    %% Connections
    UserBrowser -->|HTTPS| NextJS
    NextJS -->|Read/Write| ServerActions

    %% Environment Logic
    ServerActions -->|If PROD| PostgresProd
    ServerActions -->|If STAGING| PostgresStaging

    %% Service Integrations
    ServerActions -->|Upload| Cloudinary
    ServerActions -->|Upload| R2
    UserBrowser -->|Client-side Send| EmailJS
```

## 2. Database Environment Matrix
The following table outlines the configuration differences between your environments.

| Feature | Development (Local) | Staging (Aiven) | Production (VPS) |
| :--- | :--- | :--- | :--- |
| **Database Engine** | SQLite (`file:./dev.db`) | PostgreSQL 16 | PostgreSQL 15 |
| **Connection Mode** | Direct File Access | Transaction Mode | Session Mode |
| **SSL Mode** | N/A | `sslmode=require` | `sslmode=prefer` |
| **Connection String** | `file:./dev.db` | `postgres://user:pass@aiven-host:port/db?sslmode=require` | `postgresql://user:pass@vps-ip:5432/db` |
| **Purpose** | Rapid Prototyping | Integration Testing | Live Traffic |

## 3. Application Data Flow
This sequence diagram shows how a typical request (e.g., Submitting a Form) travels through the system layers.

```mermaid
sequenceDiagram
    participant User as User
    participant Middleware as Middleware (Auth)
    participant Client as Client Component
    participant Server as Server Action
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL (VPS/Aiven)

    User->>Client: Fills Form & Clicks Submit
    Client->>Client: Validate Inputs (Zod/Regex)
    Client->>Server: Invoke Server Action (FormData)

    Note over Middleware: Verify Session Cookie (JWT)

    Server->>Server: Server-side Validation (Zod)
    Server->>Server: Check RBAC Permissions

    Server->>Prisma: prisma.model.create()
    Prisma->>DB: INSERT INTO table...
    DB-->>Prisma: Return Record
    Prisma-->>Server: Return Data Object

    Server-->>Client: { success: true, data: ... }
    Client->>User: Show Success Toast / Redirect
```

## 4. Simplified Entity Relationship Diagram (ERD)
A high-level view of the core data models defined in `prisma/schema.prisma`.

```mermaid
erDiagram
    User ||--o{ Siswa : "has profile"
    User ||--o{ Kesiswaan : "has profile"
    User ||--o{ News : "authors"
    User ||--o{ SchoolActivity : "creates"

    User {
        string id PK
        string username
        string role "Enum: ADMIN, SISWA, etc"
    }

    Siswa {
        string id PK
        string nisn
        string name
        boolean osisAccess "Flag for OSIS Privileges"
    }

    Kesiswaan {
        string id PK
        string nip
        string name
    }

    News {
        string id PK
        string title
        string statusPersetujuan "APPROVED/PENDING"
    }

    PPDBApplication {
        string id PK
        string nisn
        string status "PENDING/ACCEPTED/REJECTED"
        string ijazahUrl "R2 Link"
    }

    Siswa ||--o{ StudentAchievement : "earns"
    Siswa ||--o{ StudentWork : "creates"
```

## 5. Role & Permission Matrix
Understanding what each role can do within the system.

| Feature / Module | SISWA (Student) | OSIS (Council) | KESISWAAN (Staff) | ADMIN | PPDB ADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Login Access** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View News/Events** | ✅ | ✅ | ✅ | ✅ | N/A |
| **Create News** | ❌ | ✅ (Pending) | ✅ (Direct) | ✅ | ❌ |
| **Validate Works** | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Manage Users** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **PPDB Access** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Upload Works** | ✅ | ✅ | N/A | N/A | N/A |
