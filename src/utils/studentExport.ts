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
 * Export students data to Excel
 */
export function exportStudentsToExcel(
  students: StudentData[],
  options?: ExportOptions
): void {
  // Build title and subtitle
  const title = "DATA SISWA SMP IP YA'KIN";
  const filters: string[] = [];
  if (options?.classFilter) {
    filters.push(`Kelas: ${options.classFilter}`);
  }
  if (options?.genderFilter) {
    filters.push(
      `Gender: ${options.genderFilter === "MALE" ? "Laki-laki" : "Perempuan"}`
    );
  }
  if (options?.angkatanFilter) {
    filters.push(`Angkatan: ${options.angkatanFilter}`);
  }
  const subtitle = filters.length > 0 ? filters.join(" | ") : "Semua Data";

  // Transform data for export
  const exportData = students.map((student, index) => ({
    No: index + 1,
    "Nama Lengkap": student.name,
    NISN: student.nisn,
    Kelas: student.class || "-",
    "Jenis Kelamin":
      student.gender === "MALE"
        ? "Laki-laki"
        : student.gender === "FEMALE"
          ? "Perempuan"
          : "-",
    "Tempat Lahir": student.birthPlace || "-",
    "Tanggal Lahir": student.birthDate || "-",
    Email: student.email || "-",
    "No. Telepon": student.phone || "-",
    Alamat: student.address || "-",
    "Nama Orang Tua": student.parentName || "-",
    "No. HP Orang Tua": student.parentPhone || "-",
    "Tahun Masuk": student.year || "-",
    "Jumlah Prestasi": student.achievementCount,
    "Jumlah Karya": student.workCount,
  }));

  // Build worksheet data array
  const wsData: unknown[][] = [];

  // Add title rows
  wsData.push([title]);
  wsData.push([subtitle]);
  wsData.push([
    `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
  ]);
  wsData.push([]); // Empty row for spacing

  // Add column headers
  const headers = Object.keys(exportData[0] || {});
  wsData.push(headers);

  // Add data rows
  exportData.forEach((row) => {
    wsData.push(
      headers.map((header) => row[header as keyof typeof row] ?? "-")
    );
  });

  // Add summary
  wsData.push([]);
  wsData.push(["RINGKASAN"]);
  wsData.push(["Total Siswa", students.length]);
  wsData.push([
    "Laki-laki",
    students.filter((s) => s.gender === "MALE").length,
  ]);
  wsData.push([
    "Perempuan",
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

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = [
    { wch: 5 }, // No
    { wch: 25 }, // Nama
    { wch: 15 }, // NISN
    { wch: 10 }, // Kelas
    { wch: 12 }, // Gender
    { wch: 15 }, // Tempat Lahir
    { wch: 15 }, // Tanggal Lahir
    { wch: 25 }, // Email
    { wch: 15 }, // Telepon
    { wch: 40 }, // Alamat
    { wch: 25 }, // Nama Ortu
    { wch: 15 }, // HP Ortu
    { wch: 12 }, // Tahun Masuk
    { wch: 12 }, // Prestasi
    { wch: 12 }, // Karya
  ];
  worksheet["!cols"] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Siswa");

  // Generate filename
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const classStr = options?.classFilter ? `_${options.classFilter}` : "";
  const filename = `Data_Siswa${classStr}_${dateStr}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}

/**
 * Export students with achievements and works detail
 */
export function exportStudentsDetailedToExcel(
  students: StudentData[],
  options?: ExportOptions
): void {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Students
  const studentData = students.map((student, index) => ({
    No: index + 1,
    "Nama Lengkap": student.name,
    NISN: student.nisn,
    Kelas: student.class || "-",
    "Jenis Kelamin":
      student.gender === "MALE"
        ? "Laki-laki"
        : student.gender === "FEMALE"
          ? "Perempuan"
          : "-",
    Email: student.email || "-",
    "No. Telepon": student.phone || "-",
    "Nama Orang Tua": student.parentName || "-",
    "Jumlah Prestasi": student.achievementCount,
    "Jumlah Karya": student.workCount,
  }));

  const studentSheet = XLSX.utils.json_to_sheet(studentData);
  XLSX.utils.book_append_sheet(workbook, studentSheet, "Data Siswa");

  // Sheet 2: Summary by Class
  const classSummary: Record<
    string,
    { total: number; male: number; female: number }
  > = {};
  students.forEach((student) => {
    const cls = student.class || "Tidak Ada Kelas";
    if (!classSummary[cls]) {
      classSummary[cls] = { total: 0, male: 0, female: 0 };
    }
    classSummary[cls].total++;
    if (student.gender === "MALE") classSummary[cls].male++;
    if (student.gender === "FEMALE") classSummary[cls].female++;
  });

  const summaryData = Object.entries(classSummary).map(([cls, data]) => ({
    Kelas: cls,
    "Total Siswa": data.total,
    "Laki-laki": data.male,
    Perempuan: data.female,
  }));

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Rekap Per Kelas");

  // Generate filename
  const dateStr = format(new Date(), "yyyy-MM-dd");
  const classStr = options?.classFilter ? `_${options.classFilter}` : "";
  const filename = `Data_Siswa_Lengkap${classStr}_${dateStr}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
}
