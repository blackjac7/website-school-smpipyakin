import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Sekolah */}
          <div className="sm:col-span-2 md:col-span-1 p-5">
            <h3 className="text-xl font-bold mb-4">SMP IP Yakin Jakarta</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-2 flex-shrink-0" />
                <p>
                  Jl. Bangun Nusa Raya No. 10, Cengkareng Timur, Jakarta Barat
                </p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>+62 21 6194 381</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>info@smpipyakin.sch.id</p>
              </div>
            </div>
          </div>

          {/* Link Cepat */}
          <div className="p-5">
            <h3 className="text-xl font-bold mb-4">Link Cepat</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/profile"
                  className="hover:text-blue-500 cursor-pointer"
                >
                  Profil Sekolah
                </Link>
              </li>
              <li>
                <Link
                  href="/facilities"
                  className="hover:text-blue-500 cursor-pointer"
                >
                  Fasilitas
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-blue-500 cursor-pointer"
                >
                  Berita
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-500 cursor-pointer"
                >
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Jam Operasional */}
          <div className="p-5">
            <h3 className="text-xl font-bold mb-4">Jam Operasional</h3>
            <ul className="space-y-2 text-sm">
              <li>Senin - Jumat: 07:00 - 15:00</li>
              <li>Sabtu: 07:00 - 12:00</li>
              <li>Minggu: Tutup</li>
            </ul>
          </div>
        </div>

        {/* Footer bawah */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} SMP IP Yakin Jakarta. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
