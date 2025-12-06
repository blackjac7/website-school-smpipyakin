"use client";

import { Target, Award } from "lucide-react";

/**
 * VisiMisiPage component.
 * Displays the school's Vision, Mission, and Goals.
 * @returns {JSX.Element} The rendered VisiMisiPage component.
 */
export default function VisiMisiPage() {
  return (
    <div className="space-y-8">
      {/* Visi Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Target className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold">Visi Sekolah</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">
          “Terwujudnya Pelajar Berkarakter Pelajar Pancasila Sepanjang Hayat.”
        </p>
      </section>

      {/* Misi Section */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <Award className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold">Misi Sekolah</h2>
        </div>
        <ul className="space-y-3 text-gray-700">
          {[
            "Merencanakan perangkat kerja guru (administrasi guru).",
            "Menyiapkan RPP/modul ajar dan kegiatan proyek.",
            "Mewujudkan peserta didik yang beriman, berakhlak mulia, cerdas, kreatif, dan berkarakter Pancasila melalui pembelajaran yang berkualitas dan berpusat pada peserta didik.",
            "Melaksanakan Kegiatan Belajar Mengajar (KBM) sesuai dengan durasi yang telah ditetapkan.",
            "Mengembangkan potensi dan bakat peserta didik secara optimal.",
            "Menggunakan metode diskusi kelompok belajar dan presentasi hasil kinerja.",
            "Menganalisis capaian pembelajaran peserta didik dengan mengimplementasikan berbagai metode pembelajaran sehingga standar kelulusan optimal.",
            "Mengawasi proses Kegiatan Belajar Mengajar (KBM) sesuai dengan durasi yang telah ditetapkan.",
            "Menilai hasil (tes/nontes/lisan/tugas) dan assessment (penilaian proses).",
            "Mensupervisi proses KBM menggunakan Model Coaching (SMC) dengan instrumen monitoring melalui lesson study (catatan pengamatan).",
          ].map((misi, idx) => (
            <li key={idx} className="flex items-start">
              <span className="w-2 h-2 mt-2 mr-2 bg-blue-600 rounded-full"></span>
              <span>{misi}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Tujuan Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Tujuan</h2>
        <ul className="space-y-3 text-gray-700">
          {[
            "Menghasilkan lulusan yang memiliki pemahaman Islam yang komprehensif",
            "Mencapai prestasi akademik dan non-akademik di tingkat nasional dan internasional",
            "Mempersiapkan siswa untuk melanjutkan ke jenjang pendidikan yang lebih tinggi",
          ].map((tujuan, idx) => (
            <li key={idx} className="flex items-start">
              <span className="w-2 h-2 mt-2 mr-2 bg-blue-600 rounded-full"></span>
              <span>{tujuan}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
