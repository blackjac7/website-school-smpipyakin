"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { Calendar } from "lucide-react";
import { PublicActivity } from "@/actions/public/calendar";

interface CalendarListProps {
  initialActivities: PublicActivity[];
}

export default function CalendarList({ initialActivities }: CalendarListProps) {
  const [activeTab, setActiveTab] = useState<"GANJIL" | "GENAP">("GANJIL");

  const filteredActivities = useMemo(() => {
    return initialActivities
      .filter((item) => item.semester === activeTab)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [initialActivities, activeTab]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 inline-flex gap-2">
          {(["GANJIL", "GENAP"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-6 md:px-10 py-3 rounded-xl text-sm md:text-base font-bold transition-all relative",
                activeTab === tab
                  ? "text-yellow-900"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-yellow-400 rounded-xl shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5" />
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Mobile List View */}
            <div className="md:hidden">
              {filteredActivities.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-5 hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded w-fit mb-1 uppercase">
                            {new Date(activity.date).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "long",
                              }
                            )}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white text-lg">
                            {new Date(activity.date).getDate()}{" "}
                            {new Date(activity.date).toLocaleDateString(
                              "id-ID",
                              {
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-1">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {activity.information}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  Belum ada jadwal.
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                    <th className="py-5 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider w-1/4">
                      Tanggal
                    </th>
                    <th className="py-5 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider w-1/3">
                      Kegiatan
                    </th>
                    <th className="py-5 px-6 font-bold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors group"
                      >
                        <td className="py-5 px-6 whitespace-nowrap align-top">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white text-xl">
                              {new Date(activity.date).getDate()}{" "}
                              {new Date(activity.date).toLocaleDateString(
                                "id-ID",
                                {
                                  month: "long",
                                }
                              )}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                              {new Date(activity.date).toLocaleDateString(
                                "id-ID",
                                {
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full w-fit mt-2 uppercase tracking-wide">
                              {new Date(activity.date).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "long",
                                }
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6 align-top">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                            {activity.title}
                          </h3>
                        </td>
                        <td className="py-5 px-6 align-top">
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                            {activity.information}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-20 text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-full">
                            <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-500" />
                          </div>
                          <p className="font-medium">
                            Belum ada jadwal kegiatan untuk semester ini.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-yellow-50/50 dark:bg-yellow-900/20 py-3 rounded-lg border border-yellow-100 dark:border-yellow-800">
            * Jadwal dapat berubah sewaktu-waktu sesuai dengan kebijakan
            sekolah.
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
