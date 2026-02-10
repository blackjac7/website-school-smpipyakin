"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { motion, AnimatePresence } from "framer-motion";
import {
  Printer,
  Search,
  CreditCard,
  Loader2,
  Filter,
  CheckSquare,
  Square,
  Users,
  X,
  Eye,
} from "lucide-react";
import StudentCardPreview from "./StudentCardPreview";
import toast from "react-hot-toast";
import {
  getStudentsForCards,
  getAvailableClasses,
  getAvailableAngkatan,
  type StudentCardData,
} from "@/actions/kesiswaan/students";

// ─── Main Component ────────────────────────────────────
export default function StudentCardSystem() {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // Student state
  const [students, setStudents] = useState<StudentCardData[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const printRef = useRef<HTMLDivElement>(null);

  // ─── Debounce search ─────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ─── Fetch filter options ────────────────────────────
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [classes, years] = await Promise.all([
          getAvailableClasses(),
          getAvailableAngkatan(),
        ]);
        setAvailableClasses(classes);
        setAvailableYears(years);
      } catch (error) {
        console.error("Failed to load filters:", error);
      }
    };
    loadFilters();
  }, []);

  // ─── Fetch students with HMAC-signed QR data ────────
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getStudentsForCards({
        search: debouncedSearch,
        classFilter,
        angkatanFilter: yearFilter === "all" ? undefined : Number(yearFilter),
      });

      if (result.success) {
        setStudents(result.data);
      } else {
        toast.error("Gagal memuat data siswa");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, classFilter, yearFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ─── Selection helpers ───────────────────────────────
  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const selectAll = () => setSelectedStudents(students.map((s) => s.id));
  const clearSelection = () => setSelectedStudents([]);

  const selectedStudentData = students.filter((s) =>
    selectedStudents.includes(s.id),
  );

  // ─── Print handler ───────────────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Kartu-Siswa-${new Date().toISOString().split("T")[0]}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 5mm 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
      }
    `,
  });

  // ─── RENDER ──────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            Kartu Siswa
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Cetak kartu identitas siswa dengan QR code terverifikasi
          </p>
        </div>
      </div>

      {/* ═══ Filters ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Class filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">Semua Kelas</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Year filter */}
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="all">Semua Angkatan</option>
            {availableYears.map((y) => (
              <option key={y} value={y.toString()}>
                Angkatan {y}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* ═══ Info Banner ═══ */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Batch Print: 10 Kartu per Halaman A4
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Layout 2 kolom × 5 baris · Ukuran 85.6 × 54 mm (standar ID card) ·
              QR code HMAC-signed untuk keamanan
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Selection Bar ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {selectedStudents.length}{" "}
                  <span className="text-gray-400 font-normal">
                    / {students.length} dipilih
                  </span>
                </p>
                {selectedStudents.length > 0 && (
                  <p className="text-xs text-gray-400">
                    {Math.ceil(selectedStudents.length / 10)} halaman A4
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                onClick={selectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Pilih Semua
              </button>
              {selectedStudents.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  Hapus Pilihan
                </button>
              )}
            </div>
          </div>

          {/* Print Action */}
          <button
            onClick={handlePrint}
            disabled={selectedStudents.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm disabled:shadow-none"
          >
            <Printer className="w-4 h-4" />
            Print Kartu
          </button>
        </div>
      </div>

      {/* ═══ Student Grid ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Daftar Siswa
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-400">Memuat data siswa...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              {debouncedSearch
                ? `Tidak ditemukan siswa dengan kata kunci "${debouncedSearch}"`
                : "Tidak ada data siswa"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {students.map((student, idx) => {
              const selected = selectedStudents.includes(student.id);
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                  onClick={() => toggleStudent(student.id)}
                  className={`group relative p-3.5 border-2 rounded-xl cursor-pointer transition-all duration-150 ${
                    selected
                      ? "border-blue-500 bg-blue-50/60 shadow-sm shadow-blue-100"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                        selected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 group-hover:border-gray-400"
                      }`}
                    >
                      {selected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        NISN: {student.nisn}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-medium">
                          {student.class || "N/A"}
                        </span>
                        <span className="text-xs text-gray-400">
                          Angkatan {student.year || "?"}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        student.gender === "MALE"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-pink-100 text-pink-600"
                      }`}
                    >
                      {student.gender === "MALE" ? "L" : "P"}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ Card Preview ═══ */}
      <AnimatePresence>
        {selectedStudents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                Preview Kartu
                <span className="text-xs font-normal text-gray-400 ml-1">
                  ({selectedStudents.length} kartu ·{" "}
                  {Math.ceil(selectedStudents.length / 10)} halaman)
                </span>
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 overflow-x-auto">
              <div
                ref={printRef}
                className="print-container"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 85.6mm)",
                  columnGap: "4mm",
                  rowGap: "3mm",
                  padding: "8mm",
                  backgroundColor: "white",
                  justifyContent: "center",
                }}
              >
                {selectedStudentData.map((student) => (
                  <StudentCardPreview key={student.id} student={student} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
