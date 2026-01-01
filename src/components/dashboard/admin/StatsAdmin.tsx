"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import {
  createSchoolStat,
  updateSchoolStat,
  deleteSchoolStat,
} from "@/actions/stats";
import { SchoolStat } from "@prisma/client";
import toast from "react-hot-toast";
import * as LucideIcons from "lucide-react";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

interface StatsPageProps {
  stats: SchoolStat[];
}

export default function StatsAdmin({ stats }: StatsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<SchoolStat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const confirmModal = useToastConfirm();

  // Helper to render dynamic icon
  const renderIcon = (iconName: string) => {
    const Icon = (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ size?: number; className?: string }>
      >
    )[iconName];
    return Icon ? (
      <Icon size={24} className="text-yellow-500" />
    ) : (
      <LayoutGrid size={24} />
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      label: formData.get("label") as string,
      value: formData.get("value") as string,
      iconName: formData.get("iconName") as string,
      isActive: true,
      sortOrder: 0, // Added to fix type error
    };

    try {
      if (editingStat) {
        await updateSchoolStat(editingStat.id, data);
        toast.success("Statistik berhasil diperbarui");
      } else {
        await createSchoolStat(data);
        toast.success("Statistik berhasil ditambahkan");
      }
      setIsModalOpen(false);
      setEditingStat(null);
    } catch (error) {
      console.error("Failed to save stat:", error);
      toast.error("Gagal menyimpan statistik");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Statistik",
        message: "Apakah Anda yakin ingin menghapus data statistik ini?",
        description: "Tindakan ini tidak dapat dibatalkan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        try {
          await deleteSchoolStat(id);
          toast.success("Statistik berhasil dihapus");
        } catch (error) {
          console.error("Failed to delete stat:", error);
          toast.error("Gagal menghapus statistik");
        }
      }
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Statistik
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola angka statistik yang ditampilkan
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStat(null);
            setIsModalOpen(true);
          }}
          aria-label="Tambah statistik baru"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={20} /> Tambah Statistik
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center relative group"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button
                onClick={() => {
                  setEditingStat(stat);
                  setIsModalOpen(true);
                }}
                aria-label={`Edit statistik ${stat.label}`}
                className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(stat.id)}
                aria-label={`Hapus statistik ${stat.label}`}
                className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex justify-center mb-4 p-3 bg-yellow-50 rounded-full w-fit mx-auto">
              {renderIcon(stat.iconName)}
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">
              {stat.value}
            </div>
            <div className="text-gray-500 font-medium uppercase text-xs tracking-wider">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stats-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 id="stats-modal-title" className="text-xl font-bold">
                {editingStat ? "Edit Statistik" : "Tambah Statistik"}
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
                  htmlFor="stat-label"
                  className="text-sm font-medium text-gray-700"
                >
                  Label
                </label>
                <input
                  id="stat-label"
                  name="label"
                  required
                  defaultValue={editingStat?.label}
                  placeholder="Contoh: Siswa Aktif"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="stat-value"
                  className="text-sm font-medium text-gray-700"
                >
                  Nilai
                </label>
                <input
                  id="stat-value"
                  name="value"
                  required
                  defaultValue={editingStat?.value}
                  placeholder="Contoh: 450+"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="stat-icon"
                  className="text-sm font-medium text-gray-700"
                >
                  Nama Ikon (Lucide React)
                </label>
                <input
                  id="stat-icon"
                  name="iconName"
                  required
                  defaultValue={editingStat?.iconName}
                  placeholder="Contoh: GraduationCap, Users, Award"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">
                  Gunakan nama komponen yang tepat dari lucide-react
                </p>
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
                  {isLoading ? "Menyimpan..." : "Simpan Statistik"}
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
