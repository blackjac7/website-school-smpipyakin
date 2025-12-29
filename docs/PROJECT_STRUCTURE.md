# Project Directory Structure

## Root
- `src/`: Source code
- `prisma/`: Database schema and migrations
- `public/`: Static assets (images, animations)
- `docs/`: Project documentation
- `tests/`: End-to-end tests (Playwright)

## Source (`src/`)

### `app/`
The Next.js App Router directory.
- `(public)/`: Publicly accessible routes (Home, News, Login).
- `(dashboard)/`: Protected dashboard routes wrapped in authentication checks.
  - `dashboard-admin/`: Administrator portal.
  - `dashboard-siswa/`: Student portal.
  - `dashboard-guru/`: Teacher portal.
  - `dashboard-ppdb/`: Admissions officer portal.
- `api/`: Legacy API routes (Auth, PPDB) and Cron jobs.

### `actions/`
Server Actions for data mutation and fetching.
- `admin/`: Actions for admin dashboard features.
- `public/`: Actions for public pages.
- `student/`: Actions for student dashboard.
- `auth.ts`: Authentication logic.

### `components/`
React components organized by feature.
- `common/`: Reusable UI atoms (Buttons, Inputs).
- `layout/`: Global layout components (Navbar, Footer, Sidebar).
- `dashboard/`: Dashboard-specific components.
- `home/`: Homepage sections.
- `shared/`: Components used across public and dashboard scopes.

### `lib/`
Utility functions and configuration.
- `prisma.ts`: Database client instance.
- `utils.ts`: Helper functions (Tailwind merge, formatting).
- `auth.ts`: Auth helpers.
- `data/`: Static data fallbacks and type definitions.

### `hooks/`
Custom React hooks.
- `useAuth.ts`: Authentication state hook.
- `useSidebar.ts`: Sidebar state management.
