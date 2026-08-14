"use client";

import { useState } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Edit,
  Trash2,
  MapPin,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OsisActivity } from "./types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion } from "framer-motion";
import { APPROVAL_STATUS } from "@/components/dashboard/layout";

interface ActivitiesListProps {
  activities: OsisActivity[];
  onAddActivity: () => void;
  onViewActivity?: (activity: OsisActivity) => void;
  onEditActivity: (activity: OsisActivity) => void;
  onDeleteActivity: (id: string) => void;
}

export default function ActivitiesList({
  activities,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: ActivitiesListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = activities.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="lg:col-span-2 space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          <span className="font-bold text-slate-900">{activities.length} program</span> tercatat. Program yang menunggu masih dapat diedit.
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onAddActivity}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Tambah program
        </motion.button>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500"
          >
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Belum ada program kerja yang diajukan.</p>
          </motion.div>
        ) : (
          paginatedActivities.map((activity, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={activity.id}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-lg sm:p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                    {activity.title}
                  </h4>
                  <span
                    className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${APPROVAL_STATUS[activity.status].className}`}
                  >
                    {APPROVAL_STATUS[activity.status].label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {activity.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => onEditActivity(activity)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                        aria-label={`Edit program ${activity.title}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteActivity(activity.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                        aria-label={`Hapus program ${activity.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                {activity.description}
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 sm:text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <span>
                    {format(new Date(activity.date), "dd MMMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{activity.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{activity.participants} Peserta</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{activity.location}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            Menampilkan {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, activities.length)} dari{" "}
            {activities.length} proker
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
