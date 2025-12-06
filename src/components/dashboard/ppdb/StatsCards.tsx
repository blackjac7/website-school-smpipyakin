"use client";

import { Stat } from "./types";

interface StatsCardsProps {
  stats: Stat[];
}

/**
 * StatsCards component.
 * Displays a grid of statistic cards for the PPDB dashboard.
 * @param {StatsCardsProps} props - The component props.
 * @param {Stat[]} props.stats - The array of statistics to display.
 * @returns {JSX.Element} The rendered StatsCards component.
 */
export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <stat.icon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
