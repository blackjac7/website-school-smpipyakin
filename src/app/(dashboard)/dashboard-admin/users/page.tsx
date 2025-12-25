"use client";

import { useState, useEffect } from "react";
import UsersTable from "./UsersTable";
import UserModal from "@/components/dashboard/admin/UserModal";
import { getUsers, createUser, updateUser, deleteUser, UserFormData } from "@/actions/admin/users";
import { User } from "./types";
import toast from "react-hot-toast";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertToCompatibleUser = (user: User | null): any => {
    if (!user) return null;
    return {
        ...user,
        joinDate: new Date().toISOString(), // Mock for compatibility if missing
        // ensure other fields match if needed, for now UserModal might be lenient or we cast
    };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const confirmModal = useToastConfirm();

  const fetchUsers = async () => {
    setIsLoading(true);
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data as User[]);
    } else {
      toast.error(result.error || "Gagal memuat data pengguna");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
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
        <p className="text-gray-600">Kelola akun siswa, guru, dan staff sekolah</p>
      </div>

      <UsersTable
        users={users}
        isLoading={isLoading}
        onAddUser={handleAddUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
      />

      <UserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        selectedUser={convertToCompatibleUser(selectedUser)}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSubmit={handleModalSubmit as any}
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
