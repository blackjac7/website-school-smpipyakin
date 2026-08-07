"use client";

import ExcelJS from "exceljs";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform?: (value: any, row: any) => string | number;
}

export interface SheetSpec {
  sheetName: string;
  title?: string;
  subtitle?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  columns: ExcelColumn[];
  includeHeader?: boolean;
  includeColumnHeaders?: boolean;
  includeSummary?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summaryData?: Record<string, any>;
  notes?: string[];
}

/**
 * Export beberapa sheet dengan styling profesional lengkap menggunakan ExcelJS.
 * Dipakai untuk laporan keterlambatan dan laporan lain yang butuh multi-sheet.
 */
export async function exportMultiSheetStyledExcel(config: {
  filename: string;
  sheets: SheetSpec[];
}): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SMP IP YA'KIN";
  workbook.created = new Date();

  for (const sheet of config.sheets) {
    await buildStyledWorksheet(workbook, sheet);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = format(new Date(), "yyyyMMdd_HHmm");
  a.download = `${config.filename}_${dateStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

async function buildStyledWorksheet(
  workbook: ExcelJS.Workbook,
  spec: SheetSpec
): Promise<void> {
  const {
    sheetName,
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

  const worksheet = workbook.addWorksheet(sheetName.slice(0, 31), {
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
    views: [{ showGridLines: true, zoomScale: 100 }],
  });

  let currentRow = 1;

  // Header Section
  if (includeHeader && title) {
    const titleRow = worksheet.addRow([title]);
    titleRow.font = {
      name: "Calibri",
      size: 16,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    titleRow.alignment = { horizontal: "center", vertical: "middle" };
    titleRow.height = 30;
    titleRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1F4788" },
      };
    });
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      Math.max(columns.length + 1, 3)
    );
    currentRow++;

    if (subtitle) {
      const subtitleRow = worksheet.addRow([subtitle]);
      subtitleRow.font = {
        name: "Calibri",
        size: 12,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      subtitleRow.alignment = { horizontal: "center", vertical: "middle" };
      subtitleRow.height = 22;
      subtitleRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF2E5C8A" },
        };
      });
      worksheet.mergeCells(
        currentRow,
        1,
        currentRow,
        Math.max(columns.length + 1, 3)
      );
      currentRow++;
    }

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
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      Math.max(columns.length + 1, 3)
    );
    currentRow++;

    worksheet.addRow([]);
    currentRow++;
  }

  // Column Headers
  if (includeColumnHeaders) {
    const headerRow = worksheet.addRow([
      "No",
      ...columns.map((col) => col.header),
    ]);
    headerRow.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    // AutoFilter
    worksheet.autoFilter = {
      from: { row: currentRow, column: 1 },
      to: { row: currentRow, column: columns.length + 1 },
    };

    currentRow++;
  }

  // Data Rows
  data.forEach((row, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cells: any[] = [index + 1];
    columns.forEach((col) => {
      const value = getNestedValue(row, col.key);
      const cell = col.transform ? col.transform(value, row) : value;
      cells.push(cell ?? "-");
    });

    const dataRow = worksheet.addRow(cells);
    dataRow.font = { name: "Calibri", size: 10 };
    dataRow.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
    dataRow.height = 20;

    dataRow.eachCell((cell, colNumber) => {
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

    currentRow++;
  });

  // Summary Section
  if (includeSummary && summaryData) {
    worksheet.addRow([]);
    currentRow++;

    const summaryTitleRow = worksheet.addRow(["RINGKASAN"]);
    summaryTitleRow.font = {
      name: "Calibri",
      size: 12,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    summaryTitleRow.alignment = { horizontal: "left", vertical: "middle" };
    summaryTitleRow.height = 22;
    summaryTitleRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF70AD47" },
      };
    });
    worksheet.mergeCells(currentRow, 1, currentRow, 3);
    currentRow++;

    Object.entries(summaryData).forEach(([key, value]) => {
      const row = worksheet.addRow([key, value]);
      row.font = { name: "Calibri", size: 11 };
      row.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      row.height = key.length > 30 || String(value).length > 30 ? 35 : 22;
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
        if (colNumber === 1) {
          cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        } else if (colNumber === 2) {
          cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
          if (typeof value === "number") {
            cell.numFmt = "#,##0";
          }
        }
      });
      currentRow++;
    });
  }

  // Notes Section
  if (notes && notes.length > 0) {
    worksheet.addRow([]);
    currentRow++;

    // Add Notes Header
    const notesHeaderRow = worksheet.addRow(["CATATAN"]);
    notesHeaderRow.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FF856404" },
    };
    notesHeaderRow.alignment = { horizontal: "left", vertical: "middle" };
    notesHeaderRow.height = 20;
    notesHeaderRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEF9E7" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFFBBF24" } },
        left: { style: "thin", color: { argb: "FFFBBF24" } },
        bottom: { style: "thin", color: { argb: "FFFBBF24" } },
        right: { style: "thin", color: { argb: "FFFBBF24" } },
      };
    });
    worksheet.mergeCells(
      currentRow,
      1,
      currentRow,
      Math.max(columns.length + 1, 3)
    );
    currentRow++;

    notes.forEach((note, index) => {
      const noteRow = worksheet.addRow([`${index + 1}. ${note}`]);
      noteRow.font = { name: "Calibri", size: 10 };
      noteRow.alignment = { horizontal: "left", vertical: "top", wrapText: true };

      // Calculate height based on text length (rough estimate: 80 chars per line)
      const estimatedLines = Math.ceil(note.length / 80);
      noteRow.height = Math.max(20, estimatedLines * 15);

      noteRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFFFBF0" },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FFFBBF24" } },
          left: { style: "thin", color: { argb: "FFFBBF24" } },
          bottom: { style: "thin", color: { argb: "FFFBBF24" } },
          right: { style: "thin", color: { argb: "FFFBBF24" } },
        };
      });
      worksheet.mergeCells(
        currentRow,
        1,
        currentRow,
        Math.max(columns.length + 1, 3)
      );
      currentRow++;
    });
  }

  // Column Widths
  const maxColWidths = columns.map((col) => {
    const headerLength = col.header.length;
    const dataLengths = data.map((row) => {
      const value = getNestedValue(row, col.key);
      const cell = col.transform ? col.transform(value, row) : value;
      return String(cell ?? "-").length;
    });
    const maxDataLength = Math.max(...dataLengths, 0);
    return Math.max(col.width || 20, Math.min(headerLength + 5, 50), Math.min(maxDataLength + 2, 50));
  });

  worksheet.columns = [
    { width: 5 }, // No column
    ...maxColWidths.map((w) => ({ width: w })),
  ];

  // Adjust columns 1 and 2 untuk Summary section (lebih lebar)
  worksheet.getColumn(1).width = Math.max(
    worksheet.getColumn(1).width || 30,
    40
  );
  worksheet.getColumn(2).width = Math.max(
    worksheet.getColumn(2).width || 30,
    50
  );
}

/**
 * Helper function to get nested object values using dot notation
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}
