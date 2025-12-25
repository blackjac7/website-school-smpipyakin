"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { createNews, updateNews, deleteNews } from "@/actions/news";
import { News } from "@prisma/client";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

interface NewsPageProps {
  news: News[];
}

export default function NewsAdmin({ news }: NewsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<News | null>(null);
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
      content: formData.get("content") as string,
      excerpt: formData.get("content")?.slice(0, 150) as string, // Manual excerpt
      image: formData.get("image") as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      category: formData.get("kategori") as any, // Mapped to expected arg
      author: "", // Handled by action
    };

    try {
      if (editingItem) {
        await updateNews(editingItem.id, {
          title: data.title,
          date: data.date,
          content: data.content,
          image: data.image,
          kategori: data.category,
        });
        toast.success("News updated");
      } else {
        await createNews(data);
        toast.success("News created");
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Failed to save news:", error);
      toast.error("Failed to save news");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Berita",
        message: "Apakah Anda yakin ingin menghapus berita ini?",
        description: "Tindakan ini tidak dapat dibatalkan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        try {
          await deleteNews(id);
          toast.success("News deleted");
        } catch (error) {
          console.error("Failed to delete news:", error);
          toast.error("Failed to delete news");
        }
      }
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">News Management</h1>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Add News
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full"
          >
            <div className="relative h-48 bg-gray-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full shadow-sm ${
                    item.kategori === "ACHIEVEMENT"
                      ? "bg-yellow-400 text-yellow-900"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {item.kategori === "ACHIEVEMENT" ? "Prestasi" : "Kegiatan"}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <CalendarIcon size={12} />
                {format(new Date(item.date), "dd MMMM yyyy", {
                  locale: localeId,
                })}
              </div>

              <h3 className="font-bold text-lg mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
                {item.content}
              </p>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-auto">
                <button
                  onClick={() => {
                    setEditingItem(item);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
                {editingItem ? "Edit News" : "Add News"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  name="title"
                  required
                  defaultValue={editingItem?.title}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    name="kategori"
                    defaultValue={editingItem?.kategori || "ACTIVITY"}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="ACTIVITY">Kegiatan</option>
                    <option value="ACHIEVEMENT">Prestasi</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-gray-400" />
                  <input
                    name="image"
                    defaultValue={editingItem?.image || ""}
                    placeholder="https://..."
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea
                  name="content"
                  required
                  defaultValue={editingItem?.content}
                  rows={8}
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
                  {isLoading ? "Saving..." : "Save News"}
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
