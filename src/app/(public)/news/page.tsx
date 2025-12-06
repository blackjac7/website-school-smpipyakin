"use client";

import NewsCard from "@/components/news/NewsCard";
import CategoryFilter from "@/components/news/CategoryFilter";
import { newsData } from "@/shared/data/news";
import { useState, useMemo } from "react";

/**
 * NewsPage component.
 * Displays a list of news and achievements, filtered by category.
 * @returns {JSX.Element} The rendered NewsPage component.
 */
export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  /**
   * Filters the news data based on the active category.
   * Memoized to avoid unnecessary recalculations.
   * @returns {Array} The filtered array of news items.
   */
  const filteredNews = useMemo(() => {
    if (activeCategory === "all") return newsData;
    return newsData.filter((news) => news.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-25 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 text-blue-500">
          Berita dan Prestasi
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ikuti perkembangan terbaru tentang prestasi dan kegiatan siswa SMP IP
          Yakin Jakarta.
        </p>
      </div>

      <CategoryFilter
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredNews.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>
    </div>
  );
}
