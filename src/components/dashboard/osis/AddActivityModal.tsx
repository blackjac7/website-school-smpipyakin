"use client";

import { X } from "lucide-react";
import { createActivity } from "@/actions/osis/activities";
import { useState } from "react";
import toast from "react-hot-toast";
import FileInput from "@/components/shared/FileInput";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (e: React.FormEvent) => void; // Optional now as we use Action
}

// Initial state for server action
const initialState = {
  success: false,
  error: "",
};

export default function AddActivityModal({
  isOpen,
  onClose,
}: AddActivityModalProps) {
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (uploading || submitting) return;

    // Upload proposal file if exists
    let proposalUrl = "";
    if (proposalFile) {
      setUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", proposalFile);
        uploadFormData.append("folder", "proposals");
        uploadFormData.append("fileType", "proposal");

        const response = await fetch("/api/upload-files", {
          method: "POST",
          body: uploadFormData,
        });

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || "Upload gagal");
        }

        proposalUrl = result.data.url;
      } catch {
        toast.error("Gagal upload proposal");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Submit form data
    setSubmitting(true);
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      if (proposalUrl) {
        formData.set("proposalUrl", proposalUrl);
      }

      const result = await createActivity(initialState, formData);

      if (result?.success) {
        toast.success("Kegiatan berhasil diajukan!");
        setProposalFile(null);
        onClose();
      } else {
        toast.error(result?.error || "Gagal mengajukan kegiatan");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Terjadi kesalahan saat mengajukan kegiatan");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Form Pengajuan Kegiatan</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Kegiatan
            </label>
            <input
              name="title"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="Masukkan judul kegiatan"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              rows={4}
              placeholder="Jelaskan detail kegiatan"
              required
              minLength={10}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                name="date"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu
              </label>
              <input
                name="time"
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi
              </label>
              <input
                name="location"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="Lokasi kegiatan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Peserta
              </label>
              <input
                name="participants"
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="Estimasi peserta"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Penanggung Jawab (Organizer)
            </label>
            <input
              name="organizer"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="Nama penanggung jawab"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimasi Budget (Rp)
            </label>
            <input
              name="budget"
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="0"
              required
            />
          </div>
          <div>
            <FileInput
              onFileSelect={setProposalFile}
              currentFile={proposalFile}
              label="Upload Proposal PDF (Opsional)"
              acceptedFormats={["PDF"]}
              maxSizeMB={10}
              required={false}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || uploading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploading
                ? "Mengupload..."
                : submitting
                  ? "Menyimpan..."
                  : "Ajukan Kegiatan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
