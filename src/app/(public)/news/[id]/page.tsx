import { getNewsById } from "@/actions/public/news";
import ShareButton from "@/components/news/ShareButton";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

interface NewsDetailProps {
  params: Promise<{ id: string }>;
}

export default async function NewsDetail({ params }: NewsDetailProps) {
  const { id } = await params;
  const news = await getNewsById(id);

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
          <ShareButton title={news.title} />
        </div>
      </div>
    </div>
  );
}
