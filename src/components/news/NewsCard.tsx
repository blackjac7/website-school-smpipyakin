"use client";

import { Calendar, Award, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {news.image && (
        <div className="relative w-full h-48">
          <Image
            src={news.image}
            alt={news.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-blue-500 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{news.date}</span>
          <Icon className="h-4 w-4 ml-2" />
          <span className="capitalize">{news.category}</span>
        </div>
        <h3 className="text-xl font-bold mb-3">{news.title}</h3>
        <p className="text-gray-600 line-clamp-3">{news.content}</p>
        <Link
          href={`/news/${news.id}`}
          className="mt-4 text-blue-500 hover:text-orange-500 font-medium inline-flex items-center"
        >
          Baca selengkapnya
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
