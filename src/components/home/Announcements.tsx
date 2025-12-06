import { Bell } from "lucide-react";
import Link from "next/link";

/**
 * Announcements component.
 * Displays a list of recent school announcements with their titles, dates, and links to details.
 * @returns {JSX.Element} The rendered Announcements component.
 */
export default function Announcements() {
  const data = [
    {
      title: "Pendaftaran Siswa Baru 2024/2025",
      date: "15 Mar 2024",
      priority: "high",
    },
    {
      title: "Jadwal Ujian Tengah Semester",
      date: "12 Mar 2024",
      priority: "medium",
    },
    {
      title: "Pekan Olahraga dan Seni",
      date: "20 Mar 2024",
      priority: "normal",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-primary">
            Pengumuman Sekolah
          </h2>
          <Bell className="h-6 w-6 text-blue-500" />
        </div>
        <div className="space-y-4">
          {data.map((announcement, index) => (
            <div
              key={index}
              className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{announcement.title}</h3>
                <span className="text-sm text-gray-500">
                  {announcement.date}
                </span>
              </div>
              <Link
                href={`/announcement/${index + 1}`}
                className="text-blue-500 text-sm hover:underline hover:text-orange-500"
              >
                Lihat detail →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
