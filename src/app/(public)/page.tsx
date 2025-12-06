"use client";

import { useEffect } from "react";
import HeroCarousel from "@/components/home/HeroCarousel";
import QuickStats from "@/components/home/QuickStats";
import Announcements from "@/components/home/Announcements";
import NewsSection from "@/components/home/NewsSection";
import Events from "@/components/home/Events";
import AcademicCalendar from "@/components/home/AcademicCalender";
import EducationalMotivation from "@/components/home/EducationalMotivation";
import InstagramEmbed from "@/components/home/InstagramEmbed";

export default function HomePage() {
  useEffect(() => {
    document.title = "SMP IP Yakin Jakarta";
  }, []);

  return (
    <>
      <HeroCarousel />
      <QuickStats />
      <Announcements />
      <NewsSection />
      <Events />
      <AcademicCalendar />
      <EducationalMotivation />
      <InstagramEmbed />
    </>
  );
}
