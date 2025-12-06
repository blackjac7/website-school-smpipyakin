"use client";

import FacilityCard from "@/components/facilities/FacilityCard";
import { School, BookOpen, Dumbbell, FlaskConical } from "lucide-react";

/**
 * Type definition for Facility.
 */
export interface Facility {
  id: string;
  name: string;
  description: string;
  image: string;
  category: "laboratory" | "library" | "sports" | "other";
}

const facilities: Facility[] = [
  {
    id: "1",
    name: "Laboratorium Sains",
    description:
      "Laboratorium modern yang dilengkapi dengan peralatan praktikum terkini untuk mata pelajaran Fisika, Kimia, dan Biologi.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMTUwSDE1MFYyNTBIMjUwVjE1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2ZyB4PSIyNzAiIHk9IjE3MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNNS4wOTY3NCAxMS4wOTY3TDEyIDQuMTkzNDFMMTguOTAzMyAxMS4wOTY3TTEyIDQuMTkzNDFWMTkuODA2NiIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4KPHR4dCB4PSIzMDAiIHk9IjI3MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5MYWJvcmF0b3JpdW0gU2FpbnM8L3R4dD4KPC9zdmc+",
    category: "laboratory",
  },
  {
    id: "2",
    name: "Perpustakaan",
    description:
      "Perpustakaan dengan koleksi buku fisik, dilengkapi area membaca yang nyaman dan akses e-library.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733112505/Perpustakaan_btnhtn.jpg",
    category: "library",
  },
  {
    id: "3",
    name: "Lapangan Olahraga",
    description:
      "Fasilitas olahraga lengkap termasuk lapangan futsal, basket, dan area atletik dengan standar nasional.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733094531/lapangan_pxkhxa.jpg",
    category: "sports",
  },
  {
    id: "4",
    name: "Laboratorium Komputer",
    description:
      "Lab komputer dengan perangkat terbaru untuk pembelajaran teknologi informasi dan programming.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/w_1024/q_auto/f_auto/v1733055889/hero2_oa2prx.webp",
    category: "laboratory",
  },
  {
    id: "5",
    name: "Kantin Sekolah",
    description:
      "Kantin dengan berbagai pilihan makanan dan minuman sehat untuk menunjang gizi siswa.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733095032/kantin_xhsmox.jpg",
    category: "other",
  },
  {
    id: "6",
    name: "Mesin Minuman Otomatis",
    description:
      "Mesin minuman otomatis yang menyediakan berbagai minuman sehat dan menyegarkan.",
    image:
      "https://res.cloudinary.com/dvnyimxmi/image/upload/t_My Logo/w_1024/q_auto/f_auto/v1733095023/mesin_otomatis_gcb28n.jpg",
    category: "other",
  },
];

const categoryIcons: Record<Facility["category"], React.ReactElement> = {
  laboratory: <FlaskConical className="h-6 w-6" />,
  library: <BookOpen className="h-6 w-6" />,
  sports: <Dumbbell className="h-6 w-6" />,
  other: <School className="h-6 w-6" />,
};

/**
 * FacilitiesPage component.
 * Displays a grid of school facilities with their descriptions and images.
 * @returns {JSX.Element} The rendered FacilitiesPage component.
 */
const FacilitiesPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-25">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 text-blue-500">
          Fasilitas Sekolah
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          SMP IP Yakin Jakarta menyediakan fasilitas modern dan lengkap untuk
          mendukung proses pembelajaran dan pengembangan potensi siswa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            icon={categoryIcons[facility.category]}
          />
        ))}
      </div>
    </div>
  );
};

export default FacilitiesPage;
