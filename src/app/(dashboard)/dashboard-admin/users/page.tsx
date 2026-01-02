"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import UsersTable from "./UsersTable";
import UserModal from "@/components/dashboard/admin/UserModal";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getUsersForExport,
  UserFormData,
} from "@/actions/admin/users";
import { User } from "./types";
import { exportUsersToExcel, UserExportData } from "@/utils/excelExport";
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

  // Pagination and filter state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25, // Show 25 users per page
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const result = await getUsers({
      page: pagination.page,
      limit: pagination.limit,
      search: searchQuery,
      role: roleFilter,
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
  }, [pagination.page, pagination.limit, searchQuery, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Server-side pagination handlers
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Debounce search to avoid too many requests
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearch = useCallback((search: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300); // 300ms debounce
  }, []);

  const handleRoleFilter = useCallback((role: string) => {
    setRoleFilter(role === "all" ? "" : role);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter
  }, []);

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

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      toast.loading("Mengambil data untuk export...", { id: "export" });
      const result = await getUsersForExport();

      if (result.success && result.data) {
        toast.dismiss("export");
        exportUsersToExcel(result.data as UserExportData[]);
        toast.success("Data pengguna berhasil diexport ke Excel");
      } else {
        toast.dismiss("export");
        toast.error(result.error || "Gagal mengexport data");
      }
    } catch {
      toast.dismiss("export");
      toast.error("Gagal mengexport data");
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
        onExportExcel={handleExportExcel}
        isExporting={isExporting}
        totalUsers={pagination.total}
        // Server-side pagination props
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onRoleFilter={handleRoleFilter}
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
