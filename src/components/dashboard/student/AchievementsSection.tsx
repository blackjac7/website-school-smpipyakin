"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Filter,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { Achievement } from "./types";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementsSectionProps {
  achievements: Achievement[];
  onUploadClick: () => void;
  // getStatusColor removed as we use internal styling
}

export default function AchievementsSection({
  achievements,
  onUploadClick,
}: AchievementsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [achievements, statusFilter, categoryFilter, levelFilter]);

  const pendingCount = achievements.filter(
    (achievement) => achievement.status === "pending"
  ).length;

  const isUploadDisabled = pendingCount >= 2;

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesStatus = statusFilter === "all" || achievement.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || achievement.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || achievement.level === levelFilter;
    return matchesStatus && matchesCategory && matchesLevel;
  });

  const totalPages = Math.ceil(filteredAchievements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAchievements = filteredAchievements.slice(startIndex, endIndex);

  const resetPage = () => setCurrentPage(1);

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setLevelFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter !== "all" || categoryFilter !== "all" || levelFilter !== "all";

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Prestasi Saya</h3>
              <p className="text-sm text-gray-500 mt-1">
                Kelola semua pencapaian akademik dan non-akademik Anda
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
                     ${isUploadDisabled
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        : "bg-[#1E3A8A] text-white hover:bg-blue-900 hover:shadow-md hover:ring-2 hover:ring-blue-500/20"}
                  `}
               >
                  <Plus className="w-4 h-4" />
                  Tambah Prestasi
               </motion.button>
            </div>
          </div>

          {/* Mobile Warning */}
          {isUploadDisabled && (
             <div className="sm:hidden mt-4 flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                <AlertCircle className="w-3.5 h-3.5" />
                Maksimal 2 prestasi pending
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
                  ${showFilters || hasActiveFilters
                     ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
                     : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}
               `}
             >
               <Filter className="w-4 h-4" />
               Filter
               {hasActiveFilters && (
                 <span className="flex items-center justify-center bg-blue-600 text-white text-[10px] h-5 w-5 rounded-full ml-1">
                   {[statusFilter !== "all", categoryFilter !== "all", levelFilter !== "all"].filter(Boolean).length}
                 </span>
               )}
             </button>

             {/* Quick Status Filters (Desktop) */}
             <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200">
                {['all', 'pending', 'approved', 'rejected'].map((status) => (
                   <button
                      key={status}
                      onClick={() => {
                         setStatusFilter(status);
                         setCurrentPage(1);
                      }}
                      className={`
                         px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize
                         ${statusFilter === status
                            ? (status === 'all' ? 'bg-gray-800 text-white' :
                               status === 'pending' ? 'bg-amber-100 text-amber-700' :
                               status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                               'bg-red-100 text-red-700')
                            : 'text-gray-500 hover:bg-gray-100'}
                      `}
                   >
                      {status === 'all' ? 'Semua' :
                       status === 'pending' ? 'Menunggu' :
                       status === 'approved' ? 'Disetujui' : 'Ditolak'}
                   </button>
                ))}
             </div>

             {hasActiveFilters && (
               <button onClick={clearFilters} className="ml-auto text-xs font-medium text-red-600 hover:text-red-700">
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
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kategori</label>
                       <select
                          value={categoryFilter}
                          onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                       >
                          <option value="all">Semua Kategori</option>
                          <option value="akademik">Akademik</option>
                          <option value="olahraga">Olahraga</option>
                          <option value="seni">Seni & Kreativitas</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tingkat</label>
                       <select
                          value={levelFilter}
                          onChange={(e) => { setLevelFilter(e.target.value); resetPage(); }}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                       >
                          <option value="all">Semua Tingkat</option>
                          <option value="sekolah">Sekolah</option>
                          <option value="kecamatan">Kecamatan</option>
                          <option value="kabupaten">Kabupaten</option>
                          <option value="provinsi">Provinsi</option>
                          <option value="nasional">Nasional</option>
                       </select>
                    </div>
                    {/* Mobile Status Select */}
                    <div className="sm:hidden">
                       <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                       <select
                          value={statusFilter}
                          onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                       >
                          <option value="all">Semua Status</option>
                          <option value="pending">Menunggu</option>
                          <option value="approved">Disetujui</option>
                          <option value="rejected">Ditolak</option>
                       </select>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="p-6 bg-gray-50 min-h-[400px]">
          {filteredAchievements.length === 0 ? (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex flex-col items-center justify-center h-64 text-center"
            >
               <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                  <Trophy className="w-8 h-8 text-[#F59E0B]" />
               </div>
               <h4 className="text-gray-900 font-medium text-lg">Tidak ada data</h4>
               <p className="text-gray-500 text-sm mt-1 max-w-xs">
                  {achievements.length === 0
                     ? "Belum ada prestasi yang diunggah. Mulai bangun portofoliomu sekarang!"
                     : "Tidak ada prestasi yang sesuai dengan filter yang dipilih."}
               </p>
               {achievements.length > 0 && hasActiveFilters && (
                  <button
                     onClick={clearFilters}
                     className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
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
              {currentAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  variants={item}
                  className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {achievement.image ? (
                      <Image
                        src={achievement.image}
                        alt={achievement.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100`}>
                        <achievement.icon className="w-10 h-10 text-gray-300" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute top-3 right-3 z-10">
                      <span className={`
                         px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm
                         ${achievement.status === 'approved' ? 'bg-emerald-500 text-white' :
                           achievement.status === 'pending' ? 'bg-amber-500 text-white' :
                           'bg-red-500 text-white'}
                      `}>
                        {achievement.status === 'approved' ? 'Disetujui' : achievement.status === 'pending' ? 'Pending' : 'Ditolak'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-[10px] font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 uppercase">
                        {getCategoryLabel(achievement.category || '')}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-200 uppercase">
                        {getLevelLabel(achievement.level || '')}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {achievement.title}
                    </h4>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                      {achievement.description}
                    </p>

                    <div className="pt-3 border-t border-gray-100 flex items-center text-xs text-gray-400 font-medium">
                       <span>{achievement.date}</span>
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
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                <span className="px-4 text-sm font-medium text-gray-700">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
    </div>
  );
}
