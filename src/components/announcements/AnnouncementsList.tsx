"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState, useRef, useMemo } from "react";
import { clsx } from "clsx";
import { PublicAnnouncement } from "@/actions/public/announcements";

const ITEMS_PER_PAGE = 5;

interface AnnouncementsListProps {
  initialAnnouncements: PublicAnnouncement[];
}

export default function AnnouncementsList({
  initialAnnouncements,
}: AnnouncementsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort by date descending (newest first)
  const sortedAnnouncements = useMemo(() => {
    return [...initialAnnouncements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [initialAnnouncements]);

  const totalPages = Math.ceil(sortedAnnouncements.length / ITEMS_PER_PAGE);
  const paginatedAnnouncements = sortedAnnouncements.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (containerRef.current) {
      const yOffset = -120;
      const y =
        containerRef.current.getBoundingClientRect().top +
        window.scrollY +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
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
    <>
      <div ref={containerRef}>
        <motion.div
          key={currentPage}
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
              <div
                className={`h-1.5 w-full ${
                  announcement.priority === "HIGH"
                    ? "bg-red-500"
                    : announcement.priority === "MEDIUM"
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                }`}
              />

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
                        {format(new Date(announcement.date), "dd MMMM yyyy", {
                          locale: id,
                        })}
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
                      dangerouslySetInnerHTML={{
                        __html: announcement.content || "",
                      }}
                    />
                  </div>

                  <div className="shrink-0">
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
                    ? "bg-yellow-500 text-white shadow-md scale-110"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-yellow-50 hover:border-yellow-200"
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
    </>
  );
}
