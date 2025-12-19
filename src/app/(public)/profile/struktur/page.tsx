"use client";

import { Users, User, GraduationCap, School } from "lucide-react";
import Image from "next/image";
import { teachers } from "@/lib/data/teachers";
import { motion } from "framer-motion";

export default function StrukturPage() {
  const kepsek = teachers.find((t) => t.position === "Kepala Sekolah");

  // New Staff
  const kepalaTU = teachers.find((t) => t.position === "Kepala Tata Usaha");
  const operator = teachers.find((t) => t.position === "Operator Sekolah");

  // Filter Wakil Kepala
  const wakaList = teachers.filter((t) => t.position.includes("Wakil Kepala"));

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

        {/* Level 2: Kepala TU & Operator Sekolah */}
        <div className="flex justify-center mb-12 relative">
            {/* Vertical connector from Level 1 */}
            {/* The vertical line from Kepsek goes down 12px. We need a horizontal connector here if multiple items, or just vertical pass through?
                User said: "dibawahnya baru Wakasek".
                Let's arrange TU and Operator side by side.
            */}

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Connectors */}
                 {/* Horizontal line above items */}
                 <div className="absolute -top-12 left-[25%] right-[25%] h-px bg-gray-300 hidden md:block"></div>
                 {/* Vertical line from Kepsek (center) to horizontal line */}
                 <div className="absolute -top-12 left-1/2 w-px h-12 bg-gray-300 -translate-x-1/2 hidden md:block"></div>

                 {/* Vertical lines dropping to items */}
                 <div className="absolute -top-12 left-[25%] w-px h-12 bg-gray-300 hidden md:block"></div>
                 <div className="absolute -top-12 right-[25%] w-px h-12 bg-gray-300 hidden md:block"></div>

                 {/* Mobile connector */}
                 <div className="absolute -top-12 left-1/2 w-px h-12 bg-gray-300 md:hidden"></div>

                 {kepalaTU && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative"
                    >
                         <div className="relative w-20 h-20 mb-3">
                            <Image
                            src={kepalaTU.photo}
                            alt={kepalaTU.name}
                            fill
                            className="rounded-full object-cover bg-gray-100"
                            />
                        </div>
                        <h3 className="font-bold text-gray-900 text-center text-sm leading-tight">{kepalaTU.name}</h3>
                        <p className="text-gray-500 text-xs text-center mt-1">{kepalaTU.position}</p>

                        {/* Connector to next level (Wakasek) */}
                        {/* If we want to connect back to a single central line for Wakasek */}
                         <div className="absolute top-full left-1/2 w-px h-12 bg-gray-300 hidden md:block"></div>
                    </motion.div>
                 )}

                {operator && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex flex-col items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative"
                    >
                         <div className="relative w-20 h-20 mb-3">
                            <Image
                            src={operator.photo}
                            alt={operator.name}
                            fill
                            className="rounded-full object-cover bg-gray-100"
                            />
                        </div>
                        <h3 className="font-bold text-gray-900 text-center text-sm leading-tight">{operator.name}</h3>
                        <p className="text-gray-500 text-xs text-center mt-1">{operator.position}</p>

                         {/* Connector to next level */}
                         <div className="absolute top-full left-1/2 w-px h-12 bg-gray-300 hidden md:block"></div>
                    </motion.div>
                 )}
            </div>

             {/* Central connector for mobile flow or regrouping */}
             {/* We need to re-converge to center for Wakasek? Or Wakasek branches out again?
                 Usually tree diagrams re-converge.
                 Let's draw a horizontal line below TU/Operator to merge back to center.
             */}
             <div className="absolute bottom-[-24px] left-[25%] right-[25%] h-px bg-gray-300 hidden md:block"></div>
             <div className="absolute bottom-[-48px] left-1/2 w-px h-6 bg-gray-300 hidden md:block"></div>
        </div>

        {/* Level 3: Wakil Kepala */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mt-12 md:mt-16">
          {/* Connector from Level 2 (The merged line) */}
          <div className="absolute -top-8 left-1/2 w-px h-8 bg-gray-300 -translate-x-1/2 md:block hidden"></div>

          {/* Horizontal Line connecting Wakas (Only visible on MD+) */}
          {wakaList.length > 1 && (
             <div className="absolute -top-12 left-[16.66%] right-[16.66%] h-px bg-gray-300 hidden md:block translate-y-12"></div>
          )}

          {/* Vertical lines from horizontal to cards */}
           <div className="absolute -top-12 left-[16.66%] w-px h-12 bg-gray-300 hidden md:block translate-y-12"></div>
           <div className="absolute -top-12 left-1/2 w-px h-12 bg-gray-300 hidden md:block translate-y-12"></div>
           <div className="absolute -top-12 right-[16.66%] w-px h-12 bg-gray-300 hidden md:block translate-y-12"></div>

          {wakaList.map((staff, index) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Mobile connector */}
              <div className="absolute -top-12 left-1/2 w-px h-12 bg-gray-300 md:hidden"></div>

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

              {/* Connector to next level (Converge again?)
                  Ideally, Wakasek leads to Wali Kelas.
                  We can merge all Wakasek to a single line down to Wali Kelas.
              */}
              <div className="absolute top-full left-1/2 w-px h-12 bg-gray-300 hidden md:block"></div>
            </motion.div>
          ))}
           {/* Merge Wakasek lines at bottom */}
           <div className="absolute -bottom-12 left-[16.66%] right-[16.66%] h-px bg-gray-300 hidden md:block"></div>
           <div className="absolute -bottom-12 left-1/2 w-px h-12 bg-gray-300 hidden md:block translate-y-0"></div>
        </div>

        {/* Level 4: Wali Kelas (Representative) */}
        <div className="mt-24 flex justify-center relative">
             <div className="absolute -top-12 left-1/2 w-px h-12 bg-gray-300 md:block hidden"></div>
             {/* Mobile connector */}
             <div className="absolute -top-12 left-1/2 w-px h-12 bg-gray-300 md:hidden"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm flex flex-col items-center w-64 relative z-10"
            >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-600">
                    <User className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900">Wali Kelas</h3>
                <p className="text-xs text-gray-500 mt-1 text-center">Membimbing & Memonitor Kelas</p>

                {/* Connector Down */}
                <div className="absolute top-full left-1/2 w-px h-12 bg-gray-300"></div>
            </motion.div>
        </div>

        {/* Level 5: Dewan Guru (Representative) */}
        <div className="mt-12 flex justify-center relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm flex flex-col items-center w-64 relative z-10"
            >
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3 text-yellow-600">
                    <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900">Dewan Guru</h3>
                <p className="text-xs text-gray-500 mt-1 text-center">Tenaga Pendidik Profesional</p>

                {/* Connector Down */}
                <div className="absolute top-full left-1/2 w-px h-12 bg-gray-300"></div>
            </motion.div>
        </div>

        {/* Level 6: Siswa (Representative) */}
        <div className="mt-12 flex justify-center relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-green-200 shadow-sm flex flex-col items-center w-64 relative z-10"
            >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
                    <School className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900">Siswa / OSIS</h3>
                <p className="text-xs text-gray-500 mt-1 text-center">Generasi Penerus Bangsa</p>
            </motion.div>
        </div>


        {/* Summary Stats (Optional - kept for context but moved down) */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-gray-100">
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
