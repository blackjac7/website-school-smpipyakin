"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

const heroSlides = [
  {
    image: {
      small:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_640/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp",
      medium:
        "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero1_qjwkk1.webp",
    },
    title: "Selamat Datang di SMP IP Yakin Jakarta",
    subtitle: "Membentuk Generasi Unggul, Berakhlak, dan Berprestasi",
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
  },
];

/**
 * HeroCarousel component.
 * Displays a full-width image carousel with text overlays and call-to-action buttons.
 * Automatically cycles through slides and provides manual navigation.
 * @returns {JSX.Element} The rendered HeroCarousel component.
 */
export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[600px] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            current === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image.small}
            alt={slide.title}
            fill
            sizes="100vw"
            className="object-cover md:hidden"
            priority={index === 0}
          />
          <Image
            src={slide.image.medium}
            alt={slide.title}
            fill
            sizes="100vw"
            className="object-cover hidden md:block"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        </div>
      ))}

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="text-white max-w-2xl animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {heroSlides[current].title}
          </h1>
          <p className="text-xl mb-8">{heroSlides[current].subtitle}</p>
          <div className="flex gap-4">
            <Link
              href="/Profile"
              className="inline-flex items-center bg-accent text-white px-6 py-3 rounded-lg bg-blue-500 hover:bg-orange-500 hover:text-white transition"
            >
              Pelajari Lebih Lanjut <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/PPDB"
              className="inline-flex items-center text-blue-500 bg-white text-primary px-6 py-3 rounded-lg hover:bg-orange-500 hover:text-white transition"
            >
              Pendaftaran
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === index ? "bg-white w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>

      <button
        onClick={() =>
          setCurrent(
            (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
          )
        }
        className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm"
      >
        <ArrowLeft className="text-white h-6 w-6" />
      </button>

      <button
        onClick={() => setCurrent((prev) => (prev + 1) % heroSlides.length)}
        className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm"
      >
        <ArrowRight className="text-white h-6 w-6" />
      </button>
    </section>
  );
}
