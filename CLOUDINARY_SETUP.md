# Cloudinary Setup Guide

## 1. Buat Akun Cloudinary

1. Kunjungi [https://cloudinary.com/](https://cloudinary.com/)
2. Klik "Sign Up for Free"
3. Isi form registrasi atau sign up dengan Google/GitHub
4. Verify email Anda

## 2. Dapatkan Credentials

Setelah login, di dashboard Cloudinary:

1. Pergi ke **Dashboard** utama
2. Di bagian **Product Environment Credentials**, Anda akan melihat:
   - **Cloud Name** (contoh: `your-cloud-name`)
   - **API Key** (contoh: `123456789012345`)
   - **API Secret** (klik "Reveal" untuk melihat)

## 3. Setup Environment Variables

Edit file `.env` dan tambahkan:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

⚠️ **PENTING**:

- Ganti `your-cloud-name`, `your-api-key`, dan `your-api-secret` dengan nilai sebenarnya
- Jangan commit file `.env` ke git (sudah ada di `.gitignore`)

## 4. Konfigurasi Upload Presets (Opsional)

Untuk keamanan tambahan, Anda bisa membuat upload preset:

1. Di dashboard Cloudinary, pergi ke **Settings** → **Upload**
2. Scroll ke bawah ke bagian **Upload presets**
3. Klik **Add upload preset**
4. Konfigurasi:
   - **Preset name**: `school-uploads`
   - **Signing Mode**: `Signed` (untuk keamanan)
   - **Folder**: `school/` (untuk organisasi)
   - **Resource Type**: `Image`
   - **Access Mode**: `Public`

## 5. Test Upload

Setelah konfigurasi selesai, test upload dengan:

1. Login ke dashboard siswa
2. Coba upload foto profil atau dokumen
3. Periksa di Cloudinary dashboard apakah file ter-upload

## 6. Fitur yang Tersedia

### Upload Features:

- ✅ Drag & drop upload
- ✅ File type validation (JPEG, PNG, WebP)
- ✅ File size validation (max 5MB)
- ✅ Image preview
- ✅ Auto optimization
- ✅ CDN delivery

### Security Features:

- ✅ JWT authentication required
- ✅ File type validation
- ✅ File size limits
- ✅ Organized folder structure

### Performance Features:

- ✅ Automatic image optimization
- ✅ Global CDN delivery
- ✅ Multiple format support
- ✅ Lazy loading ready

## 7. Folder Structure

Uploads akan diorganisir sebagai berikut:

```
school/
├── uploads/          # General uploads
├── profiles/         # Profile pictures
├── documents/        # Student documents
└── certificates/     # Certificates
```

## 8. Free Tier Limits

Cloudinary free tier memberikan:

- 25 credits/month (setara ~25GB bandwidth)
- 25GB storage
- Basic transformations
- Global CDN

## 9. Monitoring Usage

Untuk monitor usage:

1. Dashboard Cloudinary → **Reports**
2. Lihat **Usage Report** untuk bandwidth dan storage
3. Setup alerts jika mendekati limit

## 10. Best Practices

### Untuk Developer:

- Selalu validate file di frontend dan backend
- Gunakan transformasi untuk optimize loading
- Implement progressive loading
- Cache transformed images

### Untuk User:

- Gunakan foto dengan kualitas baik tapi tidak terlalu besar
- Format JPEG untuk foto, PNG untuk logo/gambar dengan transparency
- Maksimal 5MB per file

## 11. Troubleshooting

### Upload Gagal:

1. Periksa credentials di `.env`
2. Periksa koneksi internet
3. Periksa format dan ukuran file
4. Lihat console browser untuk error detail

### Image Tidak Muncul:

1. Periksa URL di network tab
2. Pastikan `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` benar
3. Periksa CORS settings di Cloudinary

### Performance Issues:

1. Gunakan transformasi untuk resize image
2. Enable auto format dan quality
3. Implement lazy loading

## 12. Code Usage

### Basic Upload:

```tsx
import ImageUpload from "@/components/shared/ImageUpload";

function ProfilePage() {
  const handleUpload = (file) => {
    console.log("Uploaded:", file);
    // Save file.url to database
  };

  return (
    <ImageUpload
      onUpload={handleUpload}
      folder="profiles"
      label="Upload Profile Picture"
    />
  );
}
```

### With Current Image:

```tsx
<ImageUpload
  currentImage={user.profileImage}
  onUpload={handleUpload}
  onRemove={handleRemove}
  folder="profiles"
/>
```

## 13. Next Steps

Setelah setup Cloudinary, Anda bisa:

1. Implement image upload di dashboard siswa
2. Add profile picture upload
3. Document upload untuk PPDB
4. Gallery untuk kegiatan sekolah
5. Certificate upload untuk prestasi

---

📝 **Note**: Simpan credentials Cloudinary dengan aman dan jangan share ke public repository!
