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
assert(
  ay.start.getMonth() === 6 && ay.start.getFullYear() === 2020,
  "TA mulai Jul 2020",
);
assert(
  ay.end.getMonth() === 5 && ay.end.getFullYear() === 2021,
  "TA berakhir Jun 2021",
);

// --- penurunan tahun ajaran di sekitar batas Juni/Juli ---
assert(
  getCurrentAcademicYear(new Date(2026, 5, 30)) === 2025,
  "30 Jun 2026 => TA 2025",
);
assert(
  getCurrentAcademicYear(new Date(2026, 6, 1)) === 2026,
  "1 Jul 2026 => TA 2026",
);
assert(
  getCurrentAcademicYear(new Date(2026, 11, 31)) === 2026,
  "31 Des 2026 => TA 2026",
);
assert(
  getCurrentAcademicYear(new Date(2026, 0, 1)) === 2025,
  "1 Jan 2026 => TA 2025",
);

// --- periode berjalan dipotong di hari ini ---
const now = new Date();
const curr = getDateRange({
  period: "specificMonth",
  month: now.getMonth(),
  year: now.getFullYear(),
});
assert(
  curr.end.getTime() <= Date.now() + 86_400_000,
  "bulan berjalan tidak melewati hari ini",
);

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
  getPeriodLabel({ period: "specificMonth", month: 7, year: 2026 }) ===
    "Agustus 2026",
  "label specificMonth",
);
assert(
  getPeriodLabel({
    period: "semester",
    semester: "GANJIL",
    academicYear: 2025,
  }) === "Semester Ganjil 2025/2026",
  "label semester",
);
assert(
  getPeriodLabel({ period: "academicYear", academicYear: 2025 }) ===
    "Tahun Ajaran 2025/2026",
  "label academicYear",
);

console.log("Report period checks done.");
