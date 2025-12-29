# Technical Documentation

## 1. Architecture Overview

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL (Prod/Staging), SQLite (Local)
- **ORM:** Prisma
- **Auth:** Custom JWT + Server Actions
- **State Management:** React Server Components + Hooks
- **Testing:** Playwright

### Directory Structure
```
src/
├── actions/          # Server Actions (Business Logic)
│   ├── admin/        # Admin-specific actions
│   ├── public/       # Public facing actions
│   ├── student/      # Student dashboard actions
│   ├── auth.ts       # Authentication logic
│   └── ...
├── app/              # Next.js App Router
│   ├── (dashboard)/  # Protected routes
│   ├── (public)/     # Public routes
│   └── api/          # Route Handlers (Cron, Webhooks)
├── components/       # React Components
├── lib/              # Shared Utilities
├── types/            # TypeScript Definitions
└── ...
```

## 2. Data Flow

### Server Components
- Fetch data directly from the database using Prisma.
- Pass serialized data to Client Components.
- Handle SEO and initial page load performance.

### Client Components
- Handle user interaction (forms, filters, UI state).
- Invoke Server Actions for mutations (Create, Update, Delete).
- Use `useActionState` (Next.js 15) for managing action states.

### Server Actions
- Located in `src/actions/`.
- Validated using Zod schemas.
- Execute business logic and database operations.
- Return typed responses `{ success: boolean, message?: string, errors?: ... }`.
- Handle revalidation (`revalidatePath`) and redirection.

## 3. Security

### Authentication
- **Mechanism:** JWT in HTTP-only, Secure cookies.
- **Entry Point:** `src/actions/auth.ts`.
- **Validation:** Middleware + Per-Action checks using `getAuthenticatedUser`.

### Role-Based Access Control (RBAC)
- Roles: `ADMIN`, `KESISWAAN`, `SISWA`, `OSIS`, `PPDB_OFFICER`.
- Enforced in Middleware (`middleware.ts`) for route protection.
- Enforced in Server Actions for data protection.

## 4. Third-Party Services

- **Cloudinary:** Image storage and optimization (configured via `src/lib/cloudinary.ts`).
- **Cloudflare R2:** File storage for documents and backups.
- **EmailJS:** Transactional emails (notifications).
- **Flowise:** AI Chatbot integration.
- **Sentry:** Error tracking and performance monitoring.

## 5. Deployment

Detailed deployment steps are available in [DEPLOYMENT.md](./DEPLOYMENT.md).

### Environments
- **Local:** SQLite, Local Files.
- **Staging:** Aiven Postgres, Vercel.
- **Production:** VPS Postgres, Vercel.

## 6. Server Actions Reference

Instead of REST API endpoints, this project primarily uses Server Actions.

### Authentication (`src/actions/auth.ts`)
- `loginAction`: Handles user login.
- `logoutAction`: Handles user logout.

### PPDB (`src/actions/public/ppdb.ts` & `src/actions/ppdb.ts`)
- `registerPPDB`: Submits a new student application.
- `checkNISN`: Verifies student status.
- `uploadPaymentProof`: Handles payment evidence uploads.

### Common Patterns
All actions follow a standard response format:
```typescript
type ActionResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};
```
