"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, Calendar, MapPin, ArrowRight } from "lucide-react";
import { MOCK_ANNOUNCEMENTS } from "@/lib/data/homepage";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AnnouncementsPage() {
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

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {MOCK_ANNOUNCEMENTS.map((announcement) => (
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
    </div>
  );
}
