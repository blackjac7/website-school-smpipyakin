"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { School } from "lucide-react";
import { PublicFacility } from "@/actions/public/facilities";

interface FacilitiesListProps {
  facilities: PublicFacility[];
}

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

export default function FacilitiesList({ facilities }: FacilitiesListProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
      <motion.div
        variants={container}
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {facilities.map((facility) => (
          <motion.div key={facility.id} variants={item}>
            <FacilityCard facility={facility} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function FacilityCard({ facility }: { facility: PublicFacility }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-64 bg-gray-200 overflow-hidden">
        {!imageError ? (
          <Image
            src={facility.image}
            alt={facility.title}
            fill
            className={`object-cover transition-all duration-500 group-hover:scale-110 ${
              imageLoading ? "opacity-0" : "opacity-100"
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
            priority={false}
            quality={75}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🏫</div>
              <div className="text-sm">Gambar tidak tersedia</div>
            </div>
          </div>
        )}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
          <School className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
          {facility.title}
        </h3>
        <p className="text-gray-600 line-clamp-3">{facility.description}</p>
      </div>
    </div>
  );
}
