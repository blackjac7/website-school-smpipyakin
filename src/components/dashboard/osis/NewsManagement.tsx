"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
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
import ImageUpload from "@/components/shared/ImageUpload";
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
import { APPROVAL_STATUS } from "@/components/dashboard/layout";

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
      },
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600"><span className="font-bold text-slate-900">{news.length} berita</span> tercatat dan akan melalui persetujuan Kesiswaan.</p>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Tulis berita
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedNews.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="h-48 bg-gray-100 relative group">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      quality={75}
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

                  {item.statusPersetujuan === "REJECTED" &&
                    item.rejectionNote && (
                      <div className="mb-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3 py-2">
                        <p className="font-semibold mb-1">Catatan penolakan</p>
                        <p className="leading-relaxed line-clamp-3">
                          {item.rejectionNote}
                        </p>
                      </div>
                    )}

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
  const statusMeta = APPROVAL_STATUS[status as keyof typeof APPROVAL_STATUS] ?? APPROVAL_STATUS.PENDING;
  const Icon = status === "APPROVED" ? CheckCircle : status === "REJECTED" ? XCircle : Clock;
  return (
    <span className={`flex items-center gap-1 rounded-full border bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm ${statusMeta.className}`}>
      <Icon className="h-3 w-3" aria-hidden="true" /> {statusMeta.label}
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
      formData: FormData,
    ) => Promise<FormState>,
    initialState,
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
            <ImageUpload
              onUpload={(file) => {
                const imageInput = document.querySelector<HTMLInputElement>(
                  'input[name="image"]',
                );
                if (imageInput) imageInput.value = file.url;
              }}
              onRemove={() => {
                const imageInput = document.querySelector<HTMLInputElement>(
                  'input[name="image"]',
                );
                if (imageInput) imageInput.value = "";
              }}
              folder="news/osis"
              label="Foto Kegiatan (Opsional)"
              acceptedFormats={["JPEG", "PNG", "WebP"]}
              maxSizeMB={4}
            />
            <input type="hidden" name="image" />
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
