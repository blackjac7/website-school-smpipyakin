# Laporan Poin & Periode Akademik — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Export Excel laporan keterlambatan & atribut menampilkan poin dan jumlah pelanggaran per siswa, dengan filter periode per bulan / semester / tahun ajaran untuk laporan wali kelas.

**Architecture:** Satukan `getDateRange()` yang terduplikasi di dua action file ke `src/lib/reportPeriod.ts` (fungsi murni, tanpa Prisma). Tambah `exportMultiSheetExcel()` di `src/utils/excelExport.ts` tanpa menyentuh `exportToExcel()` yang dipakai enam pemanggil lain. Action export baru mengembalikan `{ detail, recap, summary }` dalam tiga query agregat, bukan N+1.

**Tech Stack:** Next.js 15 App Router (server actions), Prisma 6, date-fns 4 + date-fns-tz 3, xlsx 0.18, React 18, TypeScript 5.9, tsx (verifikasi script).

**Spec:** `docs/superpowers/specs/2026-08-06-laporan-poin-periode-design.md`

## Global Constraints

- **Tanpa perubahan skema Prisma.** Semua angka diturunkan dari data yang ada. Indeks `@@index([siswaId, date])` dan `@@index([date])` sudah ada di `lateness_records` dan `attribute_violations`.
- **Tanpa dependensi baru.** `tsx` sudah ada di devDependencies untuk script verifikasi.
- **Zona waktu:** `WIB_TIMEZONE = "Asia/Jakarta"`, memakai pola `toZonedTime(now, WIB_TIMEZONE)` lalu operasi date-fns di atas hasilnya — persis seperti kode yang ada. Jangan ubah semantik timezone periode lama.
- **Periode lama (`day`/`week`/`month`/`year`/`custom`) tidak boleh berubah perilakunya.** Batas atasnya tetap `endOfDay(hari ini)`.
- **`Period` harus tetap di-export dari `src/actions/lateness.ts` dan `src/actions/attributes.ts`** (re-export), karena `LatenessReportsContent.tsx:38` dan `AttributeReportsContent.tsx:39` meng-import dari sana.
- **Bahasa UI dan header Excel: Bahasa Indonesia.** Nama bulan memakai `date-fns/locale` `id`.
- **Aturan poin:** `floor(count ÷ threshold) × pointsPerThreshold`, threshold default 3, poin default 2. Jangan duplikasi rumus — pakai `calculateLatenessPoints()` / `calculateAttributePoints()` yang sudah ada.
- **Pola return server action:** `{ success: true, ... }` atau `{ success: false, error: string }`. Error ditampilkan lewat `react-hot-toast`.
- **Verifikasi akhir setiap task:** `npm run lint` dan `npx tsc --noEmit` harus bersih.

---

### Task 1: `src/lib/reportPeriod.ts` — sumber tunggal periode

**Files:**
- Create: `src/lib/reportPeriod.ts`
- Create: `scripts/verify-report-period.ts`

**Interfaces:**
- Consumes: `date-fns` (`startOfDay`, `endOfDay`, `startOfWeek`, `startOfMonth`, `endOfMonth`, `startOfYear`), `date-fns-tz` (`toZonedTime`), `date-fns/locale` (`id`), `date-fns` (`format`)
- Produces:
  ```ts
  export type Period =
    | "day" | "week" | "month" | "year" | "custom"
    | "specificMonth" | "semester" | "academicYear";

  export type SemesterType = "GANJIL" | "GENAP";

  export interface PeriodInput {
    period: Period;
    customStart?: Date;
    customEnd?: Date;
    month?: number;          // 0-11
    year?: number;
    semester?: SemesterType;
    academicYear?: number;   // tahun awal, 2025 => 2025/2026
  }

  export interface DateRange { start: Date; end: Date }

  export function getDateRange(input: PeriodInput): DateRange;
  export function getPeriodLabel(input: PeriodInput): string;
  export function getCurrentAcademicYear(now?: Date): number;
  export function getAcademicYearLabel(academicYear: number): string;
  /** Slug aman untuk nama berkas: "Agustus 2026" -> "Agustus-2026" */
  export function getPeriodFilenameSlug(input: PeriodInput): string;
  export const WIB_TIMEZONE = "Asia/Jakarta";
  ```

**Aturan yang harus diimplementasikan:**

1. Periode lampau berakhir di akhir periode sebenarnya; periode berjalan dipotong `endOfDay(zonedNow)`. Terapkan lewat satu helper internal `clampToToday(end, zonedNow)` yang mengembalikan `end > todayEnd ? todayEnd : end`.
2. `specificMonth` butuh `month` dan `year`; `semester` butuh `semester` dan `academicYear`; `academicYear` butuh `academicYear`. Bila kurang, lempar `Error` dengan pesan menyebut field yang hilang.
3. `getCurrentAcademicYear`: bulan ≥ 6 (Juli, indeks 0-based) → tahun berjalan, selain itu tahun−1.
4. Semester GANJIL tahun ajaran `Y` = 1 Jul `Y` s/d 31 Des `Y`. GENAP = 1 Jan `Y+1` s/d 30 Jun `Y+1`.
5. `academicYear` `Y` = 1 Jul `Y` s/d 30 Jun `Y+1`.
6. `custom` dengan `customEnd < customStart`: tukar otomatis.
7. Tanggal untuk periode akademik dibangun dari komponen (`new Date(year, month, 1)`) dan diperlakukan sebagai wall-clock WIB, konsisten dengan bagaimana hasil `toZonedTime` dipakai di kode yang ada.
8. Label: `specificMonth` → `"Agustus 2026"`; `semester` → `"Semester Ganjil 2025/2026"`; `academicYear` → `"Tahun Ajaran 2025/2026"`; `day` → `"Hari Ini"`; `week` → `"Minggu Ini"`; `month` → `"Bulan Ini"`; `year` → `"Tahun Ini"`; `custom` → `"1 Jan 2026 - 31 Jan 2026"` (format `d MMM yyyy`, locale `id`).

- [ ] **Step 1: Tulis script verifikasi yang gagal**

Buat `scripts/verify-report-period.ts`, mengikuti pola `scripts/check-roles.ts` yang sudah ada di repo ini:

```ts
import {
  getDateRange,
  getPeriodLabel,
  getCurrentAcademicYear,
} from "../src/lib/reportPeriod";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAILED:", msg);
    process.exitCode = 1;
  } else {
    console.log("OK:", msg);
  }
}

console.log("Running report period checks...");

// --- specificMonth: bulan penuh yang sudah lewat ---
const aug = getDateRange({ period: "specificMonth", month: 7, year: 2025 });
assert(aug.start.getDate() === 1, "specificMonth mulai tanggal 1");
assert(aug.start.getMonth() === 7, "specificMonth bulan Agustus");
assert(aug.end.getDate() === 31, "Agustus 2025 berakhir tanggal 31");
assert(aug.end.getMonth() === 7, "akhir masih di bulan Agustus");

// Februari tahun kabisat
const feb = getDateRange({ period: "specificMonth", month: 1, year: 2024 });
assert(feb.end.getDate() === 29, "Februari 2024 berakhir tanggal 29");

// --- semester ---
const ganjil = getDateRange({
  period: "semester",
  semester: "GANJIL",
  academicYear: 2020,
});
assert(ganjil.start.getMonth() === 6, "Ganjil mulai Juli");
assert(ganjil.start.getFullYear() === 2020, "Ganjil mulai tahun awal");
assert(ganjil.end.getMonth() === 11, "Ganjil berakhir Desember");
assert(ganjil.end.getFullYear() === 2020, "Ganjil berakhir tahun awal");

const genap = getDateRange({
  period: "semester",
  semester: "GENAP",
  academicYear: 2020,
});
assert(genap.start.getMonth() === 0, "Genap mulai Januari");
assert(genap.start.getFullYear() === 2021, "Genap mulai tahun berikutnya");
assert(genap.end.getMonth() === 5, "Genap berakhir Juni");
assert(genap.end.getDate() === 30, "Juni berakhir tanggal 30");

// --- academicYear ---
const ay = getDateRange({ period: "academicYear", academicYear: 2020 });
assert(ay.start.getMonth() === 6 && ay.start.getFullYear() === 2020, "TA mulai Jul 2020");
assert(ay.end.getMonth() === 5 && ay.end.getFullYear() === 2021, "TA berakhir Jun 2021");

// --- penurunan tahun ajaran di sekitar batas Juni/Juli ---
assert(getCurrentAcademicYear(new Date(2026, 5, 30)) === 2025, "30 Jun 2026 => TA 2025");
assert(getCurrentAcademicYear(new Date(2026, 6, 1)) === 2026, "1 Jul 2026 => TA 2026");
assert(getCurrentAcademicYear(new Date(2026, 11, 31)) === 2026, "31 Des 2026 => TA 2026");
assert(getCurrentAcademicYear(new Date(2026, 0, 1)) === 2025, "1 Jan 2026 => TA 2025");

// --- periode berjalan dipotong di hari ini ---
const now = new Date();
const curr = getDateRange({
  period: "specificMonth",
  month: now.getMonth(),
  year: now.getFullYear(),
});
assert(curr.end.getTime() <= Date.now() + 86_400_000, "bulan berjalan tidak melewati hari ini");

// --- custom terbalik ditukar ---
const rev = getDateRange({
  period: "custom",
  customStart: new Date(2026, 0, 31),
  customEnd: new Date(2026, 0, 1),
});
assert(rev.start.getTime() < rev.end.getTime(), "custom terbalik ditukar");

// --- field kurang melempar error ---
let threw = false;
try {
  getDateRange({ period: "specificMonth" });
} catch {
  threw = true;
}
assert(threw, "specificMonth tanpa month/year melempar error");

threw = false;
try {
  getDateRange({ period: "semester", semester: "GANJIL" });
} catch {
  threw = true;
}
assert(threw, "semester tanpa academicYear melempar error");

// --- label ---
assert(
  getPeriodLabel({ period: "specificMonth", month: 7, year: 2026 }) === "Agustus 2026",
  "label specificMonth",
);
assert(
  getPeriodLabel({ period: "semester", semester: "GANJIL", academicYear: 2025 }) ===
    "Semester Ganjil 2025/2026",
  "label semester",
);
assert(
  getPeriodLabel({ period: "academicYear", academicYear: 2025 }) ===
    "Tahun Ajaran 2025/2026",
  "label academicYear",
);

console.log("Report period checks done.");
```

- [ ] **Step 2: Jalankan untuk memastikan gagal**

Run: `npx tsx scripts/verify-report-period.ts`
Expected: FAIL — `Cannot find module '../src/lib/reportPeriod'`

- [ ] **Step 3: Implementasikan `src/lib/reportPeriod.ts`**

```ts
/**
 * Report Period
 * =============
 * Satu-satunya sumber perhitungan rentang tanggal laporan. Sebelumnya
 * getDateRange() terduplikasi identik di src/actions/lateness.ts dan
 * src/actions/attributes.ts; menambah periode di dua tempat berarti dua
 * sumber kebenaran yang bisa menyimpang.
 *
 * Fungsi murni, tanpa Prisma dan tanpa "use server", sehingga dapat
 * diverifikasi lewat scripts/verify-report-period.ts.
 */

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  format,
} from "date-fns";
import { id } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

export const WIB_TIMEZONE = "Asia/Jakarta";

export type Period =
  | "day"
  | "week"
  | "month"
  | "year"
  | "custom"
  | "specificMonth"
  | "semester"
  | "academicYear";

export type SemesterType = "GANJIL" | "GENAP";

export interface PeriodInput {
  period: Period;
  customStart?: Date;
  customEnd?: Date;
  /** 0-11, untuk specificMonth */
  month?: number;
  /** untuk specificMonth */
  year?: number;
  semester?: SemesterType;
  /** tahun awal: 2025 berarti tahun ajaran 2025/2026 */
  academicYear?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

/** Bulan Juli (indeks 0-based) sebagai awal tahun ajaran. */
const ACADEMIC_YEAR_START_MONTH = 6;

/**
 * Tahun ajaran berjalan diturunkan dari tanggal, bukan di-hardcode:
 * bulan >= Juli -> tahun berjalan, selain itu tahun sebelumnya.
 */
export function getCurrentAcademicYear(now: Date = new Date()): number {
  const zoned = toZonedTime(now, WIB_TIMEZONE);
  return zoned.getMonth() >= ACADEMIC_YEAR_START_MONTH
    ? zoned.getFullYear()
    : zoned.getFullYear() - 1;
}

export function getAcademicYearLabel(academicYear: number): string {
  return `${academicYear}/${academicYear + 1}`;
}

/**
 * Periode lampau berakhir di akhir periode sebenarnya, tapi periode yang
 * sedang berjalan dipotong di hari ini supaya laporan tidak memuat baris
 * tanggal kosong di masa depan.
 */
function clampToToday(end: Date, zonedNow: Date): Date {
  const todayEnd = endOfDay(zonedNow);
  return end.getTime() > todayEnd.getTime() ? todayEnd : end;
}

function requireField<T>(value: T | undefined, field: string, period: Period): T {
  if (value === undefined || value === null) {
    throw new Error(`Periode "${period}" membutuhkan field "${field}"`);
  }
  return value;
}

export function getDateRange(input: PeriodInput): DateRange {
  const { period } = input;
  const zonedNow = toZonedTime(new Date(), WIB_TIMEZONE);

  switch (period) {
    case "custom": {
      const rawStart = requireField(input.customStart, "customStart", period);
      const rawEnd = requireField(input.customEnd, "customEnd", period);
      const a = startOfDay(toZonedTime(rawStart, WIB_TIMEZONE));
      const b = endOfDay(toZonedTime(rawEnd, WIB_TIMEZONE));
      // Rentang terbalik ditukar, bukan ditolak.
      return b.getTime() < a.getTime()
        ? { start: startOfDay(b), end: endOfDay(a) }
        : { start: a, end: b };
    }

    case "specificMonth": {
      const month = requireField(input.month, "month", period);
      const year = requireField(input.year, "year", period);
      const first = new Date(year, month, 1);
      return {
        start: startOfMonth(first),
        end: clampToToday(endOfMonth(first), zonedNow),
      };
    }

    case "semester": {
      const semester = requireField(input.semester, "semester", period);
      const ay = requireField(input.academicYear, "academicYear", period);
      // Ganjil: Jul-Des tahun awal. Genap: Jan-Jun tahun berikutnya.
      const start =
        semester === "GANJIL"
          ? new Date(ay, ACADEMIC_YEAR_START_MONTH, 1)
          : new Date(ay + 1, 0, 1);
      const lastMonth =
        semester === "GANJIL" ? new Date(ay, 11, 1) : new Date(ay + 1, 5, 1);
      return {
        start: startOfDay(start),
        end: clampToToday(endOfMonth(lastMonth), zonedNow),
      };
    }

    case "academicYear": {
      const ay = requireField(input.academicYear, "academicYear", period);
      return {
        start: startOfDay(new Date(ay, ACADEMIC_YEAR_START_MONTH, 1)),
        end: clampToToday(endOfMonth(new Date(ay + 1, 5, 1)), zonedNow),
      };
    }

    // Periode lama: batas atas tetap hari ini, perilaku tidak diubah.
    case "week":
      return {
        start: startOfWeek(zonedNow, { weekStartsOn: 1 }),
        end: endOfDay(zonedNow),
      };
    case "month":
      return { start: startOfMonth(zonedNow), end: endOfDay(zonedNow) };
    case "year":
      return { start: startOfYear(zonedNow), end: endOfDay(zonedNow) };
    case "day":
    default:
      return { start: startOfDay(zonedNow), end: endOfDay(zonedNow) };
  }
}

export function getPeriodLabel(input: PeriodInput): string {
  switch (input.period) {
    case "specificMonth": {
      const month = requireField(input.month, "month", input.period);
      const year = requireField(input.year, "year", input.period);
      return format(new Date(year, month, 1), "MMMM yyyy", { locale: id });
    }
    case "semester": {
      const semester = requireField(input.semester, "semester", input.period);
      const ay = requireField(input.academicYear, "academicYear", input.period);
      const name = semester === "GANJIL" ? "Ganjil" : "Genap";
      return `Semester ${name} ${getAcademicYearLabel(ay)}`;
    }
    case "academicYear": {
      const ay = requireField(input.academicYear, "academicYear", input.period);
      return `Tahun Ajaran ${getAcademicYearLabel(ay)}`;
    }
    case "custom": {
      const { start, end } = getDateRange(input);
      const fmt = (d: Date) => format(d, "d MMM yyyy", { locale: id });
      return `${fmt(start)} - ${fmt(end)}`;
    }
    case "week":
      return "Minggu Ini";
    case "month":
      return "Bulan Ini";
    case "year":
      return "Tahun Ini";
    case "day":
    default:
      return "Hari Ini";
  }
}

/** Slug aman untuk nama berkas: "Agustus 2026" -> "Agustus-2026". */
export function getPeriodFilenameSlug(input: PeriodInput): string {
  return getPeriodLabel(input)
    .replace(/[/\\]/g, "-")
    .replace(/\s+/g, "-");
}
```

- [ ] **Step 4: Jalankan verifikasi sampai lulus**

Run: `npx tsx scripts/verify-report-period.ts`
Expected: semua baris `OK:`, exit code 0, tidak ada `FAILED:`

- [ ] **Step 5: Lint & typecheck**

Run: `npm run lint && npx tsc --noEmit`
Expected: bersih

- [ ] **Step 6: Commit**

```bash
git add src/lib/reportPeriod.ts scripts/verify-report-period.ts
git commit -m "feat: tambah reportPeriod.ts sebagai sumber tunggal periode laporan

Menyatukan getDateRange() yang terduplikasi di lateness.ts dan
attributes.ts, plus tiga periode akademik baru: specificMonth,
semester, dan academicYear.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Migrasi kedua action file ke `reportPeriod.ts`

Task ini hanya memindahkan sumber `getDateRange`, tanpa mengubah perilaku apa pun. Dipisah dari Task 3 supaya bila ada regresi pada periode lama, penyebabnya jelas.

**Files:**
- Modify: `src/actions/lateness.ts` — hapus `getDateRange` lokal (baris 309-335) dan `export type Period` (baris 306); ubah 14 pemanggil
- Modify: `src/actions/attributes.ts` — hapus `getDateRange` lokal (baris 63-89) dan `export type Period` (baris 61); ubah pemanggil

**Interfaces:**
- Consumes: `getDateRange`, `Period`, `PeriodInput`, `WIB_TIMEZONE` dari Task 1
- Produces: kedua action file me-**re-export** `Period` supaya import di komponen tidak putus:
  ```ts
  export type { Period } from "@/lib/reportPeriod";
  ```

**Konteks penting:** `Period` di-import oleh `LatenessReportsContent.tsx:38` dan `AttributeReportsContent.tsx:39` dari action file, bukan dari lib. Menghapusnya tanpa re-export akan memutus build.

**Pemanggil `getDateRange` yang harus diubah di `lateness.ts`:** `getLatenessStats` (4 pemanggilan, baris 356-389), `getLatenessRecords` (424), `getLatenessByClass` (507), `getLatenesTrend` (546), `getLatenessForExport` (806), `exportLatenessCSV` (875). Di `attributes.ts`: pola yang setara.

**Wajib: ubah tanda tangan fungsi daftar & chart menjadi `PeriodInput`.**

Ini bukan kosmetik — ini mencegah bug konversi zona ganda. Bila komponen menghitung `{start, end}` lebih dulu lalu mengirimnya sebagai `customStart`/`customEnd`, cabang `custom` di server akan menjalankan `toZonedTime()` **untuk kedua kalinya** pada tanggal yang sudah ter-zona. `toZonedTime` menggeser +7 jam tiap pemanggilan, sehingga batas rentang melenceng 14 jam dan tanggal pertama/terakhir periode bisa salah masuk atau terbuang.

Solusinya: satu representasi periode di semua lapisan. Fungsi berikut mengganti tiga parameter `(period, customStart, customEnd)` dengan satu `periodInput: PeriodInput`:

| Berkas | Fungsi |
|---|---|
| `lateness.ts` | `getLatenessRecords`, `getLatenessByClass`, `getLatenesTrend` |
| `attributes.ts` | `getAttributeViolations`, `getAttributeViolationsByClass`, `getAttributeViolationTrend`, `getMostViolatedAttributes` |

Tanda tangan baru — objek, bukan posisional, karena `getLatenessRecords` sudah punya 7 parameter dan menambah lagi akan sangat rawan salah urut:

```ts
export async function getLatenessRecords(params: {
  periodInput: PeriodInput;
  classFilter?: string;
  page?: number;
  limit?: number;
  search?: string;
});

export async function getLatenessByClass(params: { periodInput: PeriodInput });
export async function getLatenesTrend(params: { periodInput: PeriodInput });
```

Di dalamnya cukup `const { start, end } = getDateRange(params.periodInput);` — konversi zona terjadi tepat sekali, di satu tempat.

`getLatenessStats()` tidak berubah tanda tangannya (tidak menerima periode dari luar), hanya bentuk pemanggilan `getDateRange` internalnya.

- [ ] **Step 1: Ubah `src/actions/lateness.ts`**

Hapus blok `export type Period = ...` dan seluruh fungsi `getDateRange` lokal. Tambahkan di bagian import:

```ts
import {
  getDateRange,
  WIB_TIMEZONE,
  type Period,
  type PeriodInput,
} from "@/lib/reportPeriod";

export type { Period, PeriodInput, SemesterType } from "@/lib/reportPeriod";
```

Hapus juga `const WIB_TIMEZONE = "Asia/Jakarta";` lokal (baris 31) dan import date-fns yang jadi tak terpakai (`startOfWeek`, `startOfMonth`, `startOfYear`) — `startOfDay` dan `endOfDay` masih dipakai `verifyScanQR`/`recordLateness`, jangan dihapus.

Ubah setiap pemanggilan dari posisional ke objek. Contoh di `getLatenessStats`:

```ts
// Sebelum
gte: getDateRange("day").start,
// Sesudah
gte: getDateRange({ period: "day" }).start,
```

Dan di `getLatenessRecords`:

```ts
// Sebelum
const { start, end } = getDateRange(period, customStart, customEnd);
// Sesudah
const { start, end } = getDateRange({ period, customStart, customEnd });
```

- [ ] **Step 2: Ubah `src/actions/attributes.ts` dengan pola yang sama**

Hapus `export type Period` (baris 61) dan `getDateRange` lokal (baris 63-89), hapus `const WIB_TIMEZONE` (baris 28), tambah import dan re-export identik dengan Step 1. Ubah semua pemanggilan `getDateRange(period, customStart, customEnd)` menjadi bentuk objek.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: bersih. Bila ada error `Cannot find name 'startOfWeek'` berarti ada import yang terhapus tapi masih dipakai — kembalikan import tersebut.

- [ ] **Step 4: Verifikasi periode lama tidak berubah**

Run: `npx tsx scripts/verify-report-period.ts && npm run lint`
Expected: semua `OK:`, lint bersih

- [ ] **Step 5: Commit**

```bash
git add src/actions/lateness.ts src/actions/attributes.ts
git commit -m "refactor: pakai reportPeriod.ts di action keterlambatan & atribut

Menghapus getDateRange yang terduplikasi. Period tetap di-re-export
dari kedua action file agar import di komponen laporan tidak putus.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: `exportMultiSheetExcel()` di `src/utils/excelExport.ts`

**Files:**
- Modify: `src/utils/excelExport.ts` — ekstrak `buildSheetRows()` + `buildWorksheet()`, tambah `exportMultiSheetExcel()`
- Create: `scripts/verify-excel-sheets.ts`

**Interfaces:**
- Consumes: `ExcelColumn` (sudah ada, baris 21-27)
- Produces:
  ```ts
  export interface SheetSpec {
    sheetName: string;
    title?: string;
    subtitle?: string;
    data: any[];
    columns: ExcelColumn[];
    includeHeader?: boolean;
    /** false untuk sheet ringkasan yang tidak punya tabel. Default true. */
    includeColumnHeaders?: boolean;
    includeSummary?: boolean;
    summaryData?: Record<string, any>;
    /** Baris catatan kaki di bawah tabel, satu baris per string. */
    notes?: string[];
  }

  export function buildSheetRows(spec: SheetSpec): any[][];
  export function exportMultiSheetExcel(config: {
    filename: string;
    sheets: SheetSpec[];
  }): void;
  ```

**Konteks penting:** `exportToExcel()` (baris 33) dipakai enam pemanggil lain — PPDB, guru, kalender, pengguna, OSIS, kesiswaan. **Tanda tangan dan perilakunya tidak boleh berubah.** Yang dilakukan adalah mengekstrak isi perutnya menjadi `buildSheetRows()`/`buildWorksheet()`, lalu `exportToExcel()` memanggil helper itu — output byte-nya harus identik dengan sebelumnya. `notes` adalah kemampuan baru yang tidak dipakai `exportToExcel()`.

- [ ] **Step 1: Tulis script verifikasi yang gagal**

Buat `scripts/verify-excel-sheets.ts`:

```ts
import { buildSheetRows } from "../src/utils/excelExport";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAILED:", msg);
    process.exitCode = 1;
  } else {
    console.log("OK:", msg);
  }
}

console.log("Running excel sheet builder checks...");

const rows = buildSheetRows({
  sheetName: "Rekap Siswa",
  title: "LAPORAN KETERLAMBATAN SISWA",
  subtitle: "Kelas 7A - Agustus 2026",
  data: [
    { name: "Budi", class: "7A", periodCount: 4, totalCount: 11 },
    { name: "Siti", class: "7A", periodCount: 2, totalCount: 3 },
  ],
  columns: [
    { header: "Nama Siswa", key: "name", width: 30 },
    { header: "Kelas", key: "class", width: 10 },
    { header: "Terlambat (Periode)", key: "periodCount", width: 18 },
    { header: "Total Terlambat", key: "totalCount", width: 18 },
  ],
  notes: ["Poin (Periode) tidak dapat dijumlahkan antar periode."],
});

// Header laporan: judul, subjudul, tanggal export, baris kosong
assert(rows[0][0] === "LAPORAN KETERLAMBATAN SISWA", "baris 0 judul");
assert(rows[1][0] === "Kelas 7A - Agustus 2026", "baris 1 subjudul");
assert(String(rows[2][0]).startsWith("Tanggal Export:"), "baris 2 tanggal export");
assert(rows[3].length === 0, "baris 3 kosong");

// Baris header kolom, dengan kolom No otomatis di depan
assert(rows[4][0] === "No", "kolom pertama adalah No");
assert(rows[4][1] === "Nama Siswa", "kolom kedua Nama Siswa");
assert(rows[4].length === 5, "5 kolom: No + 4");

// Baris data
assert(rows[5][0] === 1, "nomor urut baris pertama");
assert(rows[5][1] === "Budi", "nama baris pertama");
assert(rows[5][3] === 4, "angka periode dipertahankan sebagai number");
assert(rows[6][0] === 2, "nomor urut baris kedua");

// Catatan kaki di paling bawah, dipisah baris kosong
const flat = rows.map((r) => String(r[0] ?? ""));
assert(
  flat.includes("Poin (Periode) tidak dapat dijumlahkan antar periode."),
  "catatan kaki ikut tercetak",
);

// Tanpa header laporan
const bare = buildSheetRows({
  sheetName: "X",
  data: [{ a: 1 }],
  columns: [{ header: "A", key: "a" }],
  includeHeader: false,
});
assert(bare[0][0] === "No" && bare[0][1] === "A", "tanpa header, baris 0 = header kolom");

// Data kosong tetap menghasilkan baris header kolom
const empty = buildSheetRows({
  sheetName: "X",
  data: [],
  columns: [{ header: "A", key: "a" }],
  includeHeader: false,
});
assert(empty.length === 1 && empty[0][1] === "A", "data kosong tetap berheader");

// Sheet ringkasan: tanpa header kolom, langsung blok RINGKASAN
const ringkasan = buildSheetRows({
  sheetName: "Ringkasan",
  data: [],
  columns: [{ header: "Keterangan", key: "k" }],
  includeHeader: false,
  includeColumnHeaders: false,
  includeSummary: true,
  summaryData: { Periode: "Agustus 2026", "Total Kejadian": 12 },
});
assert(
  !ringkasan.some((r) => r[0] === "No"),
  "sheet ringkasan tidak mencetak header kolom kosong",
);
assert(
  ringkasan.some((r) => r[0] === "RINGKASAN"),
  "sheet ringkasan memuat blok RINGKASAN",
);
assert(
  ringkasan.some((r) => r[0] === "Periode" && r[1] === "Agustus 2026"),
  "baris ringkasan berpasangan kunci-nilai",
);

console.log("Excel sheet builder checks done.");
```

- [ ] **Step 2: Jalankan untuk memastikan gagal**

Run: `npx tsx scripts/verify-excel-sheets.ts`
Expected: FAIL — `buildSheetRows is not a function` atau error import

- [ ] **Step 3: Ekstrak helper dan tambah fungsi multi-sheet**

Di `src/utils/excelExport.ts`, tambahkan setelah definisi `ExcelColumn` (baris 27):

```ts
export interface SheetSpec {
  sheetName: string;
  title?: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  columns: ExcelColumn[];
  includeHeader?: boolean;
  /** false untuk sheet ringkasan yang tidak punya tabel. Default true. */
  includeColumnHeaders?: boolean;
  includeSummary?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summaryData?: Record<string, any>;
  /** Baris catatan kaki di bawah tabel, satu baris per string. */
  notes?: string[];
}

/**
 * Bangun isi sheet sebagai array-of-arrays. Dipisah dari pembuatan
 * worksheet supaya bisa diverifikasi tanpa menyentuh berkas.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildSheetRows(spec: SheetSpec): any[][] {
  const {
    title,
    subtitle,
    data,
    columns,
    includeHeader = true,
    includeColumnHeaders = true,
    includeSummary = false,
    summaryData,
    notes,
  } = spec;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wsData: any[][] = [];

  if (includeHeader && title) {
    wsData.push([title]);
    if (subtitle) {
      wsData.push([subtitle]);
    }
    wsData.push([
      `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
    ]);
    wsData.push([]);
  }

  if (includeColumnHeaders) {
    wsData.push(["No", ...columns.map((col) => col.header)]);
  }

  data.forEach((row, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cells: any[] = [index + 1];
    columns.forEach((col) => {
      const value = getNestedValue(row, col.key);
      cells.push(col.transform ? col.transform(value, row) : (value ?? "-"));
    });
    wsData.push(cells);
  });

  if (includeSummary && summaryData) {
    wsData.push([]);
    wsData.push(["RINGKASAN"]);
    Object.entries(summaryData).forEach(([key, value]) => {
      wsData.push([key, value]);
    });
  }

  if (notes && notes.length > 0) {
    wsData.push([]);
    notes.forEach((note) => wsData.push([note]));
  }

  return wsData;
}

function buildWorksheet(spec: SheetSpec): XLSX.WorkSheet {
  const wsData = buildSheetRows(spec);
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  worksheet["!cols"] = [
    { wch: 5 },
    ...spec.columns.map((col) => ({ wch: col.width || 20 })),
  ];

  if ((spec.includeHeader ?? true) && spec.title) {
    const mergeEnd = spec.columns.length;
    worksheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: mergeEnd } }];
    if (spec.subtitle) {
      worksheet["!merges"].push({
        s: { r: 1, c: 0 },
        e: { r: 1, c: mergeEnd },
      });
    }
  }

  return worksheet;
}

/**
 * Export beberapa sheet dalam satu workbook. Dipakai laporan keterlambatan
 * dan atribut yang butuh Detail + Rekap Siswa + Ringkasan sekaligus.
 */
export function exportMultiSheetExcel(config: {
  filename: string;
  sheets: SheetSpec[];
}): void {
  const workbook = XLSX.utils.book_new();

  config.sheets.forEach((sheet) => {
    // Nama sheet Excel dibatasi 31 karakter.
    const safeName = sheet.sheetName.slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, buildWorksheet(sheet), safeName);
  });

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `${config.filename}_${dateStr}.xlsx`);
}
```

Lalu ganti isi `exportToExcel()` (baris 33-131) agar memakai helper, dengan perilaku identik:

```ts
export function exportToExcel(config: ExcelExportConfig): void {
  const worksheet = buildWorksheet(config);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, config.sheetName);

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  XLSX.writeFile(workbook, `${config.filename}_${dateStr}.xlsx`);
}
```

`ExcelExportConfig` sudah punya semua field yang dibutuhkan `SheetSpec` kecuali `notes`; tidak perlu diubah.

- [ ] **Step 4: Jalankan verifikasi sampai lulus**

Run: `npx tsx scripts/verify-excel-sheets.ts`
Expected: semua `OK:`, exit code 0

- [ ] **Step 5: Regresi manual pemanggil lama**

Buka `/dashboard-admin/users`, klik Export Excel. Berkas harus terbuka normal dengan judul, kolom No, dan data seperti sebelumnya. Ini memastikan ekstraksi helper tidak mengubah output.

- [ ] **Step 6: Lint & typecheck**

Run: `npm run lint && npx tsc --noEmit`
Expected: bersih

- [ ] **Step 7: Commit**

```bash
git add src/utils/excelExport.ts scripts/verify-excel-sheets.ts
git commit -m "feat: tambah exportMultiSheetExcel untuk workbook banyak sheet

Mengekstrak buildSheetRows/buildWorksheet agar dipakai bersama
exportToExcel. Tanda tangan exportToExcel tidak berubah sehingga
enam pemanggil lain tidak terdampak.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: `getLatenessReportForExport()` — data rekap keterlambatan

**Files:**
- Modify: `src/actions/lateness.ts` — ganti `getLatenessForExport` (baris 794-857) dengan fungsi baru; hapus juga `exportLatenessCSV` (baris 863-928) yang sudah bertanda `@deprecated` dan tidak dipanggil dari mana pun
- Create: `scripts/verify-report-points.ts`

**Interfaces:**
- Consumes: `getDateRange`, `getPeriodLabel`, `PeriodInput` (Task 1); `getLatenessPointConfig`, `calculateLatenessPoints` dari `@/lib/latenessPoints`
- Produces:
  ```ts
  export interface ReportDetailRow {
    date: Date;
    siswaName: string | null;
    nisn: string;
    class: string | null;
    time: string;          // arrivalTime
    reason: string | null;
    recordedBy: string;
    totalPoints: number;   // poin seumur hidup siswa ybs
  }

  export interface ReportRecapRow {
    siswaId: string;
    name: string | null;
    nisn: string;
    class: string | null;
    periodCount: number;
    periodPoints: number;
    totalCount: number;
    totalPoints: number;
  }

  export interface ReportSummary {
    periodLabel: string;
    classLabel: string;        // "7A" atau "Semua Kelas"
    totalRecords: number;
    totalStudents: number;
    averagePerStudent: number; // 1 desimal
    topClass: string;
    threshold: number;
    pointsPerThreshold: number;
  }

  export async function getLatenessReportForExport(params: {
    periodInput: PeriodInput;
    classFilter?: string;
    search?: string;
  }): Promise<
    | { success: true; detail: ReportDetailRow[]; recap: ReportRecapRow[]; summary: ReportSummary }
    | { success: false; error: string }
  >;
  ```

**Aturan perhitungan (spec §2):**
- `periodPoints = calculateLatenessPoints(periodCount, threshold, pointsPerThreshold)`
- `totalPoints = calculateLatenessPoints(totalCount, threshold, pointsPerThreshold)`
- `totalCount` = jumlah seumur hidup, **tidak** terpengaruh filter periode maupun kelas
- Rekap diurut `totalPoints` menurun, lalu `totalCount` menurun, lalu nama menaik (supaya urutan stabil antar export)

**Wajib: teruskan `search`.** Ini memperbaiki cacat yang ada — export lama mengabaikan kotak pencarian sehingga isi berkas tidak cocok dengan layar. Predikat `where` harus sama persis dengan `getLatenessRecords` (baris 427-440).

**Tiga query, bukan N+1:**
1. `findMany` detail dengan `include` siswa + recorder (untuk sheet Detail)
2. `groupBy({ by: ["siswaId"], _count: true })` dengan `where` yang sama (jumlah per siswa dalam periode)
3. `siswa.findMany({ where: { id: { in: ids } }, select: { ..., _count: { select: { latenessRecords: true } } } })` (identitas + jumlah seumur hidup)

- [ ] **Step 1: Tulis script verifikasi perhitungan poin**

Buat `scripts/verify-report-points.ts`. Menguji rumus poin murni, termasuk kasus sisa pembagian yang hilang — tanpa perlu DB:

```ts
import { calculateLatenessPoints } from "../src/lib/latenessPoints";
import { calculateAttributePoints } from "../src/lib/attributePoints";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAILED:", msg);
    process.exitCode = 1;
  } else {
    console.log("OK:", msg);
  }
}

console.log("Running report point checks...");

const T = 3;
const P = 2;

assert(calculateLatenessPoints(0, T, P) === 0, "0x = 0 poin");
assert(calculateLatenessPoints(2, T, P) === 0, "2x = 0 poin (belum capai threshold)");
assert(calculateLatenessPoints(3, T, P) === 2, "3x = 2 poin");
assert(calculateLatenessPoints(4, T, P) === 2, "4x = 2 poin");
assert(calculateLatenessPoints(6, T, P) === 4, "6x = 4 poin");
assert(calculateLatenessPoints(11, T, P) === 6, "11x = 6 poin");

// Kasus yang dijelaskan di spec: poin periode TIDAK dapat dijumlahkan.
// 2x Agustus + 2x September = 0 + 0 poin per periode,
// padahal lifetime 4x = 2 poin. Sisa pembagian hilang tiap pemotongan.
const agustus = calculateLatenessPoints(2, T, P);
const september = calculateLatenessPoints(2, T, P);
const lifetime = calculateLatenessPoints(4, T, P);
assert(agustus + september === 0, "jumlah poin per periode = 0");
assert(lifetime === 2, "poin lifetime = 2");
assert(
  agustus + september !== lifetime,
  "poin periode memang tidak sama dengan lifetime - catatan kaki wajib ada",
);

// threshold tidak wajar tidak boleh membuat NaN/Infinity
assert(calculateLatenessPoints(5, 0, P) === 0, "threshold 0 aman");
assert(calculateLatenessPoints(-1, T, P) === 0, "count negatif aman");

// Atribut memakai rumus yang sama
assert(calculateAttributePoints(3, T, P) === 2, "atribut 3x = 2 poin");
assert(calculateAttributePoints(2, T, P) === 0, "atribut 2x = 0 poin");

console.log("Report point checks done.");
```

- [ ] **Step 2: Jalankan — script ini harus LULUS sejak awal**

Run: `npx tsx scripts/verify-report-points.ts`
Expected: semua `OK:`

Berbeda dari task lain, ini bukan test yang gagal dulu — fungsinya sudah ada. Script ini mengunci perilaku yang diandalkan Task 4 dan mendokumentasikan kasus sisa pembagian, supaya kalau nanti ada yang "memperbaiki" rumus poin, kegagalannya ketahuan.

- [ ] **Step 3: Implementasikan `getLatenessReportForExport`**

Ganti seluruh `getLatenessForExport` di `src/actions/lateness.ts`:

```ts
export interface ReportDetailRow {
  date: Date;
  siswaName: string | null;
  nisn: string;
  class: string | null;
  time: string;
  reason: string | null;
  recordedBy: string;
  totalPoints: number;
}

export interface ReportRecapRow {
  siswaId: string;
  name: string | null;
  nisn: string;
  class: string | null;
  periodCount: number;
  periodPoints: number;
  totalCount: number;
  totalPoints: number;
}

export interface ReportSummary {
  periodLabel: string;
  classLabel: string;
  totalRecords: number;
  totalStudents: number;
  averagePerStudent: number;
  topClass: string;
  threshold: number;
  pointsPerThreshold: number;
}

/**
 * Data lengkap untuk export tiga sheet: Detail, Rekap Siswa, Ringkasan.
 * Menggantikan getLatenessForExport() yang hanya mengembalikan baris
 * kejadian dan mengabaikan kotak pencarian.
 */
export async function getLatenessReportForExport(params: {
  periodInput: PeriodInput;
  classFilter?: string;
  search?: string;
}) {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false as const, error: auth.error! };
  }

  const { periodInput, classFilter, search } = params;

  try {
    const { start, end } = getDateRange(periodInput);
    const { threshold, pointsPerThreshold } = await getLatenessPointConfig();

    // Predikat sama persis dengan getLatenessRecords agar isi export
    // cocok dengan yang terlihat di layar.
    const where: Prisma.LatenessRecordWhereInput = {
      date: { gte: start, lte: end },
    };

    if (classFilter && classFilter !== "all") {
      where.siswa = { class: classFilter };
    }

    if (search) {
      where.OR = [
        { siswa: { name: { contains: search, mode: "insensitive" } } },
        { siswa: { nisn: { contains: search } } },
      ];
    }

    const [records, grouped] = await Promise.all([
      prisma.latenessRecord.findMany({
        where,
        include: {
          siswa: { select: { id: true, name: true, nisn: true, class: true } },
          recorder: {
            select: {
              username: true,
              siswa: { select: { name: true } },
              kesiswaan: { select: { name: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.latenessRecord.groupBy({
        by: ["siswaId"],
        where,
        _count: { _all: true },
      }),
    ]);

    const siswaIds = grouped.map((g) => g.siswaId);

    // Jumlah seumur hidup: sengaja TANPA filter periode/kelas.
    const students =
      siswaIds.length > 0
        ? await prisma.siswa.findMany({
            where: { id: { in: siswaIds } },
            select: {
              id: true,
              name: true,
              nisn: true,
              class: true,
              _count: { select: { latenessRecords: true } },
            },
          })
        : [];

    const studentById = new Map(students.map((s) => [s.id, s]));
    const periodCountById = new Map(
      grouped.map((g) => [g.siswaId, g._count._all]),
    );

    const recap: ReportRecapRow[] = students
      .map((s) => {
        const periodCount = periodCountById.get(s.id) ?? 0;
        const totalCount = s._count.latenessRecords;
        return {
          siswaId: s.id,
          name: s.name,
          nisn: s.nisn,
          class: s.class,
          periodCount,
          periodPoints: calculateLatenessPoints(
            periodCount,
            threshold,
            pointsPerThreshold,
          ),
          totalCount,
          totalPoints: calculateLatenessPoints(
            totalCount,
            threshold,
            pointsPerThreshold,
          ),
        };
      })
      // Urutan stabil: poin, lalu jumlah, lalu nama.
      .sort(
        (a, b) =>
          b.totalPoints - a.totalPoints ||
          b.totalCount - a.totalCount ||
          (a.name || "").localeCompare(b.name || ""),
      );

    const totalPointsById = new Map(recap.map((r) => [r.siswaId, r.totalPoints]));

    const detail: ReportDetailRow[] = records.map((r) => ({
      date: r.date,
      siswaName: r.siswa.name,
      nisn: r.siswa.nisn,
      class: r.siswa.class,
      time: r.arrivalTime,
      reason: r.reason,
      recordedBy:
        r.recorder.siswa?.name ||
        r.recorder.kesiswaan?.name ||
        r.recorder.username,
      totalPoints: totalPointsById.get(r.siswa.id) ?? 0,
    }));

    const byClass: Record<string, number> = {};
    records.forEach((r) => {
      const cls = r.siswa.class || "Tanpa Kelas";
      byClass[cls] = (byClass[cls] || 0) + 1;
    });
    const topClass =
      Object.entries(byClass).sort(([, a], [, b]) => b - a)[0]?.[0] || "-";

    const summary: ReportSummary = {
      periodLabel: getPeriodLabel(periodInput),
      classLabel:
        classFilter && classFilter !== "all" ? classFilter : "Semua Kelas",
      totalRecords: records.length,
      totalStudents: recap.length,
      averagePerStudent:
        recap.length > 0
          ? Number((records.length / recap.length).toFixed(1))
          : 0,
      topClass,
      threshold,
      pointsPerThreshold,
    };

    return { success: true as const, detail, recap, summary };
  } catch (error) {
    console.error("Error building lateness report:", error);
    return { success: false as const, error: "Gagal mengambil data export" };
  }
}
```

Tambahkan `getPeriodLabel` ke import dari `@/lib/reportPeriod`. Hapus `exportLatenessCSV` — bertanda `@deprecated` dan `grep` memastikan tidak ada pemanggil.

- [ ] **Step 4: Pastikan tidak ada pemanggil lama yang tertinggal**

Run: `grep -rn "getLatenessForExport\|exportLatenessCSV" src/`
Expected: hanya kemunculan di `LatenessReportsContent.tsx` (akan diganti di Task 6). Bila ada di berkas lain, ubah juga.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: hanya error di `LatenessReportsContent.tsx` karena masih memanggil fungsi lama — itu wajar, dibereskan di Task 6. Tidak boleh ada error lain.

- [ ] **Step 6: Commit**

```bash
git add src/actions/lateness.ts scripts/verify-report-points.ts
git commit -m "feat: getLatenessReportForExport dengan rekap poin per siswa

Mengembalikan detail, rekap per siswa, dan ringkasan dalam tiga query
agregat. Kotak pencarian kini ikut diteruskan sehingga isi export cocok
dengan yang terlihat di layar. Menghapus exportLatenessCSV yang
deprecated dan tanpa pemanggil.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: `getAttributeReportForExport()` — data rekap atribut

**Files:**
- Modify: `src/actions/attributes.ts` — ganti `getAttributeViolationsForExport` (baris 901-956)

**Interfaces:**
- Consumes: tipe `ReportRecapRow`/`ReportSummary` — **definisikan ulang di sini dengan nama berbeda**, jangan import dari `lateness.ts` (dua server action file saling import akan membingungkan; tipe atribut juga punya field tambahan)
- Produces:
  ```ts
  export interface AttributeDetailRow {
    date: Date;
    siswaName: string | null;
    nisn: string;
    class: string | null;
    time: string;              // scanTime
    attributesLabel: string;   // "Dasi, Topi"
    notes: string | null;
    recordedBy: string;
    totalPoints: number;
  }

  export interface AttributeRecapRow {
    siswaId: string;
    name: string | null;
    nisn: string;
    class: string | null;
    periodCount: number;
    periodPoints: number;
    totalCount: number;
    totalPoints: number;
    topAttribute: string;   // atribut tersering dalam periode
  }

  export async function getAttributeReportForExport(params: {
    periodInput: PeriodInput;
    classFilter?: string;
    search?: string;
  }): Promise<
    | { success: true; detail: AttributeDetailRow[]; recap: AttributeRecapRow[]; summary: ReportSummary }
    | { success: false; error: string }
  >;
  ```

`ReportSummary` untuk atribut punya bentuk sama seperti Task 4 — definisikan ulang di file ini dengan nama `ReportSummary` (masing-masing file punya salinannya sendiri; keduanya tidak saling import).

**Perbedaan dari Task 4:**
- Tabel `attributeViolation`, relasi `attributeViolations` pada `Siswa`, konfigurasi `getAttributePointConfig()`, rumus `calculateAttributePoints()`
- `detail` butuh `include: { items: { include: { attributeItem: { select: { name: true, order: true } } } } }`
- **`topAttribute`:** atribut yang paling sering muncul pada pelanggaran siswa tsb **dalam periode terpilih**. Bila seri, ambil `AttributeItem.order` terkecil supaya hasil stabil antar export. Dihitung dari `records` yang sudah ter-fetch — **tanpa query tambahan**.

- [ ] **Step 1: Implementasikan fungsi**

Struktur identik dengan Task 4. Bagian yang berbeda — hitung `topAttribute` dari data yang sudah ada:

```ts
    // Atribut tersering per siswa, dihitung dari records yang sudah
    // ter-fetch untuk sheet Detail. Seri diputus oleh AttributeItem.order
    // terkecil supaya urutannya stabil antar export.
    const attrTallyBySiswa = new Map<string, Map<string, { count: number; order: number }>>();
    records.forEach((r) => {
      const tally =
        attrTallyBySiswa.get(r.siswa.id) ??
        new Map<string, { count: number; order: number }>();
      r.items.forEach((i) => {
        const name = i.attributeItem.name;
        const prev = tally.get(name);
        tally.set(name, {
          count: (prev?.count ?? 0) + 1,
          order: i.attributeItem.order,
        });
      });
      attrTallyBySiswa.set(r.siswa.id, tally);
    });

    function topAttributeFor(siswaId: string): string {
      const tally = attrTallyBySiswa.get(siswaId);
      if (!tally || tally.size === 0) return "-";
      return [...tally.entries()].sort(
        ([, a], [, b]) => b.count - a.count || a.order - b.order,
      )[0][0];
    }
```

`detail` memakai `attributesLabel: r.items.map((i) => i.attributeItem.name).join(", ")`, seperti fungsi lama (baris 943). Sisanya — `groupBy`, `siswa.findMany` dengan `_count.attributeViolations`, penyusunan `recap`, `summary`, penerusan `search` — mengikuti Task 4 persis.

- [ ] **Step 2: Pastikan tidak ada pemanggil lama tertinggal**

Run: `grep -rn "getAttributeViolationsForExport" src/`
Expected: hanya di `AttributeReportsContent.tsx` (diganti di Task 7)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: hanya error di kedua komponen laporan (belum diperbarui). Tidak ada error lain.

- [ ] **Step 4: Commit**

```bash
git add src/actions/attributes.ts
git commit -m "feat: getAttributeReportForExport dengan rekap poin per siswa

Sejajar dengan getLatenessReportForExport, ditambah kolom atribut
tersering yang dihitung dari data yang sudah ter-fetch tanpa query
tambahan.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: `PeriodFilter` — komponen pemilih periode bersama

Blok filter periode di `LatenessReportsContent.tsx:372-410` dan `AttributeReportsContent.tsx:372-408` hampir identik. Menambah tiga sub-pemilih di dua tempat berarti menduplikasi logika yang tidak sepele. Ekstrak lebih dulu.

**Files:**
- Create: `src/components/dashboard/kesiswaan/PeriodFilter.tsx`

**Interfaces:**
- Consumes: `Period`, `SemesterType`, `PeriodInput`, `getCurrentAcademicYear`, `getAcademicYearLabel` dari `@/lib/reportPeriod`
- Produces:
  ```ts
  export interface PeriodFilterValue {
    period: Period;
    customStart: string;      // "YYYY-MM-DD"
    customEnd: string;
    month: number;            // 0-11
    year: number;
    semester: SemesterType;
    academicYear: number;
  }

  export function createDefaultPeriodValue(): PeriodFilterValue;

  /** Ubah state UI menjadi PeriodInput untuk server action. */
  export function toPeriodInput(v: PeriodFilterValue): PeriodInput;

  /** false bila sub-pemilih belum lengkap — tombol export dinonaktifkan. */
  export function isPeriodValueComplete(v: PeriodFilterValue): boolean;

  export default function PeriodFilter(props: {
    value: PeriodFilterValue;
    onChange: (next: PeriodFilterValue) => void;
    academicYears: number[];
  }): JSX.Element;
  ```

**Catatan:** `PeriodFilter.tsx` adalah komponen klien (`"use client"`) yang meng-import dari `@/lib/reportPeriod`. Lib itu murni tanpa Prisma dan tanpa `"use server"`, jadi aman di-bundle ke klien.

**Perilaku:**
- Dropdown periode: `Hari Ini`, `Minggu Ini`, `Bulan Ini`, `Bulan Tertentu`, `Semester`, `Tahun Ajaran`, `Tahun Ini`, `Range Tanggal`
- `specificMonth` → dua select: bulan (nama Indonesia, `Januari`–`Desember`) dan tahun (dari `academicYears`, ditambah `+1` agar semester genap terjangkau)
- `semester` → select `Ganjil`/`Genap` + select tahun ajaran berlabel `getAcademicYearLabel()`
- `academicYear` → select tahun ajaran
- `custom` → dua `<input type="date">` seperti sekarang
- `isPeriodValueComplete` mengembalikan `false` untuk `custom` bila salah satu tanggal kosong; periode lain selalu lengkap karena state selalu berisi default
- Gaya visual mengikuti yang ada: `px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500`, dibungkus `animate-in fade-in slide-in-from-left-4` seperti input custom sekarang

- [ ] **Step 1: Buat komponen**

```tsx
"use client";

import { Calendar } from "lucide-react";
import {
  getAcademicYearLabel,
  getCurrentAcademicYear,
  type Period,
  type PeriodInput,
  type SemesterType,
} from "@/lib/reportPeriod";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export interface PeriodFilterValue {
  period: Period;
  customStart: string;
  customEnd: string;
  month: number;
  year: number;
  semester: SemesterType;
  academicYear: number;
}

export function createDefaultPeriodValue(): PeriodFilterValue {
  const now = new Date();
  return {
    period: "week",
    customStart: "",
    customEnd: "",
    month: now.getMonth(),
    year: now.getFullYear(),
    semester: now.getMonth() >= 6 ? "GANJIL" : "GENAP",
    academicYear: getCurrentAcademicYear(now),
  };
}

export function toPeriodInput(v: PeriodFilterValue): PeriodInput {
  switch (v.period) {
    case "custom":
      return {
        period: "custom",
        customStart: v.customStart ? new Date(v.customStart) : undefined,
        customEnd: v.customEnd ? new Date(v.customEnd) : undefined,
      };
    case "specificMonth":
      return { period: "specificMonth", month: v.month, year: v.year };
    case "semester":
      return {
        period: "semester",
        semester: v.semester,
        academicYear: v.academicYear,
      };
    case "academicYear":
      return { period: "academicYear", academicYear: v.academicYear };
    default:
      return { period: v.period };
  }
}

export function isPeriodValueComplete(v: PeriodFilterValue): boolean {
  if (v.period === "custom") {
    return Boolean(v.customStart && v.customEnd);
  }
  return true;
}

const SELECT_CLASS =
  "px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500";

export default function PeriodFilter({
  value,
  onChange,
  academicYears,
}: {
  value: PeriodFilterValue;
  onChange: (next: PeriodFilterValue) => void;
  academicYears: number[];
}) {
  const set = (patch: Partial<PeriodFilterValue>) =>
    onChange({ ...value, ...patch });

  // Semester genap jatuh di tahun berikutnya, jadi daftar tahun kalender
  // perlu satu tahun ekstra di ujung.
  const calendarYears = [
    ...academicYears,
    (academicYears[academicYears.length - 1] ?? getCurrentAcademicYear()) + 1,
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        <select
          value={value.period}
          onChange={(e) => set({ period: e.target.value as Period })}
          className={SELECT_CLASS}
        >
          <option value="day">Hari Ini</option>
          <option value="week">Minggu Ini</option>
          <option value="month">Bulan Ini</option>
          <option value="specificMonth">Bulan Tertentu</option>
          <option value="semester">Semester</option>
          <option value="academicYear">Tahun Ajaran</option>
          <option value="year">Tahun Ini</option>
          <option value="custom">Range Tanggal</option>
        </select>
      </div>

      {value.period === "specificMonth" && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
          <select
            value={value.month}
            onChange={(e) => set({ month: Number(e.target.value) })}
            className={SELECT_CLASS}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={value.year}
            onChange={(e) => set({ year: Number(e.target.value) })}
            className={SELECT_CLASS}
          >
            {calendarYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.period === "semester" && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
          <select
            value={value.semester}
            onChange={(e) => set({ semester: e.target.value as SemesterType })}
            className={SELECT_CLASS}
          >
            <option value="GANJIL">Ganjil (Jul-Des)</option>
            <option value="GENAP">Genap (Jan-Jun)</option>
          </select>
          <select
            value={value.academicYear}
            onChange={(e) => set({ academicYear: Number(e.target.value) })}
            className={SELECT_CLASS}
          >
            {academicYears.map((y) => (
              <option key={y} value={y}>
                {getAcademicYearLabel(y)}
              </option>
            ))}
          </select>
        </div>
      )}

      {value.period === "academicYear" && (
        <select
          value={value.academicYear}
          onChange={(e) => set({ academicYear: Number(e.target.value) })}
          className={`${SELECT_CLASS} animate-in fade-in slide-in-from-left-4`}
        >
          {academicYears.map((y) => (
            <option key={y} value={y}>
              {getAcademicYearLabel(y)}
            </option>
          ))}
        </select>
      )}

      {value.period === "custom" && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
          <input
            type="date"
            value={value.customStart}
            onChange={(e) => set({ customStart: e.target.value })}
            className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={value.customEnd}
            onChange={(e) => set({ customEnd: e.target.value })}
            className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Tambah action `getAvailableAcademicYears`**

Daftar tahun ajaran diisi dari data yang benar-benar ada, bukan daftar statis. Tambahkan ke `src/actions/lateness.ts`, di dekat `getAvailableClasses` (baris 767):

```ts
/**
 * Daftar tahun ajaran yang punya data, dari record terlama sampai tahun
 * ajaran berjalan. Satu query ringan (agregat MIN pada kolom terindeks).
 */
export async function getAvailableAcademicYears() {
  const auth = await verifyKesiswaanAccess();
  if (!auth.authorized) {
    return { success: false, error: auth.error, years: [] };
  }

  try {
    const oldest = await prisma.latenessRecord.aggregate({
      _min: { date: true },
    });

    const current = getCurrentAcademicYear();
    const earliest = oldest._min.date
      ? getCurrentAcademicYear(oldest._min.date)
      : current;

    const years: number[] = [];
    for (let y = current; y >= earliest; y--) {
      years.push(y);
    }

    return { success: true, years };
  } catch (error) {
    console.error("Error getting academic years:", error);
    return { success: false, error: "Gagal mengambil tahun ajaran", years: [] };
  }
}
```

Tambahkan `getCurrentAcademicYear` ke import dari `@/lib/reportPeriod`. Tambahkan fungsi setara di `src/actions/attributes.ts`, memakai `prisma.attributeViolation.aggregate`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: hanya error di kedua komponen laporan (belum diperbarui)

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/kesiswaan/PeriodFilter.tsx src/actions/lateness.ts src/actions/attributes.ts
git commit -m "feat: komponen PeriodFilter bersama + daftar tahun ajaran

Mengekstrak blok filter periode yang terduplikasi di dua komponen
laporan, ditambah sub-pemilih untuk bulan tertentu, semester, dan
tahun ajaran. Daftar tahun ajaran diturunkan dari record terlama.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Sambungkan `LatenessReportsContent.tsx`

**Files:**
- Modify: `src/components/dashboard/kesiswaan/LatenessReportsContent.tsx`

**Interfaces:**
- Consumes: `PeriodFilter`, `PeriodFilterValue`, `createDefaultPeriodValue`, `toPeriodInput`, `isPeriodValueComplete` (Task 6); `getLatenessReportForExport` (Task 4); `getAvailableAcademicYears` (Task 6); `exportMultiSheetExcel`, `SheetSpec` (Task 3); `getPeriodFilenameSlug` (Task 1)

**Perubahan state:** Ganti tiga state `period`/`customStart`/`customEnd` (baris 80-82) dengan satu:

```ts
const [periodValue, setPeriodValue] = useState<PeriodFilterValue>(
  createDefaultPeriodValue,
);
const [academicYears, setAcademicYears] = useState<number[]>([]);
```

Fungsi daftar & chart kini menerima `PeriodInput` (Task 2), jadi komponen cukup meneruskan hasil `toPeriodInput(periodValue)` — **jangan** menghitung `{start, end}` di komponen lalu mengirimnya sebagai rentang custom, karena itu memicu konversi zona ganda.

```ts
const periodInput = toPeriodInput(periodValue);

const recordsResult = await getLatenessRecords({
  periodInput,
  classFilter: classFilter === "all" ? undefined : classFilter,
  page,
  limit: 20,
  search: searchTerm,
});

if (page === 1) {
  const [trendRes, classRes] = await Promise.all([
    getLatenesTrend({ periodInput }),
    getLatenessByClass({ periodInput }),
  ]);

  if (trendRes.success) setTrendData(trendRes.data || []);
  if (classRes.success) setClassData(classRes.data || []);
}
```

`getDateRange` tidak perlu di-import ke komponen ini.

Array dependensi `useEffect` (baris 172) berubah dari `[period, classFilter, page, customStart, customEnd, searchTerm]` menjadi `[periodValue, classFilter, page, searchTerm]`.

- [ ] **Step 1: Ganti blok filter dengan `<PeriodFilter />`**

Hapus baris 372-410 (blok Period Filter beserta input custom), ganti dengan:

```tsx
<PeriodFilter
  value={periodValue}
  onChange={(next) => {
    setPeriodValue(next);
    setPage(1);
  }}
  academicYears={academicYears}
/>
```

- [ ] **Step 2: Muat daftar tahun ajaran saat mount**

Tambahkan di dekat `fetchClasses` (baris 103-111):

```ts
useEffect(() => {
  async function fetchYears() {
    const result = await getAvailableAcademicYears();
    if (result.success && result.years.length > 0) {
      setAcademicYears(result.years);
    }
  }
  fetchYears();
}, []);
```

- [ ] **Step 3: Tulis ulang `handleExport` dengan tiga sheet**

Ganti seluruh `handleExport` (baris 197-291):

```tsx
const handleExport = async () => {
  setIsExporting(true);
  try {
    const periodInput = toPeriodInput(periodValue);

    const result = await getLatenessReportForExport({
      periodInput,
      classFilter: classFilter === "all" ? undefined : classFilter,
      search: searchTerm || undefined,
    });

    if (!result.success) {
      toast.error(result.error || "Gagal mengambil data export");
      return;
    }

    const { detail, recap, summary } = result;

    if (detail.length === 0) {
      toast("Tidak ada data pada periode ini. Berkas tetap dibuat.", {
        icon: "⚠️",
      });
    }

    const headerTitle = "LAPORAN KETERLAMBATAN SISWA";
    const headerSubtitle = `${summary.classLabel} — ${summary.periodLabel}`;
    const pointRule = `Setiap ${summary.threshold}x keterlambatan = ${summary.pointsPerThreshold} poin.`;

    const sheets: SheetSpec[] = [
      {
        sheetName: "Detail",
        title: headerTitle,
        subtitle: headerSubtitle,
        data: detail,
        columns: [
          {
            header: "Tanggal",
            key: "date",
            width: 15,
            transform: (val) => formatExcelDate(val),
          },
          { header: "Nama Siswa", key: "siswaName", width: 30 },
          { header: "NISN", key: "nisn", width: 15 },
          { header: "Kelas", key: "class", width: 10 },
          {
            header: "Jam Tiba",
            key: "time",
            width: 12,
            transform: (val) => val || "-",
          },
          {
            header: "Alasan",
            key: "reason",
            width: 35,
            transform: (val) => val || "-",
          },
          { header: "Dicatat Oleh", key: "recordedBy", width: 18 },
          { header: "Total Poin Siswa", key: "totalPoints", width: 16 },
        ],
        notes: [
          "Catatan: kolom Total Poin Siswa adalah poin seumur hidup siswa tersebut,",
          "melekat pada siswa dan bukan pada kejadian - kolom ini tidak boleh dijumlahkan.",
        ],
      },
      {
        sheetName: "Rekap Siswa",
        title: headerTitle,
        subtitle: `Rekap per Siswa — ${headerSubtitle}`,
        data: recap,
        columns: [
          { header: "Nama Siswa", key: "name", width: 30 },
          { header: "NISN", key: "nisn", width: 15 },
          { header: "Kelas", key: "class", width: 10 },
          { header: "Terlambat (Periode)", key: "periodCount", width: 18 },
          { header: "Poin (Periode)", key: "periodPoints", width: 15 },
          { header: "Total Terlambat", key: "totalCount", width: 16 },
          { header: "Total Poin", key: "totalPoints", width: 12 },
        ],
        notes: [
          pointRule,
          "Total Poin adalah angka resmi pembinaan, sama dengan yang tampil di dashboard.",
          "Poin (Periode) hanya indikator intensitas periode ini dan TIDAK dapat",
          "dijumlahkan antar periode: sisa pembagian hilang setiap kali dipotong.",
        ],
      },
      {
        sheetName: "Ringkasan",
        title: headerTitle,
        subtitle: headerSubtitle,
        data: [],
        columns: [{ header: "Keterangan", key: "k", width: 32 }],
        includeColumnHeaders: false,
        includeSummary: true,
        summaryData: {
          Periode: summary.periodLabel,
          Kelas: summary.classLabel,
          "Total Kejadian": summary.totalRecords,
          "Jumlah Siswa Terlibat": summary.totalStudents,
          "Rata-rata per Siswa": summary.averagePerStudent,
          "Kelas Terbanyak": summary.topClass,
          "Aturan Poin": pointRule,
        },
        notes: [
          "Poin (Periode) di sheet Rekap Siswa tidak dapat dijumlahkan antar periode.",
          "Gunakan Total Poin sebagai angka resmi pembinaan.",
        ],
      },
    ];

    const classSlug =
      classFilter === "all" ? "Semua-Kelas" : classFilter.replace(/\s+/g, "-");

    exportMultiSheetExcel({
      filename: `Laporan_Keterlambatan_${classSlug}_${getPeriodFilenameSlug(periodInput)}`,
      sheets,
    });

    toast.success("Data berhasil diexport ke Excel!");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Terjadi kesalahan saat export");
  } finally {
    setIsExporting(false);
  }
};
```

Perhatikan `finally` — kode lama tidak memakainya, sehingga `isExporting` tersangkut `true` selamanya bila terjadi error di tengah jalan. Ini diperbaiki sekalian.

- [ ] **Step 4: Perbaiki syarat nonaktif tombol export**

Baris 318 sekarang `disabled={isExporting || records.length === 0}`, sehingga periode kosong tidak bisa di-export sama sekali — padahal wali kelas justru butuh bukti bahwa periode itu nihil. Ganti:

```tsx
disabled={isExporting || !isPeriodValueComplete(periodValue)}
```

- [ ] **Step 5: Perbarui import**

```ts
import {
  getLatenessRecords,
  getLatenessStats,
  getLatenesTrend,
  getLatenessByClass,
  getAvailableClasses,
  getAvailableAcademicYears,
  getLatenessReportForExport,
  getLatenessPointsSummary,
} from "@/actions/lateness";
import { getPeriodFilenameSlug } from "@/lib/reportPeriod";
import PeriodFilter, {
  createDefaultPeriodValue,
  toPeriodInput,
  isPeriodValueComplete,
  type PeriodFilterValue,
} from "./PeriodFilter";
import {
  exportMultiSheetExcel,
  formatExcelDate,
  type SheetSpec,
} from "@/utils/excelExport";
```

`exportToExcel` tidak lagi dipakai di berkas ini — hapus dari import. `Period` juga tidak lagi dipakai langsung (tersembunyi di dalam `PeriodFilterValue`) — hapus agar lint tidak mengeluh soal import tak terpakai.

- [ ] **Step 6: Typecheck & lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: bersih untuk berkas ini; `AttributeReportsContent.tsx` masih error sampai Task 8

- [ ] **Step 7: Verifikasi manual**

Jalankan `npm run dev`, buka `/dashboard-kesiswaan/keterlambatan`:
1. Pilih `Bulan Tertentu` → bulan lampau yang ada datanya → tabel terisi
2. Pilih kelas tertentu → klik Export Excel
3. Buka berkas: tiga sheet ada, nama berkas memuat kelas dan periode
4. **Cocokkan `Total Poin` di sheet Rekap dengan angka di tabel "Poin Keterlambatan Siswa" pada layar — harus sama persis**
5. Ketik nama di kotak pencarian → export → berkas hanya berisi siswa itu (perbaikan cacat lama)
6. Pilih periode tanpa data → export tetap menghasilkan berkas dengan sheet Ringkasan terisi

- [ ] **Step 8: Commit**

```bash
git add src/components/dashboard/kesiswaan/LatenessReportsContent.tsx
git commit -m "feat: export tiga sheet & periode akademik di laporan keterlambatan

Rekap per siswa dengan poin periode dan poin seumur hidup, filter
bulan/semester/tahun ajaran, nama berkas mengikuti kelas dan periode.
Tombol export tidak lagi mati saat periode kosong, dan isExporting
kini di-reset lewat finally.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Sambungkan `AttributeReportsContent.tsx`

**Files:**
- Modify: `src/components/dashboard/kesiswaan/AttributeReportsContent.tsx`

**Interfaces:**
- Consumes: sama dengan Task 7, tetapi `getAttributeReportForExport` dan `getAvailableAcademicYears` dari `@/actions/attributes`

Struktur sejajar dengan Task 7, tetapi ditulis lengkap di sini karena task dapat dikerjakan tanpa membaca Task 7.

- [ ] **Step 1: Ganti state periode**

Ganti `period`/`customStart`/`customEnd` (baris 83-85) dengan:

```ts
const [periodValue, setPeriodValue] = useState<PeriodFilterValue>(
  createDefaultPeriodValue,
);
const [academicYears, setAcademicYears] = useState<number[]>([]);
```

- [ ] **Step 2: Perbarui import**

```ts
import {
  getAttributeViolations,
  getAttributeStats,
  getAttributeViolationTrend,
  getAttributeViolationsByClass,
  getMostViolatedAttributes,
  getAvailableClasses,
  getAvailableAcademicYears,
  getAttributeReportForExport,
  getAttributePointsSummary,
} from "@/actions/attributes";
import { getPeriodFilenameSlug } from "@/lib/reportPeriod";
import PeriodFilter, {
  createDefaultPeriodValue,
  toPeriodInput,
  isPeriodValueComplete,
  type PeriodFilterValue,
} from "./PeriodFilter";
import {
  exportMultiSheetExcel,
  formatExcelDate,
  type SheetSpec,
} from "@/utils/excelExport";
```

`exportToExcel` dan `Period` tidak lagi dipakai — hapus dari import.

- [ ] **Step 3: Teruskan `PeriodInput` ke fungsi daftar & chart**

Di `useEffect` pengambil data (baris 125-170), ganti perhitungan `start`/`end`. Fungsi-fungsi ini kini menerima `PeriodInput` (Task 2) — **jangan** menghitung `{start, end}` di komponen lalu mengirimnya sebagai rentang custom, karena itu memicu konversi zona ganda:

```ts
const periodInput = toPeriodInput(periodValue);

const recordsResult = await getAttributeViolations({
  periodInput,
  classFilter: classFilter === "all" ? undefined : classFilter,
  page,
  limit: 20,
  search: searchTerm,
});

if (page === 1) {
  const [trendRes, classRes, attrRes] = await Promise.all([
    getAttributeViolationTrend({ periodInput }),
    getAttributeViolationsByClass({ periodInput }),
    getMostViolatedAttributes({ periodInput }),
  ]);

  if (trendRes.success) setTrendData(trendRes.data || []);
  if (classRes.success) setClassData(classRes.data || []);
  if (attrRes.success) setAttributeData(attrRes.data || []);
}
```

Ubah array dependensi (baris 170) dari `[period, classFilter, page, customStart, customEnd, searchTerm]` menjadi `[periodValue, classFilter, page, searchTerm]`.

- [ ] **Step 4: Muat daftar tahun ajaran saat mount**

Tambahkan di dekat `fetchClasses` (baris 105-113):

```ts
useEffect(() => {
  async function fetchYears() {
    const result = await getAvailableAcademicYears();
    if (result.success && result.years.length > 0) {
      setAcademicYears(result.years);
    }
  }
  fetchYears();
}, []);
```

- [ ] **Step 5: Ganti blok filter dengan `<PeriodFilter />`**

Hapus baris 372-408 (blok Period Filter beserta input custom), ganti dengan:

```tsx
<PeriodFilter
  value={periodValue}
  onChange={(next) => {
    setPeriodValue(next);
    setPage(1);
  }}
  academicYears={academicYears}
/>
```

- [ ] **Step 6: Tulis ulang `handleExport`**

Ganti seluruh `handleExport` (baris 193-293):

```tsx
const handleExport = async () => {
  setIsExporting(true);
  try {
    const periodInput = toPeriodInput(periodValue);

    const result = await getAttributeReportForExport({
      periodInput,
      classFilter: classFilter === "all" ? undefined : classFilter,
      search: searchTerm || undefined,
    });

    if (!result.success) {
      toast.error(result.error || "Gagal mengambil data export");
      return;
    }

    const { detail, recap, summary } = result;

    if (detail.length === 0) {
      toast("Tidak ada data pada periode ini. Berkas tetap dibuat.", {
        icon: "⚠️",
      });
    }

    const headerTitle = "LAPORAN PELANGGARAN ATRIBUT SISWA";
    const headerSubtitle = `${summary.classLabel} — ${summary.periodLabel}`;
    const pointRule = `Setiap ${summary.threshold}x pelanggaran atribut = ${summary.pointsPerThreshold} poin.`;

    const sheets: SheetSpec[] = [
      {
        sheetName: "Detail",
        title: headerTitle,
        subtitle: headerSubtitle,
        data: detail,
        columns: [
          {
            header: "Tanggal",
            key: "date",
            width: 15,
            transform: (val) => formatExcelDate(val),
          },
          { header: "Nama Siswa", key: "siswaName", width: 30 },
          { header: "NISN", key: "nisn", width: 15 },
          { header: "Kelas", key: "class", width: 10 },
          {
            header: "Jam",
            key: "time",
            width: 12,
            transform: (val) => val || "-",
          },
          {
            header: "Atribut Dilanggar",
            key: "attributesLabel",
            width: 35,
            transform: (val) => val || "-",
          },
          {
            header: "Catatan",
            key: "notes",
            width: 30,
            transform: (val) => val || "-",
          },
          { header: "Dicatat Oleh", key: "recordedBy", width: 18 },
          { header: "Total Poin Siswa", key: "totalPoints", width: 16 },
        ],
        notes: [
          "Catatan: kolom Total Poin Siswa adalah poin seumur hidup siswa tersebut,",
          "melekat pada siswa dan bukan pada kejadian - kolom ini tidak boleh dijumlahkan.",
        ],
      },
      {
        sheetName: "Rekap Siswa",
        title: headerTitle,
        subtitle: `Rekap per Siswa — ${headerSubtitle}`,
        data: recap,
        columns: [
          { header: "Nama Siswa", key: "name", width: 30 },
          { header: "NISN", key: "nisn", width: 15 },
          { header: "Kelas", key: "class", width: 10 },
          { header: "Pelanggaran (Periode)", key: "periodCount", width: 20 },
          { header: "Poin (Periode)", key: "periodPoints", width: 15 },
          { header: "Total Pelanggaran", key: "totalCount", width: 18 },
          { header: "Total Poin", key: "totalPoints", width: 12 },
          { header: "Atribut Tersering", key: "topAttribute", width: 20 },
        ],
        notes: [
          pointRule,
          "Total Poin adalah angka resmi pembinaan, sama dengan yang tampil di dashboard.",
          "Poin (Periode) hanya indikator intensitas periode ini dan TIDAK dapat",
          "dijumlahkan antar periode: sisa pembagian hilang setiap kali dipotong.",
          "Atribut Tersering dihitung dari pelanggaran dalam periode terpilih saja.",
        ],
      },
      {
        sheetName: "Ringkasan",
        title: headerTitle,
        subtitle: headerSubtitle,
        data: [],
        columns: [{ header: "Keterangan", key: "k", width: 32 }],
        includeColumnHeaders: false,
        includeSummary: true,
        summaryData: {
          Periode: summary.periodLabel,
          Kelas: summary.classLabel,
          "Total Kejadian": summary.totalRecords,
          "Jumlah Siswa Terlibat": summary.totalStudents,
          "Rata-rata per Siswa": summary.averagePerStudent,
          "Kelas Terbanyak": summary.topClass,
          "Atribut Paling Sering Dilanggar": attributeData[0]?.name || "-",
          "Aturan Poin": pointRule,
        },
        notes: [
          "Poin (Periode) di sheet Rekap Siswa tidak dapat dijumlahkan antar periode.",
          "Gunakan Total Poin sebagai angka resmi pembinaan.",
        ],
      },
    ];

    const classSlug =
      classFilter === "all" ? "Semua-Kelas" : classFilter.replace(/\s+/g, "-");

    exportMultiSheetExcel({
      filename: `Laporan_Atribut_${classSlug}_${getPeriodFilenameSlug(periodInput)}`,
      sheets,
    });

    toast.success("Data berhasil diexport ke Excel!");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Terjadi kesalahan saat export");
  } finally {
    setIsExporting(false);
  }
};
```

`attributeData` sudah ada di state komponen (baris 79), diisi oleh `getMostViolatedAttributes`.

Perhatikan `finally` — kode lama tidak memakainya, sehingga `isExporting` tersangkut `true` selamanya bila terjadi error di tengah jalan.

- [ ] **Step 7: Perbaiki syarat nonaktif tombol export**

Baris 319 sekarang `disabled={isExporting || records.length === 0}`, sehingga periode kosong tidak bisa di-export sama sekali — padahal kesiswaan justru butuh bukti bahwa periode itu nihil. Ganti:

```tsx
disabled={isExporting || !isPeriodValueComplete(periodValue)}
```

- [ ] **Step 8: Typecheck & lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: bersih seluruhnya

- [ ] **Step 9: Jalankan seluruh script verifikasi**

Run:
```bash
npx tsx scripts/verify-report-period.ts
npx tsx scripts/verify-excel-sheets.ts
npx tsx scripts/verify-report-points.ts
```
Expected: semua `OK:`, tidak ada `FAILED:`

- [ ] **Step 10: Verifikasi build produksi**

Run: `npm run build`
Expected: sukses. Ini menangkap kesalahan batas server/client — `PeriodFilter.tsx` meng-import `@/lib/reportPeriod`, dan bila lib itu tanpa sengaja menarik Prisma, build inilah yang menggagalkannya.

- [ ] **Step 11: Verifikasi manual laporan atribut**

Buka `/dashboard-kesiswaan/atribut`, ulangi enam langkah verifikasi Task 7 Step 7, ditambah: kolom `Atribut Tersering` di sheet Rekap terisi dan masuk akal dibanding chart "Atribut Paling Sering Dilanggar" di layar.

- [ ] **Step 12: Commit**

```bash
git add src/components/dashboard/kesiswaan/AttributeReportsContent.tsx
git commit -m "feat: export tiga sheet & periode akademik di laporan atribut

Sejajar dengan laporan keterlambatan, ditambah kolom atribut tersering
per siswa di sheet Rekap.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Urutan & Ketergantungan

```
Task 1 (reportPeriod.ts)
  └─> Task 2 (migrasi action)
        ├─> Task 4 (action keterlambatan) ─┐
        ├─> Task 5 (action atribut) ───────┤
        └─> Task 6 (PeriodFilter) ─────────┤
Task 3 (excelExport) ──────────────────────┤
                                           ├─> Task 7 (komponen keterlambatan)
                                           └─> Task 8 (komponen atribut)
```

Task 3 tidak bergantung pada Task 1 dan 2 — bisa dikerjakan paralel. Task 7 dan 8 baru bisa jalan setelah 3, 4/5, dan 6 selesai.

## Cakupan Spec

| Bagian spec | Task |
|---|---|
| §1 `reportPeriod.ts`, periode akademik | 1, 2 |
| §2 Perhitungan poin periode vs lifetime | 4, 5 (verifikasi di 4 Step 1) |
| §3 Tiga query agregat, penerusan `search` | 4, 5 |
| §4 Struktur Excel tiga sheet | 3, 7, 8 |
| §5 Sub-pemilih UI, `getAvailableAcademicYears`, nama berkas | 6, 7, 8 |
| Penanganan kesalahan: sub-pemilih tak lengkap | 6 (`isPeriodValueComplete`), 7 Step 4 |
| Penanganan kesalahan: periode kosong | 7 Step 3 (toast + berkas tetap dibuat) |
| Penanganan kesalahan: rentang terbalik | 1 (ditukar di `getDateRange`) |
| Verifikasi | 1, 3, 4 (script) + 7, 8 (manual) + 8 Step 4 (`npm run build`) |
