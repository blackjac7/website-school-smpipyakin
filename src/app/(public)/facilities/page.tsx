"use client";

import FacilityCard from "@/components/facilities/FacilityCard";
import PageHeader from "@/components/layout/PageHeader";
import { facilities, Facility } from "@/lib/data/facilities";
import { School, BookOpen, Dumbbell, FlaskConical } from "lucide-react";
import { motion } from "framer-motion";

const categoryIcons: Record<Facility["category"], React.ReactElement> = {
  laboratory: <FlaskConical className="h-6 w-6" />,
  library: <BookOpen className="h-6 w-6" />,
  sports: <Dumbbell className="h-6 w-6" />,
  other: <School className="h-6 w-6" />,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const FacilitiesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Fasilitas Sekolah"
        description="SMP IP Yakin Jakarta menyediakan fasilitas modern dan lengkap untuk mendukung proses pembelajaran dan pengembangan potensi siswa."
        breadcrumbs={[{ label: "Fasilitas", href: "/facilities" }]}
        image="https://res.cloudinary.com/dvnyimxmi/image/upload/v1733055889/hero2_oa2prx.webp"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <motion.div
          variants={container}
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {facilities.map((facility) => (
            <motion.div key={facility.id} variants={item}>
              <FacilityCard
                facility={facility}
                icon={categoryIcons[facility.category]}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FacilitiesPage;
