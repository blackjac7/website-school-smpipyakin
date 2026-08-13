import Link from "next/link";
import { ArrowRight, Bell, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { SerializableAnnouncement } from "@/lib/data/homepage";

export default function Announcements({ announcements = [] }: { announcements: SerializableAnnouncement[] }) {
  return (
    <section className="public-section bg-slate-50 dark:bg-slate-900/50">
      <div className="public-container grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="max-w-xl">
          <p className="public-eyebrow"><Bell aria-hidden="true" className="h-4 w-4" /> Informasi resmi</p>
          <h2 className="public-heading mt-3">Pengumuman sekolah</h2>
          <p className="public-lead mt-5">Informasi penting untuk siswa, orang tua, dan masyarakat sekolah ditampilkan ringkas dan terurut.</p>
          <Link href="/announcements" className="public-button-secondary mt-7">Semua pengumuman <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>

        <div className="public-card overflow-hidden">
          {announcements.length ? (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {announcements.map((announcement) => (
                <li key={announcement.id}>
                  <Link href={`/announcements/${announcement.id}`} className="focus-ring group grid min-h-28 gap-3 p-5 transition-colors hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6 dark:hover:bg-slate-800">
                    <span>
                      <span className="block text-base font-extrabold text-slate-950 group-hover:text-blue-800 dark:text-white dark:group-hover:text-blue-300">{announcement.title}</span>
                      <span className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CalendarDays aria-hidden="true" className="h-4 w-4" />{format(new Date(announcement.date), "d MMMM yyyy", { locale: id })}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-800 dark:text-blue-300">Baca <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">Belum ada pengumuman terbaru. Silakan periksa kembali nanti.</div>
          )}
        </div>
      </div>
    </section>
  );
}
