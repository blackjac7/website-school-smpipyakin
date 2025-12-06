"use client";

import { Stat } from "./types";
import { TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: Stat[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    +12%
                  </span>
                </div>
                <span className="text-xs text-gray-500">dari bulan lalu</span>
              </div>
            </div>
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                index === 0
                  ? "bg-gradient-to-br from-blue-100 to-blue-200"
                  : index === 1
                    ? "bg-gradient-to-br from-green-100 to-green-200"
                    : "bg-gradient-to-br from-red-100 to-red-200"
              }`}
            >
              <stat.icon
                className={`w-7 h-7 ${
                  index === 0
                    ? "text-blue-600"
                    : index === 1
                      ? "text-green-600"
                      : "text-red-600"
                }`}
              />
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-bl-full opacity-50 -z-10"></div>
        </div>
      ))}
    </div>
  );
}
