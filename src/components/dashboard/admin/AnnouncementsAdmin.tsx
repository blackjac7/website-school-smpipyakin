"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/actions/announcements";
import { Announcement, PriorityLevel } from "@prisma/client";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";
import FileInput from "@/components/shared/FileInput";

interface AnnouncementsPageProps {
  announcements: Announcement[];
}

export default function AnnouncementsAdmin({
  announcements,
}: AnnouncementsPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [keepExisting, setKeepExisting] = useState(false);
  const confirmModal = useToastConfirm();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (uploading || isLoading) return;

    // Upload attachment file if exists
    let attachmentUrl =
      keepExisting && editingItem?.linkFile ? editingItem.linkFile : undefined;
    if (attachmentFile) {
      setUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", attachmentFile);
        uploadFormData.append("folder", "announcements");
        uploadFormData.append("fileType", "attachment");

        const response = await fetch("/api/upload-files", {
          method: "POST",
          body: uploadFormData,
        });

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || "Upload gagal");
        }

        attachmentUrl = result.data.url;
      } catch {
        toast.error("Gagal upload lampiran");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Parse date safely
    const dateStr = formData.get("date") as string;
    const date = dateStr ? new Date(dateStr) : new Date();

    const data = {
      title: formData.get("title") as string,
      date: date,
      location: formData.get("location") as string,
      content: formData.get("content") as string,
      priority: formData.get("priority") as PriorityLevel,
      linkFile: attachmentUrl,
    };

    try {
      let result;
      if (editingItem) {
        result = await updateAnnouncement(editingItem.id, data);
      } else {
        result = await createAnnouncement(data);
      }

      if (result.success) {
        toast.success(
          editingItem
            ? "Pengumuman berhasil diperbarui"
            : "Pengumuman berhasil dibuat"
        );
        setIsModalOpen(false);
        setEditingItem(null);
        setAttachmentFile(null);
        setKeepExisting(false);
        router.refresh(); // Refresh the page to show updated data
      } else {
        toast.error(result.error || "Gagal menyimpan pengumuman");
      }
    } catch (error) {
      console.error("Failed to save announcement:", error);
      toast.error("Gagal menyimpan pengumuman");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Pengumuman",
        message: "Apakah Anda yakin ingin menghapus pengumuman ini?",
        description: "Tindakan ini tidak dapat dibatalkan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        try {
          const result = await deleteAnnouncement(id);
          if (result.success) {
            toast.success("Pengumuman berhasil dihapus");
            router.refresh(); // Refresh the page to show updated data
          } else {
            toast.error(result.error || "Gagal menghapus pengumuman");
          }
        } catch (error) {
          console.error("Failed to delete announcement:", error);
          toast.error("Gagal menghapus pengumuman");
        }
      }
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Pengumuman
          </h1>
          <p className="text-gray-600 text-sm">Kelola pengumuman sekolah</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setAttachmentFile(null);
            setKeepExisting(false);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
          aria-label="Tambah pengumuman baru"
        >
          <Plus size={20} aria-hidden="true" /> Tambah Pengumuman
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${
              item.priority === "HIGH"
                ? "border-l-red-500"
                : item.priority === "MEDIUM"
                  ? "border-l-yellow-500"
                  : "border-l-green-500"
            } border border-gray-100`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      item.priority === "HIGH"
                        ? "bg-red-100 text-red-600"
                        : item.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {item.priority}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <CalendarIcon size={14} />
                    {format(new Date(item.date), "dd MMM yyyy", { locale: id })}
                  </span>
                  {item.location && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} />
                      {item.location}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  {item.title}
                </h3>
                <p className="text-gray-600 mt-2 text-sm whitespace-pre-line">
                  {item.content}
                </p>
                {item.linkFile && (
                  <a
                    href={item.linkFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 text-sm mt-2 hover:underline"
                  >
                    <FileText size={14} aria-hidden="true" /> Lampiran
                  </a>
                )}
              </div>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setAttachmentFile(null);
                    setKeepExisting(!!item.linkFile);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {editingItem ? "Edit Pengumuman" : "Tambah Pengumuman"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Tutup modal"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    required
                    defaultValue={editingItem?.title}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan judul pengumuman"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="date" className="text-sm font-medium">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    defaultValue={
                      editingItem?.date
                        ? new Date(editingItem.date).toISOString().split("T")[0]
                        : ""
                    }
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Lokasi
                  </label>
                  <input
                    id="location"
                    name="location"
                    defaultValue={editingItem?.location || ""}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Aula Sekolah"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Prioritas
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    defaultValue={editingItem?.priority || "MEDIUM"}
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="HIGH">Tinggi (Merah)</option>
                    <option value="MEDIUM">Sedang (Kuning)</option>
                    <option value="LOW">Rendah (Hijau)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Isi Pengumuman <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  defaultValue={editingItem?.content}
                  rows={5}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tulis isi pengumuman di sini..."
                />
              </div>

              <div className="space-y-2">
                {editingItem?.linkFile && !attachmentFile && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">
                      File saat ini:{" "}
                      <a
                        href={editingItem.linkFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Lihat lampiran
                      </a>
                    </p>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={keepExisting}
                        onChange={(e) => setKeepExisting(e.target.checked)}
                        className="rounded"
                      />
                      <span>Pertahankan file yang ada</span>
                    </label>
                  </div>
                )}
                <FileInput
                  onFileSelect={(file) => {
                    setAttachmentFile(file);
                    if (file) setKeepExisting(false);
                  }}
                  currentFile={attachmentFile}
                  label="Lampiran Dokumen Baru (Opsional)"
                  acceptedFormats={["PDF", "DOC", "DOCX"]}
                  maxSizeMB={10}
                  required={false}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {uploading
                    ? "Mengupload..."
                    : isLoading
                      ? "Menyimpan..."
                      : "Simpan Pengumuman"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
