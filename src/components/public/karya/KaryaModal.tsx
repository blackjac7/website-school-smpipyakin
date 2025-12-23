"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, BookOpen, Tag } from "lucide-react";
import Image from "next/image";

interface PublicWork {
  id: string;
  title: string;
  description: string;
  workType: string;
  mediaUrl: string;
  videoLink: string;
  category: string;
  subject: string;
  createdAt: string;
  studentName: string;
  studentClass: string;
  studentImage: string;
}

interface KaryaModalProps {
  work: PublicWork | null;
  onClose: () => void;
}

export default function KaryaModal({ work, onClose }: KaryaModalProps) {
  if (!work) return null;

  const isVideo = work.workType === "video";

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      let videoId = "";
      if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("youtube.com/watch?v=")) videoId = url.split("watch?v=")[1].split("&")[0];
      else if (url.includes("youtube.com/embed/")) return url;
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    } catch { return null; }
  };

  return (
    <AnimatePresence>
      {work && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button Mobile */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full md:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Section */}
            <div className="w-full md:w-2/3 bg-black flex items-center justify-center relative min-h-[300px] md:h-auto">
              {isVideo ? (
                <iframe
                  src={getYouTubeEmbedUrl(work.videoLink) || ""}
                  className="w-full h-full absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={work.mediaUrl}
                    alt={work.title}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="w-full md:w-1/3 flex flex-col bg-white h-full max-h-[50vh] md:max-h-full overflow-y-auto">
              <div className="p-6 md:p-8 flex-1">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-3">
                      {work.category}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                      {work.title}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Student Info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {work.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{work.studentName}</h4>
                    <p className="text-xs text-gray-500">{work.studentClass}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Deskripsi
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {work.description || "Tidak ada deskripsi."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5" />
                        Mata Pelajaran
                      </h3>
                      <p className="text-sm font-medium text-gray-900">
                        {work.subject || "-"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        Tanggal Upload
                      </h3>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(work.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 md:bg-white">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl active:scale-[0.98]"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
