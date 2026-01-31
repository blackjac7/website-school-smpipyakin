"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Award,
  Palette,
  Calendar,
} from "lucide-react";
import {
  getStudentsForKesiswaan,
  getAllStudentsForExport,
  getAvailableClasses,
  getAvailableAngkatan,
  getStudentStats,
  StudentData,
} from "@/actions/kesiswaan/students";
import { exportStudentsToExcel } from "@/utils/studentExport";
import toast from "react-hot-toast";
import AddStudentModal from "./AddStudentModal";
import ImportStudentModal from "./ImportStudentModal";
import { Plus, Upload } from "lucide-react";

export default function StudentManagement() {
  // State
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState<"all" | "MALE" | "FEMALE">(
    "all"
  );
  const [angkatanFilter, setAngkatanFilter] = useState<number | "all">("all");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableAngkatan, setAvailableAngkatan] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    maleCount: 0,
    femaleCount: 0,
    byClass: [] as Array<{ class: string; count: number }>,
  });

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getStudentsForKesiswaan({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        classFilter: classFilter !== "all" ? classFilter : undefined,
        genderFilter: genderFilter !== "all" ? genderFilter : undefined,
        angkatanFilter: angkatanFilter !== "all" ? angkatanFilter : undefined,
      });

      if (result.success) {
        setStudents(result.data);
        setPagination(result.pagination);
      } else {
        toast.error(result.error || "Gagal memuat data siswa");
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Gagal memuat data siswa");
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    searchQuery,
    classFilter,
    genderFilter,
    angkatanFilter,
  ]);

  // Initial load
  useEffect(() => {
    const loadInitialData = async () => {
      const [classesResult, angkatanResult, statsResult] = await Promise.all([
        getAvailableClasses(),
        getAvailableAngkatan(),
        getStudentStats(),
      ]);
      setAvailableClasses(classesResult);
      setAvailableAngkatan(angkatanResult);
      setStats(statsResult);
    };
    loadInitialData();
  }, []);

  // Fetch students when filters change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleClassFilterChange = (value: string) => {
    setClassFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleGenderFilterChange = (value: "all" | "MALE" | "FEMALE") => {
    setGenderFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAngkatanFilterChange = (value: string) => {
    setAngkatanFilter(value === "all" ? "all" : parseInt(value));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Export to Excel
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getAllStudentsForExport({
        classFilter: classFilter !== "all" ? classFilter : undefined,
        genderFilter: genderFilter !== "all" ? genderFilter : undefined,
        angkatanFilter: angkatanFilter !== "all" ? angkatanFilter : undefined,
      });

      if (result.success && result.data.length > 0) {
        exportStudentsToExcel(result.data, {
          classFilter: classFilter !== "all" ? classFilter : undefined,
          genderFilter: genderFilter !== "all" ? genderFilter : undefined,
          angkatanFilter: angkatanFilter !== "all" ? angkatanFilter : undefined,
        });
        toast.success(`Berhasil export ${result.data.length} data siswa`);
      } else if (result.data.length === 0) {
        toast.error("Tidak ada data untuk diexport");
      } else {
        toast.error(result.error || "Gagal export data");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal export data siswa");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle view detail
  const handleViewDetail = (student: StudentData) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Siswa</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.totalStudents}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Laki-laki</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.maleCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-50 rounded-lg">
              <User className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Perempuan</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.femaleCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jumlah Kelas</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.byClass.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama, NISN, atau email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={classFilter}
                onChange={(e) => handleClassFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">Semua Kelas</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={genderFilter}
              onChange={(e) =>
                handleGenderFilterChange(
                  e.target.value as "all" | "MALE" | "FEMALE"
                )
              }
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="all">Semua Gender</option>
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={angkatanFilter}
                onChange={(e) => handleAngkatanFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">Semua Angkatan</option>
                {availableAngkatan.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                <Upload className="w-4 h-4" />
                Import
                </button>
                
                <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                <Plus className="w-4 h-4" />
                Tambah Siswa
                </button>

                <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Download className="w-4 h-4" />
                )}
                Export
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      No
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      NISN
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Kelas
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Gender
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Prestasi
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-700">
                      Karya
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.length > 0 ? (
                    students.map((student, index) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-500">
                          {(pagination.page - 1) * pagination.limit + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.email || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-mono">
                          {student.nisn}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                            {student.class || "Belum ada"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.gender === "MALE"
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : student.gender === "FEMALE"
                                  ? "bg-pink-50 text-pink-700 border border-pink-100"
                                  : "bg-gray-50 text-gray-500 border border-gray-100"
                            }`}
                          >
                            {student.gender === "MALE"
                              ? "L"
                              : student.gender === "FEMALE"
                                ? "P"
                                : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium border border-yellow-100">
                            {student.achievementCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                            {student.workCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(student)}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>Tidak ada data siswa ditemukan</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  dari {pagination.total} siswa
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium ${
                            pagination.page === pageNum
                              ? "bg-purple-600 text-white"
                              : "hover:bg-gray-50 text-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">Detail Siswa</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedStudent.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    NISN: {selectedStudent.nisn}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Kelas</p>
                  <p className="font-medium text-gray-900">
                    {selectedStudent.class || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Gender</p>
                  <p className="font-medium text-gray-900">
                    {selectedStudent.gender === "MALE"
                      ? "Laki-laki"
                      : selectedStudent.gender === "FEMALE"
                        ? "Perempuan"
                        : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tempat Lahir</p>
                  <p className="font-medium text-gray-900">
                    {selectedStudent.birthPlace || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tanggal Lahir</p>
                  <p className="font-medium text-gray-900">
                    {selectedStudent.birthDate || "-"}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {selectedStudent.email || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {selectedStudent.phone || "-"}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">
                    {selectedStudent.address || "-"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nama Orang Tua</p>
                  <p className="font-medium text-gray-900">
                    {selectedStudent.parentName || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">No. HP Orang Tua</p>
                  <p className="font-medium text-gray-900">
                    {selectedStudent.parentPhone || "-"}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <div className="flex-1 p-3 bg-yellow-50 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <p className="text-2xl font-bold text-yellow-700">
                      {selectedStudent.achievementCount}
                    </p>
                  </div>
                  <p className="text-xs text-yellow-600">Prestasi</p>
                </div>
                <div className="flex-1 p-3 bg-green-50 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Palette className="w-4 h-4 text-green-600" />
                    <p className="text-2xl font-bold text-green-700">
                      {selectedStudent.workCount}
                    </p>
                  </div>
                  <p className="text-xs text-green-600">Karya</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
            fetchStudents();
            setIsAddModalOpen(false);
        }}
        availableClasses={availableClasses}
      />

      {/* Import Student Modal */}
      <ImportStudentModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
            fetchStudents();
            setIsImportModalOpen(false);
        }}
      />
    </div>
  );
}
