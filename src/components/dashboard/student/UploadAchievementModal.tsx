"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import ImageUpload from "@/components/shared/ImageUpload";
import { getTodayWIB } from "@/utils/dateFormat";
import toast from "react-hot-toast";

interface AchievementData {
  title: string;
  description: string;
  category: string;
  level: string;
  achievementDate: string;
  image: string;
}

interface UploadAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AchievementData) => void;
  pendingCount?: number;
}

export default function UploadAchievementModal({
  isOpen,
  onClose,
  onSubmit,
  pendingCount = 0,
}: UploadAchievementModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    level: "",
    achievementDate: getTodayWIB(), // Default to today's date in WIB
  });

  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    public_id: string;
  } | null>(null);

  const handleFileUpload = (file: { url: string; public_id: string }) => {
    setUploadedFile(file);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user already has 2 pending achievements
    if (pendingCount >= 2) {
      toast.error(
        "Anda sudah memiliki 2 prestasi yang sedang menunggu persetujuan. Silakan tunggu hingga ada yang disetujui atau ditolak sebelum mengunggah prestasi baru."
      );
      return;
    }

    if (!uploadedFile) {
      toast.error(
        "Upload foto prestasi wajib! Silakan upload foto dokumentasi atau sertifikat prestasi terlebih dahulu."
      );
      return;
    }

    // Validate achievement date is not in the future
    const selectedDate = new Date(formData.achievementDate);
    const today = new Date(getTodayWIB());

    if (selectedDate > today) {
      toast.error("Tanggal prestasi tidak boleh di masa depan");
      return;
    }

    const submissionData = {
      ...formData,
      image: uploadedFile.url,
    };

    onSubmit(submissionData);

    // Reset form after successful submission
    setFormData({
      title: "",
      description: "",
      category: "",
      level: "",
      achievementDate: getTodayWIB(),
    });
    setUploadedFile(null);
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      level: "",
      achievementDate: getTodayWIB(), // Reset to today's date in WIB
    });
    setUploadedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Unggah Prestasi Baru</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-800 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning for pending achievements */}
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
                Anda memiliki {pendingCount} prestasi yang sedang menunggu
                persetujuan.
                {pendingCount === 1
                  ? " Anda masih bisa mengunggah 1 prestasi lagi."
                  : " Ini adalah prestasi terakhir yang bisa Anda unggah hingga ada yang disetujui."}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="achievement-category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kategori Prestasi
            </label>
            <select
              id="achievement-category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
              required
            >
              <option value="">Pilih kategori prestasi</option>
              <option value="akademik">Prestasi Akademik</option>
              <option value="olahraga">Prestasi Olahraga</option>
              <option value="seni">Prestasi Seni</option>
              <option value="teknologi">Prestasi Teknologi</option>
              <option value="kepemimpinan">Prestasi Kepemimpinan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="achievement-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Judul Prestasi
            </label>
            <input
              id="achievement-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Masukkan judul prestasi"
              required
            />
          </div>

          <div>
            <label
              htmlFor="achievement-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Deskripsi Prestasi
            </label>
            <textarea
              id="achievement-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              rows={4}
              placeholder="Jelaskan detail prestasi yang dicapai"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="achievement-date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tanggal Prestasi
              </label>
              <input
                id="achievement-date"
                type="date"
                value={formData.achievementDate}
                max={getTodayWIB()} // Prevent future dates
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    achievementDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tanggal saat prestasi diraih/diperoleh (tidak boleh di masa
                depan)
              </p>
            </div>
            <div>
              <label
                htmlFor="achievement-level"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tingkat Prestasi
              </label>
              <select
                id="achievement-level"
                value={formData.level}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, level: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent cursor-pointer"
                required
              >
                <option value="">Pilih tingkat</option>
                <option value="sekolah">Tingkat Sekolah</option>
                <option value="kecamatan">Tingkat Kecamatan</option>
                <option value="kabupaten">Tingkat Kabupaten</option>
                <option value="provinsi">Tingkat Provinsi</option>
                <option value="nasional">Tingkat Nasional</option>
                <option value="internasional">Tingkat Internasional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Foto Dokumentasi Prestasi/Sertifikat *
              <span className="text-red-500 text-sm ml-1">(Wajib)</span>
            </label>
            <ImageUpload
              onUpload={handleFileUpload}
              onRemove={handleFileRemove}
              folder="achievements"
              maxSizeMB={5}
              acceptedFormats={["JPEG", "PNG"]}
              label=""
              className="mb-2"
            />
            <p className="text-xs text-gray-500">
              Upload foto sertifikat atau foto dokumentasi prestasi Anda
              (format: JPG, PNG - maksimal 5MB) - <strong>Wajib diisi</strong>
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!uploadedFile}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-orange-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Unggah Prestasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
