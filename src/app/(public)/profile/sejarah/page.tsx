"use client";

import { motion } from "framer-motion";

export default function SejarahPage() {
  const milestones = [
    {
      year: "1974",
      title: "Pendirian Sekolah",
      description:
        "Didirikan oleh Bapak Dr. Usman Dadu, M.BA, sebagai wujud kepedulian terhadap pendidikan yang berkualitas di lingkungan sekitar.",
    },
    {
      year: "1976",
      title: "Resmi Menjadi SMP Swasta",
      description:
        "Mendapatkan izin operasional dengan angkatan pertama sebanyak 87 siswa dan fasilitas awal yang sederhana.",
    },
    {
      year: "1984",
      title: "Pengakuan Pemerintah",
      description:
        "Memperoleh status diakui dari Kementerian Pendidikan dan Kebudayaan pada tanggal 10 Maret 1984, menjadi tonggak penting legalitas sekolah.",
    },
    {
      year: "1990-an",
      title: "Pengembangan Infrastruktur",
      description:
        "Pembangunan gedung baru, penambahan ruang kelas, dan laboratorium IPA untuk mendukung pembelajaran sains.",
    },
    {
      year: "2015",
      title: "Era Digital",
      description:
        "Modernisasi fasilitas dengan laboratorium komputer dan perpustakaan digital untuk menghadapi tantangan teknologi.",
    },
    {
      year: "2024",
      title: "Transformasi Modern",
      description:
        "Peluncuran identitas baru, penguatan kurikulum merdeka, dan digitalisasi sistem informasi sekolah melalui website resmi.",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg leading-relaxed border-l-4 border-blue-600 dark:border-blue-500 pl-4 bg-blue-50 dark:bg-blue-900/30 py-3 rounded-r-lg"
        >
          <span className="font-bold text-blue-700 dark:text-blue-400">
            SMP IP Yakin Jakarta
          </span>{" "}
          memiliki sejarah panjang dalam dunia pendidikan. Dimulai dari visi
          sederhana pada tahun 1974, kini telah berkembang menjadi institusi
          pendidikan modern yang tetap memegang teguh nilai-nilai luhur dan siap
          mencetak generasi unggul.
        </motion.p>
      </div>

      <div className="relative border-l-2 border-blue-100 dark:border-blue-900 ml-3 md:ml-6 space-y-10 py-4">
        {milestones.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative pl-8 md:pl-12 group"
          >
            <div className="absolute -left-[9px] top-1 h-5 w-5 rounded-full border-4 border-white dark:border-gray-800 bg-blue-300 dark:bg-blue-600 group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors shadow-sm" />
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                {item.year}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors -ml-2">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
