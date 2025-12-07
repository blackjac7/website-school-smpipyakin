# SMP IP Yakin Website

A modern, secure, and comprehensive school management system built for SMP IP Yakin. This project leverages the latest web technologies to provide a seamless experience for students, teachers, administrators, and the public.

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: Custom JWT (Jose) + HttpOnly Cookies
- **Storage**: Cloudinary
- **Email**: EmailJS

## ✨ Key Features

- **Role-Based Dashboards**: Dedicated areas for Admin, Kesiswaan, OSIS, PPDB, and Students.
- **Secure Authentication**: Robust login system with database-backed rate limiting and IP binding.
- **PPDB System**: Digital student admission process with document management.
- **Anti-Bot Security**: Integrated Math Captcha, Honeypot fields, and intelligent rate limiting.
- **Responsive Design**: Mobile-first architecture ensuring accessibility on all devices.

## 📚 Documentation

For detailed technical information, including setup instructions, security architecture, and database schema, please refer to the **[Technical Documentation](TECHNICAL_DOCS.md)**.

## 🛠️ Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Environment**:
    Copy `.env.example` to `.env` and fill in the required credentials (Database, Cloudinary, etc.).
4.  **Initialize Database**:
    ```bash
    npm run db:generate
    npm run db:migrate
    npm run db:seed
    ```
5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🔐 Default Accounts (Development)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Student | `siswa001` | `admin123` |

*Refer to `TECHNICAL_DOCS.md` for the full list of default accounts.*

## 📄 License

Private - SMP IP Yakin
