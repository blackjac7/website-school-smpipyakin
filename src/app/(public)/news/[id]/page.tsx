import { getNewsById } from "@/actions/public/news";
import ShareButton from "@/components/news/ShareButton";
import { Calendar, Clock, ArrowLeft, Award, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface NewsDetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: NewsDetailProps): Promise<Metadata> {
  const { id } = await params;
  const news = await getNewsById(id);

  if (!news) {
    return {
      title: "Berita Tidak Ditemukan - SMP IP Yakin Jakarta",
      description: "Halaman berita yang Anda cari tidak tersedia.",
    };
  }

  // Remove HTML tags for description
  const cleanDescription = news.content
    .replace(/<[^>]*>/g, "")
    .substring(0, 160);
  const imageUrl =
    news.image ||
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop";

  return {
    title: `${news.title} - Berita SMP IP Yakin Jakarta`,
    description: cleanDescription,
    openGraph: {
      title: news.title,
      description: cleanDescription,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: news.title,
        },
      ],
      type: "article",
      publishedTime: news.date,
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description: cleanDescription,
      images: [imageUrl],
    },
  };
}

export default async function NewsDetail({ params }: NewsDetailProps) {
  const { id } = await params;
  const news = await getNewsById(id);

  if (!news) return notFound();

  const plainContent = news.content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const readingTime = Math.max(
    1,
    Math.ceil(plainContent.split(/\s+/).length / 180)
  );
  const summaryText = plainContent.slice(0, 220).trim();
  const categoryLabel =
    news.category === "achievement" ? "Prestasi" : "Kegiatan";
  const categoryTone =
    news.category === "achievement"
      ? "bg-amber-500/90 text-amber-950"
      : "bg-blue-600/90 text-white";
  const heroImage =
    news.image ||
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=1200&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-black pt-20 pb-16 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 mb-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 hover:underline hover:underline-offset-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Berita & Prestasi
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-white/10 shadow-xl bg-white/70 dark:bg-white/5 backdrop-blur-md">
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt={news.title}
              fill
              className="object-cover opacity-70"
              sizes="(max-width: 768px) 100vw, 1200px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/10" />
          </div>

          <div className="relative z-10 p-8 sm:p-10 lg:p-12 text-white">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold shadow-sm ${categoryTone}`}
              >
                {news.category === "achievement" ? (
                  <Award className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {categoryLabel}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">
                <Calendar className="h-4 w-4" />
                {news.date}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20">
                <Clock className="h-4 w-4" />
                {readingTime} menit baca
              </span>
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-xl">
              {news.title}
            </h1>

            {summaryText && (
              <p className="mt-4 max-w-3xl text-base sm:text-lg text-white/85 leading-relaxed">
                {summaryText}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <ShareButton
                title={news.title}
                text={summaryText || news.title}
              />
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-sm">
                Terbit: {news.date}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr] mt-10 items-start">
          <article className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="relative aspect-[16/9] w-full bg-gray-100 dark:bg-gray-800">
              <Image
                src={heroImage}
                alt={news.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
              />
            </div>
            <div className="p-6 sm:p-8">
              <div
                className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none break-words prose-img:rounded-xl prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </div>
          </article>

          <aside className="space-y-5">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Info Singkat
              </h3>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  {news.category === "achievement" ? (
                    <Award className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Users className="h-4 w-4 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Kategori
                    </p>
                    <p>{categoryLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Tanggal
                    </p>
                    <p>{news.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Perkiraan Waktu Baca
                    </p>
                    <p>{readingTime} menit</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                Bagikan ke Orang Tua & Guru
              </h3>
              <p className="text-sm text-white/85 leading-relaxed mb-4">
                Sebarkan kabar baik ini agar seluruh civitas SMP IP Yakin
                Jakarta bisa ikut merayakan.
              </p>
              <ShareButton
                title={news.title}
                text={summaryText || news.title}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
