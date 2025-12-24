// src/app/(public)/page.tsx
import { Suspense } from "react";
import HeroCarousel from "@/components/home/HeroCarousel";
import QuickStats from "@/components/home/QuickStats";
import Announcements from "@/components/home/Announcements";
import NewsSection from "@/components/home/NewsSection";
import Events from "@/components/home/Events";
import EducationalMotivation from "@/components/home/EducationalMotivation";
import InstagramEmbed from "@/components/home/InstagramEmbed";
import {
  getLatestNews,
  getUpcomingAnnouncements,
  getUpcomingActivities,
} from "@/lib/data/homepage";
import { getHeroSlides } from "@/actions/hero";
import { getSchoolStats } from "@/actions/stats";
import { HeroSlide } from "@/components/home/HeroCarousel";

export const metadata = {
  title: "SMP IP Yakin Jakarta - Membentuk Generasi Unggul",
  description:
    "Selamat datang di website resmi SMP IP Yakin Jakarta. Sekolah Menengah Pertama yang mengedepankan pendidikan karakter dan prestasi.",
  openGraph: {
    title: "SMP IP Yakin Jakarta - Membentuk Generasi Unggul",
    description:
      "Sekolah Menengah Pertama yang mengedepankan pendidikan karakter dan prestasi.",
    type: "website",
  },
};

// Default fallback data for graceful degradation
// Empty array is the fallback since getSchoolStats returns array
const defaultStats: {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  sortOrder: number;
  label: string;
  value: string;
  iconName: string;
}[] = [];

const defaultSlides: HeroSlide[] = [
  {
    image: {
      small:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp",
      medium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp",
    },
    title: "Selamat Datang di SMP IP Yakin Jakarta",
    subtitle: "Membentuk Generasi Unggul, Berakhlak, dan Berprestasi",
    linkPrimary: { text: "Pelajari Lebih Lanjut", href: "/profile" },
    linkSecondary: { text: "Pendaftaran PPDB", href: "/ppdb" },
  },
  {
    image: {
      small:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
      medium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
    },
    title: "Fasilitas Pembelajaran Modern",
    subtitle: "Mendukung Pengembangan Potensi Siswa",
    linkPrimary: { text: "Lihat Fasilitas", href: "/facilities" },
    linkSecondary: { text: "Hubungi Kami", href: "/contact" },
  },
  {
    image: {
      small:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
      medium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
    },
    title: "Prestasi Membanggakan",
    subtitle: "Raih Masa Depan Cemerlang Bersama Kami",
    linkPrimary: { text: "Berita & Prestasi", href: "/news" },
    linkSecondary: { text: "Ekstrakurikuler", href: "/extracurricular" },
  },
];

export default async function HomePage() {
  // Fetch data on the server with graceful error handling
  // Using Promise.allSettled to ensure partial failures don't break the page
  const results = await Promise.allSettled([
    getLatestNews(),
    getUpcomingAnnouncements(),
    getUpcomingActivities(),
    getHeroSlides(),
    getSchoolStats(),
  ]);

  // Extract values with fallbacks for failed requests
  const latestNews = results[0].status === "fulfilled" ? results[0].value : [];
  const upcomingAnnouncements =
    results[1].status === "fulfilled" ? results[1].value : [];
  const upcomingActivities =
    results[2].status === "fulfilled" ? results[2].value : [];
  const heroSlidesData =
    results[3].status === "fulfilled" ? results[3].value : [];
  const schoolStats =
    results[4].status === "fulfilled" ? results[4].value : defaultStats;

  // Transform heroSlides to match component props if needed
  // The DB model uses camelCase for properties but component expects object structure for images
  const transformedSlides: HeroSlide[] =
    heroSlidesData.length > 0
      ? heroSlidesData.map((slide) => ({
          image: {
            small: slide.imageSmall,
            medium: slide.imageMedium,
          },
          title: slide.title,
          subtitle: slide.subtitle,
          linkPrimary: slide.linkPrimaryText
            ? {
                text: slide.linkPrimaryText,
                href: slide.linkPrimaryHref || "#",
              }
            : undefined,
          linkSecondary: slide.linkSecondaryText
            ? {
                text: slide.linkSecondaryText,
                href: slide.linkSecondaryHref || "#",
              }
            : undefined,
        }))
      : defaultSlides;

  return (
    <>
      <HeroCarousel slides={transformedSlides} />

      <QuickStats stats={schoolStats} />

      {/* Announcements Section */}
      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse" />}>
        <Announcements announcements={upcomingAnnouncements} />
      </Suspense>

      {/* News Section */}
      <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
        <NewsSection news={latestNews} />
      </Suspense>

      {/* Events Section - Using Activities data for now */}
      <Suspense fallback={<div className="h-80 bg-gray-50 animate-pulse" />}>
        <Events events={upcomingActivities} />
      </Suspense>

      <EducationalMotivation />

      <InstagramEmbed />
    </>
  );
}
