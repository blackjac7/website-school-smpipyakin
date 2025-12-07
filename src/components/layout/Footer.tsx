import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-full p-1">
                 <Image src={logo} alt="Logo" width={32} height={32} />
              </div>
              <span className="text-xl font-bold text-white">SMP IP Yakin</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              Membangun generasi berkarakter, cerdas, dan berakhlak mulia melalui pendidikan berkualitas dan lingkungan belajar yang inspiratif.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Hubungi Kami</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <p>Jl. Bangun Nusa Raya No. 10, Cengkareng Timur, Jakarta Barat</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <p>+62 21 6194 381</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <p>info@smpipyakin.sch.id</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Link Cepat</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Profil Sekolah", href: "/profile" },
                { label: "Fasilitas", href: "/facilities" },
                { label: "Berita & Artikel", href: "/news" },
                { label: "Info PPDB", href: "/ppdb" },
                { label: "Ekstrakurikuler", href: "/extracurricular" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary transition-colors flex items-center gap-2 group">
                     <span className="h-1 w-1 rounded-full bg-zinc-600 group-hover:bg-primary transition-colors"/>
                     {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

           {/* Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Jam Operasional</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-zinc-800 pb-2">
                <span>Senin - Jumat</span>
                <span className="text-white">07:00 - 15:00</span>
              </li>
              <li className="flex justify-between border-b border-zinc-800 pb-2">
                <span>Sabtu</span>
                <span className="text-white">07:00 - 12:00</span>
              </li>
              <li className="flex justify-between text-zinc-500">
                <span>Minggu</span>
                <span>Tutup</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} SMP IP Yakin Jakarta. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">Privacy Policy</Link>
            <Link href="#" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
