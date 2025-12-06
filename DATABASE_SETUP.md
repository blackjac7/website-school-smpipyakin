# Database & Prisma Setup Documentation

## 📋 Overview

Project ini menggunakan **PostgreSQL** dengan **Prisma ORM** untuk mengelola database sekolah yang komprehensif. Schema database dirancang sesuai dengan kebutuhan sistem sekolah modern.

## 🗄️ Database Schema

### **Struktur Utama:**

- **Users & Authentication** - Sistem login multi-role
- **Students Management** - Manajemen data siswa
- **PPDB System** - Penerimaan Peserta Didik Baru
- **Content Management** - Berita, pengumuman, aktivitas
- **School Facilities** - Fasilitas dan ekstrakurikuler

### **Role System:**

- `ADMIN` - Administrator sekolah
- `KESISWAAN` - Staff kesiswaan
- `SISWA` - Siswa reguler
- `OSIS` - Siswa dengan akses OSIS
- `PPDB_STAFF` - Petugas PPDB

## 🚀 Setup Instructions

### 1. **Install Dependencies**

```bash
npm install prisma @prisma/client bcryptjs tsx
```

### 2. **Environment Configuration**

Pastikan file `.env` sudah dikonfigurasi:

```env
# Database (pilih salah satu)
# Option 1: Prisma Dev Database (recommended untuk development)
DATABASE_URL="prisma+postgres://localhost:51213/..."

# Option 2: Local PostgreSQL
# DATABASE_URL="postgresql://username:password@localhost:5432/smpipyakin_db"

# JWT Secret (GANTI untuk production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
```

### 3. **Database Migration**

```bash
# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name init

# Seed database with sample data
npm run db:seed
```

### 4. **Available Scripts**

```bash
npm run db:seed      # Populate database dengan data sample
npm run db:reset     # Reset database (HATI-HATI!)
npm run db:migrate   # Run database migration
npm run db:generate  # Generate Prisma client
```

## 👥 Default User Accounts

Setelah running seed, Anda bisa login dengan akun berikut:

| Username  | Password | Role         | Access                   |
| --------- | -------- | ------------ | ------------------------ |
| admin     | admin123 | admin        | Dashboard admin saja     |
| kesiswaan | admin123 | kesiswaan    | Dashboard kesiswaan saja |
| siswa001  | admin123 | siswa        | Dashboard siswa saja     |
| osis001   | admin123 | osis         | Dashboard OSIS saja      |
| ppdb001   | admin123 | ppdb-officer | Dashboard PPDB saja      |

⚠️ **PENTING**: Ganti semua password default sebelum production!

## 🏗️ Database Architecture

### **User Management**

```sql
users
├── id (UUID, Primary Key)
├── username (Unique)
├── email (Optional, untuk notifikasi)
├── password (bcrypt hashed)
├── role (ENUM)
└── timestamps

siswa
├── userId (FK to users)
├── nisn (Unique)
├── name, gender, angkatan
├── osisAccess (boolean)
└── achievements[] (relation)

kesiswaan
├── userId (FK to users)
├── nip (Unique)
├── name, gender
└── statusActive
```

### **Content Management**

```sql
news
├── title, content, image
├── kategori (achievement/activity)
├── statusPersetujuan (approval workflow)
└── authorId (FK to users)

announcements
├── title, content, location
├── priority (high/medium/low)
└── linkFile (optional)

school_activities
├── title, information
├── semester, tahunPelajaran
└── createdBy (FK to users)
```

### **PPDB System**

```sql
ppdb_applications
├── name, nisn, gender
├── birthDate, asalSekolah
├── address, noWa
├── status (pending/approved/rejected)
└── feedback
```

## 🔧 Prisma Usage Examples

### **Basic Queries**

```typescript
import { prisma } from "@/lib/prisma";

// Get user with relations
const user = await prisma.user.findUnique({
  where: { username: "admin" },
  include: {
    siswa: true,
    kesiswaan: true,
  },
});

// Create news with approval workflow
const news = await prisma.news.create({
  data: {
    title: "Prestasi Siswa",
    content: "Siswa meraih juara...",
    kategori: "ACHIEVEMENT",
    statusPersetujuan: "PENDING",
    authorId: userId,
  },
});

// Get pending PPDB applications
const applications = await prisma.pPDBApplication.findMany({
  where: { status: "PENDING" },
  orderBy: { createdAt: "desc" },
});
```

### **Advanced Queries**

```typescript
// Students with achievements
const studentsWithAchievements = await prisma.siswa.findMany({
  include: {
    user: true,
    achievements: {
      where: { statusPersetujuan: "APPROVED" },
    },
  },
});

// News by category with author
const newsByCategory = await prisma.news.findMany({
  where: {
    kategori: "ACHIEVEMENT",
    statusPersetujuan: "APPROVED",
  },
  include: { author: true },
  orderBy: { date: "desc" },
});
```

## 🔐 Security Features

### **Password Security**

- Bcrypt hashing dengan salt rounds 12
- Password validation di backend

### **Role-Based Access**

- Middleware protection untuk routes
- Permission-based authorization
- Cross-dashboard access prevention

### **Data Validation**

- Prisma schema validation
- Input sanitization
- Proper error handling

## 🚀 Production Considerations

### **Database**

1. **Gunakan PostgreSQL production database**
2. **Setup connection pooling**
3. **Configure backup strategy**
4. **Monitor database performance**

### **Security**

1. **Ganti JWT_SECRET yang secure (min 32 characters)**
2. **Update semua password default**
3. **Enable HTTPS**
4. **Setup rate limiting**

### **Performance**

1. **Add database indexes untuk queries yang sering**
2. **Implement caching untuk data yang static**
3. **Optimize Prisma queries dengan select/include**
4. **Monitor query performance**

## 📊 Database Monitoring

### **Prisma Studio**

```bash
npx prisma studio
```

Akses database GUI di `http://localhost:5555`

### **Useful Commands**

```bash
# View database schema
npx prisma db pull

# Reset database (DANGER!)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Deploy migrations (production)
npx prisma migrate deploy
```

## 🎯 Best Practices

### **Prisma Usage**

1. **Selalu gunakan transactions untuk operasi complex**
2. **Implement proper error handling**
3. **Use connection pooling untuk production**
4. **Optimize queries dengan select field yang diperlukan**

### **Data Management**

1. **Backup database secara regular**
2. **Monitor disk space usage**
3. **Archive old data sesuai kebijakan**
4. **Implement audit logging untuk data sensitive**

---

## 📞 Support

Jika ada pertanyaan atau masalah dengan database setup:

1. Check migration files di `prisma/migrations/`
2. Review schema di `prisma/schema.prisma`
3. Test dengan `npm run db:seed`
4. Check logs untuk debugging

**Setup ini sudah production-ready dengan best practices untuk sistem sekolah! 🎓**
