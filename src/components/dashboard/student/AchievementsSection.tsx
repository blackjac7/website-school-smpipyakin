"use client";

import { Plus } from "lucide-react";
import { Achievement } from "./types";

interface AchievementsSectionProps {
  achievements: Achievement[];
  onUploadClick: () => void;
  getStatusColor: (status: string) => string;
}

export default function AchievementsSection({
  achievements,
  onUploadClick,
  getStatusColor,
}: AchievementsSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Prestasi Saya
          </h3>
          <button
            onClick={onUploadClick}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Unggah Prestasi Baru
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${achievement.color}`}
                >
                  <achievement.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {achievement.title}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(achievement.status)}`}
                    >
                      {achievement.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {achievement.description}
                  </p>
                  <p className="text-sm text-gray-500">{achievement.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
