"use client";

import { useState } from "react";
import ActivityCard from "@/components/extracurricular/ActivityCard";
import ImageModal from "@/components/extracurricular/ImageModal";
import PageHeader from "@/components/layout/PageHeader";
import { activities } from "@/lib/data/extracurricular";
import { motion, Variants } from "framer-motion";

export default function ExtracurricularPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const handleImageClick = (image: string, title: string) => {
    setSelectedImage(image);
    setSelectedTitle(title);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setSelectedTitle(null);
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Program Ekstrakurikuler"
        description="Mengembangkan bakat dan minat siswa melalui berbagai kegiatan positif di luar jam pelajaran reguler."
        breadcrumbs={[{ label: "Ekstrakurikuler", href: "/extracurricular" }]}
        image="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1920&auto=format&fit=crop"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 -mt-10 relative z-20"
        >
          {activities.map((activity) => (
            <motion.div key={activity.id} variants={item}>
              <ActivityCard
                activity={activity}
                onImageClick={handleImageClick}
              />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-xl border border-blue-100 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none" />
          <h2 className="text-2xl font-bold mb-6 text-blue-800 relative z-10">
            Informasi Kegiatan
          </h2>
          <div className="grid md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-blue-50/50 p-4 rounded-xl">
               <h3 className="font-semibold text-blue-900 mb-2">Waktu Pelaksanaan</h3>
               <p className="text-gray-600 text-sm">
                 Dilaksanakan setelah jam pelajaran reguler atau di hari Sabtu sesuai jadwal masing-masing.
               </p>
            </div>
             <div className="bg-blue-50/50 p-4 rounded-xl">
               <h3 className="font-semibold text-blue-900 mb-2">Pendaftaran</h3>
               <p className="text-gray-600 text-sm">
                 Siswa dapat mendaftar melalui guru pembimbing atau koordinator ekstrakurikuler di awal semester.
               </p>
            </div>
             <div className="bg-blue-50/50 p-4 rounded-xl">
               <h3 className="font-semibold text-blue-900 mb-2">Persyaratan</h3>
               <p className="text-gray-600 text-sm">
                 Setiap siswa kelas 7 dan 8 wajib mengikuti minimal satu kegiatan ekstrakurikuler (Pramuka Wajib).
               </p>
            </div>
          </div>
        </motion.div>
      </div>

      {selectedImage && selectedTitle && (
        <ImageModal
          isOpen={true}
          onClose={handleCloseModal}
          imageUrl={selectedImage}
          title={selectedTitle}
        />
      )}
    </div>
  );
}
