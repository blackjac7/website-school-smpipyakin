import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { SerializableNews } from "@/lib/data/homepage";

const excerpt = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 150);

export default function NewsSection({ news = [] }: { news: SerializableNews[] }) {
  return (
    <section className="public-section bg-white dark:bg-slate-950">
      <div className="public-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="public-eyebrow"><Newspaper aria-hidden="true" className="h-4 w-4" /> Kabar sekolah</p>
            <h2 className="public-heading mt-3">Berita dan prestasi terbaru</h2>
            <p className="public-lead mt-5">Lihat kegiatan nyata, pencapaian, dan cerita dari lingkungan SMP IP Yakin.</p>
          </div>
          <Link href="/news" className="public-button-secondary shrink-0">Semua berita <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>

        {news.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {news.map((item) => (
              <article key={item.id} className="public-card group flex h-full flex-col overflow-hidden">
                <Link href={`/news/${item.id}`} className="focus-ring relative block aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {item.image ? <Image src={item.image} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">Gambar belum tersedia</div>}
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-blue-900 shadow-sm">{item.kategori || "Berita"}</span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CalendarDays aria-hidden="true" className="h-4 w-4" />{format(new Date(item.date), "d MMMM yyyy", { locale: id })}</p>
                  <h3 className="mt-3 line-clamp-2 text-xl font-extrabold leading-snug text-slate-950 dark:text-white"><Link href={`/news/${item.id}`} className="focus-ring rounded hover:text-blue-800 dark:hover:text-blue-300">{item.title}</Link></h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{excerpt(item.content) || item.title}</p>
                  <Link href={`/news/${item.id}`} className="focus-ring mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-lg font-bold text-blue-800 dark:text-blue-300">Baca selengkapnya <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="public-card mt-10 p-10 text-center text-slate-500 dark:text-slate-400">Belum ada berita yang diterbitkan.</div>
        )}
      </div>
    </section>
  );
}
