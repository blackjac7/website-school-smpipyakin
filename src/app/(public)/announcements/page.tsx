"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_ANNOUNCEMENTS } from "@/lib/data/homepage";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState, useRef, useMemo } from "react";
import { clsx } from "clsx";

const ITEMS_PER_PAGE = 5;

export default function AnnouncementsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use memo to sort and slice data
  // Sort by date descending (newest first) just in case mock data isn't sorted
  const sortedAnnouncements = useMemo(() => {
    return [...MOCK_ANNOUNCEMENTS].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, []);

  const totalPages = Math.ceil(sortedAnnouncements.length / ITEMS_PER_PAGE);
  const paginatedAnnouncements = sortedAnnouncements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to the top of the list
    if (containerRef.current) {
        const yOffset = -120;
        const y = containerRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-4">
            <Bell className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pengumuman Sekolah
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Informasi penting dan pengumuman terbaru seputar kegiatan akademik
            dan non-akademik di SMP IP Yakin Jakarta.
          </p>
        </motion.div>

        <div ref={containerRef}>
          <motion.div
            key={currentPage} // Add key to force re-render/animate on page change
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {paginatedAnnouncements.map((announcement) => (
              <motion.div
                key={announcement.id}
                variants={item}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className={`h-1.5 w-full ${
                  announcement.priority === 'HIGH' ? 'bg-red-500' :
                  announcement.priority === 'MEDIUM' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />

                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">
                        <Link href={`/announcements/${announcement.id}`}>
                          {announcement.title}
                        </Link>
                      </h2>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(announcement.date), "dd MMMM yyyy", { locale: id })}
                        </div>
                        {announcement.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {announcement.location}
                          </div>
                        )}
                      </div>

                      <div
                        className="text-gray-600 line-clamp-2 prose prose-sm mb-4"
                        dangerouslySetInnerHTML={{ __html: announcement.content || "" }}
                      />
                    </div>

                    <div className="flex-shrink-0">
                      <Link
                        href={`/announcements/${announcement.id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors px-4 py-2 rounded-lg hover:bg-yellow-50"
                      >
                        Lihat Detail
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                      currentPage === page
                        ? "bg-yellow-500 text-white shadow-md scale-110"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-yellow-50 hover:border-yellow-200"
                    )}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                handlePageChange(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
