"use client";

import ExcelJS from "exceljs";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export interface KesiswaanReportData {
  summary: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  monthly: Array<{
    month: string;
    validated: number;
    pending: number;
    rejected: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Export Laporan Kesiswaan dengan Styling Profesional Lengkap
 * - Header dengan background biru & text putih bold
 * - Zebra striping (baris genap/ganjil beda warna)
 * - Borders pada semua cell
 * - Number formatting dengan ribuan
 * - Conditional formatting untuk status
 * - Print-ready settings
 */
export async function exportKesiswaanReportStyledToExcel(
  report: KesiswaanReportData
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "SMP IP YAKIN";
  workbook.lastModifiedBy = "Sistem Kesiswaan";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("Laporan Kesiswaan", {
    pageSetup: {
      paperSize: 9,
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    },
    views: [
      {
        showGridLines: true,
        zoomScale: 100,
      },
    ],
  });

  // ==================== HEADER SECTION ====================
  const titleRow = worksheet.addRow(["LAPORAN VALIDASI KONTEN KESISWAAN"]);
  titleRow.font = { name: "Calibri", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleRow.alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 30;
  titleRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4788" },
    };
  });
  worksheet.mergeCells("A1:E1");

  const subtitleRow = worksheet.addRow(["SMP IP YAKIN"]);
  subtitleRow.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  subtitleRow.alignment = { horizontal: "center", vertical: "middle" };
  subtitleRow.height = 22;
  subtitleRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2E5C8A" },
    };
  });
  worksheet.mergeCells("A2:E2");

  const dateRow = worksheet.addRow([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  dateRow.font = { name: "Calibri", size: 10, italic: true };
  dateRow.alignment = { horizontal: "center", vertical: "middle" };
  dateRow.height = 18;
  dateRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE7E9EC" },
    };
  });
  worksheet.mergeCells("A3:E3");

  worksheet.addRow([]);

  // ==================== RINGKASAN STATUS ====================
  const summaryTitleRow = worksheet.addRow(["RINGKASAN STATUS"]);
  summaryTitleRow.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  summaryTitleRow.alignment = { horizontal: "left", vertical: "middle" };
  summaryTitleRow.height = 25;
  summaryTitleRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
  });
  worksheet.mergeCells("A5:C5");

  const summaryHeaderRow = worksheet.addRow(["Status", "Jumlah", "Persentase"]);
  summaryHeaderRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  summaryHeaderRow.alignment = { horizontal: "center", vertical: "middle" };
  summaryHeaderRow.height = 22;
  summaryHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF5B9BD5" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });

  const total = report.summary.total || 1;
  const summaryData = [
    {
      status: "Disetujui",
      count: report.summary.approved,
      percentage: ((report.summary.approved / total) * 100).toFixed(1) + "%",
      bgColor: "FFD5E8D4",
    },
    {
      status: "Pending",
      count: report.summary.pending,
      percentage: ((report.summary.pending / total) * 100).toFixed(1) + "%",
      bgColor: "FFFFF2CC",
    },
    {
      status: "Ditolak",
      count: report.summary.rejected,
      percentage: ((report.summary.rejected / total) * 100).toFixed(1) + "%",
      bgColor: "FFF8CECC",
    },
  ];

  summaryData.forEach((data, index) => {
    const row = worksheet.addRow([data.status, data.count, data.percentage]);
    row.font = { name: "Calibri", size: 11 };
    row.alignment = { horizontal: "center", vertical: "middle" };
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
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.font = { name: "Calibri", size: 11, bold: true };
      }

      if (colNumber === 2) {
        cell.numFmt = "#,##0";
      }
    });
  });

  const totalRow = worksheet.addRow(["TOTAL", report.summary.total, "100%"]);
  totalRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  totalRow.alignment = { horizontal: "center", vertical: "middle" };
  totalRow.height = 22;
  totalRow.eachCell((cell, colNumber) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    cell.border = {
      top: { style: "medium", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "medium", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
    if (colNumber === 1) {
      cell.alignment = { horizontal: "left", vertical: "middle" };
    }
    if (colNumber === 2) {
      cell.numFmt = "#,##0";
    }
  });

  worksheet.addRow([]);

  // ==================== VALIDASI BULANAN ====================
  const monthlyStartRow = worksheet.rowCount + 1;
  const monthlyTitleRow = worksheet.addRow(["VALIDASI BULANAN"]);
  monthlyTitleRow.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  monthlyTitleRow.alignment = { horizontal: "left", vertical: "middle" };
  monthlyTitleRow.height = 25;
  monthlyTitleRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF70AD47" },
    };
  });
  worksheet.mergeCells(`A${monthlyStartRow}:E${monthlyStartRow}`);

  const monthlyHeaderRow = worksheet.addRow([
    "Bulan",
    "Disetujui",
    "Pending",
    "Ditolak",
    "Total",
  ]);
  monthlyHeaderRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  monthlyHeaderRow.alignment = { horizontal: "center", vertical: "middle" };
  monthlyHeaderRow.height = 22;
  monthlyHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF92D050" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });

  report.monthly.forEach((m, index) => {
    const monthTotal = m.validated + m.pending + m.rejected;
    const row = worksheet.addRow([m.month, m.validated, m.pending, m.rejected, monthTotal]);
    row.font = { name: "Calibri", size: 11 };
    row.alignment = { horizontal: "center", vertical: "middle" };
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
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.font = { name: "Calibri", size: 11, bold: true };
      } else {
        cell.numFmt = "#,##0";
      }
    });
  });

  worksheet.addRow([]);

  // ==================== DISTRIBUSI KATEGORI ====================
  const categoryStartRow = worksheet.rowCount + 1;
  const categoryTitleRow = worksheet.addRow(["DISTRIBUSI KATEGORI"]);
  categoryTitleRow.font = { name: "Calibri", size: 13, bold: true, color: { argb: "FFFFFFFF" } };
  categoryTitleRow.alignment = { horizontal: "left", vertical: "middle" };
  categoryTitleRow.height = 25;
  categoryTitleRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFED7D31" },
    };
  });
  worksheet.mergeCells(`A${categoryStartRow}:C${categoryStartRow}`);

  const categoryHeaderRow = worksheet.addRow(["Kategori", "Jumlah", "Persentase"]);
  categoryHeaderRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  categoryHeaderRow.alignment = { horizontal: "center", vertical: "middle" };
  categoryHeaderRow.height = 22;
  categoryHeaderRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF4B084" },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };
  });

  report.byCategory.forEach((c, index) => {
    const row = worksheet.addRow([c.category, c.count, `${c.percentage.toFixed(1)}%`]);
    row.font = { name: "Calibri", size: 11 };
    row.alignment = { horizontal: "center", vertical: "middle" };
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
        cell.alignment = { horizontal: "left", vertical: "middle" };
        cell.font = { name: "Calibri", size: 11, bold: true };
      }
      if (colNumber === 2) {
        cell.numFmt = "#,##0";
      }
    });
  });

  // ==================== COLUMN WIDTHS ====================
  worksheet.getColumn(1).width = 28;
  worksheet.getColumn(2).width = 15;
  worksheet.getColumn(3).width = 15;
  worksheet.getColumn(4).width = 15;
  worksheet.getColumn(5).width = 15;

  // ==================== AUTO FILTER ====================
  worksheet.autoFilter = {
    from: { row: 6, column: 1 },
    to: { row: 6, column: 3 },
  };

  // ==================== GENERATE & DOWNLOAD ====================
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  a.download = `Laporan_Kesiswaan_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
