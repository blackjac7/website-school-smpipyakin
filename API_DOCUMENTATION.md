# API & Server Actions Documentation

This document outlines the primary data interaction points within the application. Note that as a Next.js App Router project, most logic is handled via **Server Actions** rather than traditional REST API endpoints.

## Server Actions

Server Actions are asynchronous functions that run on the server, callable directly from Client Components.

### Authentication (`src/actions/auth.ts`)

| Action | Description | Input | Returns |
|--------|-------------|-------|---------|
| `loginAction` | Authenticates a user. | `LoginSchema` (username, password, role) | `ActionResponse` |
| `logoutAction` | Clears the session cookie. | None | `ActionResponse` |

### Public PPDB (`src/actions/public/ppdb.ts`)

| Action | Description | Input | Returns |
|--------|-------------|-------|---------|
| `registerPPDB` | Submits a new PPDB application. | `PPDBRegistrationSchema` | `ActionResponse` |
| `checkNISN` | Checks if a NISN is already registered. | `nisn: string` | `ActionResponse` |

### Student Dashboard (`src/actions/student/`)

| Action | Description | Scope |
|--------|-------------|-------|
| `createAchievement` | Submits a new achievement. | Student |
| `createWork` | Submits a new student work. | Student |

## Route Handlers

A limited number of Route Handlers exist for specific use cases like Cron jobs or webhooks.

### Cron Jobs (`src/app/api/cron/`)

| Endpoint | Method | Description | Security |
|----------|--------|-------------|----------|
| `/api/cron` | GET | Triggers scheduled tasks. | `Authorization: Bearer <CRON_SECRET>` |

## Data Models

Refer to `prisma/schema.prisma` for the authoritative database schema definitions.
