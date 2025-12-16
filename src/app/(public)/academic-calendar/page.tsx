"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { MOCK_ACTIVITIES } from "@/lib/data/homepage";
import { Calendar } from "lucide-react";

export default function AcademicCalendarPage() {
  const [activeTab, setActiveTab] = useState<"GANJIL" | "GENAP">("GANJIL");

  const filteredActivities = MOCK_ACTIVITIES.filter(
    (item) => item.semester === activeTab
  ).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kalender Akademik
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Tahun Pelajaran 2024/2025
            </p>
            <div className="h-1.5 w-24 bg-yellow-500 mx-auto rounded-full" />
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 inline-flex gap-2">
            {(["GANJIL", "GENAP"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-8 py-3 rounded-lg text-sm font-semibold transition-all relative",
                  activeTab === tab
                    ? "text-yellow-900"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-yellow-400 rounded-lg shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Semester {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-5 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider w-1/4">
                        Tanggal
                      </th>
                      <th className="py-5 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider w-1/3">
                        Kegiatan
                      </th>
                      <th className="py-5 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map((activity) => (
                        <tr
                          key={activity.id}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="py-5 px-6 whitespace-nowrap align-top">
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900 text-lg">
                                {new Date(activity.date!).getDate()}{" "}
                                {new Date(activity.date!).toLocaleDateString("id-ID", {
                                  month: "long",
                                })}
                              </span>
                              <span className="text-gray-500 text-sm font-medium">
                                {new Date(activity.date!).toLocaleDateString("id-ID", {
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit mt-1 uppercase">
                                {new Date(activity.date!).toLocaleDateString("id-ID", {
                                  weekday: "long",
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="py-5 px-6 align-top">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors flex items-center gap-2">
                              {activity.title}
                            </h3>
                          </td>
                          <td className="py-5 px-6 align-top">
                            <p className="text-gray-600 leading-relaxed text-sm">
                              {activity.information}
                            </p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Calendar className="w-10 h-10 text-gray-300" />
                            <p>Belum ada jadwal kegiatan untuk semester ini.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              * Jadwal dapat berubah sewaktu-waktu sesuai dengan kebijakan sekolah.
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
