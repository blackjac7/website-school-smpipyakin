"use client";

import { X, Upload } from "lucide-react";

interface UploadAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * UploadAchievementModal component.
 * Displays a modal form for students to upload new achievements.
 * Includes fields for category, title, description, date, level, and document upload.
 * @param {UploadAchievementModalProps} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {function} props.onSubmit - Callback function to handle form submission.
 * @returns {JSX.Element | null} The rendered UploadAchievementModal component or null if not open.
 */
export default function UploadAchievementModal({
  isOpen,
  onClose,
  onSubmit,
}: UploadAchievementModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Unggah Prestasi Baru</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Prestasi
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Prestasi
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Masukkan judul prestasi"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Prestasi
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              rows={4}
              placeholder="Jelaskan detail prestasi yang dicapai"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Prestasi
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tingkat Prestasi
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
              Upload Sertifikat/Dokumen Pendukung
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500">
                    Klik untuk upload file
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: PDF, JPG, PNG (Maks. 5MB)
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
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
