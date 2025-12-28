# SMP IP Yakin Website - Development Guidelines

This document provides guidelines and instructions for internal development and contribution to the SMP IP Yakin Website project.
Access to this repository is restricted to authorized personnel and development team members.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## 📜 Professional Conduct

This project follows a professional code of conduct applicable to all staff and developers. Please be respectful and constructive in all interactions.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git

### Setup Development Environment

```bash
# Clone the repository (Authorized Access Required)
git clone https://github.com/your-repo/website-school-smpipyakin.git
cd website-school-smpipyakin

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Configure your .env file

# Setup database
npm run db:generate
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

---

## 🔄 Development Workflow

### Branch Naming Convention

| Type          | Pattern                | Example                      |
| ------------- | ---------------------- | ---------------------------- |
| Feature       | `feature/description`  | `feature/add-student-report` |
| Bug Fix       | `fix/description`      | `fix/login-rate-limit`       |
| Hotfix        | `hotfix/description`   | `hotfix/security-patch`      |
| Refactor      | `refactor/description` | `refactor/auth-module`       |
| Documentation | `docs/description`     | `docs/update-readme`         |

### Workflow Steps

1. **Create a branch** from `main`
2. **Make changes** with meaningful commits
3. **Test thoroughly** before pushing
4. **Open a Pull Request** with a clear description
5. **Address review feedback**
6. **Merge** after approval

---

## 📝 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Use explicit types
interface User {
  id: string;
  username: string;
  role: UserRole;
}

// ✅ Good: Use const for immutable values
const MAX_LOGIN_ATTEMPTS = 5;

// ✅ Good: Use async/await for async operations
async function fetchUser(id: string): Promise<User | null> {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// ❌ Bad: Avoid any type
function processData(data: any) { ... }

// ❌ Bad: Avoid magic numbers
if (attempts > 5) { ... }
```

### React/Next.js Guidelines

```tsx
// ✅ Good: Use functional components with proper typing
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {label}
    </button>
  );
}

// ✅ Good: Use Server Components by default
// Only use 'use client' when necessary

// ✅ Good: Use Server Actions for mutations
("use server");
export async function createPost(data: FormData) {
  // Server-side logic
}
```

### File Naming Conventions

| Type             | Convention | Example             |
| ---------------- | ---------- | ------------------- |
| Components       | PascalCase | `UserProfile.tsx`   |
| Utilities        | camelCase  | `dateFormat.ts`     |
| Server Actions   | camelCase  | `users.ts`          |
| Types/Interfaces | PascalCase | `types.ts`          |
| CSS Modules      | camelCase  | `button.module.css` |

### Directory Structure

```
src/
├── actions/          # Server Actions (grouped by domain)
├── app/              # Next.js App Router
├── components/       # React Components (grouped by feature)
├── hooks/            # Custom React Hooks
├── lib/              # External library configurations
├── shared/           # Shared types and data
└── utils/            # Utility functions
```

---

## 💬 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                           |
| ---------- | ------------------------------------- |
| `feat`     | New feature                           |
| `fix`      | Bug fix                               |
| `docs`     | Documentation changes                 |
| `style`    | Code style changes (formatting, etc.) |
| `refactor` | Code refactoring                      |
| `perf`     | Performance improvements              |
| `test`     | Adding or updating tests              |
| `chore`    | Maintenance tasks                     |
| `security` | Security improvements                 |

### Examples

```bash
# Feature
git commit -m "feat(auth): add remember me functionality"

# Bug fix
git commit -m "fix(ppdb): resolve file upload validation error"

# Documentation
git commit -m "docs: update API documentation"

# Security
git commit -m "security(auth): implement IP-based rate limiting"
```

---

## 🔀 Pull Request Process

### Before Opening a PR

- [ ] Code follows the project's coding standards
- [ ] All tests pass locally
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation is updated if needed

### PR Template

```markdown
## Description

Brief description of the changes.

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How has this been tested?

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. At least one approval required
2. All CI checks must pass
3. No unresolved comments
4. Branch is up to date with `main`

---

## 🏗 Project Structure

### Key Directories

| Directory         | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `prisma/`         | Database schema and migrations              |
| `public/`         | Static assets                               |
| `src/actions/`    | Server Actions for data mutations           |
| `src/app/`        | Next.js pages and API routes                |
| `src/components/` | Reusable React components                   |
| `src/hooks/`      | Custom React hooks                          |
| `src/lib/`        | Library configurations (Prisma, Auth, etc.) |
| `src/utils/`      | Utility functions                           |
| `docs/`           | Project documentation                       |

### Important Files

| File                | Purpose                             |
| ------------------- | ----------------------------------- |
| `middleware.ts`     | Authentication and route protection |
| `lib/auth.ts`       | Authentication utilities            |
| `lib/prisma.ts`     | Prisma client singleton             |
| `utils/security.ts` | Security utility functions          |

---

## ❓ Questions?

If you have questions about development procedures, please contact the Lead Developer or open an internal issue with the `question` label.

---

**SMP IP YAKIN Internal Development Team**
