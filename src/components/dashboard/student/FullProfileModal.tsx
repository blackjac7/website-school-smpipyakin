"use client";

import { useState } from "react";
import { X, Save, User, Phone, School, Users, Lock } from "lucide-react";
import { ProfileData } from "./types";
import ProfileImageUpload from "./ProfileImageUpload";
import toast from "react-hot-toast";

interface FullProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onUpdate: (updates: ProfileData) => Promise<void>;
  onChangePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const EMPTY_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function FullProfileModal({
  isOpen,
  onClose,
  profileData,
  onUpdate,
  onChangePassword,
}: FullProfileModalProps) {
  const [formData, setFormData] = useState<ProfileData>({
    ...profileData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpdate = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: imageUrl,
    }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Password saat ini dan password baru harus diisi");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Konfirmasi password baru tidak sesuai");
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await onChangePassword(passwordForm);
      if (result.success) {
        toast.success("Password berhasil diubah!");
        setPasswordForm(EMPTY_PASSWORD_FORM);
      } else {
        toast.error(result.error || "Gagal mengubah password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name?.trim()) {
      toast.error("Nama lengkap harus diisi");
      return;
    }

    // Email validation - only validate format if provided
    if (formData.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Format email tidak valid");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onUpdate(formData);
      toast.success("Profil berhasil diperbarui!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Profil Lengkap
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Perbarui semua informasi profil Anda
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Profile Image Section */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200">
            <ProfileImageUpload
              currentImage={formData.profileImage}
              onImageUpdate={handleImageUpdate}
              size="lg"
              showLabel={true}
            />
          </div>

          <div className="space-y-8">
            {/* Personal Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-500" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Informasi Pribadi
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NISN
                    <span className="text-xs text-gray-500 ml-1">
                      (Tidak dapat diubah)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.nisn || ""}
                    disabled
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formData.birthPlace || ""}
                    onChange={(e) =>
                      handleInputChange("birthPlace", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                    placeholder="Masukkan tempat lahir"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate || ""}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-teal-500" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Informasi Kontak
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                    placeholder="Masukkan email (opsional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    value={formData.address || ""}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none cursor-text"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <School className="w-5 h-5 text-purple-500" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Informasi Akademik
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelas
                    <span className="text-xs text-gray-500 ml-1">
                      (Tidak dapat diubah)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.class || ""}
                    disabled
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun Angkatan
                    <span className="text-xs text-gray-500 ml-1">
                      (Tidak dapat diubah)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.year || ""}
                    disabled
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-emerald-500" />
                <h4 className="text-lg font-semibold text-gray-900">
                  Informasi Orang Tua
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Orang Tua
                  </label>
                  <input
                    type="text"
                    value={formData.parentName || ""}
                    onChange={(e) =>
                      handleInputChange("parentName", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                    placeholder="Masukkan nama orang tua"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon Orang Tua
                  </label>
                  <input
                    type="tel"
                    value={formData.parentPhone || ""}
                    onChange={(e) =>
                      handleInputChange("parentPhone", e.target.value)
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                    placeholder="Masukkan nomor telepon orang tua"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8 mt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>

        {/* Change Password Section */}
        <div className="px-6 pb-6">
          <form
            onSubmit={handleChangePassword}
            className="pt-8 mt-8 border-t border-gray-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-red-500" />
              <h4 className="text-lg font-semibold text-gray-900">
                Ubah Password
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("currentPassword", e.target.value)
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                  placeholder="Masukkan password saat ini"
                  autoComplete="current-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("newPassword", e.target.value)
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                  placeholder="Minimal 8 karakter"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    handlePasswordInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Password baru harus mengandung huruf besar, huruf kecil, angka,
              dan karakter khusus.
            </p>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 font-medium"
              >
                {isChangingPassword ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengubah...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Ubah Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
