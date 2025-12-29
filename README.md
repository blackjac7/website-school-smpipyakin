# SMP IP YAKIN - Modern School System

A comprehensive school management system built with Next.js 15, Prisma, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS v4.
- **Role-Based Access Control**: Secure dashboards for Admin, Students, OSIS, Kesiswaan, and PPDB Officers.
- **Server Actions**: Fully typed, secure server-side logic replacing legacy API routes.
- **Database**: PostgreSQL (Production/Staging) and SQLite (Local Development).
- **Authentication**: Custom JWT-based auth with secure cookies and role management.
- **Performance**: Optimized images, Lottie animations, and dynamic caching strategies.
- **Monitoring**: Integrated with Sentry and Vercel Speed Insights.

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd school-website
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy `.env.example` to `.env` and configure your local variables.
    ```bash
    cp .env.example .env
    ```
    *Note: For local development, `DATABASE_URL` defaults to a local SQLite file.*

4.  **Database Setup**
    Initialize the database and seed it with initial data.
    ```bash
    npm run db:reset
    ```
    *This command runs migrations and seeds the database.*

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture Overview

### Key Directories

- `src/app`: App Router pages and layouts.
- `src/actions`: Server Actions for business logic (Auth, PPDB, Admin, etc.).
- `src/components`: Reusable UI components.
- `src/lib`: Utilities, Prisma client, and configuration.
- `prisma`: Database schema and seed scripts.
- `docs`: Detailed documentation.

### Authentication

The system uses a custom authentication flow powered by Server Actions (`src/actions/auth.ts`). Users are authenticated via secure HTTP-only cookies containing JWTs.

### Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions for Local, Staging (Aiven), and Production (VPS) environments.

## 🧪 Testing

Run the critical path tests using Playwright:

```bash
npm run test:critical
```

See [docs/TESTING.md](docs/TESTING.md) for more details.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

Proprietary Software. All Rights Reserved.
