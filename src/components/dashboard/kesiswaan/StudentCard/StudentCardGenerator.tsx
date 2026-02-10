"use client";

import React, { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Download,
  Printer,
  Eye,
  Users,
  Search,
  CreditCard,
  Loader2,
} from "lucide-react";
import StudentCardPreview from "./StudentCardPreview";
import toast from "react-hot-toast";
import {
  getAllStudentsForExport,
  getAvailableClasses,
  getAvailableAngkatan,
} from "@/actions/kesiswaan/students";

interface Student {
  id: string;
  nisn: string;
  name: string;
  class: string | null;
  year: number | null;
  gender: "MALE" | "FEMALE";
  birthDate: string | null;
  birthPlace: string | null;
}

export default function StudentCardGenerator() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const printRef = useRef<HTMLDivElement>(null);

  // Fetch filter options and initial students
  useEffect(() => {
    const initData = async () => {
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
    initData();
  }, []);

  // Fetch students function
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const result = await getAllStudentsForExport({
        search: searchQuery,
        classFilter: classFilter,
        angkatanFilter: yearFilter === "all" ? undefined : Number(yearFilter),
      });

      if (result.success) {
        const mappedStudents = result.data.map((s) => ({
          id: s.id,
          nisn: s.nisn,
          name: s.name,
          class: s.class,
          year: s.year,
          gender: (s.gender === "FEMALE" ? "FEMALE" : "MALE") as
            | "MALE"
            | "FEMALE",
          birthDate: s.birthDate,
          birthPlace: s.birthPlace,
        }));
        setStudents(mappedStudents);
      } else {
        console.error(result.error);
        toast.error("Gagal memuat data siswa");
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, classFilter, yearFilter]);

  // Toggle select student
  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  // Select all filtered students
  const selectAll = () => {
    const allIds = students.map((s) => s.id);
    setSelectedStudents(allIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Get selected student data
  const selectedStudentData = students.filter((s) =>
    selectedStudents.includes(s.id),
  );

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Kartu-Siswa-${new Date().toISOString().split("T")[0]}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          print-color-adjust: exact;
        }
      }
    `,
  });

  // Download as PDF with multi-page support (10 cards per page)
  const handleDownloadPDF = async () => {
    if (!printRef.current || selectedStudents.length === 0) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    try {
      setGenerating(true);
      toast.loading("Generating PDF...", { id: "pdf-gen" });

      // Wait a bit for DOM to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const cardsPerPage = 10; // 2 columns x 5 rows
      const totalPages = Math.ceil(selectedStudentData.length / cardsPerPage);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Get all card elements
      const cardElements = printRef.current.querySelectorAll(".student-card");

      if (cardElements.length === 0) {
        throw new Error("Kartu tidak ditemukan. Silakan coba lagi.");
      }

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }

        const startIdx = page * cardsPerPage;
        const endIdx = Math.min(startIdx + cardsPerPage, cardElements.length);

        // Card dimensions and layout
        const cardWidth = 85.6;
        const cardHeight = 54;
        const margin = 10;
        const gap = 5;

        // Process cards for this page
        for (let i = startIdx; i < endIdx; i++) {
          const cardIndex = i - startIdx;
          const row = Math.floor(cardIndex / 2);
          const col = cardIndex % 2;
          const x = margin + col * (cardWidth + gap);
          const y = margin + row * (cardHeight + gap);

          // Capture individual card
          const canvas = await html2canvas(cardElements[i] as HTMLElement, {
            scale: 4,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: cardWidth * 3.7795, // mm to px at 300 DPI
            height: cardHeight * 3.7795,
          });

          const imgData = canvas.toDataURL("image/png", 1.0);
          pdf.addImage(imgData, "PNG", x, y, cardWidth, cardHeight);
        }

        // Add page footer
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(
          `Halaman ${page + 1}/${totalPages} | ${selectedStudentData.length} kartu | SMP IP YAKIN`,
          pageWidth / 2,
          pageHeight - 5,
          { align: "center" },
        );
      }

      const filename = `Kartu-Siswa-${selectedStudentData.length}-cards-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);

      toast.dismiss("pdf-gen");
      toast.success(
        `PDF berhasil dibuat! ${totalPages} halaman • ${selectedStudentData.length} kartu`,
        { duration: 4000 },
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss("pdf-gen");
      const errorMessage =
        error instanceof Error ? error.message : "Gagal membuat PDF";
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  // Download as PNG
  const handleDownloadPNG = async () => {
    if (!printRef.current || selectedStudents.length === 0) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    try {
      setGenerating(true);
      toast.loading("Generating PNG...", { id: "png-gen" });

      // Wait a bit for DOM to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      const element = printRef.current;

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `Kartu-Siswa-${selectedStudents.length}-cards-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.dismiss("png-gen");
      toast.success(`PNG berhasil dibuat! ${selectedStudents.length} kartu`, {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error generating PNG:", error);
      toast.dismiss("png-gen");
      const errorMessage =
        error instanceof Error ? error.message : "Gagal membuat PNG";
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              📄 Batch Print: 10 Kartu per Halaman A4
            </h3>
            <p className="text-xs text-gray-600">
              Layout: 2 kolom × 5 baris | Ukuran kartu: 85.6mm × 54mm (standard
              ID card) |
              <span className="font-medium">
                {" "}
                Pilih banyak siswa → Download PDF → Print batch sekaligus
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Generate Kartu Siswa
            </h1>
            <p className="text-gray-600 mt-1">
              Pilih siswa untuk generate kartu identitas dengan QR code
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Kelas</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                Kelas {cls}
              </option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Tahun (Angkatan)</option>
            {availableYears.map((year) => (
              <option key={year} value={year.toString()}>
                Tahun {year}
              </option>
            ))}
          </select>
        </div>

        {/* Selection Info & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedStudents.length} dari {students.length} siswa dipilih
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Pilih Semua
                </button>
                {selectedStudents.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Hapus Pilihan
                  </button>
                )}
              </div>
            </div>
            {selectedStudents.length > 0 && (
              <div className="text-xs text-gray-600 flex items-center gap-2">
                📄 Layout: {Math.ceil(selectedStudents.length / 10)} halaman A4
                (10 kartu/halaman = 2 kolom × 5 baris)
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              disabled={selectedStudents.length === 0 || generating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={selectedStudents.length === 0 || generating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={selectedStudents.length === 0 || generating}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              PNG
            </button>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Daftar Siswa
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Memuat data siswa...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedStudents.includes(student.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-600">
                      NISN: {student.nisn}
                    </p>
                    <p className="text-sm text-gray-600">
                      Kelas: {student.class || "N/A"} | Tahun:{" "}
                      {student.year || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && students.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada siswa ditemukan</p>
          </div>
        )}
      </div>

      {/* Preview Section */}
      {selectedStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Preview Kartu ({selectedStudents.length} kartu)
            </h2>
          </div>

          <div
            ref={printRef}
            className="print-container"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10mm",
              padding: "10mm",
              backgroundColor: "white",
            }}
          >
            {selectedStudentData.map((student) => (
              <StudentCardPreview key={student.id} student={student} />
            ))}
          </div>
        </div>
      )}

      {generating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-700 font-medium">
              Generating kartu siswa...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
