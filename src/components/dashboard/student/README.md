# Student Dashboard Components

Komponen-komponen modular untuk dashboard siswa yang telah dikonversi dari React.js ke Next.js.

## Struktur Komponen

### 1. DashboardHeader
Komponen header dashboard yang menampilkan:
- Judul dashboard
- Bell notifikasi dengan badge unread count
- Dropdown notifikasi dengan list semua notifikasi
- Avatar user

**Props:**
- `notifications`: Array notifikasi
- `showNotifications`: State untuk show/hide dropdown
- `setShowNotifications`: Function untuk toggle dropdown
- `markAsRead`: Function untuk mark notifikasi sebagai read
- `unreadCount`: Jumlah notifikasi yang belum dibaca

### 2. ProfileSection
Komponen section profil siswa yang menampilkan:
- Avatar dengan tombol edit foto
- Informasi nama, kelas, dan angkatan
- Tombol edit profile

**Props:**
- `profileData`: Object data profil siswa
- `onEditClick`: Function callback untuk membuka modal edit

### 3. NotificationsOverview
Komponen preview notifikasi terbaru (2 teratas) di main content.

**Props:**
- `notifications`: Array notifikasi

### 4. AchievementsSection
Komponen section prestasi siswa yang menampilkan:
- Header dengan tombol "Unggah Prestasi Baru"
- List semua prestasi dengan status dan detail

**Props:**
- `achievements`: Array prestasi
- `onUploadClick`: Function callback untuk membuka modal upload
- `getStatusColor`: Function untuk mendapatkan warna status

### 5. EditProfileModal
Modal untuk edit informasi profil siswa dengan form sections:
- Informasi Pribadi
- Informasi Kontak
- Informasi Akademik
- Informasi Orang Tua

**Props:**
- `isOpen`: State untuk show/hide modal
- `onClose`: Function untuk close modal
- `profileData`: Object data profil
- `onInputChange`: Function untuk handle perubahan input
- `onSubmit`: Function untuk handle submit form

### 6. UploadAchievementModal
Modal untuk upload prestasi baru dengan form fields:
- Kategori prestasi
- Judul prestasi
- Deskripsi
- Tanggal dan tingkat prestasi
- Upload file sertifikat

**Props:**
- `isOpen`: State untuk show/hide modal
- `onClose`: Function untuk close modal
- `onSubmit`: Function untuk handle submit form

## Types

File `types.ts` berisi interface TypeScript untuk:
- `ProfileData`: Interface untuk data profil siswa
- `Notification`: Interface untuk data notifikasi
- `Achievement`: Interface untuk data prestasi

## Penggunaan

```tsx
import {
  DashboardHeader,
  ProfileSection,
  NotificationsOverview,
  AchievementsSection,
  EditProfileModal,
  UploadAchievementModal,
  ProfileData,
  Notification,
  Achievement
} from "@/components/dashboard/student";
```

## Teknologi

- **Next.js 15.4.1** dengan App Router
- **TypeScript** untuk type safety
- **Tailwind CSS** untuk styling
- **Lucide React** untuk icons
- **"use client"** directive untuk client-side interactivity

## Struktur File

```
src/components/dashboard/student/
├── DashboardHeader.tsx
├── ProfileSection.tsx
├── NotificationsOverview.tsx
├── AchievementsSection.tsx
├── EditProfileModal.tsx
├── UploadAchievementModal.tsx
├── types.ts
└── index.ts
```

Semua komponen sudah di-export melalui `index.ts` untuk kemudahan import.
