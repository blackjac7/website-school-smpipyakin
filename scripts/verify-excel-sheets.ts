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
assert(
  String(rows[2][0]).startsWith("Tanggal Export:"),
  "baris 2 tanggal export",
);
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
assert(
  bare[0][0] === "No" && bare[0][1] === "A",
  "tanpa header, baris 0 = header kolom",
);

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

// Nested key & transform tetap berfungsi seperti exportToExcel lama
const nested = buildSheetRows({
  sheetName: "X",
  data: [{ siswa: { name: "Budi" }, date: null }],
  columns: [
    { header: "Nama", key: "siswa.name" },
    { header: "Tanggal", key: "date", transform: (val) => (val ? "ada" : "-") },
  ],
  includeHeader: false,
});
assert(nested[1][1] === "Budi", "nested key dot-notation terbaca");
assert(nested[1][2] === "-", "transform dijalankan pada nilai null");

console.log("Excel sheet builder checks done.");
