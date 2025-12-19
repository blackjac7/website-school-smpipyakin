
"use client";

import { useState, useMemo } from "react";
import { Teacher } from "@/lib/data/teachers";
import TeacherCard from "./TeacherCard";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TeacherSearchProps {
  initialTeachers: Teacher[];
}

export default function TeacherSearch({ initialTeachers }: TeacherSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeachers = useMemo(() => {
    return initialTeachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.subject &&
          teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    });
  }, [initialTeachers, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Search Controls */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-center">

          {/* Search Input */}
          <div className="relative w-full max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari guru berdasarkan nama atau mata pelajaran..."
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-yellow focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-gray-500 italic">
        Menampilkan {filteredTeachers.length} profil
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredTeachers.map((teacher) => (
            <motion.div
              key={teacher.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <TeacherCard teacher={teacher} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">Tidak ada data yang ditemukan.</p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-4 text-school-blue hover:underline"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
}
