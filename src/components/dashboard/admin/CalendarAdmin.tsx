"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/actions/calendar";
import { SchoolActivity, SemesterType } from "@prisma/client";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";
import { exportCalendarToExcel, CalendarExportData } from "@/utils/excelExport";

const ITEMS_PER_PAGE = 10;

interface CalendarPageProps {
  activities: SchoolActivity[];
}

export default function CalendarAdmin({ activities }: CalendarPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SchoolActivity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filterSemester, setFilterSemester] = useState<SemesterType | "ALL">(
    "ALL"
  );
  const [filterTahunPelajaran, setFilterTahunPelajaran] =
    useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const confirmModal = useToastConfirm();

  // Extract unique tahun pelajaran for filter
  const tahunPelajaranOptions = useMemo(() => {
    const uniqueYears = [...new Set(activities.map((a) => a.tahunPelajaran))]
      .sort()
      .reverse();
    return uniqueYears;
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchesSemester =
        filterSemester === "ALL" || a.semester === filterSemester;
      const matchesTahun =
        filterTahunPelajaran === "ALL" ||
        a.tahunPelajaran === filterTahunPelajaran;
      return matchesSemester && matchesTahun;
    });
  }, [activities, filterSemester, filterTahunPelajaran]);

  // Pagination logic
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedActivities = filteredActivities.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset page when filters change
  const handleSemesterChange = (value: SemesterType | "ALL") => {
    setFilterSemester(value);
    setCurrentPage(1);
  };

  const handleTahunChange = (value: string) => {
    setFilterTahunPelajaran(value);
    setCurrentPage(1);
  };

  // Handle export to Excel
  const handleExportExcel = async () => {
    if (filteredActivities.length === 0) {
      toast.error("Tidak ada data kegiatan untuk diekspor");
      return;
    }

    try {
      setIsExporting(true);

      // Convert SchoolActivity to CalendarExportData format
      const exportData: CalendarExportData[] = filteredActivities.map(
        (activity) => ({
          id: activity.id,
          title: activity.title,
          date: activity.date,
          information: activity.information,
          semester: activity.semester,
          tahunPelajaran: activity.tahunPelajaran,
        })
      );

      exportCalendarToExcel(exportData);
      toast.success("Data kalender berhasil diekspor ke Excel");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor data kalender");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    // Parse date safely
    const dateStr = formData.get("date") as string;
    const date = dateStr ? new Date(dateStr) : new Date();

    // Map form data to match action expectations
    const data = {
      title: formData.get("title") as string,
      date: date,
      description: formData.get("information") as string, // Mapping information to description
      semester: formData.get("semester") as SemesterType,
      tahunPelajaran: formData.get("tahunPelajaran") as string,
      category: "academic", // Default
      isHoliday: false, // Default
      createdBy: "", // Action handles this
    };

    try {
      if (editingItem) {
        const result = await updateCalendarEvent(editingItem.id, {
          title: data.title,
          date: data.date,
          information: data.description,
          semester: data.semester,
          tahunPelajaran: data.tahunPelajaran,
        });
        if (result.success) {
          toast.success("Kegiatan berhasil diperbarui");
          setIsModalOpen(false);
          setEditingItem(null);
          router.refresh();
        } else {
          toast.error(result.error || "Gagal memperbarui kegiatan");
        }
      } else {
        const result = await createCalendarEvent(data);
        if (result.success) {
          toast.success("Kegiatan berhasil ditambahkan");
          setIsModalOpen(false);
          setEditingItem(null);
          router.refresh();
        } else {
          toast.error(result.error || "Gagal menambahkan kegiatan");
        }
      }
    } catch (error) {
      console.error("Failed to save activity:", error);
      toast.error("Gagal menyimpan kegiatan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Kegiatan",
        message: "Apakah Anda yakin ingin menghapus kegiatan ini?",
        description: "Tindakan ini tidak dapat dibatalkan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        try {
          const result = await deleteCalendarEvent(id);
          if (result.success) {
            toast.success("Kegiatan berhasil dihapus");
            router.refresh();
          } else {
            toast.error(result.error || "Gagal menghapus kegiatan");
          }
        } catch (error) {
          console.error("Failed to delete activity:", error);
          toast.error("Gagal menghapus kegiatan");
        }
      }
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Kalender Akademik
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola jadwal kegiatan sekolah ({filteredActivities.length}{" "}
            kegiatan)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Filter Tahun Pelajaran */}
          <div className="relative">
            <CalendarIcon
              className="absolute left-2 top-2.5 text-gray-400"
              size={16}
            />
            <select
              value={filterTahunPelajaran}
              onChange={(e) => handleTahunChange(e.target.value)}
              aria-label="Filter tahun pelajaran"
              className="pl-8 pr-4 py-2 border rounded-lg bg-white appearance-none cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Tahun</option>
              {tahunPelajaranOptions.map((tahun) => (
                <option key={tahun} value={tahun}>
                  {tahun}
                </option>
              ))}
            </select>
          </div>
          {/* Filter Semester */}
          <div className="relative">
            <Filter
              className="absolute left-2 top-2.5 text-gray-400"
              size={16}
            />
            <select
              value={filterSemester}
              onChange={(e) =>
                handleSemesterChange(e.target.value as SemesterType | "ALL")
              }
              aria-label="Filter semester"
              className="pl-8 pr-4 py-2 border rounded-lg bg-white appearance-none cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Semester</option>
              <option value="GANJIL">Ganjil</option>
              <option value="GENAP">Genap</option>
            </select>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            aria-label="Ekspor ke Excel"
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Download size={20} />
            )}{" "}
            Ekspor Excel
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            aria-label="Tambah kegiatan baru"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={20} /> Tambah Kegiatan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tanggal
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kegiatan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Semester
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-blue-500" />
                        {format(new Date(item.date), "dd MMM yyyy", {
                          locale: id,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {item.information}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.semester === "GANJIL"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {item.semester} {item.tahunPelajaran}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsModalOpen(true);
                          }}
                          aria-label={`Edit kegiatan ${item.title}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Hapus kegiatan ${item.title}`}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Tidak ada kegiatan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 p-4">
            <p className="text-sm text-gray-600">
              Menampilkan {startIndex + 1}-
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredActivities.length)}{" "}
              dari {filteredActivities.length} kegiatan
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 px-3">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Halaman selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 id="calendar-modal-title" className="text-xl font-bold">
                {editingItem ? "Edit Kegiatan" : "Tambah Kegiatan"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="cal-title"
                  className="text-sm font-medium text-gray-700"
                >
                  Judul Kegiatan
                </label>
                <input
                  id="cal-title"
                  name="title"
                  required
                  defaultValue={editingItem?.title}
                  placeholder="Masukkan judul kegiatan"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="cal-date"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tanggal
                  </label>
                  <input
                    id="cal-date"
                    type="date"
                    name="date"
                    required
                    defaultValue={
                      editingItem?.date
                        ? new Date(editingItem.date).toISOString().split("T")[0]
                        : ""
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="cal-tahun"
                    className="text-sm font-medium text-gray-700"
                  >
                    Tahun Pelajaran
                  </label>
                  <input
                    id="cal-tahun"
                    name="tahunPelajaran"
                    required
                    defaultValue={editingItem?.tahunPelajaran || "2025/2026"}
                    placeholder="Contoh: 2025/2026"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cal-semester"
                  className="text-sm font-medium text-gray-700"
                >
                  Semester
                </label>
                <select
                  id="cal-semester"
                  name="semester"
                  defaultValue={editingItem?.semester || "GANJIL"}
                  className="w-full p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GANJIL">Ganjil</option>
                  <option value="GENAP">Genap</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cal-info"
                  className="text-sm font-medium text-gray-700"
                >
                  Keterangan/Deskripsi
                </label>
                <textarea
                  id="cal-info"
                  name="information"
                  required
                  defaultValue={editingItem?.information}
                  rows={3}
                  placeholder="Masukkan deskripsi kegiatan"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Kegiatan"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Toast Confirm Modal */}
      <ToastConfirmModal
        isOpen={confirmModal.isOpen}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        {...confirmModal.options}
      />
    </div>
  );
}
