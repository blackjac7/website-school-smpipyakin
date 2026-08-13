"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";

export interface HeroSlide {
  image: { small: string; medium: string };
  title: string;
  subtitle: string;
  linkPrimary?: { text: string; href: string };
  linkSecondary?: { text: string; href: string };
}

interface HeroCarouselProps {
  slides?: HeroSlide[];
  ssrFallback?: boolean;
}

export default function HeroCarousel({ slides = [], ssrFallback }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const activeSlides = slides;

  useEffect(() => {
    setMounted(true);
    if (reduceMotion || isPaused || activeSlides.length < 2) return;
    const timer = window.setInterval(
      () => setCurrent((value) => (value + 1) % activeSlides.length),
      8000,
    );
    return () => window.clearInterval(timer);
  }, [activeSlides.length, isPaused, reduceMotion]);

  if (!activeSlides.length) return null;

  const slide = activeSlides[current];
  const changeSlide = (next: number) => setCurrent((next + activeSlides.length) % activeSlides.length);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Sorotan SMP IP YAKIN"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") changeSlide(current - 1);
        if (event.key === "ArrowRight") changeSlide(current + 1);
      }}
      tabIndex={0}
      className={mounted ? "relative h-[clamp(42rem,84dvh,54rem)] overflow-hidden bg-slate-950 text-white" : "pointer-events-none relative h-[clamp(42rem,84dvh,54rem)] bg-transparent"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={current} className="absolute inset-0" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          {!(ssrFallback && !mounted && current === 0) && (
            <>
              <Image src={slide.image.small} alt="" fill sizes="100vw" className="object-cover md:hidden" priority={current === 0} />
              <Image src={slide.image.medium} alt="" fill sizes="100vw" className="hidden object-cover md:block" priority={current === 0} />
            </>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.94)_0%,rgba(2,6,23,.76)_48%,rgba(2,6,23,.3)_100%)]" />
        </motion.div>
      </AnimatePresence>

      <div className="public-container relative flex h-full items-center pt-18">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={current} initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45 }} className="max-w-3xl py-14">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm"><MapPin aria-hidden="true" className="h-4 w-4 text-amber-300" /> Jakarta Barat</p>
            <h1 aria-live="polite" className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">{slide.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">{slide.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/ppdb" className="public-button-primary min-h-12 px-6">Informasi PPDB <ArrowRight aria-hidden="true" className="h-5 w-5" /></Link>
              <Link href={slide.linkPrimary?.href ?? "/profile/visi-misi"} className="focus-ring inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 font-bold text-white backdrop-blur-sm hover:bg-white hover:text-slate-950">{slide.linkPrimary?.text ?? "Kenali sekolah"}</Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {activeSlides.length > 1 && (
        <div className="public-container pointer-events-none absolute inset-x-0 bottom-12 z-20 flex items-center justify-center">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/25 bg-slate-950/55 p-1 shadow-xl backdrop-blur-md">
            <button type="button" onClick={() => changeSlide(current - 1)} aria-label="Sorotan sebelumnya" className="focus-ring flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-full text-white transition hover:bg-white hover:text-slate-950"><ArrowLeft aria-hidden="true" className="h-5 w-5" /></button>
            <div className="flex items-center justify-center" role="group" aria-label="Pilih sorotan">
            {activeSlides.map((item, index) => (
              <button key={`${item.title}-${index}`} type="button" onClick={() => changeSlide(index)} aria-label={`Tampilkan sorotan ${index + 1}: ${item.title}`} aria-current={current === index ? "true" : undefined} className="focus-ring flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full">
                <span aria-hidden="true" className={current === index ? "h-3 w-8 rounded-full bg-amber-400 transition-all" : "h-3 w-3 rounded-full bg-white/70 transition-all hover:bg-white"} />
              </button>
            ))}
            </div>
            <button type="button" onClick={() => changeSlide(current + 1)} aria-label="Sorotan berikutnya" className="focus-ring flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-full text-white transition hover:bg-white hover:text-slate-950"><ArrowRight aria-hidden="true" className="h-5 w-5" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
