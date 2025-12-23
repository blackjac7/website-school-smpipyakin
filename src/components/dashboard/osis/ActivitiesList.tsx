"use client";

import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Eye,
  Edit,
  Trash2,
  MapPin,
} from "lucide-react";
import { OsisActivity } from "./types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface ActivitiesListProps {
  activities: OsisActivity[];
  onAddActivity: () => void;
  onViewActivity: (activity: OsisActivity) => void;
  onEditActivity: (activity: OsisActivity) => void;
  onDeleteActivity: (id: string) => void;
}

export default function ActivitiesList({
  activities,
  onAddActivity,
  onViewActivity,
  onEditActivity,
  onDeleteActivity,
}: ActivitiesListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";
      case "REJECTED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case "APPROVED": return "Disetujui";
          case "REJECTED": return "Ditolak";
          default: return "Menunggu";
      }
  }

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Add Activity Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Daftar Kegiatan</h3>
        <button
          onClick={onAddActivity}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Kegiatan Baru
        </button>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {activities.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg border border-gray-200 text-gray-500">
                Belum ada kegiatan yang diajukan.
            </div>
        ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                {activity.title}
              </h4>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
                >
                  {getStatusLabel(activity.status)}
                </span>
                <div className="flex items-center gap-1">
                  {/*
                  <button
                    onClick={() => onViewActivity(activity)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  */}
                  {activity.status === "PENDING" && (
                    <>
                    <button
                        onClick={() => onEditActivity(activity)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDeleteActivity(activity.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-3 line-clamp-2">{activity.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{format(new Date(activity.date), "dd MMMM yyyy", { locale: idLocale })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{activity.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{activity.participants} peserta</span>
              </div>
               <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{activity.location}</span>
              </div>
              <div className="flex items-center gap-1 col-span-2">
                <span>Budget: Rp {activity.budget.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}
