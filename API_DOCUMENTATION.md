# API Documentation

## SMP IP Yakin Jakarta - REST API

Base URL: `https://www.smpipyakin.sch.id/api`

### Table of Contents

- [Authentication](#authentication)
- [PPDB (Admissions)](#ppdb-admissions)
- [Cron & Maintenance](#cron--maintenance)
- [Error Format](#error-format)
- [Rate Limiting & Validation](#rate-limiting--validation)

---

## Authentication

### POST `/api/auth/login`

Login to the system. Sets an HTTP-only `auth-token` cookie with IP binding and role-based permissions.

**Request Body (JSON):**

```json
{
  "username": "string",
  "password": "string",
  "role": "admin | kesiswaan | siswa | osis | ppdb_admin"
}
```

**Successful Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "admin",
    "name": "Administrator",
    "role": "admin",
    "email": "admin@example.com",
    "permissions": ["read", "write", "delete", "manage_users", "view_reports"]
  }
}
```

**Error Responses:**

```json
{
  "error": "Invalid credentials",
  "remainingAttempts": 3,
  "retryAfter": 0,
  "lockType": null
}
```

- Status **429** when IP rate limit is exceeded (5 attempts / 15 minutes).
- Status **423** when account lock is hit (10 attempts / 24 hours).

### POST `/api/auth/logout`

Clears the `auth-token` cookie.

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### GET `/api/auth/verify`

Validates the current session cookie and returns fresh user info.

**Headers:** `Cookie: auth-token=<JWT_TOKEN>`

**Successful Response:**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "admin",
    "name": "Administrator",
    "role": "admin",
    "normalizedRole": "ADMIN",
    "email": "admin@example.com",
    "permissions": ["read", "write", "delete", "manage_users", "view_reports"]
  }
}
```

**401 Response:**

```json
{ "error": "No token found" }
```

---

## PPDB (Admissions)

### GET `/api/ppdb/check-nisn?nisn=1234567890`

Checks whether an applicant with the given NISN already exists and whether a retry is allowed.

**Successful Response (existing):**

```json
{
  "exists": true,
  "message": "NISN 1234567890 sudah terdaftar atas nama Ananda",
  "data": {
    "id": "uuid",
    "name": "Ananda",
    "status": "REJECTED",
    "retries": 0,
    "allowRetry": true
  }
}
```

**Successful Response (available):**

```json
{
  "exists": false,
  "message": "NISN 1234567890 tersedia untuk pendaftaran"
}
```

### POST `/api/ppdb/register`

Submits a PPDB registration (gated by `siteSettings` PPDB window). Rate limited to **5 submissions per hour per IP**.

**Request Body (JSON):**

```json
{
  "namaLengkap": "Nama Lengkap",
  "nisn": "1234567890",
  "jenisKelamin": "laki-laki | perempuan",
  "tempatLahir": "Jakarta",
  "tanggalLahir": "2010-01-01",
  "alamatLengkap": "Alamat",
  "asalSekolah": "SMP Contoh",
  "kontakOrtu": "081234567890",
  "namaOrtu": "Nama Orang Tua",
  "emailOrtu": "ortu@example.com",
  "documents": [
    {
      "cloudinaryId": "ppdb_uploads/abc",
      "url": "https://res.cloudinary.com/...",
      "fileName": "ijazah.pdf",
      "fileSize": 12345,
      "mimeType": "application/pdf",
      "documentType": "ijazah"
    }
  ]
}
```

**Successful Response:**

```json
{
  "success": true,
  "message": "Pendaftaran PPDB berhasil dikirim",
  "data": {
    "id": "uuid",
    "nisn": "1234567890",
    "name": "Nama Lengkap",
    "status": "PENDING",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Notes & Conflict Handling:**

- Duplicate **PENDING**/**ACCEPTED** applications return **409**.
- **REJECTED** applications may re-register **once** (increments `retries`); further attempts return **409**.
- Document URLs are mapped into `ijazahUrl`, `aktaKelahiranUrl`, `kartuKeluargaUrl`, and `pasFotoUrl` in the database.

### GET `/api/ppdb/status?nisn=1234567890`

Returns the application status for a given NISN.

**Successful Response:**

```json
{
  "success": true,
  "data": {
    "nisn": "1234567890",
    "name": "Nama Lengkap",
    "status": "pending | accepted | rejected",
    "statusMessage": "Pendaftaran Anda sedang dalam tahap verifikasi dokumen. Estimasi waktu: 2-3 hari kerja.",
    "feedback": "Optional feedback",
    "submittedAt": "2025-01-01T00:00:00.000Z",
    "documentsCount": 3,
    "documents": [
      { "type": "ijazah", "url": "https://..." }
    ]
  }
}
```

### POST `/api/ppdb/upload`

Uploads a document to **Cloudinary** using the PPDB preset.

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field         | Required | Description                                      |
| ------------- | -------- | ------------------------------------------------ |
| `file`        | Yes      | JPG / PNG / PDF, max 5MB                         |
| `documentType`| Yes      | `ijazah` \| `aktaKelahiran` \| `kartuKeluarga` \| `pasFoto` |
| `nisn`        | Yes      | Applicant NISN (used for folder naming)          |

**Successful Response:**

```json
{
  "success": true,
  "data": {
    "cloudinaryId": "ppdb_uploads/abc",
    "url": "https://res.cloudinary.com/...",
    "fileName": "ijazah.pdf",
    "fileSize": 12345,
    "mimeType": "application/pdf",
    "documentType": "ijazah"
  }
}
```

### POST `/api/ppdb/upload-r2`

Uploads a document to **Cloudflare R2** (S3-compatible). Rate limited to **20 uploads per hour per IP**.

**Content-Type:** `multipart/form-data` (same fields and validation as `/upload`).

**Successful Response:**

```json
{
  "success": true,
  "data": {
    "cloudinaryId": "1234567890/ijazah_1730000000000.pdf",
    "url": "https://pub-xxxx.r2.dev/1234567890/ijazah_1730000000000.pdf",
    "fileName": "ijazah.pdf",
    "fileSize": 12345,
    "mimeType": "application/pdf",
    "documentType": "ijazah"
  }
}
```

---

## Cron & Maintenance

### GET `/api/cron/cleanup-logs`

Deletes login attempt records older than 30 days.

- **Headers:** `Authorization: Bearer <CRON_SECRET>` (required in production)
- **Response:** `{ "success": true, "deletedCount": number }`

### POST `/api/cron/maintenance-check`

Activates/deactivates maintenance mode based on active `maintenanceSchedules`.

- **Headers:** `Authorization: Bearer <CRON_SECRET>` (falls back to `test-cron-secret` if unset for local use)
- **Response (maintenance on):** `{ "success": true, "active": true, "scheduleId": "uuid" }`
- **Response (off):** `{ "success": true, "active": false }`

---

## Error Format

Common structure for failures:

```json
{
  "error": "Human readable message",
  "success": false
}
```

Authentication and rate-limit responses also include `remainingAttempts`, `retryAfter`, and `lockType` when applicable.

---

## Rate Limiting & Validation

- **Login:** 5 failed attempts / 15 minutes per IP; 10 / 24 hours per username (database-backed, logged in `login_attempts`).
- **PPDB register:** 5 submissions / hour / IP (in-memory limiter).
- **PPDB upload (R2):** 20 uploads / hour / IP (in-memory limiter).
- **Uploads:** Only JPG / PNG / PDF up to 5MB.
- **Sessions:** JWT stored in `auth-token` cookie (HttpOnly, SameSite Strict in production) with IP binding.
- **Transport:** All endpoints must be called over HTTPS in production.

---

### Changelog

- **2026-01:** Updated to align with Next.js 15.5.9 codebase, PPDB retry rules, Cloudinary/R2 uploads, cron endpoints, and Zod 4.x validation.
