"use client";

import { useState } from "react";
import { X, Upload, Image as ImageIcon, Video, Link } from "lucide-react";
import ImageUpload from "@/components/shared/ImageUpload";
import toast from "react-hot-toast";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

interface UploadWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    subject: string;
    workType: string;
    mediaUrl?: string;
    videoLink?: string;
  }) => void;
  pendingCount?: number;
}

export default function UploadWorkModal({
  isOpen,
  onClose,
  onSubmit,
  pendingCount = 0,
}: UploadWorkModalProps) {
  const [workType, setWorkType] = useState<"photo" | "video">("photo");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subject: "",
    mediaUrl: "",
    videoLink: "",
  });

  // Setup toast confirm modal
  const confirmModal = useToastConfirm();

  const handleFileUpload = (file: { url: string; public_id: string }) => {
    setFormData((prev) => ({ ...prev, mediaUrl: file.url }));
  };

  const handleFileRemove = () => {
    setFormData((prev) => ({ ...prev, mediaUrl: "" }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWorkTypeChange = (newWorkType: "photo" | "video") => {
    const currentData = formData.mediaUrl || formData.videoLink;

    if (currentData && newWorkType !== workType) {
      // Show confirmation with new ToastConfirmModal
      const currentMediaType = workType === "photo" ? "gambar" : "link video";

      confirmModal.showConfirm(
        {
          title: "Ganti Jenis Karya",
          message: `Anda sudah memasukkan ${currentMediaType}. Mengganti jenis karya akan menghapus data yang sudah dimasukkan.`,
          description: "Apakah Anda yakin ingin melanjutkan?",
          type: "warning",
          confirmText: "Ya, Ganti",
          cancelText: "Batal",
        },
        async () => {
          setWorkType(newWorkType);
          // Clear media data when switching work type
          setFormData((prev) => ({
            ...prev,
            mediaUrl: "",
            videoLink: "",
          }));
        }
      );
    } else {
      setWorkType(newWorkType);
      // Clear media data when switching work type
      setFormData((prev) => ({
        ...prev,
        mediaUrl: "",
        videoLink: "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user already has 2 pending works
    if (pendingCount >= 2) {
      toast.error(
        "Anda sudah memiliki 2 karya yang sedang menunggu persetujuan. Silakan tunggu hingga ada yang disetujui atau ditolak sebelum mengunggah karya baru."
      );
      return;
    }

    // Validate media based on work type
    if (workType === "photo" && !formData.mediaUrl) {
      toast.error("Silakan upload foto/gambar terlebih dahulu.");
      return;
    }

    if (workType === "video" && !formData.videoLink) {
      toast.error("Silakan masukkan link video terlebih dahulu.");
      return;
    }

    // Ensure only one media type is provided
    if (workType === "photo" && formData.videoLink) {
      toast.error(
        "Anda memilih jenis karya foto/gambar, tapi ada link video yang terisi. Silakan pilih salah satu jenis karya saja."
      );
      return;
    }

    if (workType === "video" && formData.mediaUrl) {
      toast.error(
        "Anda memilih jenis karya video, tapi ada gambar yang terupload. Silakan pilih salah satu jenis karya saja."
      );
      return;
    }

    // Create form data with workType
    const submitData = {
      ...formData,
      workType,
    };

    // Trigger parent onSubmit with form data
    onSubmit(submitData);

    // Reset form after successful submission
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      subject: "",
      mediaUrl: "",
      videoLink: "",
    });
    setWorkType("photo");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Upload Karya Saya
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warning for pending works */}
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-amber-800">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">Perhatian!</span>
              </div>
              <p className="text-amber-700 mt-1 text-sm">
                Anda memiliki {pendingCount} karya yang sedang menunggu
                persetujuan.
                {pendingCount === 1
                  ? " Anda masih bisa mengunggah 1 karya lagi."
                  : " Ini adalah karya terakhir yang bisa Anda unggah hingga ada yang disetujui."}
              </p>
            </div>
          )}

          {/* Work Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jenis Karya <span className="text-red-500">*</span>
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-blue-800">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium text-sm">Pilih Salah Satu</span>
              </div>
              <p className="text-blue-700 mt-1 text-xs">
                Anda hanya bisa memilih antara upload gambar ATAU link video.
                Tidak bisa keduanya sekaligus.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleWorkTypeChange("photo")}
                className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                  workType === "photo"
                    ? "border-gray-900 bg-gray-50 text-gray-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <span className="block font-medium">Foto/Gambar</span>
                <span className="text-sm text-gray-500">
                  Upload ke Cloudinary
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleWorkTypeChange("video")}
                className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                  workType === "video"
                    ? "border-gray-900 bg-gray-50 text-gray-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Video className="w-8 h-8 mx-auto mb-2" />
                <span className="block font-medium">Video</span>
                <span className="text-sm text-gray-500">
                  Link YouTube/GDrive
                </span>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Karya <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih kategori</option>
                <option value="seni-budaya">Seni Budaya</option>
                <option value="bahasa-indonesia">Bahasa Indonesia</option>
                <option value="bahasa-inggris">Bahasa Inggris</option>
                <option value="matematika">Matematika</option>
                <option value="ipa">IPA</option>
                <option value="ips">IPS</option>
                <option value="pai">Pendidikan Agama Islam</option>
                <option value="pkn">PKn</option>
                <option value="pjok">PJOK</option>
                <option value="informatika">Informatika</option>
                <option value="koding">Koding</option>
                <option value="prakarya">Prakarya</option>
                <option value="fotografi">Fotografi</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Karya <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan judul karya Anda"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Karya
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Jelaskan tentang karya Anda, teknik yang digunakan, atau inspirasi di baliknya"
            />
          </div>

          {/* Media Upload/Link Section */}
          <div
            className={`border-2 rounded-lg p-4 transition-all ${
              workType === "photo"
                ? "border-gray-900 bg-gray-50"
                : workType === "video"
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {workType === "photo" ? (
                <>
                  <ImageIcon className="w-5 h-5 text-gray-900" />
                  <span className="font-medium text-gray-900">
                    Mode: Upload Foto/Gambar
                  </span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 text-gray-900" />
                  <span className="font-medium text-gray-900">
                    Mode: Link Video
                  </span>
                </>
              )}
            </div>

            {workType === "photo" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Foto/Gambar <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  onUpload={handleFileUpload}
                  onRemove={handleFileRemove}
                  currentImage={formData.mediaUrl}
                  folder="student-works"
                  maxSizeMB={10}
                  acceptedFormats={["JPEG", "PNG", "WebP"]}
                  label="Pilih atau drag & drop gambar di sini"
                  className="mb-2"
                />
                <p className="text-xs text-gray-500">
                  Format yang didukung: JPEG, PNG, WebP. Maksimal 10MB.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Video <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={formData.videoLink}
                    onChange={(e) =>
                      handleInputChange("videoLink", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://youtube.com/... atau https://drive.google.com/..."
                    required={workType === "video"}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pastikan video dapat diakses publik. Untuk Google Drive, ubah
                  izin sharing ke &ldquo;Anyone with the link can view&rdquo;.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Karya
            </button>
          </div>
        </form>
      </div>

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
