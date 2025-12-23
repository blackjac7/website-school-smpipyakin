"use client";

import { Calendar, Award, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";

interface News {
  id: string;
  title: string;
  content: string;
  image?: string;
  date: string;
  category: string;
}

interface NewsCardProps {
  news: News;
}

export default function NewsCard({ news }: NewsCardProps) {
  const Icon = news.category === "achievement" ? Award : Users;
  const isAchievement = news.category === "achievement";

  return (
    <div className="group h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl dark:hover:shadow-gray-900/50 transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full h-56 overflow-hidden">
        {news.image ? (
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500">No Image</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md",
              isAchievement
                ? "bg-yellow-400/90 text-yellow-950"
                : "bg-blue-600/90 text-white"
            )}
          >
            <Icon className="w-3 h-3" />
            <span className="capitalize">{news.category}</span>
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-grow p-6">
        {/* Date */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>{news.date}</span>
        </div>

        {/* Title */}
        <Link
          href={`/news/${news.id}`}
          className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-3 line-clamp-2">
            {news.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
          {news.content}
        </p>

        {/* Footer / Link */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <Link
            href={`/news/${news.id}`}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 inline-flex items-center gap-1 transition-all group-hover:gap-2"
          >
            Baca Selengkapnya
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
