"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
} from "lucide-react";
import Image from "next/image";
import { Achievement } from "./types";

interface AchievementsSectionProps {
  achievements: Achievement[];
  onUploadClick: () => void;
  getStatusColor: (status: string) => string;
}

export default function AchievementsSection({
  achievements,
  onUploadClick,
  getStatusColor,
}: AchievementsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 6; // 2 rows of 3 items each for consistency with works

  // Reset pagination when achievements change
  useEffect(() => {
    setCurrentPage(1);
  }, [achievements]);

  // Count pending achievements
  const pendingCount = achievements.filter(
    (achievement) => achievement.status === "pending"
  ).length;

  // Check if upload should be disabled (max 2 pending)
  const isUploadDisabled = pendingCount >= 2;

  // Filter logic
  const filteredAchievements = achievements.filter((achievement) => {
    // Status filter
    const matchesStatus =
      statusFilter === "all" || achievement.status === statusFilter;

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || achievement.category === categoryFilter;

    // Level filter
    const matchesLevel =
      levelFilter === "all" || achievement.level === levelFilter;

    return matchesStatus && matchesCategory && matchesLevel;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAchievements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAchievements = filteredAchievements.slice(startIndex, endIndex);

  // Reset page when filters change
  const resetPage = () => {
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setLevelFilter("all");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    statusFilter !== "all" || categoryFilter !== "all" || levelFilter !== "all";

  // Ensure currentPage doesn't exceed totalPages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      akademik: "Akademik",
      olahraga: "Olahraga",
      seni: "Seni & Kreativitas",
    };
    return categories[category] || category;
  };

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      sekolah: "Sekolah",
      kecamatan: "Kecamatan",
      kabupaten: "Kabupaten",
      provinsi: "Provinsi",
      nasional: "Nasional",
    };
    return levels[level] || level;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Prestasi Saya
            </h3>
            {achievements.length > 0 && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Total: {achievements.length} prestasi | Ditampilkan:{" "}
                {filteredAchievements.length} prestasi | Menunggu persetujuan:{" "}
                {pendingCount}
              </p>
            )}
          </div>

          {/* Upload Button - Always visible but conditionally disabled */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {isUploadDisabled && (
              <div className="flex items-center gap-2 text-amber-600 text-xs bg-amber-50 px-3 py-2 rounded-lg">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span className="text-center sm:text-left">
                  Maksimal 2 prestasi pending
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
                  ? "Anda sudah memiliki 2 prestasi yang menunggu persetujuan"
                  : "Unggah prestasi baru"
              }
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Prestasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      {achievements.length > 0 && (
        <div className="px-4 sm:px-6 pb-4 border-b border-gray-200">
          {/* Filter Toggle and Clear Filters */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  showFilters || hasActiveFilters
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filter
                {hasActiveFilters && (
                  <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {
                      [
                        statusFilter !== "all" && 1,
                        categoryFilter !== "all" && 1,
                        levelFilter !== "all" && 1,
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
                  <option value="akademik">Akademik</option>
                  <option value="olahraga">Olahraga</option>
                  <option value="seni">Seni & Kreativitas</option>
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Tingkat
                </label>
                <select
                  value={levelFilter}
                  onChange={(e) => {
                    setLevelFilter(e.target.value);
                    resetPage();
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">Semua Tingkat</option>
                  <option value="sekolah">Sekolah</option>
                  <option value="kecamatan">Kecamatan</option>
                  <option value="kabupaten">Kabupaten</option>
                  <option value="provinsi">Provinsi</option>
                  <option value="nasional">Nasional</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4 sm:p-6">
        {achievements.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Belum Ada Prestasi
            </h4>
            <p className="text-gray-500 mb-6 text-sm sm:text-base max-w-sm mx-auto">
              Mulai unggah prestasi akademik, olahraga, atau seni Anda untuk
              membangun portofolio yang mengesankan.
            </p>
            <button
              onClick={onUploadClick}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all text-sm sm:text-base font-medium flex items-center gap-2 mx-auto cursor-pointer shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Unggah Prestasi Pertama
            </button>
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Tidak Ada Prestasi Ditemukan
            </h4>
            <p className="text-gray-500 mb-6 text-sm sm:text-base max-w-sm mx-auto">
              Tidak ada prestasi yang sesuai dengan filter yang dipilih. Coba
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
            {/* Achievements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {currentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Achievement Image */}
                  <div className="aspect-video bg-gray-100 relative">
                    {achievement.image ? (
                      <Image
                        src={achievement.image}
                        alt={achievement.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${achievement.color} bg-opacity-10`}
                      >
                        <achievement.icon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(achievement.status)}`}
                      >
                        {achievement.status === "approved"
                          ? "Disetujui"
                          : achievement.status === "pending"
                            ? "Menunggu"
                            : "Ditolak"}
                      </span>
                    </div>

                    {/* Category and Level Badges */}
                    {achievement.category && achievement.level && (
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {getCategoryLabel(achievement.category)}
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          {getLevelLabel(achievement.level)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-sm sm:text-base">
                      {achievement.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                      {achievement.description}
                    </p>

                    <p className="text-xs sm:text-sm text-gray-500">
                      <span className="font-medium">Tanggal:</span>{" "}
                      {achievement.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center sm:text-left">
                  Menampilkan {startIndex + 1}-
                  {Math.min(endIndex, filteredAchievements.length)} dari{" "}
                  {filteredAchievements.length} prestasi
                  {hasActiveFilters && ` (${achievements.length} total)`}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
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
                        )
                      )}
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
  );
}
