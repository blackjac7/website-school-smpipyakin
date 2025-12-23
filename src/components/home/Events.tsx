// components/home/Events.tsx
"use client";

import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { SerializableActivity } from "@/lib/data/homepage";
import Link from "next/link";

interface EventsProps {
  events: SerializableActivity[];
}

export default function Events({ events }: EventsProps) {
  const data = events || [];

  return (
    <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Agenda Mendatang
          </h2>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
            <Calendar className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        {data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {data.map((event, index) => (
              <div
                key={event.id || index}
                className="group bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70 hover:-translate-y-1 transition-all duration-300 border-t-4 border-yellow-500 flex flex-col"
              >
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-semibold mb-3 bg-yellow-50 dark:bg-yellow-900/20 w-fit px-3 py-1 rounded-full text-sm">
                  <Calendar className="w-4 h-4" />
                  {event.date
                    ? format(new Date(event.date), "dd MMM yyyy", {
                        locale: id,
                      })
                    : "TBA"}
                </div>

                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  {event.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 text-sm flex-grow">
                  {event.information}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>SMP IP Yakin Jakarta</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 mb-8">
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada agenda kegiatan mendatang.
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Link
            href="/academic-calendar"
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Lihat Semua Agenda
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
