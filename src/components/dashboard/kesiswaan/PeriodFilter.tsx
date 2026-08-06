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
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
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

/** Ubah state UI menjadi PeriodInput untuk server action. */
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

/** false bila sub-pemilih belum lengkap — tombol export dinonaktifkan. */
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
  const years =
    academicYears.length > 0 ? academicYears : [getCurrentAcademicYear()];
  const calendarYears = [...years, years[years.length - 1] + 1];

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
            {years.map((y) => (
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
          {years.map((y) => (
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
