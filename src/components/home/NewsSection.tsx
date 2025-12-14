"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { mockNews, formatDate } from "@/lib/dummy-data";

export default function NewsSection() {
  // Use first 3 news items from shared mock data
  const data = mockNews.slice(0, 3);

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Berita Terbaru
            </h2>
            <div className="h-1 w-24 bg-yellow-500 mx-auto rounded-full" />
            <p className="mt-4 text-xl text-gray-500">
                Ikuti perkembangan terkini dari SMP IP Yakin
            </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full group"
            >
              <div className="relative w-full h-56 overflow-hidden">
                <Image
                  src={news.image!}
                  alt={news.title!}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {news.kategori}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-sm text-gray-500 mb-3 gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(news.date!)}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                    {news.title}
                </h3>
                <div className="mt-auto pt-4">
                    <Link
                    href={`/news/${news.id}`}
                    className="inline-flex items-center text-yellow-600 font-bold hover:text-yellow-700 transition"
                    >
                    Baca selengkapnya <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
            <Link
                href="/news"
                className="inline-flex items-center px-6 py-3 border-2 border-yellow-500 text-yellow-600 rounded-full font-bold hover:bg-yellow-500 hover:text-white transition-all"
            >
                Lihat Semua Berita
                <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </div>
      </div>
    </section>
  );
}
