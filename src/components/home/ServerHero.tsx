import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { HeroSlide } from "@/components/home/HeroCarousel";

export default function ServerHero({ slide }: { slide: HeroSlide }) {
  if (!slide) return null;

  return (
    <section id="server-hero" aria-hidden="true" className="relative h-[clamp(42rem,84dvh,54rem)] overflow-hidden bg-slate-950 text-white">
      <Image src={slide.image.medium} alt="" fill sizes="100vw" className="object-cover" priority />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.94)_0%,rgba(2,6,23,.76)_48%,rgba(2,6,23,.3)_100%)]" />
      <div className="public-container relative flex h-full items-center pt-18">
        <div className="max-w-3xl py-14">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
            <MapPin aria-hidden="true" className="h-4 w-4 text-amber-300" /> Jakarta Barat
          </p>
          <div className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">{slide.title}</div>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">{slide.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/ppdb" className="public-button-primary min-h-12 px-6">Informasi PPDB <ArrowRight aria-hidden="true" className="h-5 w-5" /></Link>
            <Link href={slide.linkPrimary?.href ?? "/profile/visi-misi"} className="focus-ring inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 font-bold text-white backdrop-blur-sm hover:bg-white hover:text-slate-950">Kenali sekolah</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
