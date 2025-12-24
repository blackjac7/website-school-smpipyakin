"use client";

import { useState, useEffect } from "react";
import { Users, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import TeachersTable from "@/components/dashboard/admin/TeachersTable";
import TeacherModal from "@/components/dashboard/admin/TeacherModal";
import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  toggleTeacherStatus,
  reorderTeachers,
  TeacherData,
  TeacherInput,
} from "@/actions/admin/teachers";
import { motion } from "framer-motion";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(
    null
  );

  // Fetch teachers on mount
  const fetchTeachers = async () => {
    setIsLoading(true);
    const result = await getTeachers();
    if (result.success && result.data) {
      setTeachers(result.data);
    } else {
      toast.error(result.error || "Gagal memuat data guru");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle add teacher
  const handleAddTeacher = () => {
    setModalMode("add");
    setSelectedTeacher(null);
    setShowModal(true);
  };

  // Handle edit teacher
  const handleEditTeacher = (teacher: TeacherData) => {
    setModalMode("edit");
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  // Handle delete teacher
  const handleDeleteTeacher = async (id: string) => {
    const teacher = teachers.find((t) => t.id === id);
    if (!teacher) return;

    if (confirm(`Apakah Anda yakin ingin menghapus ${teacher.name}?`)) {
      const result = await deleteTeacher(id);
      if (result.success) {
        toast.success(result.message || "Guru berhasil dihapus");
        fetchTeachers();
      } else {
        toast.error(result.error || "Gagal menghapus guru");
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string) => {
    const result = await toggleTeacherStatus(id);
    if (result.success) {
      toast.success(result.message || "Status berhasil diubah");
      fetchTeachers();
    } else {
      toast.error(result.error || "Gagal mengubah status");
    }
  };

  // Handle reorder
  const handleReorder = async (reorderedIds: string[]) => {
    const result = await reorderTeachers(reorderedIds);
    if (result.success) {
      toast.success(result.message || "Urutan berhasil diperbarui");
    } else {
      toast.error(result.error || "Gagal mengubah urutan");
      fetchTeachers(); // Revert on error
    }
  };

  // Handle form submit
  const handleModalSubmit = async (data: TeacherInput) => {
    let result;

    if (modalMode === "add") {
      result = await createTeacher(data);
    } else if (selectedTeacher) {
      result = await updateTeacher(selectedTeacher.id, data);
    } else {
      toast.error("Terjadi kesalahan");
      return;
    }

    if (result.success) {
      toast.success(result.message || "Berhasil");
      setShowModal(false);
      fetchTeachers();
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Profil Guru
            </h1>
            <p className="text-sm text-gray-500">
              Kelola data guru yang ditampilkan di halaman profil sekolah
            </p>
          </div>
        </div>

        <button
          onClick={fetchTeachers}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
      >
        <p className="text-sm text-blue-700">
          <strong>Tips:</strong> Drag & drop baris guru untuk mengubah urutan
          tampilan. Guru yang ditandai aktif akan ditampilkan di halaman profil
          sekolah.
        </p>
      </motion.div>

      {/* Teachers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TeachersTable
          teachers={teachers}
          isLoading={isLoading}
          onAddTeacher={handleAddTeacher}
          onEditTeacher={handleEditTeacher}
          onDeleteTeacher={handleDeleteTeacher}
          onToggleStatus={handleToggleStatus}
          onReorder={handleReorder}
        />
      </motion.div>

      {/* Modal */}
      <TeacherModal
        show={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        selectedTeacher={selectedTeacher}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
