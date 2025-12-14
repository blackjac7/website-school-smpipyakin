// components/home/Events.tsx
"use client";

import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { SerializableActivity } from "@/lib/data/homepage";

interface EventsProps {
  events: SerializableActivity[];
}

export default function Events({ events }: EventsProps) {
  const data = events || [];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Agenda Mendatang</h2>
          <div className="bg-yellow-100 p-2 rounded-full">
            <Calendar className="h-6 w-6 text-yellow-600" />
          </div>
        </div>

        {data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((event, index) => (
                <div
                key={event.id || index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-t-4 border-yellow-500 flex flex-col"
                >
                <div className="flex items-center gap-2 text-yellow-700 font-semibold mb-3 bg-yellow-50 w-fit px-3 py-1 rounded-full text-sm">
                     <Calendar className="w-4 h-4" />
                     {event.date ? format(new Date(event.date), "dd MMM yyyy", { locale: id }) : "TBA"}
                </div>

                <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                    {event.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2 text-sm flex-grow">
                    {event.information}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>SMP IP Yakin Jakarta</span>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">Belum ada agenda kegiatan mendatang.</p>
            </div>
        )}
      </div>
    </section>
  );
}
