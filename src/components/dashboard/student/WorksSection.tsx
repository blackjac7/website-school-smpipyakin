"use client";

import {
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Filter,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Work {
  id: string;
  title: string;
  description: string;
  workType: string;
  mediaUrl: string;
  videoLink: string;
  category: string;
  subject: string;
  status: string;
  rejectionNote: string;
  createdAt: string;
}

interface WorksSectionProps {
  works: Work[];
  onUploadClick: () => void;
  onEditClick: (work: Work) => void;
  onDeleteClick: (workId: string) => void;
  // getStatusColor removed as we use internal styling
}

export default function WorksSection({
  works,
  onUploadClick,
  onEditClick,
  onDeleteClick,
}: WorksSectionProps) {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [works, statusFilter, categoryFilter, workTypeFilter, subjectFilter]);

  const pendingCount = works.filter((work) => work.status === "pending").length;
  const isUploadDisabled = pendingCount >= 2;

  const filteredWorks = works.filter((work) => {
    const matchesStatus =
      statusFilter === "all" || work.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || work.category === categoryFilter;
    const matchesWorkType =
      workTypeFilter === "all" || work.workType === workTypeFilter;
    const matchesSubject =
      subjectFilter === "all" || work.subject === subjectFilter;
    return (
      matchesStatus && matchesCategory && matchesWorkType && matchesSubject
    );
  });

  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorks = filteredWorks.slice(startIndex, endIndex);

  const resetPage = () => setCurrentPage(1);

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setWorkTypeFilter("all");
    setSubjectFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    workTypeFilter !== "all" ||
    subjectFilter !== "all";

  const getWorkTypeLabel = (type: string) =>
    type === "photo" ? "Foto/Gambar" : "Video";

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      "seni-budaya": "Seni Budaya",
      "bahasa-indonesia": "Bahasa Indonesia",
      "bahasa-inggris": "Bahasa Inggris",
      matematika: "Matematika",
      ipa: "IPA",
      ips: "IPS",
      pai: "Pendidikan Agama Islam",
      pkn: "PKn",
      pjok: "PJOK",
      informatika: "Informatika",
      koding: "Koding",
      prakarya: "Prakarya",
      fotografi: "Fotografi",
      lainnya: "Lainnya",
    };
    return categories[category] || category;
  };

  const getSubjectLabel = (subject: string) => {
    const subjects: { [key: string]: string } = {
      "seni-budaya": "Seni Budaya",
      teknologi: "Teknologi",
      "bahasa-indonesia": "Bahasa Indonesia",
      "bahasa-inggris": "Bahasa Inggris",
      matematika: "Matematika",
      ipa: "IPA",
      ips: "IPS",
      pai: "Pendidikan Agama Islam",
      penjaskes: "Pendidikan Jasmani",
      lainnya: "Lainnya",
    };
    return subjects[subject] || subject;
  };

  const handleViewMedia = (work: Work) => {
    if (
      (work.workType === "photo" && work.mediaUrl) ||
      (work.workType === "video" && work.videoLink)
    ) {
      setSelectedWork(work);
    }
  };

  // Helper functions for YouTube and Google Drive URLs (same as before)
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      let videoId = "";
      if (url.includes("youtu.be/"))
        videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("youtube.com/watch?v="))
        videoId = url.split("watch?v=")[1].split("&")[0];
      else if (url.includes("youtube.com/embed/")) return url;
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  };

  const isYouTubeUrl = (url: string) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const getYouTubeThumbnail = (url: string) => {
    try {
      let videoId = "";
      if (url.includes("youtu.be/"))
        videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("youtube.com/watch?v="))
        videoId = url.split("watch?v=")[1].split("&")[0];
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null;
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Karya Saya</h3>
              <p className="text-sm text-gray-500 mt-1">
                Koleksi karya kreatif, tugas, dan proyek Anda
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isUploadDisabled && (
                <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Limit pending tercapai
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onUploadClick}
                disabled={isUploadDisabled}
                className={`
                     flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all
                     ${
                       isUploadDisabled
                         ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                         : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:ring-2 hover:ring-blue-500/20"
                     }
                  `}
              >
                <Plus className="w-4 h-4" />
                Upload Karya
              </motion.button>
            </div>
          </div>

          {isUploadDisabled && (
            <div className="sm:hidden mt-4 flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
              <AlertCircle className="w-3.5 h-3.5" />
              Maksimal 2 karya pending
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    showFilters || hasActiveFilters
                      ? "bg-white text-teal-700 shadow-sm ring-1 ring-teal-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }
               `}
            >
              <Filter className="w-4 h-4" />
              Filter
              {hasActiveFilters && (
                <span className="flex items-center justify-center bg-teal-600 text-white text-[10px] h-5 w-5 rounded-full ml-1">
                  {
                    [
                      statusFilter !== "all",
                      categoryFilter !== "all",
                      workTypeFilter !== "all",
                      subjectFilter !== "all",
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </button>

            {/* Quick Status Filters */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`
                         px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize
                         ${
                           statusFilter === status
                             ? status === "all"
                               ? "bg-gray-800 text-white"
                               : status === "pending"
                                 ? "bg-amber-100 text-amber-700"
                                 : status === "approved"
                                   ? "bg-emerald-100 text-emerald-700"
                                   : "bg-red-100 text-red-700"
                             : "text-gray-500 hover:bg-gray-100"
                         }
                      `}
                >
                  {status === "all"
                    ? "Semua"
                    : status === "pending"
                      ? "Menunggu"
                      : status === "approved"
                        ? "Disetujui"
                        : "Ditolak"}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-xs font-medium text-red-600 hover:text-red-700"
              >
                Reset Filter
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-2 border-t border-gray-200/50">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Kategori
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        resetPage();
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="seni">Seni & Kreativitas</option>
                      <option value="teknologi">Teknologi & Digital</option>
                      <option value="tulis">Karya Tulis</option>
                      <option value="fotografi">Fotografi</option>
                      <option value="video">Video & Multimedia</option>
                      <option value="desain">Desain Grafis</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Mata Pelajaran
                    </label>
                    <select
                      value={subjectFilter}
                      onChange={(e) => {
                        setSubjectFilter(e.target.value);
                        resetPage();
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="all">Semua Mapel</option>
                      <option value="seni-budaya">Seni Budaya</option>
                      <option value="teknologi">Teknologi</option>
                      <option value="bahasa-indonesia">Bahasa Indonesia</option>
                      <option value="bahasa-inggris">Bahasa Inggris</option>
                      <option value="matematika">Matematika</option>
                      <option value="ipa">IPA</option>
                      <option value="ips">IPS</option>
                      <option value="pai">Pendidikan Agama Islam</option>
                      <option value="penjaskes">Pendidikan Jasmani</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Jenis
                    </label>
                    <select
                      value={workTypeFilter}
                      onChange={(e) => {
                        setWorkTypeFilter(e.target.value);
                        resetPage();
                      }}
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    >
                      <option value="all">Semua Jenis</option>
                      <option value="photo">Foto/Gambar</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="p-6 bg-gray-50 min-h-[400px]">
          {filteredWorks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-gray-900 font-medium text-lg">
                Tidak ada data
              </h4>
              <p className="text-gray-500 text-sm mt-1 max-w-xs">
                {works.length === 0
                  ? "Belum ada karya yang diunggah. Tunjukkan kreativitasmu!"
                  : "Tidak ada karya yang sesuai dengan filter yang dipilih."}
              </p>
              {works.length > 0 && hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  Hapus semua filter
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentWorks.map((work) => (
                <motion.div
                  key={work.id}
                  variants={item}
                  className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {/* Media Preview Logic (Simplified for brevity, similar to original but cleaned up) */}
                    <div
                      className="w-full h-full cursor-pointer relative"
                      onClick={() => handleViewMedia(work)}
                    >
                      {work.workType === "photo" && work.mediaUrl ? (
                        <Image
                          src={work.mediaUrl}
                          alt={work.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : work.workType === "video" && work.videoLink ? (
                        <div className="w-full h-full relative">
                          {/* Thumbnail Logic reuse */}
                          <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
                            {/* Just a placeholder if no thumbnail fetch logic available in this view, simpler than before */}
                            {isYouTubeUrl(work.videoLink) ? (
                              (() => {
                                const thumb = getYouTubeThumbnail(work.videoLink);
                                return thumb ? (
                                  <Image
                                    src={thumb}
                                    alt=""
                                    fill
                                    className="object-cover opacity-80"
                                  />
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                                    </div>
                                    <span className="text-xs font-medium">Video Preview</span>
                                  </div>
                                );
                              })()
                            ) : (
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <Eye className="w-8 h-8" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="px-4 py-2 bg-white/90 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          Lihat Detail
                        </div>
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 z-10 pointer-events-none">
                      <span
                        className={`
                         px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm
                         ${
                           work.status === "approved"
                             ? "bg-emerald-500 text-white"
                             : work.status === "pending"
                               ? "bg-amber-500 text-white"
                               : "bg-red-500 text-white"
                         }
                      `}
                      >
                        {work.status === "approved"
                          ? "Disetujui"
                          : work.status === "pending"
                            ? "Pending"
                            : "Ditolak"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm bg-white/90 backdrop-blur-sm ${work.workType === "photo" ? "text-green-700" : "text-red-700"}`}
                      >
                        {getWorkTypeLabel(work.workType)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-[10px] font-semibold px-2 py-1 bg-teal-50 text-teal-700 rounded-md border border-teal-100 uppercase">
                        {getCategoryLabel(work.category)}
                      </span>
                      {work.subject && (
                        <span className="text-[10px] font-semibold px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-200 uppercase line-clamp-1">
                          {getSubjectLabel(work.subject)}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {work.title}
                    </h4>

                    <p className="text-xs text-gray-400 font-medium mb-3">
                      {formatDate(work.createdAt)}
                    </p>

                    {/* Action Footer */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedWork(work)}
                        className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors text-xs font-semibold"
                      >
                        Detail
                      </button>

                      {work.status === "pending" && (
                        <button
                          onClick={() => onEditClick(work)}
                          className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {work.status === "rejected" && (
                        <button
                          onClick={() => onDeleteClick(work.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                <span className="px-4 text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Detail Karya</h3>
              <button
                onClick={() => setSelectedWork(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              {/* Content logic same as original but styled nicely */}
              <div className="space-y-6">
                {/* Media Display Area */}
                <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                  {selectedWork.workType === "photo" &&
                  selectedWork.mediaUrl ? (
                    <Image
                      src={selectedWork.mediaUrl}
                      alt={selectedWork.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 800px"
                    />
                  ) : selectedWork.workType === "video" ? (
                    <iframe
                      src={
                        getYouTubeEmbedUrl(selectedWork.videoLink) ||
                        selectedWork.videoLink
                      }
                      className="w-full h-full"
                      allowFullScreen
                      title={`Video: ${selectedWork.title}`}
                    />
                  ) : (
                    <span className="text-white">Media tidak tersedia</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedWork.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(selectedWork.createdAt)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">
                        Deskripsi
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {selectedWork.description || "Tidak ada deskripsi."}
                      </p>
                    </div>

                    {selectedWork.status === "rejected" &&
                      selectedWork.rejectionNote && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                          <h4 className="text-red-800 font-semibold text-sm mb-1">
                            Alasan Penolakan:
                          </h4>
                          <p className="text-red-600 text-sm">
                            {selectedWork.rejectionNote}
                          </p>
                        </div>
                      )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 h-fit border border-gray-100 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Status
                      </label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase
                                 ${
                                   selectedWork.status === "approved"
                                     ? "bg-emerald-100 text-emerald-700"
                                     : selectedWork.status === "pending"
                                       ? "bg-amber-100 text-amber-700"
                                       : "bg-red-100 text-red-700"
                                 }`}
                        >
                          {selectedWork.status === "approved"
                            ? "Disetujui"
                            : selectedWork.status === "pending"
                              ? "Menunggu Review"
                              : "Ditolak"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Kategori
                      </label>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {getCategoryLabel(selectedWork.category)}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Jenis Karya
                      </label>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {getWorkTypeLabel(selectedWork.workType)}
                      </p>
                    </div>

                    {selectedWork.subject && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">
                          Mata Pelajaran
                        </label>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          {getSubjectLabel(selectedWork.subject)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
