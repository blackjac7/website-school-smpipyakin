// src/app/(public)/page.tsx
import { Suspense } from "react";
import HeroCarousel from "@/components/home/HeroCarousel";
import QuickStats from "@/components/home/QuickStats";
import Announcements from "@/components/home/Announcements";
import NewsSection from "@/components/home/NewsSection";
import Events from "@/components/home/Events";
import EducationalMotivation from "@/components/home/EducationalMotivation";
import InstagramEmbed from "@/components/home/InstagramEmbed";
import { getLatestNews, getUpcomingAnnouncements, getUpcomingActivities } from "@/lib/data/homepage";
import { getHeroSlides } from "@/actions/hero";
import { getSchoolStats } from "@/actions/stats";
import { HeroSlide } from "@/components/home/HeroCarousel";

export const metadata = {
  title: "SMP IP Yakin Jakarta - Membentuk Generasi Unggul",
  description: "Selamat datang di website resmi SMP IP Yakin Jakarta. Sekolah Menengah Pertama yang mengedepankan pendidikan karakter dan prestasi.",
};

export default async function HomePage() {
  // Fetch data on the server
  // We use Promise.all to fetch in parallel for better performance
  const [
    latestNews,
    upcomingAnnouncements,
    upcomingActivities,
    heroSlides,
    schoolStats
  ] = await Promise.all([
    getLatestNews(),
    getUpcomingAnnouncements(),
    getUpcomingActivities(),
    getHeroSlides(),
    getSchoolStats()
  ]);

  // Transform heroSlides to match component props if needed
  // The DB model uses camelCase for properties but component expects object structure for images
  const transformedSlides: HeroSlide[] = heroSlides.map(slide => ({
    image: {
      small: slide.imageSmall,
      medium: slide.imageMedium,
    },
    title: slide.title,
    subtitle: slide.subtitle,
    linkPrimary: slide.linkPrimaryText ? {
      text: slide.linkPrimaryText,
      href: slide.linkPrimaryHref || "#",
    } : undefined,
    linkSecondary: slide.linkSecondaryText ? {
      text: slide.linkSecondaryText,
      href: slide.linkSecondaryHref || "#",
    } : undefined,
  }));

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
