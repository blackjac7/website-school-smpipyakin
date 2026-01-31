"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Check,
  X,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "@/components/shared/ImageUpload";
import { createNews, updateNews, deleteNews, validateNews } from "@/actions/news";
import { News } from "@prisma/client";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

interface NewsWithAuthor extends News {
  author?: {
    username: string;
    role: string;
  } | null;
}

interface NewsPageProps {
  news: NewsWithAuthor[];
  pendingNews?: NewsWithAuthor[];
}

export default function NewsAdmin({ news, pendingNews = [] }: NewsPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"published" | "pending">("published");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<News | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  
  const confirmModal = useToastConfirm();

  const handleValidate = async (id: string, action: "APPROVE" | "REJECT") => {
    if (action === "REJECT") {
      setRejectId(id);
      setRejectNote("");
      setIsRejectModalOpen(true);
      return;
    }

    try {
      const result = await validateNews(id, "APPROVE");
      if (result.success) {
        toast.success("Berita disetujui");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyetujui berita");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan");
    }
  };

  const handleRejectSubmit = async () => {
      if (!rejectId || !rejectNote.trim()) return;

      setIsLoading(true);
      try {
          const result = await validateNews(rejectId, "REJECT", rejectNote);
          if (result.success) {
              toast.success("Berita ditolak");
              setIsRejectModalOpen(false);
              setRejectId(null);
              setRejectNote("");
              router.refresh();
          } else {
              toast.error(result.error || "Gagal menolak berita");
          }
      } catch (error) {
          console.error("Failed to reject news:", error);
          toast.error("Terjadi kesalahan");
      } finally {
          setIsLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

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
        const result = await updateNews(editingItem.id, {
          title: data.title,
          date: data.date,
          content: data.content,
          image: data.image,
          kategori: data.category,
        });
        if (result.success) {
          toast.success("News updated");
          setIsModalOpen(false);
          setEditingItem(null);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update news");
        }
      } else {
        const result = await createNews(data);
        if (result.success) {
          toast.success("News created");
          setIsModalOpen(false);
          setEditingItem(null);
          router.refresh();
        } else {
          console.error("createNews failed client-side:", result);
          toast.error(result.error || "Failed to create news");
        }
      }
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
          const result = await deleteNews(id);
          if (result.success) {
            toast.success("News deleted");
            router.refresh();
          } else {
            toast.error(result.error || "Failed to delete news");
          }
        } catch (error) {
          console.error("Failed to delete news:", error);
          toast.error("Failed to delete news");
        }
      }
    );
  };

  const displayNews = activeTab === "published" ? news : pendingNews;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Berita</h1>
          <p className="text-gray-600 text-sm">
            Kelola berita dan validasi konten kegiatan OSIS
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
          aria-label="Tambah berita baru"
        >
          <Plus size={20} aria-hidden="true" /> Tambah Berita
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("published")}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === "published"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Berita Terbit
          {activeTab === "published" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === "pending"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Menunggu Validasi
          {pendingNews.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
              {pendingNews.length}
            </span>
          )}
          {activeTab === "pending" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
            />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayNews.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               {activeTab === "published" ? "Belum ada berita yang diterbitkan." : "Tidak ada berita yang menunggu validasi."}
            </div>
          ) : (
            displayNews.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
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
                  <div className="absolute top-2 right-2 flex gap-1">
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
                  {item.statusPersetujuan === "PENDING" && (
                     <div className="absolute top-2 left-2">
                       <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                         <Clock size={12} /> Pending
                       </span>
                     </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <CalendarIcon size={12} />
                        {format(new Date(item.date), "dd MMMM yyyy", {
                        locale: localeId,
                        })}
                    </div>
                    {item.author && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {item.author.username}
                        </span>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 prose prose-sm">
                    {item.content}
                  </p>

                  <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-auto">
                    {activeTab === "pending" ? (
                      <>
                         <button
                          onClick={() => handleValidate(item.id, "REJECT")}
                          className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <X size={16} /> Tolak
                        </button>
                        <button
                          onClick={() => handleValidate(item.id, "APPROVE")}
                          className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <Check size={16} /> Setujui
                        </button>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">
                {editingItem ? "Edit Berita" : "Tambah Berita"}
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
                  placeholder="Masukkan judul berita"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <label htmlFor="kategori" className="text-sm font-medium">
                    Kategori
                  </label>
                  <select
                    id="kategori"
                    name="kategori"
                    defaultValue={editingItem?.kategori || "ACTIVITY"}
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ACTIVITY">Kegiatan</option>
                    <option value="ACHIEVEMENT">Prestasi</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="image" className="text-sm font-medium">
                  Foto Berita
                </label>
                <ImageUpload
                  onUpload={(file) => {
                    const imageInput = document.querySelector<HTMLInputElement>(
                      'input[name="image"]'
                    );
                    if (imageInput) imageInput.value = file.url;
                  }}
                  onRemove={() => {
                    const imageInput = document.querySelector<HTMLInputElement>(
                      'input[name="image"]'
                    );
                    if (imageInput) imageInput.value = "";
                  }}
                  currentImage={editingItem?.image || ""}
                  folder="news/admin"
                  label="Upload Foto Berita"
                  acceptedFormats={["JPEG", "PNG", "WebP"]}
                  maxSizeMB={4}
                />
                <input
                  type="hidden"
                  name="image"
                  defaultValue={editingItem?.image || ""}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Konten <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  defaultValue={editingItem?.content}
                  rows={8}
                  placeholder="Tulis isi berita di sini..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Berita"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-red-600">Tolak Berita</h2>
              <p className="text-sm text-gray-500 mt-1">Masukkan alasan penolakan untuk memberikan feedback kepada pembuat berita.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                 <label htmlFor="rejectNote" className="text-sm font-medium">
                   Alasan Penolakan <span className="text-red-500">*</span>
                 </label>
                 <textarea
                   id="rejectNote"
                   value={rejectNote}
                   onChange={(e) => setRejectNote(e.target.value)}
                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[100px]"
                   placeholder="Contoh: Konten kurang relevan, mohon perbaiki foto..."
                 />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                      setIsRejectModalOpen(false);
                      setRejectNote("");
                      setRejectId(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={isLoading || !rejectNote.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Menolak..." : "Tolak Berita"}
                </button>
              </div>
            </div>
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
