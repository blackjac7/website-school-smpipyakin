"use client";

import {
  Eye,
  ExternalLink,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  Filter,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

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
  getStatusColor: (status: string) => string;
}

export default function WorksSection({
  works,
  onUploadClick,
  onEditClick,
  onDeleteClick,
  getStatusColor,
}: WorksSectionProps) {
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [workTypeFilter, setWorkTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 6; // 2 rows of 3 items each

  // Count pending works
  const pendingCount = works.filter((work) => work.status === "pending").length;

  // Check if upload should be disabled (max 2 pending)
  const isUploadDisabled = pendingCount >= 2;

  // Filter and search logic
  const filteredWorks = works.filter((work) => {
    // Status filter
    const matchesStatus =
      statusFilter === "all" || work.status === statusFilter;

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || work.category === categoryFilter;

    // Work type filter
    const matchesWorkType =
      workTypeFilter === "all" || work.workType === workTypeFilter;

    // Subject filter
    const matchesSubject =
      subjectFilter === "all" || work.subject === subjectFilter;

    return (
      matchesStatus && matchesCategory && matchesWorkType && matchesSubject
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredWorks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorks = filteredWorks.slice(startIndex, endIndex);

  // Reset page when filters change
  const resetPage = () => {
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setWorkTypeFilter("all");
    setSubjectFilter("all");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    workTypeFilter !== "all" ||
    subjectFilter !== "all";

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getWorkTypeLabel = (type: string) => {
    return type === "photo" ? "Foto/Gambar" : "Video";
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      seni: "Seni & Kreativitas",
      teknologi: "Teknologi & Digital",
      tulis: "Karya Tulis",
      fotografi: "Fotografi",
      video: "Video & Multimedia",
      desain: "Desain Grafis",
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
    if (work.workType === "photo" && work.mediaUrl) {
      window.open(work.mediaUrl, "_blank");
    } else if (work.workType === "video" && work.videoLink) {
      // For video, we'll show it in the detail modal instead of opening in new tab
      setSelectedWork(work);
    }
  };

  // Helper function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      // Handle different YouTube URL formats
      let videoId = "";

      if (url.includes("youtu.be/")) {
        // Format: https://youtu.be/VIDEO_ID
        videoId = url.split("youtu.be/")[1].split("?")[0];
      } else if (url.includes("youtube.com/watch?v=")) {
        // Format: https://www.youtube.com/watch?v=VIDEO_ID
        videoId = url.split("watch?v=")[1].split("&")[0];
      } else if (url.includes("youtube.com/embed/")) {
        // Already embed format
        return url;
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      return null;
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      return null;
    }
  };

  // Check if URL is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  // Check if URL is a Google Drive URL
  const isGoogleDriveUrl = (url: string) => {
    return url.includes("drive.google.com");
  };

  // Helper function to get YouTube thumbnail
  const getYouTubeThumbnail = (url: string) => {
    try {
      let videoId = "";

      if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      } else if (url.includes("youtube.com/watch?v=")) {
        videoId = url.split("watch?v=")[1].split("&")[0];
      }

      if (videoId) {
        // Using maxresdefault for higher quality, fallback to hqdefault if not available
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }

      return null;
    } catch (error) {
      console.error("Error getting YouTube thumbnail:", error);
      return null;
    }
  };

  // Helper function to get Google Drive file ID and create preview/embed URLs
  const getGoogleDriveInfo = (url: string) => {
    try {
      let fileId = "";

      // Extract file ID from different Google Drive URL formats
      if (url.includes("/file/d/")) {
        fileId = url.split("/file/d/")[1].split("/")[0];
      } else if (url.includes("id=")) {
        fileId = url.split("id=")[1].split("&")[0];
      }

      if (fileId) {
        return {
          fileId,
          thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h225`,
          embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
          directUrl: url,
        };
      }

      return null;
    } catch (error) {
      console.error("Error parsing Google Drive URL:", error);
      return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Karya Saya
              </h3>
              {works.length > 0 && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Total: {works.length} karya | Ditampilkan:{" "}
                  {filteredWorks.length} karya | Menunggu persetujuan:{" "}
                  {pendingCount}
                </p>
              )}
              {works.some(
                (w) => w.status === "pending" || w.status === "rejected"
              ) && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full inline-block">
                  💡 Tip: Karya pending dapat diedit, karya ditolak dapat
                  dihapus
                </div>
              )}
            </div>

            {/* Upload Button - Always visible but conditionally disabled */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {isUploadDisabled && (
                <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span className="text-center sm:text-left">
                    Maksimal 2 karya pending
                  </span>
                </div>
              )}
              <button
                onClick={onUploadClick}
                disabled={isUploadDisabled}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isUploadDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                }`}
                title={
                  isUploadDisabled
                    ? "Anda sudah memiliki 2 karya yang menunggu persetujuan"
                    : "Upload karya baru"
                }
              >
                <Plus className="w-4 h-4" />
                <span>Upload Karya Baru</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {works.length > 0 && (
          <div className="px-4 sm:px-6 pb-4 border-b border-gray-200">
            {/* Filter Toggle and Clear Filters */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    showFilters || hasActiveFilters
                      ? "bg-teal-100 text-teal-800 border border-teal-200"
                      : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Filter
                  {hasActiveFilters && (
                    <span className="bg-teal-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {
                        [
                          statusFilter !== "all" && 1,
                          categoryFilter !== "all" && 1,
                          workTypeFilter !== "all" && 1,
                          subjectFilter !== "all" && 1,
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-xs sm:text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      resetPage();
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="approved">Disetujui</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => {
                      setCategoryFilter(e.target.value);
                      resetPage();
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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

                {/* Work Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Jenis Karya
                  </label>
                  <select
                    value={workTypeFilter}
                    onChange={(e) => {
                      setWorkTypeFilter(e.target.value);
                      resetPage();
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="photo">Foto/Gambar</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Mata Pelajaran
                  </label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => {
                      setSubjectFilter(e.target.value);
                      resetPage();
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              </div>
            )}
          </div>
        )}

        <div className="p-4 sm:p-6">
          {works.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Karya
              </h4>
              <p className="text-gray-500 mb-6 text-sm sm:text-base max-w-sm mx-auto">
                Mulai upload karya Anda untuk membangun portofolio yang
                menginspirasi dan menunjukkan kreativitas Anda.
              </p>
              <button
                onClick={onUploadClick}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm sm:text-base font-medium flex items-center gap-2 mx-auto cursor-pointer shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                Upload Karya Pertama
              </button>
            </div>
          ) : filteredWorks.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Tidak Ada Karya Ditemukan
              </h4>
              <p className="text-gray-500 mb-6 text-sm sm:text-base max-w-sm mx-auto">
                Tidak ada karya yang sesuai dengan filter yang dipilih. Coba
                ubah kriteria filter Anda.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm sm:text-base font-medium cursor-pointer shadow-lg hover:shadow-xl"
                >
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {currentWorks.map((work) => (
                  <div
                    key={work.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Media Preview */}
                    <div className="aspect-video bg-gray-100 relative">
                      {work.workType === "photo" && work.mediaUrl ? (
                        <Image
                          src={work.mediaUrl}
                          alt={work.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handleViewMedia(work)}
                        />
                      ) : work.workType === "video" ? (
                        <div
                          className="w-full h-full relative cursor-pointer group"
                          onClick={() => handleViewMedia(work)}
                        >
                          {isYouTubeUrl(work.videoLink) &&
                          getYouTubeThumbnail(work.videoLink) ? (
                            // YouTube Thumbnail
                            <>
                              <Image
                                src={getYouTubeThumbnail(work.videoLink)!}
                                alt={work.title}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to hqdefault if maxresdefault fails
                                  const target = e.target as HTMLImageElement;
                                  const videoId = work.videoLink.includes(
                                    "youtu.be/"
                                  )
                                    ? work.videoLink
                                        .split("youtu.be/")[1]
                                        .split("?")[0]
                                    : work.videoLink
                                        .split("watch?v=")[1]
                                        .split("&")[0];
                                  target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                }}
                              />
                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center group-hover:bg-opacity-40 transition-colors">
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <svg
                                    className="w-8 h-8 text-white ml-1"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                              {/* YouTube Logo */}
                              <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-white text-xs font-bold">
                                YouTube
                              </div>
                            </>
                          ) : isGoogleDriveUrl(work.videoLink) &&
                            getGoogleDriveInfo(work.videoLink) ? (
                            // Google Drive Thumbnail
                            <>
                              <Image
                                src={
                                  getGoogleDriveInfo(work.videoLink)!
                                    .thumbnailUrl
                                }
                                alt={work.title}
                                width={400}
                                height={225}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to generic video placeholder
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  target.parentElement!.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                                      <div class="text-center">
                                        <svg class="w-12 h-12 mx-auto text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                        </svg>
                                        <span class="text-sm text-blue-800 font-medium">Google Drive</span>
                                      </div>
                                    </div>
                                  `;
                                }}
                              />
                              {/* Play Button Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center group-hover:bg-opacity-40 transition-colors">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <svg
                                    className="w-8 h-8 text-white ml-1"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                              {/* Google Drive Logo */}
                              <div className="absolute top-2 left-2 bg-blue-600 px-2 py-1 rounded text-white text-xs font-bold">
                                Drive
                              </div>
                            </>
                          ) : (
                            // Fallback for other video platforms
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-200">
                              <div className="text-center">
                                <ExternalLink className="w-8 h-8 mx-auto text-red-600 mb-2" />
                                <span className="text-sm text-red-800 font-medium">
                                  Lihat Video
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Eye className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      {/* Work Type Badge */}
                      <div className="absolute bottom-2 left-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            work.workType === "photo"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getWorkTypeLabel(work.workType)}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            work.status
                          )}`}
                        >
                          {work.status === "pending"
                            ? "Menunggu"
                            : work.status === "approved"
                              ? "Disetujui"
                              : "Ditolak"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-sm sm:text-base">
                        {work.title}
                      </h4>

                      <div className="space-y-1 mb-3">
                        <p className="text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Kategori:</span>{" "}
                          {getCategoryLabel(work.category)}
                        </p>
                        {work.subject && (
                          <p className="text-xs sm:text-sm text-gray-600">
                            <span className="font-medium">Mapel:</span>{" "}
                            {getSubjectLabel(work.subject)}
                          </p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500">
                          {formatDate(work.createdAt)}
                        </p>
                      </div>

                      {work.description && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                          {work.description}
                        </p>
                      )}

                      {/* Rejection Note */}
                      {work.status === "rejected" && work.rejectionNote && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-3">
                          <p className="text-xs sm:text-sm text-red-800">
                            <span className="font-medium">
                              Catatan penolakan:
                            </span>{" "}
                            {work.rejectionNote}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedWork(work)}
                          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm flex items-center justify-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>

                        {work.status === "pending" && (
                          <button
                            onClick={() => onEditClick(work)}
                            className="px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-blue-500 hover:text-white transition-colors text-xs sm:text-sm flex items-center justify-center cursor-pointer"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="ml-1 hidden sm:inline">Edit</span>
                          </button>
                        )}

                        {work.status === "rejected" && (
                          <button
                            onClick={() => onDeleteClick(work.id)}
                            className="px-2 sm:px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs sm:text-sm flex items-center justify-center"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="ml-1 hidden sm:inline">Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center sm:text-left">
                    Menampilkan {startIndex + 1}-
                    {Math.min(endIndex, filteredWorks.length)} dari{" "}
                    {filteredWorks.length} karya
                    {hasActiveFilters && ` (${works.length} total)`}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Show current page on mobile, all pages on desktop */}
                    <div className="flex items-center gap-1">
                      {/* Mobile: Show only current page */}
                      <span className="sm:hidden px-3 py-1 text-sm font-medium">
                        {currentPage} / {totalPages}
                      </span>

                      {/* Desktop: Show all page numbers */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? "bg-gray-800 text-white"
                                : "text-gray-600 hover:text-blue-600 cursor-pointer"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedWork && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                Detail Karya
              </h3>
              <button
                onClick={() => setSelectedWork(null)}
                className="text-gray-400 hover:text-gray-800 transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Media */}
              {selectedWork.workType === "photo" && selectedWork.mediaUrl ? (
                <div>
                  <Image
                    src={selectedWork.mediaUrl}
                    alt={selectedWork.title}
                    width={800}
                    height={450}
                    className="w-full rounded-lg"
                  />
                </div>
              ) : selectedWork.workType === "video" &&
                selectedWork.videoLink ? (
                <div>
                  {isYouTubeUrl(selectedWork.videoLink) ? (
                    // YouTube Embed
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={getYouTubeEmbedUrl(selectedWork.videoLink) || ""}
                        title={selectedWork.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : isGoogleDriveUrl(selectedWork.videoLink) &&
                    getGoogleDriveInfo(selectedWork.videoLink) ? (
                    // Google Drive Embed
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <iframe
                        src={
                          getGoogleDriveInfo(selectedWork.videoLink)!.embedUrl
                        }
                        title={selectedWork.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    // External Link Fallback
                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                      <ExternalLink className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Video eksternal</p>
                      <a
                        href={selectedWork.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Buka Video
                      </a>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                    Informasi Karya
                  </h4>
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Judul:</span>{" "}
                      {selectedWork.title}
                    </p>
                    <p className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Jenis:</span>{" "}
                      {getWorkTypeLabel(selectedWork.workType)}
                    </p>
                    <p className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">
                        Kategori:
                      </span>{" "}
                      {getCategoryLabel(selectedWork.category)}
                    </p>
                    {selectedWork.subject && (
                      <p className="text-xs sm:text-sm">
                        <span className="font-medium text-gray-700">
                          Mata Pelajaran:
                        </span>{" "}
                        {getSubjectLabel(selectedWork.subject)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                    Status
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                          selectedWork.status
                        )}`}
                      >
                        {selectedWork.status === "pending"
                          ? "Menunggu Persetujuan"
                          : selectedWork.status === "approved"
                            ? "Disetujui"
                            : "Ditolak"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Upload: {formatDate(selectedWork.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedWork.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                    Deskripsi
                  </h4>
                  <p className="text-gray-600 whitespace-pre-wrap text-xs sm:text-sm">
                    {selectedWork.description}
                  </p>
                </div>
              )}

              {/* Rejection Note */}
              {selectedWork.status === "rejected" &&
                selectedWork.rejectionNote && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-medium text-red-900 mb-2 text-sm sm:text-base">
                      Catatan Penolakan
                    </h4>
                    <p className="text-red-800 text-xs sm:text-sm">
                      {selectedWork.rejectionNote}
                    </p>
                  </div>
                )}
            </div>

            {/* Close Button
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setSelectedWork(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
}
