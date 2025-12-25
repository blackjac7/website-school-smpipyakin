"use client";

import { useState } from "react";
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

interface AnnouncementsPageProps {
  announcements: Announcement[];
}

export default function AnnouncementsAdmin({
  announcements,
}: AnnouncementsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const confirmModal = useToastConfirm();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    // Parse date safely
    const dateStr = formData.get("date") as string;
    const date = dateStr ? new Date(dateStr) : new Date();

    const data = {
      title: formData.get("title") as string,
      date: date,
      location: formData.get("location") as string,
      content: formData.get("content") as string,
      priority: formData.get("priority") as PriorityLevel,
      linkFile: formData.get("linkFile") as string,
    };

    try {
      if (editingItem) {
        await updateAnnouncement(editingItem.id, data);
        toast.success("Announcement updated");
      } else {
        await createAnnouncement(data);
        toast.success("Announcement created");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save announcement:", error);
      toast.error("Failed to save announcement");
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
          await deleteAnnouncement(id);
          toast.success("Announcement deleted");
        } catch (error) {
          console.error("Failed to delete announcement:", error);
          toast.error("Failed to delete announcement");
        }
      }
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Announcements Management
        </h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> New Announcement
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
                    <FileText size={14} /> Attachment
                  </a>
                )}
              </div>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => {
                    setEditingItem(item);
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
                {editingItem ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    name="title"
                    required
                    defaultValue={editingItem?.title}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={
                      editingItem?.date
                        ? new Date(editingItem.date).toISOString().split("T")[0]
                        : ""
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <input
                    name="location"
                    defaultValue={editingItem?.location || ""}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    name="priority"
                    defaultValue={editingItem?.priority || "MEDIUM"}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="HIGH">High (Red)</option>
                    <option value="MEDIUM">Medium (Yellow)</option>
                    <option value="LOW">Low (Green)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea
                  name="content"
                  required
                  defaultValue={editingItem?.content}
                  rows={5}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Attachment Link (Optional)
                </label>
                <input
                  name="linkFile"
                  defaultValue={editingItem?.linkFile || ""}
                  placeholder="https://..."
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Announcement"}
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
