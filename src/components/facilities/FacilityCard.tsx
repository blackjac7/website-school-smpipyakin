"use client";

import Image from "next/image";
import { Facility } from "@/app/(public)/facilities/page";
import { useState } from "react";

interface FacilityCardProps {
  facility: Facility;
  icon: React.ReactNode;
}

const FacilityCard = ({ facility, icon }: FacilityCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-64 bg-gray-200">
        {!imageError ? (
          <Image
            src={facility.image}
            alt={facility.name}
            fill
            className={`object-cover transition-opacity duration-300 ${
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
          {icon}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{facility.name}</h3>
        <p className="text-gray-600">{facility.description}</p>
      </div>
    </div>
  );
};

export default FacilityCard;
