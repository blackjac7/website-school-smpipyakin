"use client";

import { useState, useEffect } from "react";
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
  Calendar,
  ArrowUpDown,
  MoreVertical,
  User,
  Phone,
  Mail,
} from "lucide-react";

interface Applicant {
  id: string;
  name: string;
  nisn: string;
  gender: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  address: string | null;
  asalSekolah: string | null;
  parentContact: string | null;
  parentName: string | null;
  parentEmail: string | null;
  status: string;
  statusColor?: string;
  feedback: string | null;
  documents?: {
    ijazah: boolean;
    akta: boolean;
    kk: boolean;
    foto: boolean;
  };
  documentUrls?: {
    ijazahUrl: string | null;
    aktaKelahiranUrl: string | null;
    kartuKeluargaUrl: string | null;
    pasFotoUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface ValidationContentEnhancedProps {
  onViewDetail: (applicant: Applicant) => void;
  onExportData: () => void;
  refreshTrigger?: number; // Add trigger for refresh
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
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        if (statusFilter !== "ALL") {
          params.append("status", statusFilter);
        }

        if (debouncedSearchTerm.trim()) {
          params.append("search", debouncedSearchTerm.trim());
        }

        const response = await fetch(`/api/ppdb/applications?${params}`);
        const result = await response.json();

        if (result.success) {
          setApplicants(result.data);
          setTotalPages(result.pagination.pages);
          setTotalCount(result.pagination.total);
        } else {
          console.error("Error fetching applicants:", result.error);
          setApplicants([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching applicants:", error);
        setApplicants([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [currentPage, statusFilter, sortBy, debouncedSearchTerm, refreshTrigger]);

  // Server-side filtering is handled by the API

  const handleViewDetail = async (applicant: Applicant) => {
    setLoadingDetailId(applicant.id);
    try {
      // Small delay for better UX
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
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Menunggu Review
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Diterima
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3" />
            Unknown
          </span>
        );
    }
  };

  const getStatusCount = (status: string) => {
    return applicants.filter((app) => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="flex gap-4">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Validasi Pendaftar
            </h2>
            <p className="text-gray-600">
              Review dan validasi aplikasi calon siswa baru
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-600">{totalCount}</div>
            <div className="text-xs text-gray-600">Total Pendaftar</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-600">
              {getStatusCount("PENDING")}
            </div>
            <div className="text-xs text-gray-600">Menunggu Review</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-600">
              {getStatusCount("APPROVED")}
            </div>
            <div className="text-xs text-gray-600">Diterima</div>
          </div>
          <div className="bg-white/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-600">
              {getStatusCount("REJECTED")}
            </div>
            <div className="text-xs text-gray-600">Ditolak</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau asal sekolah..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu Review</option>
              <option value="ACCEPTED">Diterima</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="name">Nama A-Z</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={onExportData}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Calon Siswa
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Informasi Kontak
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Asal Sekolah
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Tanggal Daftar
                </th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applicants.map((applicant: Applicant) => (
                <tr
                  key={applicant.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Student Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {applicant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          NISN: {applicant.nisn}
                        </div>
                        <div className="text-xs text-gray-400">
                          {applicant.gender === "LAKI_LAKI"
                            ? "Laki-laki"
                            : "Perempuan"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">
                          {applicant.parentName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">
                          {applicant.parentContact}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600 truncate max-w-32">
                          {applicant.parentEmail}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* School Info */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {applicant.asalSekolah || "Tidak diisi"}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    {getStatusBadge(applicant.status)}
                  </td>

                  {/* Registration Date */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(applicant.createdAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetail(applicant)}
                        disabled={loadingDetailId === applicant.id}
                        className={`flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm ${
                          loadingDetailId === applicant.id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {loadingDetailId === applicant.id ? (
                          <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        Detail
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan {applicants.length} dari {totalCount} pendaftar
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Sebelumnya
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {applicants.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada pendaftar
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? `Tidak ditemukan pendaftar dengan kata kunci "${searchTerm}"`
              : "Belum ada pendaftar yang sesuai dengan filter yang dipilih"}
          </p>
        </div>
      )}
    </div>
  );
}
