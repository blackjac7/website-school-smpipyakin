"use client";

import { useState } from "react";
import { X, Save, Upload, User } from "lucide-react";
import Image from "next/image";
import { ProfileData } from "./types";
import toast from "react-hot-toast";
import { uploadImageAction } from "@/actions/upload";

interface QuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: ProfileData;
  onUpdate: (updates: Partial<ProfileData>) => Promise<void>;
}

export default function QuickEditModal({
  isOpen,
  onClose,
  profileData,
  onUpdate,
}: QuickEditModalProps) {
  const [formData, setFormData] = useState({
    name: profileData.name || "",
    phone: profileData.phone || "",
    email: profileData.email || "",
    address: profileData.address || "",
    profileImage: profileData.profileImage || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - hanya JPG, PNG, WebP
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format file harus JPG, PNG, atau WebP");
      return;
    }

    // Validate file size (max 2MB untuk profil)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    // Validate image dimensions (optional but recommended)
    const img = new window.Image();
    img.onload = async () => {
      // Minimum 200x200, Maximum 2000x2000
      if (img.width < 200 || img.height < 200) {
        toast.error("Resolusi gambar minimal 200x200 pixel");
        return;
      }
      if (img.width > 2000 || img.height > 2000) {
        toast.error("Resolusi gambar maksimal 2000x2000 pixel");
        return;
      }

      // Aspect ratio check (square recommended)
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.8 || aspectRatio > 1.2) {
        toast.error("Disarankan menggunakan gambar dengan rasio 1:1 (persegi)");
      }

      await uploadFile();
    };

    img.src = URL.createObjectURL(file);

    const uploadFile = async () => {
      setIsUploadingImage(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "profiles");

        const result = await uploadImageAction(formData);

        if (result.success && result.data && result.data.url) {
          const url = result.data.url;
          if (!url) {
            toast.error("Gagal mengunggah foto profil");
          } else {
            setFormData((prev) => ({
              ...prev,
              profileImage: url,
            }));
            toast.success("Foto profil berhasil diunggah!");
          }
        } else {
          toast.error("Gagal mengunggah foto profil");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Terjadi kesalahan saat mengunggah foto");
      } finally {
        setIsUploadingImage(false);
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nama lengkap harus diisi");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email harus diisi");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Format email tidak valid");
      return;
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-blue-50 to-purple-50">
          <h3 className="text-xl font-semibold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Aksi Cepat
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Image Upload */}
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-blue-200 overflow-hidden bg-linear-to-br from-blue-50 to-purple-50 shadow-lg">
                {formData.profileImage ? (
                  <Image
                    src={formData.profileImage}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-blue-400" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <label className="absolute bottom-0 right-0 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full p-2 cursor-pointer transition-all shadow-lg transform hover:scale-110">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                {isUploadingImage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </label>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                {isUploadingImage
                  ? "Mengunggah..."
                  : "Klik tombol untuk mengganti foto profil"}
              </p>
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>Maksimal 2MB • JPG, PNG, WebP</p>
                <p>Minimal 200x200px • Disarankan 1:1</p>
              </div>
            </div>
          </div>

          {/* Quick Edit Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                placeholder="Masukkan email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No. Telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-text"
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none cursor-text"
                placeholder="Masukkan alamat lengkap"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="flex-1 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
