# Laporan Keterlambatan & Atribut: Poin, Rekap Siswa, dan Periode Akademik

**Tanggal:** 2026-08-06
**Status:** Disetujui, siap masuk rencana implementasi

## Latar Belakang

Kesiswaan meminta dua hal untuk laporan keterlambatan dan pelanggaran atribut:

1. Export Excel juga menampilkan poin yang didapat siswa dan berapa kali siswa
   sudah melanggar.
2. Laporan keterlambatan dapat difilter per kelas untuk rentang satu bulan,
   enam bulan, dan satu tahun — karena laporan ini diserahkan ke wali kelas.

Permintaan ini bermuara pada satu kebutuhan: wali kelas butuh satu berkas per
kelas per periode yang langsung bisa dibaca tanpa diolah lagi.

## Kondisi Saat Ini

| Aspek | Kondisi |
|---|---|
| Opsi periode | `day`, `week`, `month`, `year`, `custom` |
| Isi export | Satu sheet, satu baris per kejadian, tanpa angka poin |
| Sumber poin | Diturunkan saat baca: `floor(total ÷ threshold) × poin`, tidak disimpan di DB |
| Tabel poin | Tampil di layar saja (`LatenessReportsContent.tsx`), tidak ikut ter-export |

Tiga masalah yang ditemukan saat menelusuri kode:

- **`getDateRange()` diduplikasi identik** di `src/actions/lateness.ts:309` dan
  `src/actions/attributes.ts:63`. Menambah periode di dua tempat berarti dua
  sumber kebenaran yang bisa menyimpang.
- **Export mengabaikan kotak pencarian.** `getLatenessForExport()` hanya
  menerima `period` dan `classFilter`. Pengguna yang mencari "Budi" lalu
  meng-export akan mendapat data satu kelas penuh — isi berkas tidak cocok
  dengan yang terlihat di layar.
- **`month` dan `year` bersifat *to-date*.** `startOfMonth` → `endOfDay(hari ini)`.
  Untuk laporan wali kelas, yang dibutuhkan adalah bulan penuh yang sudah lewat.

## Ruang Lingkup

**Dikerjakan:**

- Periode akademik baru: bulan tertentu, semester, tahun ajaran.
- Export Excel tiga sheet dengan kolom poin dan jumlah pelanggaran.
- Perbaikan filter pencarian pada export.
- Penamaan berkas dan header yang mengikuti periode terpilih.

**Tidak dikerjakan:**

- Perubahan skema database. Semua angka dapat diturunkan dari data yang ada.
- Export PDF, tanda tangan wali kelas/kepala sekolah, role wali kelas baru.
- Perubahan pada `exportToExcel()` yang sudah dipakai enam pemanggil lain.

## Rancangan

### 1. `src/lib/reportPeriod.ts` — sumber tunggal periode

Fungsi murni tanpa `"use server"`, tanpa akses Prisma, sehingga dapat
diverifikasi terpisah. `lateness.ts` dan `attributes.ts` menghapus
`getDateRange()` masing-masing dan meng-import dari sini.

```ts
export type Period =
  | "day" | "week" | "month" | "year" | "custom"
  | "specificMonth"   // 1 s/d akhir bulan yang dipilih
  | "semester"        // Ganjil: Jul–Des | Genap: Jan–Jun
  | "academicYear";   // Jul YYYY – Jun YYYY+1

export interface PeriodInput {
  period: Period;
  customStart?: Date;
  customEnd?: Date;
  month?: number;          // 0–11, untuk specificMonth
  year?: number;           // untuk specificMonth
  semester?: "GANJIL" | "GENAP";
  academicYear?: number;   // tahun awal, mis. 2025 untuk 2025/2026
}

export function getDateRange(input: PeriodInput): { start: Date; end: Date };
export function getPeriodLabel(input: PeriodInput): string;
export function getCurrentAcademicYear(now?: Date): number;
```

Tanda tangannya berupa objek, bukan posisional. `specificMonth` butuh dua
argumen tambahan dan `semester` butuh dua lagi; menambahkannya sebagai
parameter posisional ke-8 hingga ke-11 akan sangat rawan salah urut.

**Aturan yang berlaku:**

- Periode yang sudah lewat berakhir di akhir periode sebenarnya. `Agustus 2026`
  = 1 s/d 31 Agustus penuh.
- Periode yang sedang berjalan dipotong di `endOfDay(hari ini)`, supaya tidak
  muncul baris tanggal kosong di masa depan.
- Tahun ajaran diturunkan dari tanggal: bulan ≥ Juli → `YYYY/YYYY+1`, selain itu
  `YYYY-1/YYYY`.
- Semester Ganjil = 1 Jul YYYY – 31 Des YYYY. Genap = 1 Jan YYYY+1 – 30 Jun YYYY+1.
- Konversi zona waktu memakai `toZonedTime(..., "Asia/Jakarta")`, mengikuti pola
  yang sudah dipakai di kedua action file.

Periode `day`/`week`/`month`/`year`/`custom` yang lama dipertahankan apa adanya
agar pemanggil yang sudah ada tidak berubah perilakunya.

### 2. Perhitungan poin

Aturan poin yang berlaku sekarang menghitung dari jumlah seumur hidup:
`floor(total ÷ threshold) × pointsPerThreshold` (`src/lib/latenessPoints.ts:48`).

Empat kolom angka yang masuk ke rekap:

| Kolom | Rumus | Arti |
|---|---|---|
| `Terlambat (Periode)` | `COUNT` dalam rentang | Jumlah kejadian di periode itu |
| `Poin (Periode)` | `floor(jml_periode ÷ threshold) × poin` | Poin dari kejadian periode itu saja |
| `Total Terlambat` | `COUNT` seumur hidup | Angka resmi pembinaan |
| `Total Poin` | `floor(total ÷ threshold) × poin` | **Angka yang mengikat**, sama dengan dashboard |

**Peringatan yang harus tercetak di berkas.** `Poin (Periode)` yang dijumlahkan
antar bulan tidak akan sama dengan `Total Poin`. Siswa dengan 2x di Agustus dan
2x di September mendapat 0 poin per bulan, padahal totalnya 4x = 2 poin — sisa
pembagian hilang setiap kali dipotong per periode.

Karena itu `Total Poin` diperlakukan sebagai sumber kebenaran, dan
`Poin (Periode)` sebagai indikator intensitas periode. Sheet Ringkasan memuat
catatan kaki yang menyatakan hal ini secara eksplisit, supaya wali kelas tidak
menjumlahkan kolom yang salah.

### 3. Pengambilan data rekap

Fungsi `getLatenessReportForExport()` dan `getAttributeReportForExport()`
menggantikan `getLatenessForExport()` dan `getAttributeViolationsForExport()`
seluruhnya — keduanya hanya dipanggil dari komponen laporan masing-masing,
jadi tidak ada pemanggil lain yang terdampak. Fungsi baru mengembalikan tiga
bagian sekaligus:

```ts
{
  detail:  DetailRow[];   // satu baris per kejadian
  recap:   RecapRow[];    // satu baris per siswa, urut Total Poin menurun
  summary: SummaryData;   // agregat + label periode + konfigurasi poin
}
```

Rekap diambil dengan tiga query, bukan N+1:

1. `groupBy({ by: ["siswaId"], where: { date: { gte, lte }, ...filter } })`
   → jumlah per siswa dalam periode.
2. `siswa.findMany({ where: { id: { in: ids } }, select: { ..., _count: { select: { latenessRecords: true } } } })`
   → identitas siswa dan jumlah seumur hidup.
3. Konfigurasi poin dari `getLatenessPointConfig()` / `getAttributePointConfig()`.

Indeks `@@index([siswaId, date])` dan `@@index([date])` sudah ada di kedua tabel,
jadi tidak perlu migrasi.

Kedua fungsi menerima `searchTerm`, memakai predikat `where` yang sama persis
dengan fungsi daftar di layar — ini yang memperbaiki ketidakcocokan isi export.

### 4. Struktur Excel

`exportToExcel()` yang ada hanya mendukung satu sheet (`src/utils/excelExport.ts:33`).
Ditambahkan fungsi baru `exportMultiSheetExcel()` di file yang sama, dengan
logika pembangun sheet diekstrak menjadi helper `buildSheet()` yang dipakai
bersama. Fungsi lama tidak diubah tanda tangannya, sehingga enam pemanggil lain
(PPDB, guru, kalender, pengguna, OSIS, kesiswaan) tidak berisiko.

**Sheet 1 — "Detail"**
Kolom seperti sekarang, ditambah `Total Poin Siswa` di ujung — nilai poin
seumur hidup milik siswa pada baris itu, sama untuk setiap barisnya. Angka ini
melekat pada siswa, bukan pada kejadian, sehingga kolom ini **tidak boleh
dijumlahkan**; keterangan tersebut ikut tercetak di sheet Ringkasan.

**Sheet 2 — "Rekap Siswa"**
`No | Nama | NISN | Kelas | Terlambat (Periode) | Poin (Periode) | Total Terlambat | Total Poin`

Untuk laporan atribut, kolom `Terlambat` menjadi `Pelanggaran`, dan ditambah
satu kolom `Atribut Tersering`: nama item atribut yang paling sering muncul di
pelanggaran siswa tersebut **dalam periode terpilih**. Bila ada seri, diambil
yang urutan `AttributeItem.order`-nya paling kecil agar hasilnya stabil antar
export. Datanya sudah ikut ter-join lewat relasi `items` untuk sheet Detail,
jadi tidak ada query tambahan.

Urut menurun berdasarkan `Total Poin`, lalu `Total Terlambat`.

**Sheet 3 — "Ringkasan"**
Periode, kelas, total kejadian, jumlah siswa terlibat, rata-rata per siswa,
kelas terbanyak, tanggal export, aturan poin yang berlaku, dan catatan kaki
tentang penjumlahan kolom periode.

### 5. Perubahan antarmuka

Dropdown periode di `LatenessReportsContent.tsx` dan `AttributeReportsContent.tsx`
bertambah tiga pilihan, dengan sub-pemilih yang muncul sesuai konteks — pola yang
sama dengan input tanggal `custom` yang sudah ada:

- `Bulan Tertentu` → pemilih bulan + tahun
- `Semester` → pemilih Ganjil/Genap + tahun ajaran
- `Tahun Ajaran` → pemilih tahun ajaran

Daftar tahun ajaran diisi dari tahun ajaran yang benar-benar punya data, lewat
action baru `getAvailableAcademicYears()`, bukan daftar statis.

Nama berkas dan header ikut periode:
`Laporan_Keterlambatan_7A_Agustus-2026.xlsx` dengan header `Kelas 7A — Agustus 2026`,
menggantikan `Periode: CUSTOM` yang sekarang.

## Penanganan Kesalahan

- Sub-pemilih tidak lengkap (mis. `specificMonth` tanpa bulan): tombol export
  nonaktif, `getDateRange()` melempar error yang menjelaskan field mana yang kurang.
- Periode tanpa data: berkas tetap dibuat dengan sheet Ringkasan terisi dan
  sheet Detail/Rekap kosong berheader, disertai toast peringatan. Wali kelas
  tetap punya bukti bahwa periode itu nihil.
- Rentang `custom` terbalik (akhir < awal): ditukar otomatis, konsisten dengan
  perilaku yang ada.
- Kegagalan query: pola `{ success: false, error }` yang sudah dipakai di seluruh
  action file, ditampilkan lewat `react-hot-toast`.

## Verifikasi

Proyek ini memakai Playwright untuk E2E dan tidak punya runner unit test.
Menambah Vitest hanya untuk ini menambah ruang lingkup, sementara `tsx` sudah
tersedia sebagai devDependency.

- `scripts/verify-report-period.ts` — assertion memakai `node:assert`, dijalankan
  dengan `npx tsx`. Menguji batas tanggal untuk ketiga periode baru, penurunan
  tahun ajaran di sekitar batas Juni/Juli, pemotongan periode berjalan, dan
  perhitungan poin termasuk kasus sisa pembagian yang hilang.
- Verifikasi manual: export satu kelas untuk bulan yang sudah lewat, cocokkan
  `Total Poin` di sheet Rekap dengan angka di tabel poin pada layar.
- `npm run lint` dan `npx tsc --noEmit` harus bersih.

## Berkas yang Tersentuh

| Berkas | Perubahan |
|---|---|
| `src/lib/reportPeriod.ts` | Baru — tipe periode, `getDateRange`, `getPeriodLabel` |
| `src/actions/lateness.ts` | Hapus `getDateRange` lokal, tambah `getLatenessReportForExport` |
| `src/actions/attributes.ts` | Hapus `getDateRange` lokal, tambah `getAttributeReportForExport` |
| `src/utils/excelExport.ts` | Tambah `exportMultiSheetExcel` + helper `buildSheet` |
| `src/components/dashboard/kesiswaan/LatenessReportsContent.tsx` | Pemilih periode, pemanggilan export |
| `src/components/dashboard/kesiswaan/AttributeReportsContent.tsx` | Sama |
| `scripts/verify-report-period.ts` | Baru — assertion logika tanggal & poin |
