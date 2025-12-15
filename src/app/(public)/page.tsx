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

export const metadata = {
  title: "SMP IP Yakin Jakarta - Membentuk Generasi Unggul",
  description: "Selamat datang di website resmi SMP IP Yakin Jakarta. Sekolah Menengah Pertama yang mengedepankan pendidikan karakter dan prestasi.",
};

export default async function HomePage() {
  // Fetch data on the server
  // We use Promise.all to fetch in parallel for better performance
  const [latestNews, upcomingAnnouncements, upcomingActivities] = await Promise.all([
    getLatestNews(),
    getUpcomingAnnouncements(),
    getUpcomingActivities(),
  ]);

  return (
    <>
      <HeroCarousel />

      <QuickStats />

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
