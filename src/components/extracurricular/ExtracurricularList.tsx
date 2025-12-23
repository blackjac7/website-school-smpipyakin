"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { motion, Variants } from "framer-motion";
import ImageModal from "./ImageModal";
import { PublicExtracurricular } from "@/actions/public/extracurricular";

interface ExtracurricularListProps {
  activities: PublicExtracurricular[];
}

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

export default function ExtracurricularList({
  activities,
}: ExtracurricularListProps) {
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

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 -mt-10 relative z-20"
        >
          {activities.map((activity) => (
            <motion.div key={activity.id} variants={item} className="group">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div
                  className="relative group cursor-pointer"
                  onClick={() =>
                    handleImageClick(activity.image, activity.title)
                  }
                >
                  <Image
                    src={activity.image}
                    alt={activity.title}
                    width={800}
                    height={400}
                    className="w-full h-48 object-cover transition duration-300 group-hover:brightness-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                      Klik untuk memperbesar
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {activity.description}
                  </p>
                  <div className="flex items-center text-sm text-blue-600">
                    <div className="flex flex-col">
                      {activity.schedule.includes(" & ") ? (
                        activity.schedule
                          .split(" & ")
                          .map((schedule, index) => (
                            <span key={index} className="mb-2 last:mb-0">
                              <div className="flex flex-row items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {schedule}
                              </div>
                            </span>
                          ))
                      ) : (
                        <div className="flex flex-row items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{activity.schedule}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-blue-50/50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">
                Waktu Pelaksanaan
              </h3>
              <p className="text-gray-600 text-sm">
                Dilaksanakan setelah jam pelajaran reguler atau di hari Sabtu
                sesuai jadwal masing-masing.
              </p>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">Pendaftaran</h3>
              <p className="text-gray-600 text-sm">
                Siswa dapat mendaftar melalui guru pembimbing atau koordinator
                ekstrakurikuler di awal semester.
              </p>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-2">Persyaratan</h3>
              <p className="text-gray-600 text-sm">
                Setiap siswa kelas 7 dan 8 wajib mengikuti minimal satu kegiatan
                ekstrakurikuler (Pramuka Wajib).
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
    </>
  );
}
