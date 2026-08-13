import Link from "next/link";
import { ArrowRight, CalendarCheck2, School, UserRoundCheck } from "lucide-react";

const journeys = [
  {
    icon: School,
    title: "Kenali sekolah",
    description: "Pelajari visi, lingkungan belajar, fasilitas, dan tenaga pendidik kami.",
    href: "/profile/visi-misi",
    link: "Lihat profil sekolah",
  },
  {
    icon: CalendarCheck2,
    title: "Ikuti kegiatan",
    description: "Temukan agenda, berita, ekstrakurikuler, prestasi, dan karya siswa terbaru.",
    href: "/academic-calendar",
    link: "Jelajahi kehidupan sekolah",
  },
  {
    icon: UserRoundCheck,
    title: "Daftar sebagai siswa",
    description: "Periksa periode, kuota, persyaratan, lalu mulai pendaftaran PPDB secara online.",
    href: "/ppdb",
    link: "Buka informasi PPDB",
    featured: true,
  },
];

export default function HomeJourneys() {
  return (
    <section className="public-section bg-white dark:bg-slate-950">
      <div className="public-container">
        <div className="max-w-2xl">
          <p className="public-eyebrow">Mulai dari sini</p>
          <h2 className="public-heading mt-3">Temukan informasi sesuai kebutuhan Anda</h2>
          <p className="public-lead mt-5">Tiga jalur utama membantu pengunjung mencapai tujuan tanpa harus memahami seluruh struktur website.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {journeys.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className={item.featured ? "rounded-3xl border border-blue-800 bg-blue-900 p-7 text-white shadow-xl" : "public-card p-7"}>
                <span className={item.featured ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-blue-950" : "flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200"}>
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className={`mt-6 text-xl font-extrabold ${item.featured ? "text-white" : "text-slate-950 dark:text-white"}`}>{item.title}</h3>
                <p className={`mt-3 min-h-18 text-sm leading-7 ${item.featured ? "text-blue-100" : "text-slate-600 dark:text-slate-300"}`}>{item.description}</p>
                <Link href={item.href} className={item.featured ? "focus-ring mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-amber-300 hover:text-amber-200" : "focus-ring mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-blue-800 hover:text-blue-600 dark:text-blue-300"}>
                  {item.link}<ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
