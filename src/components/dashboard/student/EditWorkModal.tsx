"use client";

import { useState, useEffect } from "react";
import { X, Save, Image as ImageIcon, Video, Link } from "lucide-react";
import ImageUpload from "@/components/shared/ImageUpload";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";
import toast from "react-hot-toast";

interface Work {
  id: string;
  title: string;
  description: string;
  category: string;
  subject: string;
  workType: string;
  mediaUrl?: string;
  videoLink?: string;
  status: string;
  createdAt: string;
  rejectionNote?: string;
}

interface EditWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (workId: string, data: Partial<Work>) => Promise<void>;
  work: Work | null;
}

export default function EditWorkModal({
  isOpen,
  onClose,
  onUpdate,
  work,
}: EditWorkModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subject: "",
    mediaUrl: "",
    videoLink: "",
  });
  const [workType, setWorkType] = useState<"photo" | "video">("photo");
  const [isLoading, setIsLoading] = useState(false);
  const confirmModal = useToastConfirm();

  // Initialize form data when work changes
  useEffect(() => {
    if (work) {
      setFormData({
        title: work.title || "",
        description: work.description || "",
        category: work.category || "",
        subject: work.subject || "",
        mediaUrl: work.mediaUrl || "",
        videoLink: work.videoLink || "",
      });
      setWorkType(work.workType as "photo" | "video");
    }
  }, [work]);

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
      const confirmMessage = `Anda sudah ${
        workType === "photo" ? "mengupload gambar" : "memasukkan link video"
      }. Mengganti jenis karya akan menghapus ${
        workType === "photo" ? "gambar" : "link video"
      } yang sudah dimasukkan. Lanjutkan?`;

      // Show confirmation with new ToastConfirmModal
      confirmModal.showConfirm(
        {
          title: "Konfirmasi Perubahan",
          message: confirmMessage,
        },
        () => {
          setWorkType(newWorkType);
          setFormData((prev) => ({
            ...prev,
            mediaUrl: "",
            videoLink: "",
          }));
        }
      );
    } else {
      setWorkType(newWorkType);
      setFormData((prev) => ({
        ...prev,
        mediaUrl: "",
        videoLink: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!work) return;

    // Validate based on work type
    if (workType === "photo" && !formData.mediaUrl) {
      toast.error("Silakan upload foto/gambar terlebih dahulu.");
      return;
    }

    if (workType === "video" && !formData.videoLink) {
      toast.error("Silakan masukkan link video terlebih dahulu.");
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        ...formData,
        workType,
        // Clear unused field based on work type
        ...(workType === "photo" ? { videoLink: "" } : { mediaUrl: "" }),
      };

      await onUpdate(work.id, updateData);
      toast.success("Karya berhasil diperbarui!");
      onClose();
    } catch (error) {
      console.error("Failed to update work:", error);
      toast.error("Gagal memperbarui karya. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    if (work) {
      setFormData({
        title: work.title || "",
        description: work.description || "",
        category: work.category || "",
        subject: work.subject || "",
        mediaUrl: work.mediaUrl || "",
        videoLink: work.videoLink || "",
      });
      setWorkType(work.workType as "photo" | "video");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !work) return null;

  // Check if work can be edited
  const canEdit = work.status === "pending" || work.status === "rejected";

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Edit Karya</h3>
            <p className="text-sm text-gray-500 mt-1">
              Status:{" "}
              {work.status === "pending"
                ? "Menunggu Persetujuan"
                : work.status === "approved"
                  ? "Disetujui"
                  : "Ditolak"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!canEdit && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-sm">Informasi</span>
            </div>
            <p className="text-blue-700 mt-1 text-sm">
              {work.status === "approved"
                ? "Karya yang sudah disetujui tidak dapat diedit."
                : "Karya ini sedang dalam review dan tidak dapat diedit saat ini."}
            </p>
          </div>
        )}

        {work.status === "rejected" && work.rejectionNote && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium text-sm">Alasan Penolakan</span>
            </div>
            <p className="text-red-700 mt-1 text-sm">{work.rejectionNote}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Work Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jenis Karya <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => handleWorkTypeChange("photo")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  workType === "photo"
                    ? "border-gray-800 bg-gray-50 text-gray-900"
                    : "border-gray-200 hover:border-gray-300"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <span className="block font-medium">Foto/Gambar</span>
                <span className="text-sm text-gray-500">
                  Upload ke Cloudinary
                </span>
              </button>
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => handleWorkTypeChange("video")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  workType === "video"
                    ? "border-gray-800 bg-gray-50 text-gray-900"
                    : "border-gray-200 hover:border-gray-300"
                } ${!canEdit ? "opacity-50 cursor-not-allowed" : ""}`}
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
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              >
                <option value="">Pilih kategori</option>
                <option value="seni">Seni & Kreativitas</option>
                <option value="teknologi">Teknologi & Digital</option>
                <option value="tulis">Karya Tulis</option>
                <option value="fotografi">Fotografi</option>
                <option value="video">Video & Multimedia</option>
                <option value="desain">Desain Grafis</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mata Pelajaran Terkait
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Pilih mata pelajaran</option>
                <option value="seni-budaya">Seni Budaya</option>
                <option value="teknologi">Teknologi</option>
                <option value="bahasa-indonesia">Bahasa Indonesia</option>
                <option value="bahasa-inggris">Bahasa Inggris</option>
                <option value="matematika">Matematika</option>
                <option value="ipa">IPA</option>
                <option value="ips">IPS</option>
                <option value="pai">Pendidikan Agama Islam</option>
                <option value="penjaskes">Pendidikan Jasmani</option>
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
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              disabled={!canEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={4}
              placeholder="Jelaskan tentang karya Anda, teknik yang digunakan, atau inspirasi di baliknya"
            />
          </div>

          {/* Media Upload/Link Section */}
          <div
            className={`border-2 rounded-lg p-4 transition-all ${
              workType === "photo" || workType === "video"
                ? "border-gray-800 bg-gray-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {workType === "photo" ? (
                <>
                  <ImageIcon className="w-5 h-5 text-gray-800" />
                  <span className="font-medium text-gray-800">
                    Mode: Upload Foto/Gambar
                  </span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 text-gray-800" />
                  <span className="font-medium text-gray-800">
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
                    disabled={!canEdit}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            {canEdit && (
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Toast Confirm Modal */}
      <ToastConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.options.title}
        message={confirmModal.options.message}
        description={confirmModal.options.description}
        type={confirmModal.options.type}
        confirmText={confirmModal.options.confirmText}
        cancelText={confirmModal.options.cancelText}
        isLoading={confirmModal.isLoading}
        showCloseButton={confirmModal.options.showCloseButton}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />
    </div>
  );
}
