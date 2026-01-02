"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  createOsisNews,
  deleteOsisNews,
  getOsisNews,
} from "@/actions/osis/news";
import toast from "react-hot-toast";
import { OsisNews } from "./types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 6;

export default function NewsManagement() {
  const [news, setNews] = useState<OsisNews[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const confirmModal = useToastConfirm();

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const res = await getOsisNews();
      if (res.success && res.data) {
        setNews(res.data as unknown as OsisNews[]);
      }
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = e;
      toast.error("Gagal memuat berita");
    } finally {
      setLoading(false);
    }
  }

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
        const res = await deleteOsisNews(id);
        if (res.success) {
          toast.success("Berita dihapus");
          fetchNews();
        } else {
          toast.error(res.error || "Gagal menghapus");
        }
      }
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(news.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNews = news.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Berita & Kegiatan</h3>
          {news.length > 0 && (
            <p className="text-sm text-gray-500">Total: {news.length} berita</p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-md shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tulis Berita Baru</span>
          <span className="sm:hidden">Baru</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedNews.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gray-100 relative group">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={item.statusPersetujuan} />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-xs text-gray-500 mb-2 font-medium">
                    {format(new Date(item.date), "dd MMMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg group-hover:text-blue-900 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                    {item.content}
                  </p>

                  {item.statusPersetujuan === "PENDING" && (
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {news.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <p>Belum ada berita yang ditulis.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">
                Menampilkan {startIndex + 1}-
                {Math.min(startIndex + ITEMS_PER_PAGE, news.length)} dari{" "}
                {news.length} berita
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 px-3">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Halaman selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <AddNewsModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchNews();
            setCurrentPage(1);
          }}
        />
      )}

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

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED")
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
        <CheckCircle className="w-3 h-3" /> Disetujui
      </span>
    );
  if (status === "REJECTED")
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-700 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
        <XCircle className="w-3 h-3" /> Ditolak
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
      <Clock className="w-3 h-3" /> Menunggu
    </span>
  );
}

type FormState = { success: boolean; error: string; message: string };

function AddNewsModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const initialState: FormState = { success: false, error: "", message: "" };
  const [state, formAction, isPending] = useActionState(
    createOsisNews as unknown as (
      prev: FormState,
      formData: FormData
    ) => Promise<FormState>,
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Berita berhasil diajukan");
      onSuccess();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Tulis Berita Kegiatan
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XCircle className="w-6 h-6 text-gray-400" />
          </button>
        </div>
        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Judul Berita
            </label>
            <input
              name="title"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              required
              minLength={5}
              placeholder="Masukkan judul menarik..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Konten
            </label>
            <textarea
              name="content"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              rows={6}
              required
              minLength={20}
              placeholder="Jelaskan detail kegiatan..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Link Gambar (Optional)
            </label>
            <input
              name="image"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Tanggal Kegiatan
            </label>
            <input
              name="date"
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-medium transition-colors shadow-lg shadow-blue-900/20"
            >
              {isPending ? "Mengirim..." : "Kirim Berita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
