/**
 * Report Period
 * =============
 * Satu-satunya sumber perhitungan rentang tanggal laporan. Sebelumnya
 * getDateRange() terduplikasi identik di src/actions/lateness.ts dan
 * src/actions/attributes.ts; menambah periode di dua tempat berarti dua
 * sumber kebenaran yang bisa menyimpang.
 *
 * Fungsi murni, tanpa Prisma dan tanpa "use server", sehingga aman
 * di-bundle ke klien (dipakai PeriodFilter.tsx) dan dapat diverifikasi
 * lewat scripts/verify-report-period.ts.
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

function requireField<T>(
  value: T | undefined,
  field: string,
  period: Period,
): T {
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
