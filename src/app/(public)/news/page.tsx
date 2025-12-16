"use client";

import NewsCard from "@/components/news/NewsCard";
import CategoryFilter from "@/components/news/CategoryFilter";
import PageHeader from "@/components/layout/PageHeader";
import { newsData } from "@/lib/data/news";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredNews = useMemo(() => {
    if (activeCategory === "all") return newsData;
    return newsData.filter((news) => news.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Berita & Prestasi"
        description="Ikuti perkembangan terbaru, prestasi siswa, dan agenda kegiatan di lingkungan SMP IP Yakin Jakarta."
        breadcrumbs={[{ label: "Berita", href: "/news" }]}
         image="https://images.unsplash.com/photo-1504812695572-c513253c51d6?q=80&w=2626&auto=format&fit=crop"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-sm p-2 mb-8 inline-block">
             <CategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
            />
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredNews.map((news) => (
            <motion.div
              layout
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={news.id}
            >
              <NewsCard news={news} />
            </motion.div>
          ))}
        </motion.div>

        {filteredNews.length === 0 && (
             <div className="text-center py-20 text-gray-500">
                 Tidak ada berita dalam kategori ini.
             </div>
        )}
      </div>
    </div>
  );
}
