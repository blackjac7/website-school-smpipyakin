"use client";

import { Calendar, Award, Users } from "lucide-react";
import Link from "next/link";

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

/**
 * NewsCard component.
 * Displays a summary of a news item, including image, date, category, title, excerpt, and a link to read more.
 * @param {NewsCardProps} props - The component props.
 * @param {News} props.news - The news data to display.
 * @returns {JSX.Element} The rendered NewsCard component.
 */
export default function NewsCard({ news }: NewsCardProps) {
  const Icon = news.category === "achievement" ? Award : Users;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {news.image && (
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-48 object-cover"
        />
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
