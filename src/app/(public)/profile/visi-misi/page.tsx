"use client";

import { motion } from "framer-motion";
import { Target, Award, CheckCircle2 } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function VisiMisiPage() {
  const misiPoints = [
    "Merencanakan perangkat kerja guru (administrasi guru) dengan standar profesional.",
    "Menyiapkan RPP/modul ajar dan kegiatan proyek yang inovatif.",
    "Mewujudkan peserta didik yang beriman, berakhlak mulia, cerdas, kreatif, dan berkarakter Pancasila.",
    "Melaksanakan Kegiatan Belajar Mengajar (KBM) yang efektif dan disiplin.",
    "Mengembangkan potensi dan bakat peserta didik secara optimal melalui ekstrakurikuler.",
    "Menggunakan metode pembelajaran aktif seperti diskusi kelompok dan presentasi.",
    "Menganalisis capaian pembelajaran secara berkala untuk perbaikan berkelanjutan.",
    "Mengawasi proses KBM untuk menjamin kualitas pendidikan.",
    "Melakukan penilaian hasil dan proses belajar yang objektif dan transparan.",
    "Mensupervisi proses KBM melalui lesson study dan pengembangan profesional guru.",
  ];

  const tujuanPoints = [
    "Menghasilkan lulusan yang memiliki pemahaman Islam yang komprehensif dan moderat.",
    "Mencapai prestasi akademik dan non-akademik di tingkat kota, provinsi, dan nasional.",
    "Mempersiapkan siswa dengan keterampilan abad 21 untuk melanjutkan ke jenjang pendidikan yang lebih tinggi.",
  ];

  return (
    <div className="space-y-12">
      {/* Visi */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-8 border border-blue-100 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Target className="w-32 h-32" />
        </div>
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-4 relative z-10">
          <Target className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 relative z-10">Visi Sekolah</h2>
        <p className="text-xl md:text-2xl font-medium text-blue-800 italic max-w-3xl mx-auto leading-relaxed relative z-10">
          “Terwujudnya Pelajar Berkarakter Pelajar Pancasila Sepanjang Hayat.”
        </p>
      </motion.section>

      {/* Misi */}
      <section>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex items-center gap-3 mb-6"
        >
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Award className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Misi Sekolah</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {misiPoints.map((misi, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="mt-1 min-w-5">
                <CheckCircle2 className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{misi}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Tujuan */}
      <section>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-bold text-gray-900 mb-6"
        >
          Tujuan Pendidikan
        </motion.h2>
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
          <ul className="space-y-6">
            {tujuanPoints.map((tujuan, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + (idx * 0.1) }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {idx + 1}
                </div>
                <p className="text-gray-700 font-medium pt-1 leading-relaxed">{tujuan}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
