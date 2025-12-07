"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const heroSlides = [
  {
    image: {
      small:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp",
      medium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp",
    },
    title: "SMP IP Yakin Jakarta",
    subtitle: "Membentuk Generasi Unggul, Berakhlak, dan Berprestasi",
    description: "Bergabunglah dengan komunitas pembelajar kami yang dinamis, di mana nilai-nilai Islam berpadu dengan keunggulan akademik modern.",
  },
  {
    image: {
      small:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
      medium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
    },
    title: "Fasilitas Modern",
    subtitle: "Mendukung Pengembangan Potensi Siswa",
    description: "Laboratorium lengkap, ruang kelas multimedia, dan sarana olahraga yang menunjang eksplorasi bakat setiap siswa.",
  },
  {
    image: {
      small:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
      medium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055884/hero3_gigw1x.webp",
    },
    title: "Prestasi Membanggakan",
    subtitle: "Raih Masa Depan Cemerlang",
    description: "Kami bangga mengantarkan siswa-siswi kami meraih prestasi di tingkat regional hingga nasional.",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = React.useState(0);
  const [direction, setDirection] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-[100dvh] min-h-[600px] overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 },
          }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/60 z-10" />
           {/* Mobile Image */}
          <Image
            src={heroSlides[current].image.small}
            alt={heroSlides[current].title}
            fill
            sizes="100vw"
            className="object-cover md:hidden"
            priority={true}
          />
           {/* Desktop Image */}
          <Image
            src={heroSlides[current].image.medium}
            alt={heroSlides[current].title}
            fill
            sizes="100vw"
            className="object-cover hidden md:block"
            priority={true}
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full container flex items-center justify-center md:justify-start pt-20">
        <div className="max-w-2xl text-center md:text-left text-white px-4 md:px-0">
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
             <span className="inline-block py-1 px-3 rounded-full bg-primary/20 border border-primary/50 text-primary text-sm font-medium mb-4 backdrop-blur-sm">
              {heroSlides[current].subtitle}
            </span>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              {heroSlides[current].title}
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
              {heroSlides[current].description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg h-12 px-8 shadow-xl shadow-primary/20">
                <Link href="/ppdb">
                  Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white h-12 px-8 text-lg backdrop-blur-sm">
                <Link href="/profile">
                  Profil Sekolah
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > current ? 1 : -1);
              setCurrent(index);
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              current === index ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Side Arrows */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => paginate(-1)}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white rounded-full h-12 w-12 z-30"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <Button
         variant="ghost"
         size="icon"
        onClick={() => paginate(1)}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white rounded-full h-12 w-12 z-30"
      >
        <ArrowRight className="h-6 w-6" />
      </Button>
    </section>
  );
}
