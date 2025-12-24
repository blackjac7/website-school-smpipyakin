"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Download, Search, Filter } from "lucide-react";
import { Applicant } from "./types";
import ApplicantsTable from "./ApplicantsTable";
import { getApplicants } from "@/actions/ppdb";

interface ValidationContentProps {
  onViewDetail: (applicant: Applicant) => void;
  onExportData: () => void;
}

interface PPDBApplication {
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
  statusColor: string;
  feedback: string | null;
  documents: {
    ijazah: boolean;
    akta: boolean;
    kk: boolean;
    foto: boolean;
  };
  documentUrls: {
    ijazahUrl: string | null;
    aktaKelahiranUrl: string | null;
    kartuKeluargaUrl: string | null;
    pasFotoUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ValidationContent({
  onViewDetail,
  onExportData,
}: ValidationContentProps) {
  const [applications, setApplications] = useState<PPDBApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getApplicants({
        page: currentPage,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: searchTerm || undefined,
      });

      if (result.success && result.data) {
        // Server action returns { data: { data: [...], meta: {...} } }
        const applicationsData = result.data.data.map((app) => ({
          ...app,
          statusColor: getStatusColor(app.status),
          documents: {
            ijazah: !!app.ijazahUrl,
            akta: !!app.aktaKelahiranUrl,
            kk: !!app.kartuKeluargaUrl,
            foto: !!app.pasFotoUrl,
          },
          documentUrls: {
            ijazahUrl: app.ijazahUrl,
            aktaKelahiranUrl: app.aktaKelahiranUrl,
            kartuKeluargaUrl: app.kartuKeluargaUrl,
            pasFotoUrl: app.pasFotoUrl,
          },
        }));
        setApplications(applicationsData as PPDBApplication[]);
        setTotalPages(result.data.meta?.totalPages || 1);
        setTotalCount(result.data.meta?.total || 0);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Convert PPDBApplication to Applicant format for compatibility
  const convertToApplicant = (app: PPDBApplication): Applicant => ({
    id: parseInt(app.id) || 0,
    name: app.name,
    nisn: app.nisn,
    status: getStatusLabel(app.status),
    statusColor: app.statusColor,
    date: new Date(app.createdAt).toLocaleDateString("id-ID"),
    email: app.parentEmail || "",
    phone: "", // Nomor telepon siswa tidak dikumpulkan dalam PPDB
    address: app.address || "",
    birthDate: app.birthDate || "",
    birthPlace: app.birthPlace || "",
    parentName: app.parentName || "",
    parentPhone: app.parentContact || "", // Nomor telepon orang tua tersedia
    previousSchool: app.asalSekolah || "",
    grade: 0, // Not collected in PPDB
    documents: {
      ...app.documents,
      raport: false, // PPDB doesn't have raport requirement
    },
  });

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "Menunggu";
      case "ACCEPTED":
        return "Diterima";
      case "REJECTED":
        return "Ditolak";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPTED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Statistics based on current data
  const stats = [
    {
      label: "Total Pendaftar",
      value: totalCount.toString(),
      color: "bg-blue-100 text-blue-700",
      icon: FileText,
    },
    {
      label: "Menunggu Validasi",
      value: applications
        .filter((app) => app.status === "PENDING")
        .length.toString(),
      color: "bg-yellow-100 text-yellow-700",
      icon: FileText,
    },
    {
      label: "Diterima",
      value: applications
        .filter((app) => app.status === "ACCEPTED")
        .length.toString(),
      color: "bg-green-100 text-green-700",
      icon: FileText,
    },
    {
      label: "Ditolak",
      value: applications
        .filter((app) => app.status === "REJECTED")
        .length.toString(),
      color: "bg-red-100 text-red-700",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Validasi Pendaftar PPDB
          </h3>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          Kelola dan validasi data calon siswa baru. Periksa dokumen
          persyaratan, verifikasi informasi, dan tentukan status penerimaan
          setiap pendaftar.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                {stat.label}
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama, NISN, atau asal sekolah..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="PENDING">Menunggu</option>
                <option value="ACCEPTED">Diterima</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>

            <button
              onClick={onExportData}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat data pendaftar...</p>
          </div>
        ) : applications.length > 0 ? (
          <>
            <ApplicantsTable
              applicants={applications.map(convertToApplicant)}
              onViewDetail={onViewDetail}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Menampilkan {(currentPage - 1) * 10 + 1} -{" "}
                    {Math.min(currentPage * 10, totalCount)} dari {totalCount}{" "}
                    pendaftar
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada data pendaftar
            </h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "Tidak ada pendaftar yang sesuai dengan filter yang dipilih"
                : "Belum ada pendaftar PPDB yang terdaftar"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
