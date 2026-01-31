# Analisis Aktor dan Use Case Sistem SMP IP Yakin

## 📊 Ringkasan Analisis

Berdasarkan analisis terhadap codebase project Anda, berikut adalah struktur role dan fitur yang telah diimplementasikan:

### Role yang Diimplementasikan di Database (Prisma Schema)
```typescript
enum UserRole {
  ADMIN          // Administrator sistem
  SISWA          // Siswa
  OSIS           // Pengurus OSIS
  KESISWAAN      // Staff Kesiswaan
  PPDB_ADMIN     // Admin PPDB
  PEMBINA_OSIS   // Pembina OSIS (role baru)
}
```

### Protected Routes & Access Control
```typescript
PROTECTED_ROUTES = {
  "/dashboard-admin": ["admin"],
  "/dashboard-kesiswaan": ["kesiswaan"],
  "/dashboard-siswa": ["siswa"],
  "/dashboard-osis": ["osis"],
  "/dashboard-ppdb": ["ppdb_admin"],
  "/dashboard-pembina-osis": ["pembina_osis", "admin"]
}
```

---

## 🎯 Rekomendasi: Pengunjung vs Calon Siswa

### **Keputusan: PISAHKAN sebagai 2 aktor berbeda**

#### Alasan Pemisahan:

| Aspek | Pengunjung | Calon Siswa/Pendaftar |
|-------|-----------|----------------------|
| **Autentikasi** | ❌ Tidak perlu login | ✅ Perlu registrasi & login |
| **Persistensi Data** | ❌ Anonim, tidak tersimpan | ✅ Data tersimpan di database |
| **Transaksi** | ❌ Hanya viewing | ✅ CRUD operations (upload, edit) |
| **Lifecycle** | Sementara | Memiliki status tracking |
| **Database Model** | - | `PPDBApplication` |

#### Benefit Pemisahan:
1. ✅ **Clarity**: Use case diagram lebih jelas dan mudah dipahami
2. ✅ **Separation of Concerns**: Memisahkan public access vs authenticated access
3. ✅ **Traceability**: Mudah tracking requirement untuk masing-masing aktor
4. ✅ **Security**: Jelas mana yang perlu authentication layer

---

## 📋 Mapping Aktor ke Database & Implementation

### 1. **Pengunjung** (Public User)
- **Database**: Tidak ada model khusus
- **Authentication**: ❌ Tidak diperlukan
- **Routes**: Public routes (/, /about, /news, /ppdb-info, dll)

### 2. **Calon Siswa/Pendaftar** (PPDB Applicant)
- **Database**: `PPDBApplication` model
- **Authentication**: ❌ **TIDAK DIPERLUKAN** (no login/account system)
- **Routes**: `/ppdb/register`, `/ppdb/status`
- **Status Tracking**: `PENDING`, `ACCEPTED`, `REJECTED`
- **Identifier**: NISN (Nomor Induk Siswa Nasional)
- **Flow**: 
  1. Isi formulir langsung tanpa login
  2. Upload dokumen persyaratan
  3. Submit pendaftaran
  4. Cek status menggunakan NISN saja (tanpa login)

### 3. **Siswa** (Student)
- **Database**: `User` (role: SISWA) + `Siswa` model
- **Authentication**: ✅ Required
- **Routes**: `/dashboard-siswa`
- **Special Access**: Bisa memiliki `osisAccess=true` untuk akses fitur OSIS

### 4. **OSIS** (Student Organization)
- **Database**: `User` (role: OSIS)
- **Authentication**: ✅ Required
- **Routes**: `/dashboard-osis`
- **Fitur Utama**: Mengelola program kerja OSIS, berita kegiatan

### 5. **Kesiswaan** (Student Affairs Staff)
- **Database**: `User` (role: KESISWAAN) + `Kesiswaan` model
- **Authentication**: ✅ Required
- **Routes**: `/dashboard-kesiswaan`
- **Fitur Utama**: Manajemen siswa, kalender, review karya/prestasi, tracking keterlambatan

### 6. **PPDB Admin**
- **Database**: `User` (role: PPDB_ADMIN)
- **Authentication**: ✅ Required
- **Routes**: `/dashboard-ppdb`
- **Fitur Utama**: Review & verifikasi pendaftaran PPDB

### 7. **Admin** (System Administrator)
- **Database**: `User` (role: ADMIN)
- **Authentication**: ✅ Required
- **Routes**: `/dashboard-admin`
- **Fitur Utama**: Full system access, manajemen konten, user, settings
- **Special**: Admin juga bisa akses `/dashboard-pembina-osis`

### 8. **Pembina OSIS** (OSIS Supervisor) - *Role Baru*
- **Database**: `User` (role: PEMBINA_OSIS)
- **Authentication**: ✅ Required
- **Routes**: `/dashboard-pembina-osis`
- **Access**: Shared dengan Admin
- **Fitur**: Review & approve program kerja OSIS

---

## 🔐 Fitur Keamanan yang Diimplementasikan

### Middleware Security Features:
1. **JWT Token Verification** - Verifikasi token untuk setiap protected route
2. **IP Binding** - Mencegah session hijacking dengan binding IP
3. **Token Age Check** - Auto logout setelah 24 jam
4. **Role-Based Access Control** - Setiap route memiliki role yang diizinkan
5. **Security Headers** - XSS Protection, Clickjacking Prevention, CSP

### Additional Security:
- **Login Attempt Tracking** - Model `LoginAttempt` untuk audit
- **Password Hashing** - Menggunakan bcrypt
- **CSRF Protection** - Via Next.js built-in

---

## 📊 Fitur Utama per Modul

### Content Management
- **News**: Berita sekolah dengan approval workflow
- **Announcements**: Pengumuman dengan priority levels
- **Hero Slides**: Carousel homepage
- **School Activities**: Kalender kegiatan sekolah
- **OSIS Activities**: Program kerja OSIS dengan approval

### Student Management
- **Student Profile**: Data lengkap siswa
- **Achievements**: Prestasi siswa dengan approval
- **Student Works**: Karya siswa (foto/video) dengan approval
- **Lateness Tracking**: QR-based attendance tracking

### Religious Activities (Ibadah)
- **Menstruation Records**: Absensi sholat putri
- **Adzan Schedule**: Jadwal adzan siswa
- **Carpet Cleaning**: Jadwal piket karpet masjid

### PPDB System
- **Application Management**: Pendaftaran siswa baru
- **Document Upload**: Upload dokumen persyaratan (Cloudinary)
- **Status Tracking**: PENDING → ACCEPTED/REJECTED
- **Feedback System**: Catatan untuk pendaftar

---

## 🎨 Use Case Diagrams

Telah dibuat use case diagram terpisah untuk:
- ✅ **Pengunjung** - `usecase-pengunjung.puml`
- ✅ **Calon Siswa** - `usecase-calon-siswa.puml`
- ✅ **Siswa** - `usecase-siswa.puml`

Akan dibuat untuk:
- ⏳ **Admin**
- ⏳ **Kesiswaan**
- ⏳ **OSIS**
- ⏳ **PPDB Admin**
- ⏳ **Pembina OSIS** (opsional, bisa digabung dengan review OSIS activities)

---

## 💡 Rekomendasi Tambahan

### 1. Konsistensi Naming
- ✅ Database menggunakan `PEMBINA_OSIS` (underscore)
- ✅ Route menggunakan `dashboard-pembina-osis` (hyphen)
- ✅ Token role menggunakan `pembina_osis` (underscore)
- Sudah ada mapping function untuk handle ini

### 2. Access Control Hierarchy
```
Admin > Pembina OSIS > OSIS
Admin > Kesiswaan
Admin > PPDB Admin
```

### 3. Special Access Pattern
- Siswa dengan `osisAccess=true` bisa akses fitur OSIS tertentu
- Admin bisa akses semua dashboard (kecuali siswa-specific)

---

## 📝 Catatan Implementasi

### Fitur yang Sudah Lengkap:
- ✅ Authentication & Authorization
- ✅ Role-based routing
- ✅ Content management dengan approval workflow
- ✅ Student management
- ✅ PPDB system
- ✅ Religious activities tracking
- ✅ Notification system
- ✅ Security features (IP binding, token expiry, etc)

### Fitur Pembina OSIS (Baru):
- Dashboard sudah ada di `/dashboard-pembina-osis`
- Components: `PendingActivitiesList`, `ActivityHistoryList`
- Kemungkinan fitur: Review & approve program kerja OSIS
