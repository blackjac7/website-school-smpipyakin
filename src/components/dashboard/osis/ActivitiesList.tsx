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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Disetujui";
      case "REJECTED":
        return "Ditolak";
      default:
        return "Menunggu";
    }
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Add Program Kerja Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          Program Kerja OSIS
        </h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddActivity}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 shadow-md shadow-blue-200"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Proker</span>
          <span className="sm:hidden">Baru</span>
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
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                    {activity.title}
                  </h4>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(activity.status)}`}
                  >
                    {getStatusLabel(activity.status)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {activity.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => onEditActivity(activity)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteActivity(activity.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
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
