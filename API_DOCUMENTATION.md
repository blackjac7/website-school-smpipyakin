# API Documentation

## SMP IP Yakin Jakarta - REST API

Base URL: `https://www.smpipyakin.sch.id/api`

### Table of Contents

- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Protected Endpoints](#protected-endpoints)
- [PPDB Endpoints](#ppdb-endpoints)
- [Error Handling](#error-handling)

---

## Authentication

### POST /api/auth/login

Login to the system.

**Request Body:**

```json
{
  "username": "string",
  "password": "string",
  "captcha": "string (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "name": "string",
      "role": "admin | kesiswaan | osis | siswa | ppdb"
    },
    "token": "string (JWT)"
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Username atau password salah"
}
```

---

### POST /api/auth/logout

Logout from the system. Clears the authentication cookie.

**Response:**

```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

---

### GET /api/auth/verify

Verify the current authentication token.

**Headers:**

```
Cookie: token=<JWT_TOKEN>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "name": "string",
      "role": "string"
    }
  }
}
```

---

## Public Endpoints

### News

#### GET /api/public/news

Get list of published news articles.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| category | string | - | Filter by category |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "excerpt": "string",
      "image": "string",
      "publishedAt": "2025-01-01T00:00:00.000Z",
      "category": "string"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /api/public/news/:id

Get a single news article by ID.

---

### Announcements

#### GET /api/public/announcements

Get list of active announcements.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| priority | string | - | Filter by priority (low, medium, high) |

---

### Calendar

#### GET /api/public/calendar

Get academic calendar events.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| month | number | current | Month (1-12) |
| year | number | current | Year |

---

### Teachers

#### GET /api/public/teachers

Get list of teachers.

---

### Facilities

#### GET /api/public/facilities

Get list of school facilities.

---

### Extracurricular

#### GET /api/public/extracurricular

Get list of extracurricular activities.

---

## PPDB Endpoints

### POST /api/ppdb/check-nisn

Check if NISN is already registered.

**Request Body:**

```json
{
  "nisn": "1234567890"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "isRegistered": false
  }
}
```

---

### POST /api/ppdb/register

Submit a new PPDB registration.

**Request Body:**

```json
{
  "fullName": "string",
  "birthPlace": "string",
  "birthDate": "2010-01-01",
  "gender": "L | P",
  "religion": "string",
  "nisn": "1234567890",
  "address": "string",
  "province": "string",
  "city": "string",
  "district": "string",
  "postalCode": "12345",
  "fatherName": "string",
  "fatherPhone": "081234567890",
  "motherName": "string",
  "motherPhone": "081234567890",
  "previousSchool": "string",
  "email": "email@example.com",
  "phone": "081234567890"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Pendaftaran berhasil",
  "data": {
    "registrationId": "string",
    "registrationNumber": "PPDB-2025-0001"
  }
}
```

**Notes & Behaviors:**

- **Unique NISN rule:** Only one active registration per NISN is allowed. If a registration exists with status `PENDING` or `ACCEPTED`, new registration attempts using the same NISN will be rejected with HTTP **409 Conflict**.
- **One-time re-registration after rejection:** If an existing application has status `REJECTED`, the applicant is allowed to re-register **exactly once**. The server stores a `retries` count on the application and increments it when a re-registration is performed. If `retries >= 1` and the application is `REJECTED`, further attempts will be rejected with HTTP **409 Conflict** and an explanatory error message.
- **Rate limiting (anti-abuse):** The registration endpoint enforces a per-IP rate limit of **5 registration attempts per hour**. If the limit is exceeded, the endpoint returns HTTP **429 Too Many Requests** with an error message. The upload endpoint (`/api/ppdb/upload` or `/api/ppdb/upload-r2`) enforces a per-IP rate limit of **20 uploads per hour**.
- **Check NISN endpoint:** Use `GET /api/ppdb/check-nisn?nisn={nisn}` to determine if a NISN already exists and whether a retry is allowed. When the NISN exists, the response includes `status`, `retries`, and `allowRetry` flags in the `data` object.

**Example error responses:**

- Duplicate / conflict:

```json
{ "error": "NISN sudah terdaftar dan berstatus PENDING." }
```

- Re-registration limit reached:

```json
{ "error": "Tidak dapat mendaftar ulang lebih dari sekali setelah penolakan." }
```

- Rate limit exceeded:

```json
{ "error": "Terlalu banyak percobaan pendaftaran. Silakan coba lagi nanti." }
```

---

### GET /api/ppdb/status/:registrationNumber

Check PPDB registration status.

**Response:**

```json
{
  "success": true,
  "data": {
    "registrationNumber": "PPDB-2025-0001",
    "status": "pending | verified | accepted | rejected",
    "fullName": "string",
    "submittedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### POST /api/ppdb/upload

Upload documents for PPDB registration.

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Document file (max 5MB) |
| registrationId | string | Yes | Registration ID |
| documentType | string | Yes | Type of document (photo, ijazah, kk, akta) |

---

## Protected Endpoints

These endpoints require authentication. Include the JWT token in cookies.

### Admin Endpoints

#### GET /api/admin/users

Get list of users (admin only).

#### POST /api/admin/users

Create a new user (admin only).

#### PUT /api/admin/users/:id

Update a user (admin only).

#### DELETE /api/admin/users/:id

Delete a user (admin only).

---

### Student Endpoints

#### GET /api/student/works

Get student's submitted works.

#### POST /api/student/works

Submit a new work.

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code             | Status | Description              |
| ---------------- | ------ | ------------------------ |
| UNAUTHORIZED     | 401    | Authentication required  |
| FORBIDDEN        | 403    | Insufficient permissions |
| NOT_FOUND        | 404    | Resource not found       |
| VALIDATION_ERROR | 400    | Invalid input data       |
| RATE_LIMITED     | 429    | Too many requests        |
| SERVER_ERROR     | 500    | Internal server error    |

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- Public endpoints: 100 requests per minute
- Authentication endpoints: 5 requests per minute
- Protected endpoints: 60 requests per minute

When rate limited, you'll receive:

```json
{
  "success": false,
  "error": "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  "code": "RATE_LIMITED"
}
```

---

## Security

- All API requests must be made over HTTPS
- JWT tokens expire after 24 hours
- Passwords are hashed using bcrypt
- Input sanitization is applied to all user inputs
- CAPTCHA is required after failed login attempts

---

## Changelog

### v1.0.0 (December 2025)

- Initial API release
- Authentication system
- PPDB registration
- Public content endpoints
