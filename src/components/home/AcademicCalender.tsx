// components/home/AcademicCalendar.tsx

import { Calendar } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AcademicCalendar() {
  const calendar = [
    {
      date: "2 Januari 2024",
      activity: "KBM semester genap kembali aktif",
      detail: "Kelas VII, VIII, IX",
    },
    {
      date: "8 Jan - 13 Feb 2024",
      activity: 'Projek "Kearifan Lokal"',
      detail: "Kelas VII",
    },
    {
      date: "8 Jan - 22 Feb 2024",
      activity: "Pendalaman Materi",
      detail: "Kelas IX",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-primary">Kalender Akademik</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Semester Genap 2023/2024</span>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                  Kegiatan
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold uppercase">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {calendar.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-700">{item.date}</td>
                  <td className="px-6 py-4 font-medium text-primary">
                    {item.activity}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/academic-calendar"
            className="inline-flex items-center text-blue-500 hover:text-orange-600 transition font-semibold"
          >
            Lihat Kalender Lengkap
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
