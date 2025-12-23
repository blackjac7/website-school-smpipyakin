"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { createOsisNews, deleteOsisNews, getOsisNews } from "@/actions/osis/news";
import toast from "react-hot-toast";
import { OsisNews } from "./types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function NewsManagement() {
  const [news, setNews] = useState<OsisNews[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Apakah anda yakin ingin menghapus berita ini?")) return;
    const res = await deleteOsisNews(id);
    if (res.success) {
      toast.success("Berita dihapus");
      fetchNews();
    } else {
      toast.error(res.error || "Gagal menghapus");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Berita & Kegiatan</h3>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tulis Berita Baru
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              {item.image && (
                <div className="h-40 bg-gray-100 relative">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs text-gray-500">{format(new Date(item.date), "dd MMM yyyy", { locale: idLocale })}</span>
                   <StatusBadge status={item.statusPersetujuan} />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{item.content}</p>

                {item.statusPersetujuan === "PENDING" && (
                    <button
                        onClick={() => handleDelete(item.id)}
                        className="self-end text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                )}
              </div>
            </div>
          ))}
          {news.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-lg border">
                Belum ada berita yang ditulis.
            </div>
          )}
        </div>
      )}

      {showModal && (
        <AddNewsModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchNews(); }} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "APPROVED") return <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3"/> Disetujui</span>;
    if (status === "REJECTED") return <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full"><XCircle className="w-3 h-3"/> Ditolak</span>;
    return <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full"><Clock className="w-3 h-3"/> Menunggu</span>;
}

function AddNewsModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const initialState = { success: false, error: "", message: "" };
    // Cast to any to bypass strict overload check for simple server action
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [state, formAction, isPending] = useActionState(createOsisNews as any, initialState);

    useEffect(() => {
        if (state?.success) {
            toast.success("Berita berhasil diajukan");
            onSuccess();
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state, onSuccess]);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Tulis Berita Kegiatan</h3>
                    <button onClick={onClose}><XCircle className="w-6 h-6 text-gray-400" /></button>
                </div>
                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Judul Berita</label>
                        <input name="title" className="w-full border rounded-lg px-3 py-2" required minLength={5} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Konten</label>
                        <textarea name="content" className="w-full border rounded-lg px-3 py-2" rows={5} required minLength={20} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Link Gambar (Optional)</label>
                        <input name="image" className="w-full border rounded-lg px-3 py-2" placeholder="URL Gambar" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Tanggal Kegiatan</label>
                        <input name="date" type="date" className="w-full border rounded-lg px-3 py-2" />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Batal</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-900 text-white rounded-lg">
                            {isPending ? "Mengirim..." : "Kirim Berita"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
