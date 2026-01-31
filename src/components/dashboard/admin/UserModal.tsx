"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Shield,
  GraduationCap,
  IdCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserFormData } from "@/actions/admin/users";

// User interface matching the page types
interface UserData {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: string;
  class?: string;
  nisn?: string;
  osisAccess?: boolean;
  nip?: string;
  gender?: "MALE" | "FEMALE";
  angkatan?: number;
}

interface UserModalProps {
  show: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  selectedUser: UserData | null;
  onSubmit: (data: UserFormData) => Promise<void>;
}

// Role options matching database enum
const ROLE_OPTIONS = [
  { value: "SISWA", label: "Siswa", description: "Akun untuk siswa sekolah" },
  {
    value: "KESISWAAN",
    label: "Kesiswaan",
    description: "Staff bagian kesiswaan",
  },
  { value: "OSIS", label: "OSIS", description: "Pengurus organisasi siswa" },
  {
    value: "PPDB_ADMIN",
    label: "PPDB Admin",
    description: "Admin penerimaan siswa baru",
  },
  {
    value: "ADMIN",
    label: "Administrator",
    description: "Full access ke semua fitur",
  },
] as const;

export default function UserModal({
  show,
  onClose,
  mode,
  selectedUser,
  onSubmit,
}: UserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "" as "" | "ADMIN" | "SISWA" | "KESISWAAN" | "OSIS" | "PPDB_ADMIN",
    nisn: "",
    class: "",
    osisAccess: false,
    nip: "",
    gender: "" as "" | "MALE" | "FEMALE",
    angkatan: "" as string | number,
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (show && selectedUser && mode === "edit") {
      setFormData({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        username: selectedUser.username || "",
        password: "", // Don't populate password for edit
        role:
          (selectedUser.role as
            | ""
            | "ADMIN"
            | "SISWA"
            | "KESISWAAN"
            | "OSIS"
            | "PPDB_ADMIN") || "",
        nisn: selectedUser.nisn || "",
        class: selectedUser.class || "",
        osisAccess: selectedUser.osisAccess || false,
        nip: selectedUser.nip || "",
        gender: selectedUser.gender || "",
        angkatan: selectedUser.angkatan || "",
      });
    } else if (show && mode === "add") {
      setFormData({
        name: "",
        email: "",
        username: "",
        password: "",
        role: "",
        nisn: "",
        class: "",
        osisAccess: false,
        nip: "",
        gender: "",
        angkatan: "",
      });
    }
    setErrors({});
  }, [show, selectedUser, mode]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama wajib diisi";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username wajib diisi";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.role) {
      newErrors.role = "Role wajib dipilih";
    }

    if (mode === "add" && !formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    // Role-specific validation
    if (formData.role === "SISWA" && !formData.nisn) {
      newErrors.nisn = "NISN wajib diisi untuk siswa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Build form data for submission
      const submitData: UserFormData = {
        name: formData.name,
        email: formData.email || undefined,
        username: formData.username,
        role: formData.role as
          | "ADMIN"
          | "SISWA"
          | "KESISWAAN"
          | "OSIS"
          | "PPDB_ADMIN",
        ...(formData.password && { password: formData.password }),
        ...(formData.role === "SISWA" && {
          nisn: formData.nisn,
          class: formData.class,
          osisAccess: formData.osisAccess,
          gender: formData.gender as "MALE" | "FEMALE" | undefined,
          angkatan: formData.angkatan ? Number(formData.angkatan) : undefined,
        }),
        ...(formData.role === "KESISWAAN" && {
          nip: formData.nip,
          gender: formData.gender as "MALE" | "FEMALE" | undefined,
        }),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-linear-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-white"
                  >
                    {mode === "add" ? "Tambah Pengguna Baru" : "Edit Pengguna"}
                  </h2>
                  <p className="text-sm text-blue-100">
                    {mode === "add"
                      ? "Isi data untuk membuat akun baru"
                      : `Edit data ${selectedUser?.name || "pengguna"}`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto max-h-[calc(90vh-180px)]"
            >
              <div className="p-6 space-y-6">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Informasi Dasar
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.name
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Masukkan nama lengkap"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Username */}
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.username
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="Masukkan username"
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.username}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          Email
                        </span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.email
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder="email@example.com (opsional)"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        <span className="flex items-center gap-1">
                          <Lock className="w-4 h-4" />
                          Password{" "}
                          {mode === "add" && (
                            <span className="text-red-500">*</span>
                          )}
                        </span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.password
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder={
                          mode === "edit"
                            ? "Kosongkan jika tidak diubah"
                            : "Minimal 6 karakter"
                        }
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role & Akses
                  </h3>

                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Pilih Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.role
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">-- Pilih Role --</option>
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                    )}
                  </div>
                </div>

                {/* Role-Specific Fields */}
                {formData.role === "SISWA" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-100"
                  >
                    <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Data Siswa
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* NISN */}
                      <div>
                        <label
                          htmlFor="nisn"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          NISN <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="nisn"
                          name="nisn"
                          value={formData.nisn}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.nisn
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300"
                          }`}
                          placeholder="Nomor Induk Siswa Nasional"
                        />
                        {errors.nisn && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.nisn}
                          </p>
                        )}
                      </div>

                      {/* Kelas */}
                      <div>
                        <label
                          htmlFor="class"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Kelas
                        </label>
                        <input
                          type="text"
                          id="class"
                          name="class"
                          value={formData.class}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Contoh: 9A, 8B, 7C"
                        />
                      </div>
                      {/* Angkatan */}
                      <div>
                        <label
                          htmlFor="angkatan"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Angkatan (Tahun Masuk)
                        </label>
                        <input
                          type="number"
                          id="angkatan"
                          name="angkatan"
                          value={formData.angkatan}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Contoh: 2024"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Gender */}
                      <div>
                        <label
                          htmlFor="gender"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Jenis Kelamin
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">-- Pilih --</option>
                          <option value="MALE">Laki-laki</option>
                          <option value="FEMALE">Perempuan</option>
                        </select>
                      </div>

                      {/* OSIS Access */}
                      <div className="flex items-center gap-3 pt-6">
                        <input
                          type="checkbox"
                          id="osisAccess"
                          name="osisAccess"
                          checked={formData.osisAccess}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="osisAccess"
                          className="text-sm font-medium text-gray-700"
                        >
                          Pengurus OSIS
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {formData.role === "KESISWAAN" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 bg-orange-50 rounded-xl border border-orange-100"
                  >
                    <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-wide flex items-center gap-2">
                      <IdCard className="w-4 h-4" />
                      Data Kesiswaan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* NIP */}
                      <div>
                        <label
                          htmlFor="nip"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          NIP
                        </label>
                        <input
                          type="text"
                          id="nip"
                          name="nip"
                          value={formData.nip}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Nomor Induk Pegawai"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label
                          htmlFor="gender"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Jenis Kelamin
                        </label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">-- Pilih --</option>
                          <option value="MALE">Laki-laki</option>
                          <option value="FEMALE">Perempuan</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      {mode === "add" ? "Tambah Pengguna" : "Simpan Perubahan"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
