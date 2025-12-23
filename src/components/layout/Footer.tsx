import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import logo from "@/assets/logo.svg";

export default function Footer() {
  const quickLinks = [
    { name: "Profil Sekolah", href: "/profile" },
    { name: "Fasilitas", href: "/facilities" },
    { name: "Berita", href: "/news" },
    { name: "PPDB", href: "/ppdb" },
    { name: "Kontak", href: "/contact" },
  ];

  const operationalHours = [
    { day: "Senin - Jumat", time: "07:00 - 15:00" },
    { day: "Sabtu", time: "07:00 - 12:00" },
    { day: "Minggu", time: "Tutup" },
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Sekolah Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Image src={logo} alt="Logo SMP IP Yakin" className="h-12 w-12" />
              <div>
                <h3 className="text-xl font-bold">SMP IP Yakin</h3>
                <p className="text-gray-400 text-sm">Jakarta Barat</p>
              </div>
            </div>
            <div className="space-y-4">
              <a
                href="https://maps.google.com/?q=Jl.+Bangun+Nusa+Raya+No.+10,+Cengkareng+Timur,+Jakarta+Barat"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-gray-300 hover:text-yellow-400 transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed">
                  Jl. Bangun Nusa Raya No. 10,
                  <br />
                  Cengkareng Timur, Jakarta Barat
                </p>
              </a>
              <a
                href="tel:+62216194381"
                className="flex items-center gap-3 text-gray-300 hover:text-yellow-400 transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                  <Phone className="h-4 w-4" />
                </div>
                <p className="text-sm">+62 21 6194 381</p>
              </a>
              <a
                href="mailto:info@smpipyakin.sch.id"
                className="flex items-center gap-3 text-gray-300 hover:text-yellow-400 transition-colors group"
              >
                <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <p className="text-sm">info@smpipyakin.sch.id</p>
              </a>
            </div>
          </div>

          {/* Link Cepat */}
          <div>
            <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-yellow-400" />
              Link Cepat
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-yellow-400 text-sm transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-yellow-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Jam Operasional */}
          <div>
            <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              Jam Operasional
            </h3>
            <ul className="space-y-3">
              {operationalHours.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0"
                >
                  <span className="text-gray-300">{item.day}</span>
                  <span
                    className={`font-medium ${item.time === "Tutup" ? "text-red-400" : "text-white"}`}
                  >
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer bawah */}
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} SMP IP Yakin Jakarta. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link
              href="/login"
              className="hover:text-yellow-400 transition-colors"
            >
              Portal Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
