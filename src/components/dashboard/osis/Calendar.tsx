"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getActivities } from "@/actions/osis/activities";
import { OsisActivity } from "./types";
import { isSameDay } from "date-fns";

interface CalendarProps {
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

export default function Calendar({
  currentMonth,
  setCurrentMonth,
}: CalendarProps) {
  const [activities, setActivities] = useState<OsisActivity[]>([]);

  useEffect(() => {
    async function fetch() {
      const res = await getActivities();
      if (res.success && res.data) {
        setActivities(res.data as unknown as OsisActivity[]);
      }
    }
    fetch();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

      const dayActivities = activities.filter(a => {
        const aDate = new Date(a.date);
        return isSameDay(aDate, date) && a.status === "APPROVED";
      });

      const hasEvent = dayActivities.length > 0;
      const isToday = isSameDay(date, new Date());

      days.push(
        <div
          key={day}
          className={`p-2 text-center cursor-pointer rounded-lg hover:bg-gray-100 relative ${
            isToday ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-700"
          }`}
          title={dayActivities.map(a => a.title).join(", ")}
        >
          {day}
          {hasEvent && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                {dayActivities.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-green-500 rounded-full"></div>
                ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Kalender Kegiatan
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-gray-500 text-center p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

      <div className="mt-4 pt-4 border-t text-xs text-gray-500 flex gap-4">
          <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Kegiatan Disetujui</span>
          </div>
      </div>
    </div>
  );
}
