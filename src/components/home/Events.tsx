// components/home/Events.tsx

import { Calendar } from "lucide-react";

/**
 * Events component.
 * Displays a list of upcoming school events.
 * @returns {JSX.Element} The rendered Events component.
 */
export default function Events() {
  const agenda = [
    {
      title: "Workshop Robotika",
      date: "25 Mar 2024",
      time: "09:00 - 15:00",
      location: "Lab Komputer",
    },
    {
      title: "Seminar Motivasi",
      date: "28 Mar 2024",
      time: "10:00 - 12:00",
      location: "Aula Utama",
    },
    {
      title: "Kompetisi Matematika",
      date: "30 Mar 2024",
      time: "08:00 - 13:00",
      location: "Ruang Kelas 7-9",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-primary">Agenda Mendatang</h2>
          <Calendar className="h-6 w-6 text-accent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agenda.map((event, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all"
            >
              <div className="text-gray-500 font-semibold mb-2">
                {event.date}
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">
                {event.title}
              </h3>
              <p className="text-gray-600 mb-1">{event.time}</p>
              <p className="text-blue-500">{event.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
