"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { SerializableAnnouncement } from "@/lib/data/homepage";

interface AnnouncementsProps {
  announcements: SerializableAnnouncement[];
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  // If no data is passed, use an empty array
  const data = announcements || [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 bg-gray-50/50">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        <div className="bg-yellow-500 p-6 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
               <Bell className="h-8 w-8 text-white animate-pulse" />
               Pengumuman Sekolah
            </h2>
        </div>

        <div className="p-8">
            <div className="space-y-6">
            {data.length > 0 ? (
                data.map((announcement, index) => (
                    <motion.div
                    key={announcement.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="group relative border-l-4 border-yellow-500 bg-white p-4 rounded-r-lg hover:shadow-md transition-all duration-300 hover:pl-6"
                    >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-yellow-700 transition-colors">
                            {announcement.title}
                        </h3>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                            {format(new Date(announcement.date), "dd MMM yyyy", { locale: id })}
                        </span>
                    </div>
                    {announcement.priority && (
                        <div className="mt-1">
                             <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                 announcement.priority === 'HIGH' ? 'bg-red-100 text-red-600' :
                                 announcement.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-600' :
                                 'bg-green-100 text-green-600'
                             }`}>
                                 {announcement.priority} Priority
                             </span>
                        </div>
                    )}
                    <div className="mt-2">
                        <Link
                            href={`/news`}
                            className="inline-flex items-center text-sm font-bold text-yellow-600 hover:text-yellow-800 transition-colors"
                        >
                            Lihat detail
                            <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                        </Link>
                    </div>
                    </motion.div>
                ))
            ) : (
                <div className="text-center py-8 text-gray-500">
                    Belum ada pengumuman terbaru.
                </div>
            )}
            </div>

            <div className="mt-8 text-center">
                 <Link href="/news">
                    <button className="px-6 py-2 border-2 border-yellow-500 text-yellow-700 rounded-full font-bold hover:bg-yellow-500 hover:text-white transition-all">
                        Lihat Semua Pengumuman
                    </button>
                 </Link>
            </div>
        </div>
      </motion.div>
    </section>
  );
}
