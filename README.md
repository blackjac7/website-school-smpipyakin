# Website School SMP IP Yakin Jakarta

This is the official repository for the SMP IP Yakin Jakarta school website. It is built using [Next.js](https://nextjs.org), a React framework for production.

## Overview

The website serves as a comprehensive platform for the school, providing:
- **Public Information**: Information about the school, including vision & mission, history, facilities, extracurricular activities, and news.
- **PPDB (New Student Admission)**: Online registration system for new students.
- **Dashboards**: Role-based dashboards for Administrators, Student Affairs (Kesiswaan), OSIS, PPDB Officers, and Students.

## Getting Started

### Prerequisites

- Node.js (version 18 or later recommended)
- npm, yarn, pnpm, or bun

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/website-school-smpipyakin.git
    cd website-school-smpipyakin
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add the following variables (replace with your actual values):
    ```env
    JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
    NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows a standard Next.js App Router structure:

-   `src/app/`: Contains the application routes, pages, and layouts.
    -   `(dashboard)/`: Protected dashboard routes.
    -   `(public)/`: Publicly accessible routes.
    -   `api/`: API route handlers (e.g., authentication).
-   `src/components/`: Reusable React components organized by feature.
    -   `auth/`: Authentication components (Login form, Protected Route).
    -   `dashboard/`: Components specific to different dashboards.
    -   `home/`: Components used on the landing page.
    -   `shared/`: Shared components (Buttons, Modals, Loading indicators).
    -   ...and more.
-   `src/hooks/`: Custom React hooks (e.g., `useAuth`).
-   `src/utils/`: Utility functions (e.g., security, password hashing).
-   `public/`: Static assets like images and fonts.

## Authentication & Authorization

The application uses a custom JWT-based authentication system.
-   **Login**: Users log in via the `/login` page.
-   **Roles**: Supported roles are `admin`, `kesiswaan`, `osis`, `ppdb-officer`, and `siswa`.
-   **Protection**: Routes are protected using middleware (`src/middleware.ts`) and the `ProtectedRoute` component.

For more details on authentication, refer to `AUTH_DOCUMENTATION.md`.

## Key Features

-   **Responsive Design**: Built with Tailwind CSS for a mobile-first approach.
-   **Dynamic Content**: News, announcements, and events are dynamically rendered.
-   **Interactive Forms**: PPDB registration and contact forms with validation and rate limiting.
-   **Role-Based Access Control**: Ensures users only access appropriate sections of the application.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
