# Use Case Diagram - Sistem SMP IP Yakin

## 📌 Rekomendasi Aktor

### ✅ Pengunjung dan Calon Siswa: **PISAHKAN**

**Alasan:**
1. **Autentikasi** - Pengunjung tidak perlu login, Calon Siswa perlu akun
2. **Persistensi** - Pengunjung anonim, Calon Siswa tersimpan di database
3. **Transaksi** - Pengunjung hanya viewing, Calon Siswa bisa CRUD
4. **Lifecycle** - Pengunjung sementara, Calon Siswa memiliki status tracking

---

## 📁 File Use Case Diagram

Telah dibuat 7 file PlantUML terpisah per aktor:

| No | Aktor | File | Deskripsi |
|----|-------|------|-----------|
| 1 | **Pengunjung** | `usecase-pengunjung.puml` | Portal publik tanpa login |
| 2 | **Calon Siswa** | `usecase-calon-siswa.puml` | Sistem PPDB untuk pendaftar |
| 3 | **Siswa** | `usecase-siswa.puml` | Dashboard siswa |
| 4 | **Admin** | `usecase-admin.puml` | Full system access |
| 5 | **Kesiswaan** | `usecase-kesiswaan.puml` | Manajemen kesiswaan |
| 6 | **OSIS** | `usecase-osis.puml` | Program kerja OSIS |
| 7 | **PPDB Admin** | `usecase-ppdb-admin.puml` | Verifikasi pendaftaran |
| 8 | **Pembina OSIS** | `usecase-pembina-osis.puml` | Review program OSIS |

---

## 🎯 Ringkasan Hak Akses per Aktor

### 1. Pengunjung (Public)
- ❌ Tidak perlu login
- ✅ Akses: Informasi publik, chatbot, info PPDB
- 📊 Database: Tidak ada model khusus

### 2. Calon Siswa/Pendaftar
- ✅ Perlu registrasi & login
- ✅ Akses: Registrasi PPDB, upload dokumen, cek status
- 📊 Database: `PPDBApplication`

### 3. Siswa
- ✅ Perlu login
- ✅ Akses: Profil, submit karya/prestasi
- 📊 Database: `User` (role: SISWA) + `Siswa`
- 🔑 Special: Bisa memiliki `osisAccess=true`

### 4. Admin
- ✅ Perlu login
- ✅ Akses: **Full system access**
- 📊 Database: `User` (role: ADMIN)
- 🔑 Special: Bisa akses semua dashboard termasuk Pembina OSIS

### 5. Kesiswaan
- ✅ Perlu login
- ✅ Akses: Manajemen siswa, kalender, review karya/prestasi, tracking keterlambatan
- 📊 Database: `User` (role: KESISWAAN) + `Kesiswaan`

### 6. OSIS
- ✅ Perlu login
- ✅ Akses: Program kerja OSIS, berita kegiatan, program keagamaan
- 📊 Database: `User` (role: OSIS)

### 7. PPDB Admin
- ✅ Perlu login
- ✅ Akses: Review & verifikasi pendaftaran PPDB
- 📊 Database: `User` (role: PPDB_ADMIN)

### 8. Pembina OSIS (Role Baru)
- ✅ Perlu login
- ✅ Akses: Review & approve program kerja OSIS
- 📊 Database: `User` (role: PEMBINA_OSIS)
- 🔑 Special: Shared access dengan Admin

---

## 🔄 Cara Menggunakan File PlantUML

### Online (Recommended)
1. Buka [PlantUML Online Editor](http://www.plantuml.com/plantuml/uml/)
2. Copy-paste isi file `.puml`
3. Klik "Submit" untuk generate diagram
4. Download sebagai PNG/SVG

### VS Code
1. Install extension: **PlantUML** by jebbs
2. Buka file `.puml`
3. Tekan `Alt+D` untuk preview
4. Klik kanan → Export untuk save sebagai image

### Command Line
```bash
# Install PlantUML
npm install -g node-plantuml

# Generate PNG
puml generate usecase-pengunjung.puml -o output.png

# Generate SVG
puml generate usecase-pengunjung.puml -o output.svg
```

---

## 📊 Approval Workflow dalam Sistem

Beberapa use case memiliki approval workflow:

| Fitur | Submitted By | Approved By | Status |
|-------|--------------|-------------|--------|
| **Karya Siswa** | Siswa | Kesiswaan/Admin | PENDING → APPROVED/REJECTED |
| **Prestasi Siswa** | Siswa | Kesiswaan/Admin | PENDING → APPROVED/REJECTED |
| **Program OSIS** | OSIS | Pembina OSIS/Admin | PENDING → APPROVED/REJECTED |
| **Berita Kegiatan** | OSIS | Pembina OSIS/Admin | PENDING → APPROVED/REJECTED |
| **Pendaftaran PPDB** | Calon Siswa | PPDB Admin | PENDING → ACCEPTED/REJECTED |

---

## 🔐 Security Features

Berdasarkan implementasi di `middleware.ts`:

1. ✅ **JWT Token Verification**
2. ✅ **IP Binding** - Mencegah session hijacking
3. ✅ **Token Age Check** - Auto logout 24 jam
4. ✅ **Role-Based Access Control**
5. ✅ **Security Headers** (XSS, Clickjacking, CSP)
6. ✅ **Login Attempt Tracking**

---

## 📝 Catatan untuk Tugas Akhir

### Kelebihan Pemisahan Aktor:
- ✅ **Clarity**: Diagram lebih mudah dipahami
- ✅ **Separation of Concerns**: Jelas mana public vs authenticated
- ✅ **Traceability**: Mudah tracking requirement
- ✅ **Maintainability**: Mudah update per aktor

### Konsistensi Implementasi:
- ✅ Database schema sudah sesuai dengan use case
- ✅ Middleware sudah implement RBAC dengan benar
- ✅ Protected routes sudah sesuai dengan role
- ✅ Approval workflow sudah terimplementasi

### Rekomendasi Dokumentasi TA:
1. Gunakan diagram terpisah untuk setiap aktor
2. Jelaskan approval workflow dengan sequence diagram
3. Tambahkan activity diagram untuk proses kompleks (PPDB, approval)
4. Sertakan ERD untuk menunjukkan relasi database
