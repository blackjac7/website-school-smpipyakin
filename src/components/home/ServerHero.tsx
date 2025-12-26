import Image from "next/image";
import Link from "next/link";
import { HeroSlide } from "@/components/home/HeroCarousel";

export default function ServerHero({ slide }: { slide: HeroSlide }) {
  if (!slide) return null;

  return (
    <section
      id="server-hero"
      className="relative h-[100dvh] min-h-[600px] overflow-hidden bg-black"
    >
      {/* Server-rendered LCP image so preload is useful */}
      <div className="absolute inset-0">
        <Image
          src={slide.image.medium}
          alt={slide.title}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="text-white max-w-2xl z-10 pb-20 md:pb-0">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            {slide.title}
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-200 font-light drop-shadow-md">
            {slide.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {slide.linkPrimary && (
              <Link
                href={slide.linkPrimary.href}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                prefetch={false}
              >
                {slide.linkPrimary.text}
              </Link>
            )}
            {slide.linkSecondary && (
              <Link
                href={slide.linkSecondary.href}
                prefetch={false}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg border-2 border-white text-white hover:bg-white hover:text-black transition flex items-center justify-center"
              >
                {slide.linkSecondary.text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
