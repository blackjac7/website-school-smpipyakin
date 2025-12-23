"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { SerializableNews } from "@/lib/data/homepage";

interface NewsSectionProps {
  news: SerializableNews[];
}

export default function NewsSection({ news }: NewsSectionProps) {
  // Use passed data or empty array
  const newsList = news || [];

  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Berita Terbaru
          </h2>
          <div className="h-1 w-24 bg-yellow-500 mx-auto rounded-full" />
          <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
            Ikuti perkembangan terkini dari SMP IP Yakin
          </p>
        </div>

        {newsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsList.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 flex flex-col h-full group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="relative w-full h-56 overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                      No Image
                    </div>
                  )}

                  <div className="absolute top-4 left-4 bg-yellow-500 dark:bg-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {item.kategori || "Berita"}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 gap-2">
                    <Calendar className="w-4 h-4" />
                    {item.date
                      ? format(new Date(item.date), "dd MMMM yyyy", {
                          locale: id,
                        })
                      : "-"}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 text-sm">
                    {item.content}
                  </p>
                  <div className="mt-auto pt-4">
                    <Link
                      href={`/news/${item.id}`}
                      className="inline-flex items-center text-yellow-600 dark:text-yellow-400 font-bold hover:text-yellow-800 dark:hover:text-yellow-300 transition"
                    >
                      Baca selengkapnya{" "}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada berita yang diterbitkan.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/news"
            className="inline-flex items-center px-6 py-3 border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 rounded-full font-bold hover:bg-yellow-500 hover:text-white transition-all"
          >
            Lihat Semua Berita
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
