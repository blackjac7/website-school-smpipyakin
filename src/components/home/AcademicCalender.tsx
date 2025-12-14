// components/home/AcademicCalendar.tsx
"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { mockActivities, formatDate } from "@/lib/dummy-data";

export default function AcademicCalendar() {
  // Use first 3 activities
  const calendar = mockActivities.slice(0, 3);

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Kalender Akademik</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">Semester Genap 2023/2024</span>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-2xl shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                  Kegiatan
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {calendar.map((item, index) => (
                <tr key={index} className="hover:bg-yellow-50/50 transition duration-150">
                  <td className="px-6 py-4 text-gray-700 whitespace-nowrap font-medium">
                    {formatDate(item.date!)}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.information}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/academic-calendar"
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-yellow-500 text-yellow-600 rounded-full font-bold hover:bg-yellow-500 hover:text-white transition-all shadow-sm hover:shadow-md"
          >
            Lihat Kalender Lengkap
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
