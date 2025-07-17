"use client";

import { useState } from "react";
import ActivityCard from "@/components/extracurricular/ActivityCard";
import ImageModal from "@/components/extracurricular/ImageModal";

const activities = [
  {
    id: "1",
    name: "Pramuka",
    description:
      "Kegiatan kepanduan yang mengembangkan jiwa kepemimpinan, kemandirian, dan kerjasama tim.",
    schedule: "Selasa, 13:00 - 14:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1732787846/Pramuka_ocy314.webp",
  },
  {
    id: "2",
    name: "Seni Musik",
    description:
      "Pengembangan bakat musik melalui pembelajaran alat musik dan paduan suara.",
    schedule: "Sabtu, 07:30 - 09:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732802973/Seni_Musik_qnbwpd.webp",
  },
  {
    id: "3",
    name: "Seni Tari",
    description:
      "Mempelajari dan melestarikan berbagai tarian tradisional dan modern Indonesia.",
    schedule: "Rabu, 13:00 - 15:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1732791235/seni_tari_1_cb7rgy.webp",
  },
  {
    id: "4",
    name: "Hadroh",
    description:
      "Pengembangan seni musik islami melalui pembelajaran alat musik rebana dan vocal.",
    schedule: "Rabu, 13:00 - 15:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732803309/hadroh_11_g8qlsr.webp",
  },
  {
    id: "5",
    name: "Rohis",
    description:
      "Kegiatan pembinaan keagamaan Islam untuk meningkatkan pemahaman dan praktik keislaman.",
    schedule: ["Selasa, 13:00 - 14:30 WIB", "Sabtu, 09:30 - 10:30 WIB"],
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732804810/rohis_dtzeef.webp",
  },
  {
    id: "6",
    name: "Rohkris",
    description:
      "Kegiatan pembinaan keagamaan Kristen untuk meningkatkan pemahaman dan praktik kekristenan.",
    schedule: "Jumat, 11:00 - 12:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733187839/rohkris_xf2im9.webp",
  },
  {
    id: "7",
    name: "Paskibra",
    description:
      "Kegiatan yang fokus pada latihan baris-berbaris dan upacara bendera.",
    schedule: "Jum'at, 13:00 - 15:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732804631/paskibra_v3htds.webp",
  },
  {
    id: "8",
    name: "Futsal",
    description:
      "Latihan futsal untuk mengembangkan kemampuan olahraga dan sportivitas.",
    schedule: "Sabtu, 09:00 - 11:30 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732802973/Futsal_hghnis.webp",
  },
  {
    id: "9",
    name: "Pencak Silat",
    description:
      "Seni bela diri tradisional Indonesia yang mengembangkan kemampuan fisik dan mental.",
    schedule: "Sabtu, 06:00 - 07:00 WIB",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1732804631/silat_a4ly8k.webp",
  },
];

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-25 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 text-blue-500">
          Program Ekstrakurikuler
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto animate-slideUp">
          SMP IP Yakin Jakarta menyediakan berbagai kegiatan ekstrakurikuler
          untuk mengembangkan bakat dan minat siswa di luar jam pelajaran
          reguler.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="animate-slideUp"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <ActivityCard activity={activity} onImageClick={handleImageClick} />
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 shadow-lg animate-fadeIn">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          Jadwal Kegiatan
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            <span className="font-semibold">Waktu Pelaksanaan:</span> Kegiatan
            ekstrakurikuler dilaksanakan setelah jam pelajaran reguler atau di
            hari Sabtu.
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Pendaftaran:</span> Siswa dapat
            mendaftar melalui guru pembimbing atau koordinator ekstrakurikuler
            di awal semester.
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Persyaratan:</span> Setiap siswa
            wajib mengikuti minimal satu kegiatan ekstrakurikuler sesuai minat
            dan bakat.
          </p>
        </div>
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
