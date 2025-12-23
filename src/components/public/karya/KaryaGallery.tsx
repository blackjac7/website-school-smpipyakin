"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import KaryaCard from "./KaryaCard";
import KaryaModal from "./KaryaModal";
import { getPublicWorks, PublicWork } from "@/actions/public/karya";

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

export default function KaryaGallery() {
  const [works, setWorks] = useState<PublicWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [selectedWork, setSelectedWork] = useState<PublicWork | null>(null);

  // Use a ref to track if we're currently fetching to prevent double-fetching in React Strict Mode or rapid scrolling
  const isFetching = useRef(false);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Controls */}
      <div className="mb-10 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari karya atau nama siswa..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm text-sm"
            >
              <option value="all">Semua Kategori</option>
              <option value="seni">Seni & Kreativitas</option>
              <option value="teknologi">Teknologi</option>
              <option value="tulis">Karya Tulis</option>
              <option value="fotografi">Fotografi</option>
              <option value="video">Video</option>
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm text-sm"
            >
              <option value="all">Semua Jenis</option>
              <option value="photo">Foto/Gambar</option>
              <option value="video">Video</option>
            </select>
          </div>
        </div>
      </div>

      {/* Gallery Grid - Masonry-ish using CSS columns */}
      {works.length === 0 && !loading ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Tidak ada karya ditemukan</h3>
          <p className="text-gray-500 mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
          <button
             onClick={() => {setSearch(""); setCategory("all"); setType("all");}}
             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {works.map((work) => (
            <KaryaCard
              key={work.id}
              work={work}
              onClick={() => setSelectedWork(work)}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:shadow-md hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
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
      <KaryaModal
        work={selectedWork}
        onClose={() => setSelectedWork(null)}
      />
    </div>
  );
}
