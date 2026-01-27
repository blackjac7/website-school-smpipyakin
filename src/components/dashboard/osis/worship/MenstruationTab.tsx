"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Plus,
  AlertTriangle,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  upsertMenstruationRecord,
  deleteMenstruationRecord,
} from "@/actions/worship";
import StudentSelector from "./StudentSelector";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

const ITEMS_PER_PAGE = 10;

interface MenstruationRecord {
  id: string;
  siswaId: string;
  startDate: Date;
  endDate: Date | null;
  notes: string | null;
  siswa: {
    name: string | null;
    class: string | null;
  };
  warning: string | null;
}

interface MenstruationTabProps {
  records: MenstruationRecord[];
  onRefresh?: () => void;
}

export default function MenstruationTab({ records, onRefresh }: MenstruationTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    siswaId: "",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const confirmModal = useToastConfirm();

  // Pagination logic
  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecords = records.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siswaId) {
      toast.error("Pilih siswi terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      await upsertMenstruationRecord({
        siswaId: formData.siswaId,
        startDate: new Date(formData.startDate),
        notes: formData.notes,
      });
      toast.success("Data berhasil disimpan");
      setIsModalOpen(false);
      setFormData({
        siswaId: "",
        startDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

  const handleEndPeriod = async (record: MenstruationRecord) => {
    confirmModal.showConfirm(
      {
        title: "Konfirmasi Selesai Haid",
        message: "Konfirmasi haid selesai hari ini?",
        description: "Status siswi akan kembali menjadi 'Suci'.",
        type: "success",
        confirmText: "Ya, Selesai",
        cancelText: "Batal",
      },
      async () => {
        try {
          await upsertMenstruationRecord({
            id: record.id,
            siswaId: record.siswaId,
            startDate: record.startDate,
            endDate: new Date(),
            notes: record.notes || undefined, // Fix: Convert null to undefined
          });
          toast.success("Status diperbarui");
          if (onRefresh) onRefresh();
        } catch (error) {
          console.error(error);
          toast.error("Gagal update status");
        }
      }
    );
  };

  const handleDelete = async (id: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Data",
        message: "Hapus data ini?",
        description: "Tindakan ini tidak dapat dibatalkan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        try {
          await deleteMenstruationRecord(id);
          toast.success("Data dihapus");
          if (onRefresh) onRefresh();
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
        <h3 className="text-lg font-semibold text-gray-700">
          Absensi Sholat Putri
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
        >
          <Plus size={18} /> Catat Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-pink-50 text-pink-900">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Siswi
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Mulai
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Selesai
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Durasi
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Status/Peringatan
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold">
                Keterangan
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Belum ada data tercatat
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => {
                const isActive = !record.endDate;
                const duration = isActive
                  ? Math.floor(
                      (new Date().getTime() -
                        new Date(record.startDate).getTime()) /
                        86400000
                    ) + 1
                  : Math.floor(
                      (new Date(record.endDate!).getTime() -
                        new Date(record.startDate).getTime()) /
                        86400000
                    ) + 1;

                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {record.siswa.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.siswa.class}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(record.startDate), "d MMM yyyy", {
                        locale: idLocale,
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.endDate ? (
                        format(new Date(record.endDate), "d MMM yyyy", {
                          locale: idLocale,
                        })
                      ) : (
                        <span className="text-green-600 font-medium">
                          Sedang Berlangsung
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {duration} Hari
                    </td>
                    <td className="px-6 py-4">
                      {record.warning ? (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit text-xs font-medium border border-amber-100">
                          <AlertTriangle size={14} />
                          {record.warning}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {isActive && (
                          <button
                            onClick={() => handleEndPeriod(record)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg tooltip"
                            title="Tandai Selesai"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Hapus Data"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              Menampilkan {startIndex + 1}-
              {Math.min(startIndex + ITEMS_PER_PAGE, records.length)} dari{" "}
              {records.length} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Halaman selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Input */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Input Data Haid</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Siswi
                </label>
                <StudentSelector
                  onSelect={(val) => setFormData({ ...formData, siswaId: val })}
                  selectedId={formData.siswaId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan (Opsional)
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
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
                  disabled={loading}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Data"}
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
