"use client";

import { History } from "lucide-react";

export default function SejarahPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <History className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Sejarah SMP IP Yakin Jakarta</h2>
      </div>
      <div className="prose max-w-none text-gray-700 space-y-4">
        <p>
          SMP IP Yakin Jakarta didirikan pada tahun <strong>1974</strong> oleh
          Bapak <strong>Dr. Usman Dadu, M.BA</strong>, sebagai upaya untuk
          memberikan pendidikan menengah yang berkualitas kepada masyarakat
          sekitar.
        </p>
        <p>
          Pada tahun <strong>1976</strong>, SMP IP Yakin secara resmi
          didaftarkan menjadi <strong>SMP Swasta</strong>, dengan fasilitas
          sederhana dan siswa awal sebanyak <strong>87 orang</strong>.
        </p>
        <p>
          Pada tanggal <strong>10 Maret 1984</strong>, memperoleh pengakuan dari
          Kementerian Pendidikan dan Kebudayaan. Sejak itu sekolah terus
          berkembang dari segi jumlah siswa, infrastruktur, dan kualitas
          pendidikan.
        </p>
        <h3 className="text-xl font-semibold mt-6 mb-3">
          Tonggak Sejarah Penting
        </h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <div className="min-w-[100px] font-semibold">1974</div>
            <div>Didirikan oleh Bapak Dr. Usman Dadu, M.BA</div>
          </li>
          <li className="flex items-start">
            <div className="min-w-[100px] font-semibold">1976</div>
            <div>Resmi menjadi SMP Swasta dengan 87 siswa</div>
          </li>
          <li className="flex items-start">
            <div className="min-w-[100px] font-semibold">1984</div>
            <div>Mendapatkan pengakuan dari pemerintah</div>
          </li>
          <li className="flex items-start">
            <div className="min-w-[100px] font-semibold">1990-an</div>
            <div>Penambahan ruang kelas dan laboratorium</div>
          </li>
          <li className="flex items-start">
            <div className="min-w-[100px] font-semibold">2000</div>
            <div>Pengenalan teknologi dan komputer</div>
          </li>
          <li className="flex items-start">
            <div className="min-w-[100px] font-semibold">2015</div>
            <div>Perpustakaan digital dan multimedia</div>
          </li>
          <li className="flex items-start">
            <div className="min-w-[100px] font-semibold">2020</div>
            <div>Pembelajaran daring di masa pandemi</div>
          </li>
          <li className="flex items-start">
            <div className="min-w-[100px] font-semibold">2024</div>
            <div>Peluncuran website resmi</div>
          </li>
        </ul>
        <p className="mt-6">
          Sekolah terus berkomitmen pada pendidikan berkualitas berbasis nilai
          Islam dan inovasi modern.
        </p>
      </div>
    </div>
  );
}
