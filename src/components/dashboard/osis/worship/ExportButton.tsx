"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ExportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  filename: string;
  sheetName?: string;
  type: "MENSTRUATION" | "ADZAN" | "CARPET";
}

export default function ExportButton({
  data,
  filename,
  sheetName = "Sheet1",
  type,
}: ExportButtonProps) {
  const handleExport = () => {
    // Helper function to get day name in Indonesian
    const getDayName = (date: Date): string => {
      return format(date, "EEEE", { locale: id });
    };

    // 1. Transform Data for Excel based on Type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let exportData: any[] = [];

    if (type === "MENSTRUATION") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exportData = data.map((item: any) => ({
        "Nama Siswi": item.siswa?.name || "-",
        Kelas: item.siswa?.class || "-",
        "Tanggal Mulai": format(new Date(item.startDate), "dd/MM/yyyy"),
        "Tanggal Selesai": item.endDate
          ? format(new Date(item.endDate), "dd/MM/yyyy")
          : "Sedang Berlangsung",
        "Durasi (Hari)": item.endDate
          ? Math.floor(
              (new Date(item.endDate).getTime() -
                new Date(item.startDate).getTime()) /
                86400000,
            ) + 1
          : "-",
        Keterangan: item.notes || "-",
        Status: item.warning ? "PERLU CEK" : "Normal",
        Peringatan: item.warning || "-",
      }));
    } else if (type === "ADZAN") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exportData = data.map((item: any) => {
        const date = new Date(item.date);
        return {
          Hari: getDayName(date),
          Tanggal: format(date, "dd/MM/yyyy"),
          "Waktu Sholat": item.prayerTime,
          Petugas: item.siswa?.name || "-",
          Kelas: item.siswa?.class || "-",
          "Status Pelaksanaan":
            item.status === "COMPLETED"
              ? "Terlaksana"
              : "Belum/Tidak Terlaksana",
        };
      });
    } else if (type === "CARPET") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exportData = data.map((item: any) => {
        const date = new Date(item.date);
        return {
          Hari: getDayName(date),
          Tanggal: format(date, "dd/MM/yyyy"),
          Lokasi: item.zone === "FLOOR_1" ? "Lantai 1" : "Lantai 2",
          Status: item.status === "COMPLETED" ? "Selesai" : "Belum",
          Petugas: item.className || "-",
        };
      });
    }

    // 2. Build worksheet with header
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wsData: any[][] = [];

    // Add title
    const titleMap = {
      MENSTRUATION: "DATA MENSTRUASI SISWI",
      ADZAN: "JADWAL PETUGAS ADZAN",
      CARPET: "JADWAL GULUNG KARPET",
    };
    wsData.push([titleMap[type]]);
    wsData.push(["SMP IP YAKIN"]);
    wsData.push([
      `Tanggal Export: ${format(new Date(), "dd MMMM yyyy, HH:mm", { locale: id })}`,
    ]);
    wsData.push([]); // Empty row for spacing

    // Add headers
    if (exportData.length > 0) {
      const headers = Object.keys(exportData[0]);
      wsData.push(headers);

      // Add data rows
      exportData.forEach((row) => {
        wsData.push(headers.map((header) => row[header] ?? "-"));
      });
    }

    // Create worksheet from array
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);

    // 3. Auto-width columns
    const wscols =
      exportData.length > 0
        ? Object.keys(exportData[0]).map(() => ({ wch: 20 }))
        : [{ wch: 20 }];
    worksheet["!cols"] = wscols;

    // 4. Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 5. Download
    const dateStr = format(new Date(), "yyyyMMdd_HHmm");
    XLSX.writeFile(workbook, `${filename}_${dateStr}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
    >
      <Download size={16} />
      Export Excel
    </button>
  );
}
