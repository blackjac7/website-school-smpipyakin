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
  ChevronUp
} from "lucide-react";
import { validateOsisActivity } from "@/actions/pembina-osis/validation";
import toast from "react-hot-toast";

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

export default function PendingActivitiesList({ activities }: { activities: OsisActivity[] }) {
  const [selectedActivity, setSelectedActivity] = useState<OsisActivity | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleApprove = async (activity: OsisActivity) => {
    if (!confirm("Apakah Anda yakin ingin MENYETUJUI program kerja ini?")) return;

    setIsProcessing(true);
    try {
      const result = await validateOsisActivity(activity.id, "APPROVE");
      if (result.success) {
        toast.success(result.message || "Validasi berhasil");
      } else {
        toast.error(result.error || "Gagal memproses");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedActivity) return;
    if (!rejectionNote.trim()) {
      toast.error("Mohon berikan alasan penolakan");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await validateOsisActivity(selectedActivity.id, "REJECT", rejectionNote);
      if (result.success) {
        toast.success(result.message || "Berhasil menolak program");
        setIsRejectModalOpen(false);
        setRejectionNote("");
        setSelectedActivity(null);
      } else {
        toast.error(result.error || "Gagal menolak program");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsProcessing(false);
    }
  };

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Semua Beres!</h3>
        <p className="text-gray-500 text-center mt-1">
          Tidak ada proposal program kerja yang menunggu validasi saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4 cursor-pointer" onClick={() => toggleExpand(activity.id)}>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{activity.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>Diajukan oleh: <span className="font-medium text-gray-700">{activity.author?.username || activity.organizer}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200 uppercase tracking-wide">
                  Menunggu Validasi
                </div>
                {expandedId === activity.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            <div className={`transition-all duration-300 ${expandedId === activity.id ? 'block' : 'hidden'}`}>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {activity.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {format(new Date(activity.date), "EEEE, dd MMMM yyyy", { locale: idLocale })}
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

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                  <button
                    className="flex items-center px-4 py-2 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
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
                    className="flex items-center px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg shadow-sm shadow-green-200 transition-colors font-medium text-sm disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Tolak Program Kerja
                </h3>
                <button 
                  onClick={() => setIsRejectModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Program kerja <strong>{selectedActivity?.title}</strong> akan ditolak.
                Mohon berikan alasan penolakan untuk perbaikan OSIS.
              </p>

              <textarea
                placeholder="Contoh: Anggaran terlalu besar, tanggal bentrok dengan kegiatan sekolah..."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none text-sm mb-6"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionNote.trim() || isProcessing}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? "Memproses..." : "Konfirmasi Penolakan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
