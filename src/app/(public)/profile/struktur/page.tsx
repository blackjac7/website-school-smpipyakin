"use client";

import { Users } from "lucide-react";
import Image from "next/image";
import { teachers } from "@/lib/data/teachers";
import { motion } from "framer-motion";

export default function StrukturPage() {
  const kepsek = teachers.find((t) => t.position === "Kepala Sekolah");

  // Filter Wakil Kepala
  const wakaList = teachers.filter((t) => t.position.includes("Wakil Kepala"));

  const koordinator = [
    "Koordinator Mata Pelajaran",
    "Koordinator Bimbingan Konseling",
    "Koordinator Ekstrakurikuler",
    "Koordinator Tata Usaha",
  ];

  // Helper to count staff/teachers
  const guruCount = teachers.filter(t => t.category === "Guru Mata Pelajaran").length;
  // Fallback for staff if not in DB fully
  const staffCount = teachers.filter(t => t.category === "Staff").length || 5;

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold text-gray-900">Struktur Organisasi</h2>
        <p className="text-gray-500">Tahun Ajaran 2024/2025</p>
      </motion.div>

      {/* Tree Diagram Layout */}
      <div className="relative">

        {/* Level 1: Kepala Sekolah */}
        <div className="flex justify-center mb-12 relative">
           <div className="absolute top-full left-1/2 w-px h-12 bg-gray-300 -translate-x-1/2"></div>
           {kepsek && (
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="flex flex-col items-center bg-white p-6 rounded-2xl border-2 border-blue-600 shadow-lg max-w-[280px] z-10 relative"
             >
                <div className="relative w-28 h-28 mb-4">
                  <Image
                    src={kepsek.photo}
                    alt={kepsek.name}
                    fill
                    className="rounded-full object-cover border-4 border-blue-50"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-lg text-center leading-tight">{kepsek.name}</h3>
                <p className="text-blue-600 font-medium text-sm text-center mt-1">{kepsek.position}</p>
             </motion.div>
           )}
        </div>

        {/* Level 2: Wakil Kepala */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Horizontal Line connecting Wakas (Only visible on MD+) */}
          {wakaList.length > 1 && (
             <div className="absolute -top-12 left-[16.66%] right-[16.66%] h-px bg-gray-300 hidden md:block"></div>
          )}

          {/* Vertical lines from horizontal to cards */}
           <div className="absolute -top-12 left-[16.66%] w-px h-12 bg-gray-300 hidden md:block"></div>
           <div className="absolute -top-12 left-1/2 w-px h-12 bg-gray-300 hidden md:block"></div>
           <div className="absolute -top-12 right-[16.66%] w-px h-12 bg-gray-300 hidden md:block"></div>

          {wakaList.map((staff, index) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Mobile connector */}
              <div className="absolute -top-6 left-1/2 w-px h-6 bg-gray-300 md:hidden"></div>

              <div className="relative w-20 h-20 mb-3">
                <Image
                  src={staff.photo}
                  alt={staff.name}
                  fill
                  className="rounded-full object-cover bg-gray-100"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-center text-sm leading-tight">{staff.name}</h3>
              <p className="text-gray-500 text-xs text-center mt-1 px-2 line-clamp-2">
                {staff.position}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Level 3: Koordinator & Staff */}
        <div className="mt-12">
            <h3 className="text-center text-lg font-semibold text-gray-800 mb-6">Koordinator Bidang</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {koordinator.map((position, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + (index * 0.05) }}
                    className="bg-gray-50 p-4 rounded-lg text-center border border-gray-100 flex flex-col items-center justify-center min-h-[80px] hover:bg-gray-100 transition-colors"
                >
                    <Users className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="font-medium text-gray-700 text-sm">{position}</p>
                </motion.div>
            ))}
            </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-gray-900 text-lg">Guru Mata Pelajaran</h4>
              <p className="text-blue-600 text-sm mt-1">Profesional & Berkompeten</p>
            </div>
            <span className="text-4xl font-black text-blue-200">{guruCount}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 bg-yellow-50 rounded-xl border border-yellow-100 flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-gray-900 text-lg">Staff Administrasi</h4>
              <p className="text-yellow-600 text-sm mt-1">Pelayanan Prima</p>
            </div>
            <span className="text-4xl font-black text-yellow-200">{staffCount}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
