# Authentication & Authorization System

Sistem authentication dan authorization yang telah diimplementasikan menggunakan best practices untuk keamanan website sekolah.

## Fitur Utama

### 1. Authentication

- **JWT Token**: Menggunakan JSON Web Token dengan HTTP-only cookies
- **Password Hashing**: Menggunakan bcrypt dengan salt rounds 12
- **Session Management**: Token disimpan dalam HTTP-only cookies yang secure
- **Rate Limiting**: Proteksi terhadap brute force attacks

### 2. Authorization

- **Role-Based Access Control (RBAC)**: 5 role berbeda
- **Route Protection**: Middleware untuk melindungi route berdasarkan role
- **Permission-Based Access**: Sistem permission granular

### 3. Security Features

- **HTTP-Only Cookies**: Token tidak dapat diakses JavaScript
- **CSRF Protection**: SameSite cookie policy
- **Input Sanitization**: Validasi dan sanitasi input
- **Secure Headers**: Headers keamanan standar

## Roles & Permissions

### Admin

- **Permissions**: `read`, `write`, `delete`, `manage_users`, `view_reports`
- **Access**: Dashboard admin saja (tidak bisa akses dashboard lain)

### Kesiswaan

- **Permissions**: `read`, `write`, `manage_students`, `view_reports`
- **Access**: Dashboard kesiswaan saja

### Siswa

- **Permissions**: `read`, `view_profile`, `submit_assignments`
- **Access**: Dashboard siswa saja

### OSIS

- **Permissions**: `read`, `write`, `manage_events`, `view_reports`
- **Access**: Dashboard OSIS saja

### PPDB Officer

- **Permissions**: `read`, `write`, `manage_ppdb`, `view_applications`
- **Access**: Dashboard PPDB saja

## Default User Accounts

| Username  | Password | Role         | Access                   |
| --------- | -------- | ------------ | ------------------------ |
| admin     | admin123 | admin        | Dashboard admin saja     |
| kesiswaan | admin123 | kesiswaan    | Dashboard kesiswaan saja |
| siswa001  | admin123 | siswa        | Dashboard siswa saja     |
| osis001   | admin123 | osis         | Dashboard OSIS saja      |
| ppdb001   | admin123 | ppdb-officer | Dashboard PPDB saja      |

⚠️ **Penting**: Ganti password default sebelum production!

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify token

### Login API Request/Response

**Request (POST /api/auth/login):**

```json
{
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "name": "Administrator",
    "role": "admin",
    "permissions": ["read", "write", "delete", "manage_users", "view_reports"]
  }
}
```

**Response (Error):**

```json
{
  "error": "Invalid credentials or role"
}
```

### Verify Token API

**Request (GET /api/auth/verify):**

- Cookie: `auth-token=<jwt_token>` (for web)
- Header: `Authorization: Bearer <jwt_token>` (for mobile)

**Response (Success):**

```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "admin",
    "role": "admin",
    "permissions": ["read", "write", "delete", "manage_users", "view_reports"]
  }
}
```

### Mobile App Support

API mendukung:

- **Web**: HTTP-only cookies untuk session management
- **Mobile**: JWT token dalam Authorization header
- **Cross-platform**: Same endpoints, different token delivery

### Route Protection

- Middleware otomatis melindungi `/dashboard-*` routes
- Redirect ke login jika tidak authenticated
- Redirect ke unauthorized jika tidak memiliki role yang sesuai
- **Setiap role hanya bisa akses dashboard mereka sendiri**

### Access Control Matrix

| Role         | Dashboard Admin | Dashboard Kesiswaan | Dashboard Siswa | Dashboard OSIS | Dashboard PPDB |
| ------------ | --------------- | ------------------- | --------------- | -------------- | -------------- |
| admin        | ✅              | ❌                  | ❌              | ❌             | ❌             |
| kesiswaan    | ❌              | ✅                  | ❌              | ❌             | ❌             |
| siswa        | ❌              | ❌                  | ✅              | ❌             | ❌             |
| osis         | ❌              | ❌                  | ❌              | ✅             | ❌             |
| ppdb-officer | ❌              | ❌                  | ❌              | ❌             | ✅             |

## Penggunaan

### Login

```typescript
const { login } = useAuth();
const success = await login(username, password, role);
```

### Logout

```typescript
const { logout } = useAuth();
await logout();
```

### Check Permissions

```typescript
const { hasPermission, hasRole } = useAuth();

if (hasPermission("manage_users")) {
  // Show user management features
}

if (hasRole(["admin", "kesiswaan"])) {
  // Show admin/kesiswaan features
}
```

### Protected Components

```typescript
// Hanya untuk admin
<ProtectedRoute requiredRoles={["admin"]}>
  <AdminOnlyComponent />
</ProtectedRoute>

// Hanya untuk kesiswaan
<ProtectedRoute requiredRoles={["kesiswaan"]}>
  <KesiswaanOnlyComponent />
</ProtectedRoute>

// Berdasarkan permission
<ProtectedRoute requiredPermissions={["manage_users"]}>
  <UserManagementComponent />
</ProtectedRoute>
```

### Route Testing

Untuk test access control:

1. **Login sebagai admin** → Hanya bisa akses `/dashboard-admin`
2. **Login sebagai kesiswaan** → Hanya bisa akses `/dashboard-kesiswaan`
3. **Login sebagai siswa** → Hanya bisa akses `/dashboard-siswa`
4. **Coba akses dashboard lain** → Akan redirect ke `/unauthorized`

## Environment Variables

```bash
# JWT Secret (WAJIB diubah untuk production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development

# Security Settings
BCRYPT_SALT_ROUNDS=12
```

## Security Best Practices

### Development

1. Gunakan password yang kuat untuk akun default
2. Set `JWT_SECRET` yang unik dan kompleks
3. Aktifkan HTTPS di production

### Production

1. **Wajib ganti semua password default**
2. **Generate JWT_SECRET yang secure** (minimal 32 karakter)
3. **Set NODE_ENV=production**
4. **Aktifkan HTTPS**
5. **Gunakan database production** (saat ini menggunakan mock data)
6. **Setup monitoring dan logging**

## Struktur File

```
src/
├── app/
│   ├── api/auth/          # API endpoints authentication
│   │   ├── login/         # POST /api/auth/login
│   │   ├── logout/        # POST /api/auth/logout
│   │   └── verify/        # GET /api/auth/verify
│   ├── unauthorized/      # Halaman unauthorized
│   └── (dashboard)/       # Protected dashboard routes
│       ├── dashboard-admin/     # Admin only
│       ├── dashboard-kesiswaan/ # Kesiswaan only
│       ├── dashboard-siswa/     # Siswa only
│       ├── dashboard-osis/      # OSIS only
│       └── dashboard-ppdb/      # PPDB Officer only
├── components/
│   ├── auth/              # Komponen authentication
│   │   ├── ProtectedRoute.tsx # Route protection component
│   │   └── LoginForm.tsx      # Login form
│   └── shared/            # AuthProvider dan shared components
│       ├── AuthProvider.tsx   # Global auth state
│       └── LogoutButton.tsx   # Logout functionality
├── hooks/
│   └── useAuth.ts         # Authentication hook
├── utils/
│   ├── password.ts        # Password utilities
│   └── security.ts        # Security utilities
└── middleware.ts          # Route protection middleware
```

## Middleware Configuration

```typescript
// middleware.ts
const PROTECTED_ROUTES = {
  "/dashboard-admin": ["admin"],
  "/dashboard-kesiswaan": ["kesiswaan"],
  "/dashboard-siswa": ["siswa"],
  "/dashboard-osis": ["osis"],
  "/dashboard-ppdb": ["ppdb-officer"],
};
```

**Behavior:**

- Tidak ada role yang bisa akses dashboard lain
- Admin tidak bisa akses dashboard kesiswaan/siswa/osis/ppdb
- Setiap role terisolasi pada dashboard mereka sendiri

## Troubleshooting

### Login Gagal

1. Periksa username, password, dan role
2. Periksa console browser untuk error
3. Periksa network tab untuk response API

### Unauthorized Access

1. **Cek role user**: Pastikan role sesuai dengan dashboard yang diakses
2. **Cek token validity**: Token mungkin sudah expired
3. **Cek middleware**: Pastikan PROTECTED_ROUTES dikonfigurasi dengan benar
4. **Expected behavior**:
   - Admin login → akses `/dashboard-kesiswaan` → redirect ke `/unauthorized`
   - Kesiswaan login → akses `/dashboard-admin` → redirect ke `/unauthorized`

### Cross-Dashboard Access Prevention

**✅ Correct behavior:**

- Admin hanya bisa akses `/dashboard-admin`
- Kesiswaan hanya bisa akses `/dashboard-kesiswaan`
- Siswa hanya bisa akses `/dashboard-siswa`
- OSIS hanya bisa akses `/dashboard-osis`
- PPDB Officer hanya bisa akses `/dashboard-ppdb`

**❌ Any attempt to access other dashboards will redirect to `/unauthorized`**

### Token Expired

1. Token akan otomatis dihapus
2. User akan diredirect ke login
3. Login ulang untuk mendapatkan token baru

## Update Password Hash

Untuk generate password hash baru:

```typescript
import { hashPassword } from "@/utils/password";

const hash = await hashPassword("newpassword123");
console.log(hash);
```

## Monitoring & Logging

Untuk production, implementasikan:

1. Logging semua login attempts
2. Monitoring failed login attempts
3. Alert untuk suspicious activities
4. Regular security audits
