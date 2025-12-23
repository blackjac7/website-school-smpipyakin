// components/home/AcademicCalendar.tsx
"use client";

import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { SerializableActivity } from "@/lib/data/homepage";

interface AcademicCalendarProps {
  calendarItems: SerializableActivity[];
}

export default function AcademicCalendar({
  calendarItems,
}: AcademicCalendarProps) {
  const data = calendarItems || [];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Kalender Akademik
          </h2>
          <div className="flex items-center gap-2 text-gray-600 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <span className="font-medium">Tahun Pelajaran 2024/2025</span>
          </div>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm bg-white">
          {/* Desktop Table View */}
          <table className="min-w-full divide-y divide-gray-200 hidden md:table">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Kegiatan
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="hover:bg-yellow-50/50 transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium w-1/4">
                      {format(new Date(item.date), "dd MMMM yyyy", {
                        locale: id,
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-bold w-1/3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                        {item.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.information}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Data kalender akademik belum tersedia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-4 hover:bg-yellow-50/50 transition duration-150"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                    <span className="text-gray-900 font-bold">
                      {item.title}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 font-medium mb-1">
                    {format(new Date(item.date), "dd MMMM yyyy", {
                      locale: id,
                    })}
                  </div>
                  {item.information && (
                    <div className="text-sm text-gray-500">
                      {item.information}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Data kalender akademik belum tersedia.
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/academic-calendar"
            className="inline-flex items-center text-yellow-600 hover:text-yellow-700 transition font-bold"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Lihat Kalender Lengkap
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
