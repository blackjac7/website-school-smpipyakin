import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { SerializableActivity } from "@/lib/data/homepage";

export default function Events({ events = [] }: { events: SerializableActivity[] }) {
  return (
    <section className="public-section bg-slate-50 dark:bg-slate-900/50">
      <div className="public-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="public-eyebrow"><CalendarDays aria-hidden="true" className="h-4 w-4" /> Kalender</p>
            <h2 className="public-heading mt-3">Agenda terdekat</h2>
          </div>
          <Link href="/academic-calendar" className="public-button-secondary shrink-0">Kalender lengkap <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>

        {events.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {events.map((event) => {
              const date = new Date(event.date);
              return (
                <article key={event.id} className="public-card flex gap-5 p-6">
                  <time dateTime={event.date} className="flex h-18 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-900 text-white">
                    <span className="text-2xl font-extrabold leading-none">{format(date, "dd")}</span>
                    <span className="mt-1 text-xs font-bold uppercase tracking-wider text-blue-100">{format(date, "MMM", { locale: id })}</span>
                  </time>
                  <div>
                    <h3 className="font-extrabold leading-snug text-slate-950 dark:text-white">{event.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.information}</p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="public-card mt-10 p-8 text-center text-slate-500 dark:text-slate-400">Belum ada agenda mendatang.</div>
        )}
      </div>
    </section>
  );
}
