import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const dummyNews = [
  {
    id: "1",
    title: "Juara 2 Tari Tingkat Nasional",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
    date: "10 Mar 2024",
  },
  {
    id: "2",
    title: "Perayaan Hari Guru",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
    date: "8 Mar 2024",
  },
  {
    id: "3",
    title: "Kompetisi Robotik",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/q_auto/f_auto/v1733056074/tari_prestasi_p3falv.webp",
    date: "5 Mar 2024",
  },
];

export default function NewsSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">
          Berita Terbaru
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dummyNews.map((news) => (
            <div
              key={news.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition"
            >
              <div className="relative w-full h-48">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2">{news.date}</div>
                <h3 className="text-xl font-semibold mb-2">{news.title}</h3>
                <Link
                  href={`/news/${news.id}`}
                  className="inline-flex items-center text-blue-500 font-medium hover:text-orange-500 transition"
                >
                  Baca selengkapnya <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
