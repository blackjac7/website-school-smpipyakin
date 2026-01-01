"use client";

import { useState, useEffect, useCallback } from "react";
import UsersTable from "./UsersTable";
import UserModal from "@/components/dashboard/admin/UserModal";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  exportUsersToCSV,
  UserFormData,
} from "@/actions/admin/users";
import { User } from "./types";
import toast from "react-hot-toast";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const confirmModal = useToastConfirm();

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const result = await getUsers({
      page: pagination.page,
      limit: pagination.limit,
    });
    if (result.success && result.data) {
      const data = result.data;
      setUsers(data.users as User[]);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } else {
      toast.error(result.error || "Gagal memuat data pengguna");
    }
    setIsLoading(false);
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = () => {
    setModalMode("add");
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Pengguna",
        message: "Apakah Anda yakin ingin menghapus pengguna ini?",
        description: "Tindakan ini tidak dapat dibatalkan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        const result = await deleteUser(userId);
        if (result.success) {
          toast.success("Pengguna berhasil dihapus");
          fetchUsers();
        } else {
          toast.error(result.error || "Gagal menghapus pengguna");
        }
      }
    );
  };

  const handleBulkDelete = async (userIds: string[]) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Banyak Pengguna",
        message: `Apakah Anda yakin ingin menghapus ${userIds.length} pengguna?`,
        description:
          "Tindakan ini tidak dapat dibatalkan. Semua data terkait pengguna akan dihapus.",
        type: "danger",
        confirmText: `Hapus ${userIds.length} Pengguna`,
        cancelText: "Batal",
      },
      async () => {
        setIsBulkDeleting(true);
        try {
          const result = await bulkDeleteUsers(userIds);
          if (result.success) {
            toast.success(
              result.message || `${userIds.length} pengguna berhasil dihapus`
            );
            fetchUsers();
          } else {
            toast.error(result.error || "Gagal menghapus pengguna");
          }
        } catch {
          toast.error("Terjadi kesalahan saat menghapus pengguna");
        } finally {
          setIsBulkDeleting(false);
        }
      }
    );
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const result = await exportUsersToCSV();
      if (result.success && result.data) {
        // Create and download the CSV file
        const blob = new Blob([result.data.csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Data berhasil diekspor");
      } else {
        toast.error(result.error || "Gagal mengekspor data");
      }
    } catch {
      toast.error("Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleModalSubmit = async (formData: UserFormData) => {
    let result;
    if (modalMode === "add") {
      result = await createUser(formData);
    } else {
      if (!selectedUser) return;
      result = await updateUser(selectedUser.id, formData);
    }

    if (result.success) {
      toast.success(result.message || "Berhasil");
      setShowModal(false);
      fetchUsers();
    } else {
      toast.error(result.error || "Terjadi kesalahan");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-600">
          Kelola akun siswa, guru, dan staff sekolah
        </p>
      </div>

      <UsersTable
        users={users}
        isLoading={isLoading}
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onExportCSV={handleExportCSV}
        isExporting={isExporting}
        totalUsers={pagination.total}
      />

      <UserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        selectedUser={selectedUser}
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
