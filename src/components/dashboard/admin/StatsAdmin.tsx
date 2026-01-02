"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, LayoutGrid, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

// Popular icons for stats - organized by category
const POPULAR_ICONS = [
  // People & Education
  { name: "Users", category: "People" },
  { name: "User", category: "People" },
  { name: "UserCheck", category: "People" },
  { name: "UsersRound", category: "People" },
  { name: "GraduationCap", category: "Education" },
  { name: "BookOpen", category: "Education" },
  { name: "School", category: "Education" },
  { name: "Library", category: "Education" },
  { name: "Backpack", category: "Education" },
  { name: "PencilRuler", category: "Education" },
  // Achievement & Awards
  { name: "Award", category: "Achievement" },
  { name: "Trophy", category: "Achievement" },
  { name: "Medal", category: "Achievement" },
  { name: "Star", category: "Achievement" },
  { name: "Crown", category: "Achievement" },
  { name: "Target", category: "Achievement" },
  // Buildings & Places
  { name: "Building", category: "Building" },
  { name: "Building2", category: "Building" },
  { name: "Home", category: "Building" },
  { name: "Church", category: "Building" },
  { name: "Landmark", category: "Building" },
  // Activities & Sports
  { name: "Activity", category: "Activity" },
  { name: "Dumbbell", category: "Activity" },
  { name: "Bike", category: "Activity" },
  { name: "Volleyball", category: "Activity" },
  // Charts & Data
  { name: "TrendingUp", category: "Chart" },
  { name: "BarChart3", category: "Chart" },
  { name: "PieChart", category: "Chart" },
  { name: "LineChart", category: "Chart" },
  // Time & Calendar
  { name: "Calendar", category: "Time" },
  { name: "CalendarDays", category: "Time" },
  { name: "Clock", category: "Time" },
  { name: "Timer", category: "Time" },
  // Documents & Files
  { name: "FileText", category: "Document" },
  { name: "Files", category: "Document" },
  { name: "ClipboardList", category: "Document" },
  { name: "Newspaper", category: "Document" },
  // Communication
  { name: "MessageSquare", category: "Communication" },
  { name: "Bell", category: "Communication" },
  { name: "Mail", category: "Communication" },
  { name: "Megaphone", category: "Communication" },
  // Misc
  { name: "Heart", category: "Misc" },
  { name: "Sparkles", category: "Misc" },
  { name: "Zap", category: "Misc" },
  { name: "Globe", category: "Misc" },
  { name: "Flag", category: "Misc" },
  { name: "Smile", category: "Misc" },
  { name: "ThumbsUp", category: "Misc" },
  { name: "CheckCircle", category: "Misc" },
];

interface StatsPageProps {
  stats: SchoolStat[];
}

export default function StatsAdmin({ stats }: StatsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<SchoolStat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [iconSearch, setIconSearch] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);
  const confirmModal = useToastConfirm();

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return POPULAR_ICONS;
    const search = iconSearch.toLowerCase();
    return POPULAR_ICONS.filter(
      (icon) =>
        icon.name.toLowerCase().includes(search) ||
        icon.category.toLowerCase().includes(search)
    );
  }, [iconSearch]);

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
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
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
            setSelectedIcon("");
            setIconSearch("");
            setShowIconPicker(false);
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
                  setSelectedIcon(stat.iconName);
                  setIconSearch("");
                  setShowIconPicker(false);
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
                <label className="text-sm font-medium text-gray-700">
                  Pilih Ikon
                </label>
                <input
                  type="hidden"
                  name="iconName"
                  value={selectedIcon || editingStat?.iconName || ""}
                  required
                />

                {/* Selected Icon Display */}
                <div
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-full p-3 border rounded-lg cursor-pointer hover:border-blue-400 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {selectedIcon || editingStat?.iconName ? (
                      <>
                        <div className="p-2 bg-yellow-50 rounded-lg">
                          {renderIcon(
                            selectedIcon || editingStat?.iconName || ""
                          )}
                        </div>
                        <span className="text-gray-700 font-medium">
                          {selectedIcon || editingStat?.iconName}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-400">
                        Klik untuk memilih ikon...
                      </span>
                    )}
                  </div>
                  <LayoutGrid size={18} className="text-gray-400" />
                </div>

                {/* Icon Picker Dropdown */}
                <AnimatePresence>
                  {showIconPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="border rounded-lg p-3 bg-gray-50 space-y-3"
                    >
                      {/* Search */}
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Cari ikon... (contoh: user, award)"
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Icon Grid */}
                      <div className="max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-6 gap-2">
                          {filteredIcons.map((icon) => {
                            const Icon = (
                              LucideIcons as unknown as Record<
                                string,
                                React.ComponentType<{
                                  size?: number;
                                  className?: string;
                                }>
                              >
                            )[icon.name];
                            const isSelected =
                              (selectedIcon || editingStat?.iconName) ===
                              icon.name;

                            return Icon ? (
                              <button
                                key={icon.name}
                                type="button"
                                onClick={() => {
                                  setSelectedIcon(icon.name);
                                  setShowIconPicker(false);
                                }}
                                title={icon.name}
                                className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                                  isSelected
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                    : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                                }`}
                              >
                                {isSelected && (
                                  <Check
                                    size={12}
                                    className="absolute top-0.5 right-0.5 text-blue-600"
                                  />
                                )}
                                <Icon
                                  size={20}
                                  className={
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-gray-600"
                                  }
                                />
                              </button>
                            ) : null;
                          })}
                        </div>
                        {filteredIcons.length === 0 && (
                          <p className="text-center text-gray-500 text-sm py-4">
                            Tidak ada ikon yang cocok
                          </p>
                        )}
                      </div>

                      {/* Quick Tips */}
                      <p className="text-xs text-gray-500 text-center">
                        {filteredIcons.length} ikon tersedia • Klik ikon untuk
                        memilih
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
