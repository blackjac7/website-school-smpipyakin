import Image from "next/image";
import Link from "next/link";
import { Clock3, Instagram, Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.svg";
import { operationalHours, schoolIdentity } from "@/lib/public-site";

const exploreLinks = [
  { label: "Tentang Sekolah", href: "/profile/visi-misi" },
  { label: "Guru & Tenaga Pendidik", href: "/profile/guru" },
  { label: "Fasilitas", href: "/facilities" },
  { label: "Ekstrakurikuler", href: "/extracurricular" },
  { label: "Karya Siswa", href: "/karya-siswa" },
];

const informationLinks = [
  { label: "Berita & Prestasi", href: "/news" },
  { label: "Pengumuman", href: "/announcements" },
  { label: "Kalender Akademik", href: "/academic-calendar" },
  { label: "Informasi PPDB", href: "/ppdb" },
  { label: "Cek Status PPDB", href: "/ppdb/status" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-200">
      <div className="public-container py-14 lg:py-18">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/" className="focus-ring inline-flex items-center gap-3 rounded-xl">
              <Image src={logo} alt="" className="h-12 w-12" />
              <span>
                <span className="block text-lg font-bold text-white">{schoolIdentity.name}</span>
                <span className="text-sm text-slate-400">{schoolIdentity.location}</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
              {schoolIdentity.description} Temukan informasi sekolah, kegiatan,
              pengumuman, dan penerimaan peserta didik baru di satu tempat.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <a href={schoolIdentity.mapsHref} target="_blank" rel="noreferrer" className="focus-ring flex w-fit gap-3 rounded-lg text-slate-300 hover:text-amber-300">
                <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{schoolIdentity.address}</span>
              </a>
              <a href={schoolIdentity.phoneHref} className="focus-ring flex w-fit items-center gap-3 rounded-lg text-slate-300 hover:text-amber-300">
                <Phone aria-hidden="true" className="h-5 w-5" /> {schoolIdentity.phoneDisplay}
              </a>
              <a href={`mailto:${schoolIdentity.email}`} className="focus-ring flex w-fit items-center gap-3 rounded-lg text-slate-300 hover:text-amber-300">
                <Mail aria-hidden="true" className="h-5 w-5" /> {schoolIdentity.email}
              </a>
            </div>
          </div>

          <FooterLinks title="Jelajahi" links={exploreLinks} />
          <FooterLinks title="Informasi" links={informationLinks} />

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">Jam layanan</h2>
            <div className="mt-5 space-y-3">
              {operationalHours.map((item) => (
                <div key={item.day} className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 text-sm">
                  <span className="text-slate-400">{item.day}</span>
                  <span className="font-semibold text-slate-200">{item.time}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500">
              <Clock3 aria-hidden="true" className="h-4 w-4 shrink-0" />
              Hubungi sekolah lebih dahulu untuk kunjungan di luar jam layanan.
            </p>
            <a href={schoolIdentity.instagramHref} target="_blank" rel="noreferrer" className="focus-ring mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-white hover:border-amber-400 hover:text-amber-300">
              <Instagram aria-hidden="true" className="h-5 w-5" /> {schoolIdentity.instagramHandle}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {schoolIdentity.name}. Hak cipta dilindungi.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/contact" className="focus-ring rounded hover:text-white">Kontak</Link>
            <Link href="/login" className="focus-ring rounded hover:text-white">Portal pengguna</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="focus-ring rounded text-slate-400 transition-colors hover:text-amber-300">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
