"use client";

import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Activity } from "./types";

interface ActivitiesListProps {
  activities: Activity[];
  onAddActivity: () => void;
  onViewActivity: (activity: Activity) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (id: number) => void;
}

export default function ActivitiesList({
  activities,
  onAddActivity,
  onViewActivity,
  onEditActivity,
  onDeleteActivity,
}: ActivitiesListProps) {
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
        {activities.map((activity) => (
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
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {activity.status}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewActivity(activity)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Lihat Detail"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
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
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-3">{activity.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{activity.date}</span>
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
                <span>Budget: Rp {activity.budget.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
