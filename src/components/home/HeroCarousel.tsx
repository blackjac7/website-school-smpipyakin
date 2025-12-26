"use client";

import Image from "next/image";
import { useLayoutEffect, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface HeroSlide {
  image: {
    small: string;
    medium: string;
  };
  title: string;
  subtitle: string;
  linkPrimary?: {
    text: string;
    href: string;
  };
  linkSecondary?: {
    text: string;
    href: string;
  };
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
  /** If true, assumes the first slide is server-rendered (LCP) and will avoid reloading it on client */
  ssrFallback?: boolean;
}

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

export default function HeroCarousel({
  slides,
  ssrFallback,
}: HeroCarouselProps) {
  // Use passed slides, or default slides if passed slides are empty or undefined
  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;
  const [current, setCurrent] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Use standard useEffect to avoid SSR warnings and ensure consistent behavior
  useEffect(() => {
    setIsMounted(true);

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrent(
      (prev) => (prev - 1 + activeSlides.length) % activeSlides.length
    );
  };

  return (
    <section
      className={`relative h-[100dvh] min-h-[600px] overflow-hidden transition-colors duration-500 ${
        isMounted ? "bg-black pointer-events-auto" : "bg-transparent pointer-events-none"
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* If server provided an LCP static hero, skip re-rendering its image until client mounts */}
          {!(ssrFallback && !isMounted && current === 0) && (
            <>
              <Image
                src={activeSlides[current].image.small}
                alt={activeSlides[current].title}
                fill
                sizes="100vw"
                className="object-cover md:hidden"
                priority={current !== 0}
              />
              <Image
                src={activeSlides[current].image.medium}
                alt={activeSlides[current].title}
                fill
                sizes="100vw"
                className="object-cover hidden md:block"
                priority={current !== 0}
              />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="text-white max-w-2xl z-10 pb-20 md:pb-0">
          {(isMounted || !ssrFallback) && (
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
                  {activeSlides[current].title}
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-gray-200 font-light drop-shadow-md">
                  {activeSlides[current].subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {activeSlides[current].linkPrimary && (
                    <Link
                      href={activeSlides[current].linkPrimary!.href}
                      className="group"
                      prefetch={false}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                      >
                        {activeSlides[current].linkPrimary!.text}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    </Link>
                  )}
                  {activeSlides[current].linkSecondary && (
                    <Link
                      href={activeSlides[current].linkSecondary!.href}
                      prefetch={false}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg border-2 border-white text-white hover:bg-white hover:text-black transition"
                      >
                        {activeSlides[current].linkSecondary!.text}
                      </motion.button>
                    </Link>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Indicators - Adjusted positioning to avoid overlap with QuickStats */}
      <div className="absolute bottom-28 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index
                ? "bg-yellow-500 w-8"
                : "bg-white/30 w-2 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-0 hidden md:flex items-center justify-between px-4 pointer-events-none">
        <button
          onClick={prevSlide}
          className="pointer-events-auto p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/20"
        >
          <ArrowRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
