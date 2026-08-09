"use client";

import * as XLSX from "xlsx";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { StudentData } from "@/actions/kesiswaan/students";

interface ExportOptions {
  classFilter?: string;
  genderFilter?: string;
  angkatanFilter?: number;
}

/**
 * Export students data to Excel with professional formatting
 */
export function exportStudentsToExcel(
  students: StudentData[],
  options?: ExportOptions
): void {
  const title = "DATA SISWA SMP IP YA'KIN";
  const filters: string[] = [];
  if (options?.classFilter) {
    filters.push(`Kelas: ${options.classFilter}`);
  }
  if (options?.genderFilter) {
    filters.push(
      `Jenis Kelamin: ${options.genderFilter === "MALE" ? "Laki-laki" : "Perempuan"}`
    );
  }
  if (options?.angkatanFilter) {
    filters.push(`Angkatan: ${options.angkatanFilter}`);
  }
  const subtitle = filters.length > 0 ? filters.join(" | ") : "Semua Data";

  const exportData = students.map((student, index) => ({
    No: index + 1,
    "Nama Lengkap": student.name,
    NISN: student.nisn || "-",
    Kelas: student.class || "-",
    "Jenis Kelamin":
      student.gender === "MALE"
        ? "Laki-laki"
        : student.gender === "FEMALE"
          ? "Perempuan"
          : "-",
    "Tempat Lahir": student.birthPlace || "-",
    "Tanggal Lahir": student.birthDate
      ? format(new Date(student.birthDate), "dd/MM/yyyy")
      : "-",
    Email: student.email || "-",
    "No. Telepon": student.phone || "-",
    Alamat: student.address || "-",
    "Nama Orang Tua": student.parentName || "-",
    "No. HP Orang Tua": student.parentPhone || "-",
    "Tahun Masuk": student.year || "-",
    "Jumlah Prestasi": student.achievementCount,
    "Jumlah Karya": student.workCount,
  }));

  const wsData: unknown[][] = [];

  wsData.push([title]);
  wsData.push([subtitle]);
  wsData.push([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  wsData.push([]);

  const headers = Object.keys(exportData[0] || {});
  wsData.push(headers);

  exportData.forEach((row) => {
    wsData.push(
      headers.map((header) => row[header as keyof typeof row] ?? "-")
    );
  });

  wsData.push([]);
  wsData.push(["RINGKASAN DATA"]);
  wsData.push(["Total Siswa", students.length]);
  wsData.push([
    "Siswa Laki-laki",
    students.filter((s) => s.gender === "MALE").length,
  ]);
  wsData.push([
    "Siswa Perempuan",
    students.filter((s) => s.gender === "FEMALE").length,
  ]);
  wsData.push([
    "Total Prestasi",
    students.reduce((sum, s) => sum + s.achievementCount, 0),
  ]);
  wsData.push([
    "Total Karya",
    students.reduce((sum, s) => sum + s.workCount, 0),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 28 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 16 },
    { wch: 14 },
    { wch: 28 },
    { wch: 15 },
    { wch: 35 },
    { wch: 28 },
    { wch: 16 },
    { wch: 12 },
    { wch: 13 },
    { wch: 12 },
  ];

  const headerRow = 4;
  const dataEndRow = headerRow + students.length;
  const summaryStartRow = dataEndRow + 2;

  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } },
    { s: { r: summaryStartRow, c: 0 }, e: { r: summaryStartRow, c: 1 } },
  ];

  worksheet["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: headerRow, c: 0 },
      e: { r: headerRow, c: 14 },
    }),
  };

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: headerRow + 1,
    activePane: "bottomLeft",
  };

  worksheet["!margins"] = {
    left: 0.5,
    right: 0.5,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3,
  };

  worksheet["!pageSetup"] = {
    paperSize: 9,
    orientation: "landscape",
    scale: 100,
    fitToWidth: 1,
    fitToHeight: 0,
    firstPageNumber: 1,
  };

  worksheet["!printOptions"] = {
    headings: false,
    gridLines: true,
    gridLinesSet: true,
    horizontalCentered: true,
    verticalCentered: false,
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  const classStr = options?.classFilter ? `_${options.classFilter}` : "";
  const filename = `Data_Siswa${classStr}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}

/**
 * Export students with achievements and works detail in multiple sheets
 */
export function exportStudentsDetailedToExcel(
  students: StudentData[],
  options?: ExportOptions
): void {
  const workbook = XLSX.utils.book_new();
  const title = "DATA SISWA SMP IP YA'KIN";
  const filters: string[] = [];
  if (options?.classFilter) filters.push(`Kelas: ${options.classFilter}`);
  if (options?.genderFilter) {
    filters.push(
      `Jenis Kelamin: ${options.genderFilter === "MALE" ? "Laki-laki" : "Perempuan"}`
    );
  }
  if (options?.angkatanFilter) filters.push(`Angkatan: ${options.angkatanFilter}`);
  const subtitle = filters.length > 0 ? filters.join(" | ") : "Semua Data";

  // Sheet 1: Data Siswa Ringkas
  const sheet1Data: unknown[][] = [];
  sheet1Data.push([title]);
  sheet1Data.push([subtitle]);
  sheet1Data.push([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  sheet1Data.push([]);
  sheet1Data.push([
    "No",
    "Nama Lengkap",
    "NISN",
    "Kelas",
    "Jenis Kelamin",
    "Email",
    "No. Telepon",
    "Nama Orang Tua",
    "Jumlah Prestasi",
    "Jumlah Karya",
  ]);

  students.forEach((student, index) => {
    sheet1Data.push([
      index + 1,
      student.name,
      student.nisn || "-",
      student.class || "-",
      student.gender === "MALE" ? "Laki-laki" : student.gender === "FEMALE" ? "Perempuan" : "-",
      student.email || "-",
      student.phone || "-",
      student.parentName || "-",
      student.achievementCount,
      student.workCount,
    ]);
  });

  const sheet1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  sheet1["!cols"] = [
    { wch: 5 },
    { wch: 28 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 28 },
    { wch: 15 },
    { wch: 28 },
    { wch: 13 },
    { wch: 12 },
  ];

  sheet1["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
  ];

  sheet1["!autofilter"] = { ref: "A5:J5" };
  sheet1["!freeze"] = { xSplit: 0, ySplit: 5, activePane: "bottomLeft" };
  sheet1["!margins"] = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
  sheet1["!pageSetup"] = {
    paperSize: 9,
    orientation: "landscape",
    scale: 100,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  sheet1["!printOptions"] = {
    headings: false,
    gridLines: true,
    gridLinesSet: true,
    horizontalCentered: true,
    verticalCentered: false,
  };

  XLSX.utils.book_append_sheet(workbook, sheet1, "Data Siswa");

  // Sheet 2: Rekap Per Kelas
  const classSummary: Record<string, { total: number; male: number; female: number; achievements: number; works: number }> = {};
  students.forEach((student) => {
    const cls = student.class || "Tidak Ada Kelas";
    if (!classSummary[cls]) {
      classSummary[cls] = { total: 0, male: 0, female: 0, achievements: 0, works: 0 };
    }
    classSummary[cls].total++;
    if (student.gender === "MALE") classSummary[cls].male++;
    if (student.gender === "FEMALE") classSummary[cls].female++;
    classSummary[cls].achievements += student.achievementCount;
    classSummary[cls].works += student.workCount;
  });

  const sheet2Data: unknown[][] = [];
  sheet2Data.push(["REKAP DATA SISWA PER KELAS"]);
  sheet2Data.push(["SMP IP YA'KIN"]);
  sheet2Data.push([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  sheet2Data.push([]);
  sheet2Data.push([
    "No",
    "Kelas",
    "Total Siswa",
    "Laki-laki",
    "Perempuan",
    "Total Prestasi",
    "Total Karya",
  ]);

  Object.entries(classSummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([cls, data], index) => {
      sheet2Data.push([
        index + 1,
        cls,
        data.total,
        data.male,
        data.female,
        data.achievements,
        data.works,
      ]);
    });

  sheet2Data.push([]);
  sheet2Data.push(["TOTAL", "", students.length,
    students.filter((s) => s.gender === "MALE").length,
    students.filter((s) => s.gender === "FEMALE").length,
    students.reduce((sum, s) => sum + s.achievementCount, 0),
    students.reduce((sum, s) => sum + s.workCount, 0),
  ]);

  const sheet2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  sheet2["!cols"] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
  ];

  const summaryRowCount = Object.keys(classSummary).length;
  sheet2["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    { s: { r: 5 + summaryRowCount + 1, c: 0 }, e: { r: 5 + summaryRowCount + 1, c: 1 } },
  ];

  sheet2["!autofilter"] = { ref: "A5:G5" };
  sheet2["!margins"] = { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };
  sheet2["!pageSetup"] = {
    paperSize: 9,
    orientation: "portrait",
    scale: 100,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  sheet2["!printOptions"] = {
    headings: false,
    gridLines: true,
    gridLinesSet: true,
    horizontalCentered: true,
    verticalCentered: false,
  };

  XLSX.utils.book_append_sheet(workbook, sheet2, "Rekap Per Kelas");

  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  const classStr = options?.classFilter ? `_${options.classFilter}` : "";
  const filename = `Data_Siswa_Lengkap${classStr}_${dateStr}.xlsx`;

  XLSX.writeFile(workbook, filename);
}
