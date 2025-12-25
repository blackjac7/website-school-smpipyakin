"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CheckSquare, Square, Trash2, Plus, Users, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { createCarpetSchedule, deleteCarpetSchedule, updateCarpetStatus } from "@/actions/worship";
import { CarpetZone, TaskStatus } from "@prisma/client";
import StudentSelector from "./StudentSelector";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

interface CarpetSchedule {
  id: string;
  date: Date;
  zone: CarpetZone;
  status: TaskStatus;
  assignments: {
      siswa: {
          name: string | null;
          class: string | null;
      };
  }[];
}

interface CarpetTabProps {
  schedules: CarpetSchedule[];
}

export default function CarpetTab({ schedules }: CarpetTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    zone: "FLOOR_1" as CarpetZone,
    studentIds: [] as string[]
  });
  const confirmModal = useToastConfirm();

  // Group by date
  const schedulesByDate = schedules.reduce((acc, curr) => {
    const dateKey = format(new Date(curr.date), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(curr);
    return acc;
  }, {} as Record<string, CarpetSchedule[]>);

  const sortedDates = Object.keys(schedulesByDate).sort();

  const handleAddStudent = (id: string) => {
    if (!formData.studentIds.includes(id)) {
        setFormData(prev => ({ ...prev, studentIds: [...prev.studentIds, id] }));
    }
  };

  const removeStudent = (id: string) => {
    setFormData(prev => ({ ...prev, studentIds: prev.studentIds.filter(sid => sid !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.studentIds.length === 0) {
        toast.error("Pilih minimal satu petugas");
        return;
    }

    try {
        await createCarpetSchedule({
            date: new Date(formData.date),
            zone: formData.zone,
            studentIds: formData.studentIds
        });
        toast.success("Jadwal karpet dibuat");
        setIsModalOpen(false);
        setFormData(prev => ({ ...prev, studentIds: [] })); // Reset students
    } catch (error) {
        console.error(error);
        toast.error("Gagal menyimpan jadwal");
    }
  };

  const toggleStatus = async (id: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
        await updateCarpetStatus(id, newStatus);
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
            await deleteCarpetSchedule(id);
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
            <h3 className="text-lg font-semibold text-gray-700">Jadwal Gelar Karpet</h3>
            <p className="text-sm text-gray-500">Persiapan sholat Lantai 1 & 2</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          <Plus size={18} /> Buat Jadwal
        </button>
      </div>

      <div className="space-y-4">
        {sortedDates.length === 0 ? (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                Belum ada jadwal karpet bulan ini
            </div>
        ) : (
            sortedDates.map(dateKey => {
                const daySchedules = schedulesByDate[dateKey];
                const dateObj = new Date(dateKey);

                return (
                    <div key={dateKey} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-medium text-gray-700 flex items-center gap-2">
                            <Layers size={18} className="text-gray-400" />
                            {format(dateObj, "EEEE, d MMM yyyy", { locale: idLocale })}
                        </div>
                        <div className="divide-y divide-gray-100">
                            {daySchedules.map(sch => (
                                <div key={sch.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50">
                                    <div className="flex items-center gap-3 min-w-[150px]">
                                        <button
                                            onClick={() => toggleStatus(sch.id, sch.status)}
                                            className={`${sch.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-300'}`}
                                        >
                                            {sch.status === 'COMPLETED' ? <CheckSquare size={24} /> : <Square size={24} />}
                                        </button>
                                        <div>
                                            <div className="text-sm font-bold text-gray-600 uppercase">
                                                {sch.zone === 'FLOOR_1' ? 'Lantai 1' : 'Lantai 2'}
                                            </div>
                                            <div className={`text-xs px-2 py-0.5 rounded-full w-fit mt-1 ${sch.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {sch.status === 'COMPLETED' ? 'Selesai' : 'Belum Selesai'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-2">
                                            {sch.assignments.map((assign, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm border border-blue-100">
                                                    <Users size={14} />
                                                    <span className="font-medium">{assign.siswa.name}</span>
                                                    <span className="text-xs text-blue-400">({assign.siswa.class})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(sch.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-2"
                                        title="Hapus Jadwal"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })
        )}
      </div>

      {/* Modal Input */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Buat Jadwal Karpet</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={formData.zone}
                        onChange={(e) => setFormData({...formData, zone: e.target.value as CarpetZone})}
                    >
                        <option value="FLOOR_1">Lantai 1 (Utama)</option>
                        <option value="FLOOR_2">Lantai 2</option>
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Petugas (Kelompok)</label>
                <div className="mb-2">
                    <StudentSelector
                        onSelect={handleAddStudent}
                        placeholder="Cari dan klik siswa untuk menambahkan..."
                    />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[100px]">
                    {formData.studentIds.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">Belum ada siswa dipilih</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {formData.studentIds.map(sid => (
                                <div key={sid} className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                                    <span className="text-sm font-medium">ID: {sid.substring(0,6)}...</span>
                                    {/* Ideally we show name, but we only have ID in state.
                                        For UX, we might need a map of ID->Name, but for MVP ID is okay or we fetch details.
                                        Wait, StudentSelector only returns ID.
                                        Let's assume the user knows who they picked or we need to improve state.
                                        Improvement: StudentSelector could return full object or we fetch list.
                                    */}
                                    <button
                                        type="button"
                                        onClick={() => removeStudent(sid)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <p className="text-xs text-gray-500 mt-1">* Siswa yang dipilih akan masuk dalam satu kelompok tugas.</p>
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
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
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
