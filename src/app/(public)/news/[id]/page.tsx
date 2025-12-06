"use client";

import { newsData } from "@/shared/data/news";
import { Calendar, Share2 } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

/**
 * Props for the NewsDetail component.
 */
interface NewsDetailProps {
  /** The route parameters, including the news ID. */
  params: { id: string };
}

/**
 * NewsDetail component.
 * Displays the full details of a specific news item, including title, date, image, and content.
 * Allows users to share the news item.
 * @param {NewsDetailProps} props - The component props.
 * @returns {JSX.Element} The rendered NewsDetail component.
 */
export default function NewsDetail({ params }: NewsDetailProps) {
  const news = newsData.find((item) => item.id === params.id);

  if (!news) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {news.title}
          </h1>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-5 w-5 mr-2" />
            <span className="text-sm">{news.date}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="aspect-video w-full bg-gray-100">
            <Image
              src={news.image}
              alt={news.title}
              width={1024}
              height={600}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="p-6">
            <div
              className="prose prose-sm sm:prose lg:prose-lg mx-auto"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() =>
              navigator.share?.({
                title: news.title,
                text: news.title,
                url: window.location.href,
              })
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            <Share2 className="h-4 w-4" />
            Bagikan Berita
          </button>
        </div>
      </div>
    </div>
  );
}
