# PWA Icons Setup

## Cara Generate Icons

Anda perlu menyediakan icon PNG dalam berbagai ukuran untuk PWA. Ikuti langkah berikut:

### Option 1: Generate Online (Recommended)

1. Buka https://realfavicongenerator.net/
2. Upload logo sekolah (logo.png atau logo.svg)
3. Download hasil generate
4. Pindahkan file-file ke folder `public/icons/`

### Option 2: Generate Manual

Buat file PNG dengan ukuran berikut dan simpan di `public/icons/`:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

### Tips:

- Gunakan background transparan atau warna solid (#F59E0B untuk tema sekolah)
- Logo harus cukup jelas di ukuran kecil (72x72)
- Untuk maskable icons, pastikan logo berada di "safe zone" (tengah 80%)

## Files yang Dibutuhkan

```
public/
├── manifest.json (sudah dibuat)
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

## Test PWA

1. Build production: `npm run build`
2. Start: `npm start`
3. Buka Chrome DevTools > Application > Manifest
4. Cek "Installability" untuk memastikan PWA siap di-install
