"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Banknote,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { validateOsisActivity } from "@/actions/pembina-osis/validation";
import toast from "react-hot-toast";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

interface OsisActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  budget: number;
  participants: number;
  organizer: string;
  author?: {
    username: string;
  };
}

export default function PendingActivitiesList({
  activities,
}: {
  activities: OsisActivity[];
}) {
  const [selectedActivity, setSelectedActivity] = useState<OsisActivity | null>(
    null,
  );
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const confirmModal = useToastConfirm();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleApprove = async (activity: OsisActivity) => {
    confirmModal.showConfirm(
      {
        title: "Setujui Program Kerja",
        message: `Setujui program “${activity.title}”?`,
        description: "OSIS akan menerima keputusan ini dan program dapat dilanjutkan sesuai proposal.",
        type: "success",
        confirmText: "Ya, setujui",
        cancelText: "Periksa lagi",
      },
      async () => {
        setIsProcessing(true);
        try {
          const result = await validateOsisActivity(activity.id, "APPROVE");
          if (result.success) toast.success(result.message || "Program kerja disetujui");
          else toast.error(result.error || "Keputusan gagal disimpan");
        } catch (err) {
          console.error("Approve error:", err);
          toast.error("Keputusan gagal disimpan. Silakan coba lagi.");
        } finally {
          setIsProcessing(false);
        }
      },
    );
  };

  const handleReject = async () => {
    if (!selectedActivity) return;
    if (!rejectionNote.trim()) {
      toast.error("Mohon berikan alasan penolakan");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await validateOsisActivity(
        selectedActivity.id,
        "REJECT",
        rejectionNote,
      );
      if (result.success) {
        toast.success(result.message || "Berhasil menolak program");
        setIsRejectModalOpen(false);
        setRejectionNote("");
        setSelectedActivity(null);
      } else {
        toast.error(result.error || "Gagal menolak program");
      }
    } catch (err) {
      console.error("Reject error:", err);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsProcessing(false);
    }
  };

  if (activities.length === 0) {
    return (
      <div className="dashboard-empty-state">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Semua sudah ditinjau</h3>
        <p className="text-gray-500 text-center mt-1">
          Tidak ada proposal program kerja yang memerlukan keputusan saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-4 sm:gap-5">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >
          <div className="p-6">
            <button type="button" className="flex w-full items-start justify-between gap-3 text-left" onClick={() => toggleExpand(activity.id)} aria-expanded={expandedId === activity.id} aria-controls={`proposal-${activity.id}`}>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {activity.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>
                    Diajukan oleh:{" "}
                    <span className="font-medium text-gray-700">
                      {activity.author?.username || activity.organizer}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] sm:text-xs font-bold rounded-full border border-yellow-200 uppercase whitespace-nowrap sm:tracking-wide">
                  Menunggu Validasi
                </div>
                {expandedId === activity.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            <div id={`proposal-${activity.id}`}
              className={`transition-all duration-300 ${expandedId === activity.id ? "block" : "hidden"}`}
            >
              <p className="text-gray-600 mb-6 leading-relaxed">
                {activity.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {format(new Date(activity.date), "EEEE, dd MMMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{activity.time} WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{activity.participants} Peserta</span>
                </div>
                <div className="flex items-center gap-2 md:col-span-2">
                  <Banknote className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    Rp {new Intl.NumberFormat("id-ID").format(activity.budget)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  className="dashboard-button border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedActivity(activity);
                    setIsRejectModalOpen(true);
                  }}
                  disabled={isProcessing}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak
                </button>
                <button
                  className="dashboard-button bg-emerald-700 text-white hover:bg-emerald-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(activity);
                  }}
                  disabled={isProcessing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Setujui Program
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Reject Modal Overlay */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reject-proposal-title">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 id="reject-proposal-title" className="flex items-center gap-2 text-lg font-bold text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  Tolak Program Kerja
                </h3>
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="dashboard-icon-button"
                  aria-label="Tutup formulir penolakan"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Program kerja <strong>{selectedActivity?.title}</strong> akan
                ditolak. Mohon berikan alasan penolakan untuk perbaikan OSIS.
              </p>

              <textarea
                aria-label="Alasan penolakan"
                aria-describedby="rejection-helper"
                required
                placeholder="Contoh: Anggaran terlalu besar, tanggal bentrok dengan kegiatan sekolah..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="mb-2 min-h-28 w-full resize-y border border-slate-300 p-3 text-sm"
              />
              <p id="rejection-helper" className="mb-6 text-xs leading-5 text-slate-500">Tuliskan alasan yang spesifik dan dapat ditindaklanjuti oleh pengurus OSIS.</p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="dashboard-button dashboard-button-secondary"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionNote.trim() || isProcessing}
                  className="dashboard-button dashboard-button-danger"
                >
                  {isProcessing ? "Memproses..." : "Konfirmasi Penolakan"}
                </button>
              </div>
            </div>
          </div>
        </div>
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
