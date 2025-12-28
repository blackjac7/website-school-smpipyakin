"use client";

import React, { useState } from "react";
import { User, Camera, X } from "lucide-react";
import Image from "next/image";
import ImageUpload from "@/components/shared/ImageUpload";
import toast from "react-hot-toast";
import { uploadImageAction } from "@/actions/upload";

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function ProfileImageUpload({
  currentImage,
  onImageUpdate,
  size = "md",
  showLabel = true,
  className = "",
}: ProfileImageUploadProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const buttonSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const buttonIconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setIsUploading(true);
      const toastId = toast.loading("Mengupload foto profil...");

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "profiles");

        const result = await uploadImageAction(formData);

        if (result.success && result.data) {
          onImageUpdate(result.data.url);
          toast.success("Foto profil berhasil diunggah!", { id: toastId });
        } else {
          toast.error("Gagal mengunggah foto profil", { id: toastId });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Terjadi kesalahan saat mengunggah foto", { id: toastId });
      } finally {
        setIsUploading(false);
      }
    };
  };

  const handleUpload = (file: { url: string; public_id: string }) => {
    onImageUpdate(file.url);
    setShowUploadModal(false);
  };

  const handleRemove = () => {
    onImageUpdate("");
    setShowUploadModal(false);
  };

  return (
    <>
      <div className={`text-center ${className}`}>
        <div className={`relative mx-auto ${sizeClasses[size]} mb-3`}>
          <div
            className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-200 shadow-lg flex items-center justify-center`}
          >
            {currentImage ? (
              <Image
                src={currentImage}
                alt="Profile"
                width={size === "sm" ? 64 : size === "md" ? 96 : 128}
                height={size === "sm" ? 64 : size === "md" ? 96 : 128}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className={`${iconSizes[size]} text-blue-400`} />
            )}
          </div>

          {/* Upload Button */}
          <label
            className={`absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full ${buttonSizes[size]} flex items-center justify-center cursor-pointer transition-all shadow-lg hover:shadow-xl border-2 border-white transform hover:scale-110`}
          >
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleDirectUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? (
              <div
                className={`${buttonIconSizes[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}
              />
            ) : (
              <Camera className={buttonIconSizes[size]} />
            )}
          </label>
        </div>

        {showLabel && (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {isUploading ? "Mengunggah..." : "Klik untuk mengganti foto"}
            </p>
            <div className="text-xs text-gray-500 space-y-0.5">
              <p>Maksimal 2MB • JPG, PNG, WebP</p>
              <p>Minimal 200x200px • Disarankan 1:1</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 -m-6 mb-6 p-6 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Foto Profil
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <ImageUpload
                currentImage={currentImage}
                onUpload={handleUpload}
                onRemove={handleRemove}
                folder="profiles"
                maxSizeMB={2}
                acceptedFormats={["JPEG", "PNG", "WebP"]}
                label=""
              />

              <div className="text-sm text-gray-500 space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-700 text-sm">
                  Persyaratan:
                </h4>
                <div className="space-y-1 text-xs">
                  <p>• Format: JPG, PNG, atau WebP</p>
                  <p>• Ukuran maksimal: 2MB</p>
                  <p>• Resolusi minimal: 200x200px</p>
                  <p>• Resolusi maksimal: 2000x2000px</p>
                  <p>• Disarankan foto persegi (rasio 1:1)</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {currentImage && (
                  <button
                    onClick={handleRemove}
                    className="flex-1 px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer"
                  >
                    Hapus Foto
                  </button>
                )}
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
