"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import {
  Printer,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  QrCode,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  getAllStudentQRCodes,
  getClassesForQR,
  regenerateAllQRTokens,
  getAvailableYearsForQR,
} from "@/actions/student-qr";
import toast from "react-hot-toast";

interface StudentQR {
  id: string;
  name: string | null;
  nisn: string;
  class: string | null;
  image: string | null;
  qrData: string;
}

export default function QRCodePrintContent() {
  const [students, setStudents] = useState<StudentQR[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const printRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((p) => ({ ...p, page: 1 })); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch classes and years for filter
  useEffect(() => {
    async function fetchFilters() {
      const [classResult, yearResult] = await Promise.all([
        getClassesForQR(),
        getAvailableYearsForQR(),
      ]);

      if (classResult.success) {
        setClasses(classResult.classes);
      }
      if (yearResult.success) {
        setYears(yearResult.years);
      }
    }
    fetchFilters();
  }, []);

  // Fetch students with server-side search
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    const result = await getAllStudentQRCodes(
      selectedClass,
      pagination.page,
      50,
      debouncedSearch || undefined,
      selectedYear,
    );
    if (result.success && result.students) {
      setStudents(result.students);
      if (result.pagination) {
        setPagination({
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          totalCount: result.pagination.totalCount,
        });
      }
    }
    setIsLoading(false);
  }, [selectedClass, pagination.page, debouncedSearch, selectedYear]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle regenerate all QR
  const handleRegenerateAll = async () => {
    setIsRegenerating(true);
    setShowConfirmRegenerate(false);

    try {
      const result = await regenerateAllQRTokens();
      if (result.success) {
        toast.success(result.message || "Berhasil regenerate QR");
        // Refetch students to get new QR codes
        await fetchStudents();
      } else {
        toast.error(result.error || "Gagal regenerate QR");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }

    setIsRegenerating(false);
  };

  // Print handler
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Siswa - ${selectedClass === "all" ? "Semua Kelas" : selectedClass}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: system-ui, sans-serif; padding: 20px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
            .card { 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              padding: 16px; 
              text-align: center;
              page-break-inside: avoid;
            }
            .card svg { width: 120px; height: 120px; margin: 0 auto; }
            .name { font-weight: 600; margin-top: 8px; font-size: 12px; }
            .nisn { color: #6b7280; font-size: 10px; }
            .class { color: #3b82f6; font-size: 10px; font-weight: 500; }
            @media print {
              .grid { grid-template-columns: repeat(4, 1fr); }
              @page { size: A4 landscape; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center; margin-bottom: 20px; font-size: 18px;">
            QR Code Absensi Siswa - SMP IP YAKIN
          </h1>
          <p style="text-align: center; margin-bottom: 20px; color: #6b7280; font-size: 12px;">
            Kelas: ${selectedClass === "all" ? "Semua Kelas" : selectedClass} | 
            Total: ${students.length} siswa
          </p>
          <div class="grid">
            ${students
              .map(
                (student) => `
              <div class="card">
                ${document.getElementById(`qr-${student.id}`)?.outerHTML || ""}
                <p class="name">${student.name || "Tanpa Nama"}</p>
                <p class="nisn">NISN: ${student.nisn}</p>
                <p class="class">${student.class || "-"}</p>
              </div>
            `,
              )
              .join("")}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-7 h-7 text-purple-600" />
            Cetak QR Code Siswa
          </h1>
          <p className="text-gray-500">
            {pagination.totalCount} siswa terdaftar
          </p>
        </div>

        <div className="flex gap-2">
          {/* Regenerate Button */}
          <button
            onClick={() => setShowConfirmRegenerate(true)}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-lg disabled:opacity-50"
          >
            {isRegenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            Regenerate Semua
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={students.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            Print QR
          </button>
        </div>
      </div>

      {/* Confirm Regenerate Modal */}
      {showConfirmRegenerate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Regenerate Semua QR?
                </h3>
                <p className="text-sm text-gray-500">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Semua QR Code siswa yang lama akan <strong>tidak berlaku</strong>{" "}
              dan diganti dengan QR baru. Siswa perlu mengakses QR baru mereka
              untuk scan keterlambatan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmRegenerate(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleRegenerateAll}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-semibold"
              >
                Ya, Regenerate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-4"
      >
        {/* Search (server-side) */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau NISN (semua siswa)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
          {searchTerm && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-purple-600">
              Mencari...
            </span>
          )}
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">Semua Tahun</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>
                Tahun {y}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* QR Grid */}
          <div
            ref={printRef}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {students.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <QRCode
                    id={`qr-${student.id}`}
                    value={student.qrData}
                    size={100}
                    level="M"
                    bgColor="#f9fafb"
                    fgColor="#1e1b4b"
                  />
                </div>
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {student.name || "Tanpa Nama"}
                </p>
                <p className="text-xs text-gray-500">{student.nisn}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                  {student.class || "Belum Ada Kelas"}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {students.length === 0 && (
            <div className="text-center py-20">
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {debouncedSearch
                  ? `Tidak ditemukan siswa dengan kata kunci "${debouncedSearch}"`
                  : "Tidak ada siswa ditemukan"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-gray-600">
                Halaman {pagination.page} dari {pagination.totalPages} (
                {pagination.totalCount} siswa)
              </span>
              <button
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
