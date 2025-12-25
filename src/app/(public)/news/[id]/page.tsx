
import { getNewsById } from "@/actions/public/news";
import ShareButton from "@/components/news/ShareButton";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface NewsDetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const { id } = await params;
  const news = await getNewsById(id);

  if (!news) {
    return {
      title: 'Berita Tidak Ditemukan - SMP IP Yakin Jakarta',
      description: 'Halaman berita yang Anda cari tidak tersedia.'
    };
  }

  // Remove HTML tags for description
  const cleanDescription = news.content.replace(/<[^>]*>/g, '').substring(0, 160);

  return {
    title: `${news.title} - Berita SMP IP Yakin Jakarta`,
    description: cleanDescription,
    openGraph: {
      title: news.title,
      description: cleanDescription,
      images: [
        {
          url: news.image,
          width: 800,
          height: 600,
          alt: news.title
        }
      ],
      type: 'article',
      publishedTime: news.date
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: cleanDescription,
      images: [news.image]
    }
  };
}

export default async function NewsDetail({ params }: NewsDetailProps) {
  const { id } = await params;
  const news = await getNewsById(id);

  if (!news) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {news.title}
          </h1>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="h-5 w-5 mr-2" />
            <span className="text-sm">{news.date}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 relative">
            <Image
              src={news.image}
              alt={news.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
          </div>
          <div className="p-6">
            <div
              className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert mx-auto break-words"
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
