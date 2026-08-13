"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
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
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";
import { exportTeachersToExcel, TeacherExportData } from "@/utils/excelExport";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherData | null>(
    null
  );
  const confirmModal = useToastConfirm();

  // Handle export to Excel
  const handleExportExcel = async () => {
    if (teachers.length === 0) {
      toast.error("Tidak ada data guru untuk diekspor");
      return;
    }

    try {
      setIsExporting(true);

      // Convert TeacherData to TeacherExportData format
      const exportData: TeacherExportData[] = teachers.map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        position: teacher.position,
        subject: teacher.subject,
        category: teacher.category,
        description: teacher.description,
        experience: teacher.experience,
        sortOrder: teacher.sortOrder,
        isActive: teacher.isActive,
        createdAt: teacher.createdAt,
      }));

      exportTeachersToExcel(exportData);
      toast.success("Data guru berhasil diekspor ke Excel");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor data guru");
    } finally {
      setIsExporting(false);
    }
  };

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

    confirmModal.showConfirm(
      {
        title: "Hapus Guru",
        message: `Apakah Anda yakin ingin menghapus ${teacher.name}?`,
        description: "Data guru yang dihapus tidak dapat dikembalikan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        const result = await deleteTeacher(id);
        if (result.success) {
          toast.success(result.message || "Guru berhasil dihapus");
          fetchTeachers();
        } else {
          toast.error(result.error || "Gagal menghapus guru");
        }
      }
    );
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
    <div className="space-y-5">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
        <button
          onClick={fetchTeachers}
          disabled={isLoading}
          className="dashboard-button dashboard-button-secondary"
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
          onExportExcel={handleExportExcel}
          isExporting={isExporting}
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
