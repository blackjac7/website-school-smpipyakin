"use client";

import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_ACTIVITIES } from "@/lib/data/homepage";
import { useState } from "react";
import { clsx } from "clsx";

export default function AcademicCalendarPage() {
  const [filter, setFilter] = useState<"ALL" | "GANJIL" | "GENAP">("ALL");

  const filteredActivities = MOCK_ACTIVITIES.filter(item => {
    if (filter === "ALL") return true;
    return item.semester === filter;
  });

  // Group by month
  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const date = new Date(activity.date!);
    const monthYear = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

    if (!acc[monthYear]) {
        acc[monthYear] = [];
    }
    acc[monthYear].push(activity);
    return acc;
  }, {} as Record<string, typeof MOCK_ACTIVITIES>);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Kalender Akademik
            </h1>
            <p className="text-lg text-gray-600 mb-2">
                Tahun Pelajaran 2023/2024
            </p>
            <div className="h-1 w-20 bg-yellow-500 mx-auto rounded-full" />
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-10">
            <div className="bg-white p-1.5 rounded-full shadow-sm border border-gray-200 inline-flex">
                {(["ALL", "GANJIL", "GENAP"] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={clsx(
                            "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                            filter === type
                                ? "bg-yellow-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-gray-100"
                        )}
                    >
                        {type === "ALL" ? "Semua" : `Semester ${type.charAt(0) + type.slice(1).toLowerCase()}`}
                    </button>
                ))}
            </div>
        </div>

        {/* Timeline */}
        <div className="space-y-12">
            {Object.entries(groupedActivities).map(([month, activities], groupIndex) => (
                <motion.div
                    key={month}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: groupIndex * 0.1 }}
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        {month}
                    </h2>

                    <div className="grid gap-4">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-4 group"
                            >
                                {/* Date Box */}
                                <div className="flex-shrink-0 flex md:flex-col items-center justify-center bg-blue-50 text-blue-600 rounded-lg p-3 min-w-[80px] md:min-w-[100px] border border-blue-100">
                                    <span className="text-2xl font-bold">
                                        {new Date(activity.date!).getDate()}
                                    </span>
                                    <span className="text-xs font-semibold uppercase hidden md:block">
                                        {new Date(activity.date!).toLocaleDateString("id-ID", { weekday: 'short' })}
                                    </span>
                                    <span className="text-sm font-medium ml-2 md:hidden">
                                        {new Date(activity.date!).toLocaleDateString("id-ID", { month: 'short' })}
                                    </span>
                                </div>

                                <div className="flex-grow border-l-2 border-gray-100 pl-4 md:pl-6">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {activity.title}
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        {activity.information}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-gray-400">
                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                            Semester {activity.semester?.toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}

            {filteredActivities.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Belum ada kegiatan untuk kategori ini.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
