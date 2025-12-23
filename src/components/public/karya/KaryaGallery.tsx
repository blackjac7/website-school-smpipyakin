"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Loader2,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";
import KaryaCard from "./KaryaCard";
import KaryaModal from "./KaryaModal";
import KaryaStats from "./KaryaStats";
import FeaturedWorks from "./FeaturedWorks";
import CategoryPills from "./CategoryPills";
import {
  KaryaStatsSkeleton,
  FeaturedSkeleton,
  GallerySkeleton,
} from "./KaryaSkeleton";
import {
  getPublicWorks,
  getFeaturedWorks,
  getKaryaStats,
  PublicWork,
} from "@/actions/public/karya";
import { motion, AnimatePresence } from "framer-motion";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface KaryaStatsData {
  totalWorks: number;
  totalPhotos: number;
  totalStudents: number;
  categories: { name: string; count: number }[];
}

export default function KaryaGallery() {
  const [works, setWorks] = useState<PublicWork[]>([]);
  const [featuredWorks, setFeaturedWorks] = useState<PublicWork[]>([]);
  const [stats, setStats] = useState<KaryaStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [selectedWork, setSelectedWork] = useState<PublicWork | null>(null);

  const isFetching = useRef(false);

  // Fetch initial data (stats + featured)
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const [featuredResult, statsResult] = await Promise.all([
          getFeaturedWorks(),
          getKaryaStats(),
        ]);

        if (featuredResult.success && featuredResult.data) {
          setFeaturedWorks(featuredResult.data);
        }
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchWorks = async (pageNum: number, isNewFilter = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const result = await getPublicWorks({
        page: pageNum,
        limit: 9,
        category,
        search: debouncedSearch,
        type,
      });

      if (result.success && result.data) {
        if (isNewFilter) {
          setWorks(result.data);
        } else {
          setWorks((prev) => [...prev, ...result.data]);
        }
        setHasMore(pageNum < (result.pagination?.totalPages || 1));
      }
    } catch (error) {
      console.error("Error fetching works:", error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Reset and fetch when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchWorks(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, category, type]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchWorks(nextPage);
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
  };

  const handleWorkClick = (work: PublicWork) => {
    setSelectedWork(work);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Stats Section */}
      {initialLoading ? <KaryaStatsSkeleton /> : <KaryaStats stats={stats} />}

      {/* Featured Section */}
      {initialLoading ? (
        <FeaturedSkeleton />
      ) : (
        featuredWorks.length > 0 && (
          <FeaturedWorks works={featuredWorks} onWorkClick={handleWorkClick} />
        )
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-10" />

      {/* Gallery Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Galeri Semua Karya
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Jelajahi koleksi lengkap karya kreatif siswa-siswi kami
        </p>
      </div>

      {/* Category Pills */}
      <CategoryPills
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
      />

      {/* Search & Type Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari karya atau nama siswa..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm dark:shadow-gray-900/30"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setType("all")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              type === "all"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setType("photo")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              type === "photo"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Foto</span>
          </button>
          <button
            onClick={() => setType("video")}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
              type === "video"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Video</span>
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading && works.length === 0 ? (
        <GallerySkeleton />
      ) : works.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600"
        >
          <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-2xl shadow-sm dark:shadow-gray-900/30 flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-gray-300 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Tidak ada karya ditemukan
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Coba sesuaikan filter atau kata kunci pencarian Anda untuk menemukan
            karya yang dicari.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCategory("all");
              setType("all");
            }}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            Reset Filter
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${type}-${debouncedSearch}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {works.map((work) => (
              <KaryaCard
                key={work.id}
                work={work}
                onClick={() => setSelectedWork(work)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Load More */}
      {hasMore && works.length > 0 && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold shadow-sm dark:shadow-gray-900/30 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memuat karya...
              </>
            ) : (
              "Tampilkan Lebih Banyak"
            )}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <KaryaModal work={selectedWork} onClose={() => setSelectedWork(null)} />
    </div>
  );
}
