"use client";

import ExcelJS from "exceljs";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { StudentData } from "@/actions/kesiswaan/students";

interface ExportOptions {
  classFilter?: string;
  genderFilter?: string;
  angkatanFilter?: number;
}

/**
 * Export Data Siswa dengan Styling Profesional Lengkap
 */
export async function exportStudentsStyledToExcel(
  students: StudentData[],
  options?: ExportOptions
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SMP IP YAKIN";
  workbook.created = new Date();

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

  const worksheet = workbook.addWorksheet("Data Siswa", {
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    },
    views: [{ showGridLines: true, zoomScale: 100 }],
  });

  // Header
  const titleRow = worksheet.addRow([title]);
  titleRow.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleRow.alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 30;
  titleRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4788" } };
  });
  worksheet.mergeCells("A1:O1");

  const subtitleRow = worksheet.addRow([subtitle]);
  subtitleRow.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  subtitleRow.alignment = { horizontal: "center", vertical: "middle" };
  subtitleRow.height = 22;
  subtitleRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E5C8A" } };
  });
  worksheet.mergeCells("A2:O2");

  const dateRow = worksheet.addRow([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  dateRow.font = { name: "Calibri", size: 10, italic: true };
  dateRow.alignment = { horizontal: "center", vertical: "middle" };
  dateRow.height = 18;
  dateRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E9EC" } };
  });
  worksheet.mergeCells("A3:O3");

  worksheet.addRow([]);

  // Column Headers
  const headerRow = worksheet.addRow([
    "No",
    "Nama Lengkap",
    "NISN",
    "Kelas",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Email",
    "No. Telepon",
    "Alamat",
    "Nama Orang Tua",
    "No. HP Orang Tua",
    "Tahun Masuk",
    "Jumlah Prestasi",
    "Jumlah Karya",
  ]);
  headerRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });

  // Data Rows
  students.forEach((student, index) => {
    const row = worksheet.addRow([
      index + 1,
      student.name,
      student.nisn || "-",
      student.class || "-",
      student.gender === "MALE" ? "Laki-laki" : student.gender === "FEMALE" ? "Perempuan" : "-",
      student.birthPlace || "-",
      student.birthDate ? format(new Date(student.birthDate), "dd/MM/yyyy") : "-",
      student.email || "-",
      student.phone || "-",
      student.address || "-",
      student.parentName || "-",
      student.parentPhone || "-",
      student.year || "-",
      student.achievementCount,
      student.workCount,
    ]);

    row.font = { name: "Calibri", size: 10 };
    row.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    row.height = 20;

    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? "FFFFFFFF" : "FFF2F2F2" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD0D0D0" } },
        left: { style: "thin", color: { argb: "FFD0D0D0" } },
        bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
        right: { style: "thin", color: { argb: "FFD0D0D0" } },
      };

      if (colNumber === 1) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if ([2, 4, 5, 6, 7, 8, 11].includes(colNumber)) {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      } else if ([10].includes(colNumber)) {
        cell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
      }
    });
  });

  worksheet.addRow([]);

  // Summary
  const summaryStartRow = worksheet.rowCount + 1;
  const summaryTitleRow = worksheet.addRow(["RINGKASAN DATA"]);
  summaryTitleRow.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  summaryTitleRow.alignment = { horizontal: "left", vertical: "middle" };
  summaryTitleRow.height = 22;
  summaryTitleRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF70AD47" } };
  });
  worksheet.mergeCells(`A${summaryStartRow}:B${summaryStartRow}`);

  const summaryData = [
    ["Total Siswa", students.length],
    ["Siswa Laki-laki", students.filter((s) => s.gender === "MALE").length],
    ["Siswa Perempuan", students.filter((s) => s.gender === "FEMALE").length],
    ["Total Prestasi", students.reduce((sum, s) => sum + s.achievementCount, 0)],
    ["Total Karya", students.reduce((sum, s) => sum + s.workCount, 0)],
  ];

  summaryData.forEach((data, index) => {
    const row = worksheet.addRow(data);
    row.font = { name: "Calibri", size: 11, bold: index === 0 };
    row.alignment = { horizontal: "left", vertical: "middle" };
    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE2EFD9" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF92D050" } },
        left: { style: "thin", color: { argb: "FF92D050" } },
        bottom: { style: "thin", color: { argb: "FF92D050" } },
        right: { style: "thin", color: { argb: "FF92D050" } },
      };
      if (colNumber === 2) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.numFmt = "#,##0";
      }
    });
  });

  // Column Widths
  worksheet.columns = [
    { width: 5 },
    { width: 28 },
    { width: 16 },
    { width: 10 },
    { width: 14 },
    { width: 16 },
    { width: 14 },
    { width: 28 },
    { width: 15 },
    { width: 35 },
    { width: 28 },
    { width: 16 },
    { width: 12 },
    { width: 13 },
    { width: 12 },
  ];

  worksheet.autoFilter = { from: { row: 5, column: 1 }, to: { row: 5, column: 15 } };

  // Generate & Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  const classStr = options?.classFilter ? `_${options.classFilter}` : "";
  a.download = `Data_Siswa${classStr}_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Export Data Siswa Detail dengan Multiple Sheets
 */
export async function exportStudentsDetailedStyledToExcel(
  students: StudentData[],
  options?: ExportOptions
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SMP IP YAKIN";
  workbook.created = new Date();

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

  // Sheet 1: Data Siswa
  const ws1 = workbook.addWorksheet("Data Siswa", {
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  const titleRow1 = ws1.addRow([title]);
  titleRow1.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleRow1.alignment = { horizontal: "center", vertical: "middle" };
  titleRow1.height = 30;
  titleRow1.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4788" } };
  });
  ws1.mergeCells("A1:J1");

  const subtitleRow1 = ws1.addRow([subtitle]);
  subtitleRow1.font = { size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  subtitleRow1.alignment = { horizontal: "center", vertical: "middle" };
  subtitleRow1.height = 22;
  subtitleRow1.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E5C8A" } };
  });
  ws1.mergeCells("A2:J2");

  const dateRow1 = ws1.addRow([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  dateRow1.font = { size: 10, italic: true };
  dateRow1.alignment = { horizontal: "center", vertical: "middle" };
  dateRow1.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E9EC" } };
  });
  ws1.mergeCells("A3:J3");

  ws1.addRow([]);

  const headerRow1 = ws1.addRow([
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
  headerRow1.font = { size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow1.alignment = { horizontal: "center", vertical: "middle" };
  headerRow1.height = 25;
  headerRow1.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  students.forEach((student, index) => {
    const row = ws1.addRow([
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

    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: index % 2 === 0 ? "FFFFFFFF" : "FFF2F2F2" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD0D0D0" } },
        left: { style: "thin", color: { argb: "FFD0D0D0" } },
        bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
        right: { style: "thin", color: { argb: "FFD0D0D0" } },
      };
      if (colNumber === 1) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    });
  });

  ws1.columns = [
    { width: 5 },
    { width: 28 },
    { width: 16 },
    { width: 10 },
    { width: 14 },
    { width: 28 },
    { width: 15 },
    { width: 28 },
    { width: 13 },
    { width: 12 },
  ];

  // Sheet 2: Rekap Per Kelas
  const ws2 = workbook.addWorksheet("Rekap Per Kelas", {
    pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1 },
  });

  const titleRow2 = ws2.addRow(["REKAP DATA SISWA PER KELAS"]);
  titleRow2.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleRow2.alignment = { horizontal: "center", vertical: "middle" };
  titleRow2.height = 30;
  titleRow2.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF70AD47" } };
  });
  ws2.mergeCells("A1:G1");

  const subtitleRow2 = ws2.addRow(["SMP IP YA'KIN"]);
  subtitleRow2.font = { size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  subtitleRow2.alignment = { horizontal: "center", vertical: "middle" };
  subtitleRow2.height = 22;
  subtitleRow2.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF92D050" } };
  });
  ws2.mergeCells("A2:G2");

  const dateRow2 = ws2.addRow([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  dateRow2.font = { size: 10, italic: true };
  dateRow2.alignment = { horizontal: "center", vertical: "middle" };
  dateRow2.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE7E9EC" } };
  });
  ws2.mergeCells("A3:G3");

  ws2.addRow([]);

  const headerRow2 = ws2.addRow([
    "No",
    "Kelas",
    "Total Siswa",
    "Laki-laki",
    "Perempuan",
    "Total Prestasi",
    "Total Karya",
  ]);
  headerRow2.font = { size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  headerRow2.alignment = { horizontal: "center", vertical: "middle" };
  headerRow2.height = 25;
  headerRow2.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF70AD47" } };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  const classSummary: Record<
    string,
    { total: number; male: number; female: number; achievements: number; works: number }
  > = {};
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

  Object.entries(classSummary)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([cls, data], index) => {
      const row = ws2.addRow([
        index + 1,
        cls,
        data.total,
        data.male,
        data.female,
        data.achievements,
        data.works,
      ]);

      row.height = 20;
      row.eachCell((cell, colNumber) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: index % 2 === 0 ? "FFFFFFFF" : "FFF2F2F2" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFD0D0D0" } },
          left: { style: "thin", color: { argb: "FFD0D0D0" } },
          bottom: { style: "thin", color: { argb: "FFD0D0D0" } },
          right: { style: "thin", color: { argb: "FFD0D0D0" } },
        };

        if (colNumber === 1) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (colNumber === 2) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
          cell.font = { bold: true };
        } else {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.numFmt = "#,##0";
        }
      });
    });

  ws2.addRow([]);

  const totalRow = ws2.addRow([
    "",
    "TOTAL",
    students.length,
    students.filter((s) => s.gender === "MALE").length,
    students.filter((s) => s.gender === "FEMALE").length,
    students.reduce((sum, s) => sum + s.achievementCount, 0),
    students.reduce((sum, s) => sum + s.workCount, 0),
  ]);
  totalRow.font = { size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  totalRow.alignment = { horizontal: "center", vertical: "middle" };
  totalRow.height = 22;
  totalRow.eachCell((cell, colNumber) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF70AD47" } };
    cell.border = {
      top: { style: "medium" },
      left: { style: "thin" },
      bottom: { style: "medium" },
      right: { style: "thin" },
    };
    if (colNumber === 2) {
      cell.alignment = { horizontal: "left", vertical: "middle" };
    }
    if (colNumber > 2) {
      cell.numFmt = "#,##0";
    }
  });

  ws2.columns = [
    { width: 5 },
    { width: 20 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 12 },
  ];

  // Generate & Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  const classStr = options?.classFilter ? `_${options.classFilter}` : "";
  a.download = `Data_Siswa_Lengkap${classStr}_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
