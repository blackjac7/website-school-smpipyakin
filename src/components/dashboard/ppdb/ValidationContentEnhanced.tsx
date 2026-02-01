"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Users,
  School,
  Phone,
} from "lucide-react";
import { getApplicants } from "@/actions/ppdb";

// Updated Interface matching Server Action Response
interface Applicant {
  id: string;
  name: string;
  nisn: string;
  gender: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  address: string | null;
  asalSekolah: string | null;
  parentContact: string | null;
  parentName: string | null;
  parentEmail: string | null;
  status: string;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional client-side properties
  documents?: unknown;
  documentUrls?: unknown;
}

interface ValidationContentEnhancedProps {
  onViewDetail: (applicant: Applicant) => void;
  onExportData: () => void;
  refreshTrigger?: number;
}

export default function ValidationContentEnhanced({
  onViewDetail,
  onExportData,
  refreshTrigger = 0,
}: ValidationContentEnhancedProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch applicants with useCallback for optimization
  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getApplicants({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: statusFilter,
        search: debouncedSearchTerm,
      });

      if (result.success && result.data) {
        setApplicants(result.data.data as unknown as Applicant[]);
        setTotalPages(result.data.meta.totalPages);
        setTotalCount(result.data.meta.total);
      } else {
        console.error("Error fetching applicants:", result.error);
        setApplicants([]);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants, refreshTrigger]);

  const handleViewDetail = async (applicant: Applicant) => {
    setLoadingDetailId(applicant.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      onViewDetail(applicant);
    } finally {
      setLoadingDetailId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" />
            Menunggu
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Diterima
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
            <Clock className="w-3 h-3" />
            Unknown
          </span>
        );
    }
  };

  if (loading && applicants.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-gray-200 rounded-xl"></div>
        <div className="h-20 bg-gray-200 rounded-xl"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-linear-to-r from-[#1E3A8A] to-[#2563EB] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Validasi Pendaftar</h2>
            <p className="text-blue-100 opacity-90">
              Kelola data dan status penerimaan calon siswa
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative group">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau asal sekolah..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-45">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <select
              className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu</option>
              <option value="ACCEPTED">Diterima</option>
              <option value="REJECTED">Ditolak</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={() => {
              // Generate CSV from current data
              const headers = [
                "Nama",
                "NISN",
                "Gender",
                "Asal Sekolah",
                "Ortu",
                "Kontak",
                "Status",
                "Tanggal Daftar",
              ];
              const rows = applicants.map((app) => [
                `"${app.name}"`,
                `"${app.nisn}"`,
                app.gender || "-",
                `"${app.asalSekolah || "-"}"`,
                `"${app.parentName || "-"}"`,
                `"${app.parentContact || "-"}"`,
                app.status,
                new Date(app.createdAt).toLocaleDateString("id-ID"),
              ]);

              const csvContent = [
                headers.join(","),
                ...rows.map((r) => r.join(",")),
              ].join("\n");
              const blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8;",
              });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute(
                "download",
                `data_pendaftar_ppdb_${new Date().toISOString().split("T")[0]}.csv`,
              );
              document.body.appendChild(link);
              link.click();
              // Use link.remove() which does nothing if the node is already detached
              link.remove();

              if (onExportData) onExportData();
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#F59E0B] text-white rounded-xl hover:bg-[#F59E0B]/90 transition-all font-medium shadow-lg shadow-orange-100 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Calon Siswa
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Orang Tua / Wali
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Asal Sekolah
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applicants.map((applicant) => (
                <tr
                  key={applicant.id}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  {/* Student Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {applicant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {applicant.name}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">
                            {applicant.nisn}
                          </span>
                          <span>
                            • {applicant.gender === "MALE" ? "L" : "P"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Parent Info */}
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {applicant.parentName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="w-3 h-3" />
                        {applicant.parentContact}
                      </div>
                    </div>
                  </td>

                  {/* School Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <School className="w-4 h-4 text-gray-400" />
                      {applicant.asalSekolah || "-"}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 text-center">
                    {getStatusBadge(applicant.status)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleViewDetail(applicant)}
                      disabled={loadingDetailId === applicant.id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium shadow-sm hover:shadow"
                    >
                      {loadingDetailId === applicant.id ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Menampilkan {applicants.length} dari {totalCount} data
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {applicants.length === 0 && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Data tidak ditemukan
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm
              ? `Tidak ada hasil pencarian untuk "${searchTerm}"`
              : "Belum ada data pendaftar saat ini."}
          </p>
        </div>
      )}
    </div>
  );
}
