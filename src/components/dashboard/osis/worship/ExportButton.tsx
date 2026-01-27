"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";

interface ExportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  filename: string;
  sheetName?: string;
  type: 'MENSTRUATION' | 'ADZAN' | 'CARPET';
}

export default function ExportButton({ data, filename, sheetName = "Sheet1", type }: ExportButtonProps) {

  const handleExport = () => {
    // 1. Transform Data for Excel based on Type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let exportData: any[] = [];

    if (type === 'MENSTRUATION') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exportData = data.map((item: any) => ({
            'Nama Siswi': item.siswa?.name || '-',
            'Kelas': item.siswa?.class || '-',
            'Tanggal Mulai': format(new Date(item.startDate), 'dd/MM/yyyy'),
            'Tanggal Selesai': item.endDate ? format(new Date(item.endDate), 'dd/MM/yyyy') : 'Sedang Berlangsung',
            'Durasi (Hari)': item.endDate
                ? Math.floor((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / 86400000) + 1
                : '-',
            'Keterangan': item.notes || '-',
            'Status': item.warning ? 'PERLU CEK' : 'Normal',
            'Peringatan': item.warning || '-'
        }));
    } else if (type === 'ADZAN') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exportData = data.map((item: any) => ({
            'Tanggal': format(new Date(item.date), 'dd/MM/yyyy'),
            'Waktu Sholat': item.prayerTime,
            'Petugas': item.siswa?.name || '-',
            'Kelas': item.siswa?.class || '-',
            'Status Pelaksanaan': item.status === 'COMPLETED' ? 'Terlaksana' : 'Belum/Tidak Terlaksana'
        }));
    } else if (type === 'CARPET') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exportData = data.map((item: any) => ({
            'Tanggal': format(new Date(item.date), 'dd/MM/yyyy'),
            'Lokasi': item.zone === 'FLOOR_1' ? 'Lantai 1' : 'Lantai 2',
            'Status': item.status === 'COMPLETED' ? 'Selesai' : 'Belum',
            'Petugas': item.className || '-'
        }));
    }

    // 2. Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // 3. Auto-width columns (basic)
    const wscols = Object.keys(exportData[0] || {}).map(() => ({ wch: 20 }));
    worksheet['!cols'] = wscols;

    // 4. Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 5. Download
    XLSX.writeFile(workbook, `${filename}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
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
