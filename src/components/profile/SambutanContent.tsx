"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";
import { teachers } from "@/lib/data/teachers";

export default function SambutanContent() {
  const kepsek = teachers.find((t) => t.position === "Kepala Sekolah");
  const photoUrl =
    kepsek?.photo ||
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop";

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full md:w-80 flex-shrink-0"
      >
        <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-xl border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
          <Image
            src={photoUrl}
            alt="Kepala Sekolah SMP IP Yakin Jakarta"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-bold text-lg leading-tight">
              Muhamad Abduh, S.T.
            </h3>
            <p className="text-sm text-gray-200">Kepala Sekolah</p>
          </div>
        </div>
        <div className="absolute -z-10 top-4 -right-4 w-full h-full bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl -rotate-2"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 space-y-6"
      >
        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl border border-blue-100 dark:border-blue-800 relative">
          <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-200 dark:text-blue-700" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Assalamualaikum Wr. Wb.
          </h2>
          <p className="text-gray-600 dark:text-gray-400 italic">
            &quot;Pendidikan bukan hanya tentang mengisi wadah, tetapi tentang
            menyalakan api.&quot;
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed">
          <p>
            Puji syukur kita panjatkan kepada Allah SWT yang telah memberikan
            rahmat dan hidayah-Nya. Selamat datang di website resmi{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              SMP IP Yakin Jakarta
            </span>
            .
          </p>

          <p>
            Kami berkomitmen untuk mengembangkan potensi setiap siswa secara
            menyeluruh. Kami percaya bahwa setiap anak adalah bintang yang siap
            bersinar dengan caranya sendiri. Kurikulum kami dirancang untuk
            menyeimbangkan keunggulan akademik dengan pembentukan karakter
            Islami yang kuat.
          </p>

          <p>
            Di era digital ini, kami terus berinovasi dalam metode pembelajaran
            dan fasilitas. Namun, teknologi hanyalah alat; hati dan keteladanan
            gurulah yang menjadi kunci pendidikan. Kami berupaya menciptakan
            lingkungan belajar yang kondusif, aman, dan menyenangkan.
          </p>

          <p>
            Mari bersinergi—orang tua, guru, dan masyarakat—untuk mewujudkan
            generasi penerus bangsa yang berakhlak mulia, cerdas, dan siap
            menghadapi tantangan masa depan.
          </p>

          <p className="font-semibold text-gray-900 dark:text-white pt-4">
            Wassalamualaikum Wr. Wb.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              Muhamad Abduh, S.T.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kepala Sekolah SMP IP Yakin Jakarta
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
