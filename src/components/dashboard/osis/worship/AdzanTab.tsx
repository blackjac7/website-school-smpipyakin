"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  upsertAdzanSchedule,
  deleteAdzanSchedule,
  updateAdzanStatus,
} from "@/actions/worship";
import { PrayerTime, TaskStatus } from "@prisma/client";
import StudentSelector from "./StudentSelector";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

const DATES_PER_PAGE = 9; // 3x3 grid

interface AdzanSchedule {
  id: string;
  siswaId: string;
  date: Date;
  prayerTime: PrayerTime;
  status: TaskStatus;
  siswa: {
    name: string | null;
    class: string | null;
  };
}

interface AdzanTabProps {
  schedules: AdzanSchedule[];
}

export default function AdzanTab({ schedules }: AdzanTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    siswaId: "",
    date: new Date().toISOString().split("T")[0],
    prayerTime: "ZUHUR" as PrayerTime, // Fixed to ZUHUR only
  });
  const confirmModal = useToastConfirm();

  // Group by date for easier display
  const schedulesByDate = schedules.reduce(
    (acc, curr) => {
      const dateKey = format(new Date(curr.date), "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(curr);
      return acc;
    },
    {} as Record<string, AdzanSchedule[]>
  );

  const sortedDates = Object.keys(schedulesByDate).sort();

  // Pagination logic for dates
  const totalPages = Math.ceil(sortedDates.length / DATES_PER_PAGE);
  const startIndex = (currentPage - 1) * DATES_PER_PAGE;
  const paginatedDates = sortedDates.slice(
    startIndex,
    startIndex + DATES_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siswaId) {
      toast.error("Pilih siswa petugas");
      return;
    }

    try {
      await upsertAdzanSchedule({
        siswaId: formData.siswaId,
        date: new Date(formData.date),
        prayerTime: formData.prayerTime,
        status: "PENDING",
      });
      toast.success("Jadwal ditambahkan");
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambahkan jadwal");
    }
  };

  const toggleStatus = async (id: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await updateAdzanStatus(id, newStatus);
      toast.success("Status diperbarui");
    } catch (error) {
      console.error(error);
      toast.error("Gagal update status");
    }
  };

  const handleDelete = async (id: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Jadwal",
        message: "Hapus jadwal ini?",
        description: "Tindakan ini tidak dapat dibatalkan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        try {
          await deleteAdzanSchedule(id);
          toast.success("Jadwal dihapus");
        } catch (error) {
          console.error(error);
          toast.error("Gagal menghapus");
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Jadwal Muadzin
          </h3>
          <p className="text-sm text-gray-500">
            Petugas Adzan Zuhur{" "}
            {sortedDates.length > 0 && `(${sortedDates.length} hari)`}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Tambah Jadwal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDates.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Belum ada jadwal adzan bulan ini
          </div>
        ) : (
          paginatedDates.map((dateKey) => {
            const daySchedules = schedulesByDate[dateKey];
            const dateObj = new Date(dateKey);
            const isToday = dateKey === format(new Date(), "yyyy-MM-dd");

            return (
              <div
                key={dateKey}
                className={`bg-white rounded-xl shadow-sm border ${isToday ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"} overflow-hidden`}
              >
                <div
                  className={`px-4 py-3 border-b ${isToday ? "bg-blue-50 text-blue-800" : "bg-gray-50 text-gray-700"} font-medium flex justify-between items-center`}
                >
                  <span>
                    {format(dateObj, "EEEE, d MMM", { locale: idLocale })}
                  </span>
                  {isToday && (
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                      Hari Ini
                    </span>
                  )}
                </div>
                <div className="divide-y divide-gray-100">
                  {daySchedules.map((sch) => (
                    <div
                      key={sch.id}
                      className="p-4 flex items-start gap-3 group hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => toggleStatus(sch.id, sch.status)}
                        className={`mt-0.5 ${sch.status === "COMPLETED" ? "text-green-500" : "text-gray-300 hover:text-gray-400"}`}
                      >
                        {sch.status === "COMPLETED" ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {sch.prayerTime}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900">
                          {sch.siswa.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sch.siswa.class}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(sch.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            Menampilkan {startIndex + 1}-
            {Math.min(startIndex + DATES_PER_PAGE, sortedDates.length)} dari{" "}
            {sortedDates.length} hari
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

      {/* Modal Input */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Tambah Jadwal Adzan</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu Sholat
                </label>
                <div className="w-full p-2.5 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                  Zuhur
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Waktu sholat tetap: Zuhur
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Petugas (Siswa)
                </label>
                <StudentSelector
                  onSelect={(val) => setFormData({ ...formData, siswaId: val })}
                  selectedId={formData.siswaId}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
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
