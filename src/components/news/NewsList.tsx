"use client";

import NewsCard from "@/components/news/NewsCard";
import CategoryFilter from "@/components/news/CategoryFilter";
import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import { PublicNews } from "@/actions/public/news";

const ITEMS_PER_PAGE = 6;

interface NewsListProps {
  initialNews: PublicNews[];
}

export default function NewsList({ initialNews }: NewsListProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const filteredNews = useMemo(() => {
    if (activeCategory === "all") return initialNews;
    return initialNews.filter((news) => news.category === activeCategory);
  }, [activeCategory, initialNews]);

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (containerRef.current) {
      const yOffset = -100;
      const y =
        containerRef.current.getBoundingClientRect().top +
        window.scrollY +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20"
    >
      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
      >
        <AnimatePresence mode="popLayout">
          {paginatedNews.map((news) => (
            <motion.div
              layout
              key={news.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <NewsCard news={news} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredNews.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 text-lg">
            Tidak ada berita dalam kategori ini.
          </p>
          <button
            onClick={() => setActiveCategory("all")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Lihat semua berita
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-md scale-110"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-200"
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Halaman Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
