"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown } from "lucide-react";
import { PublicTeacher } from "@/actions/public/teachers";

interface TeacherListProps {
  initialTeachers: PublicTeacher[];
}

export default function TeacherList({ initialTeachers }: TeacherListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(initialTeachers.map((t) => t.category));
    return ["all", ...Array.from(cats)];
  }, [initialTeachers]);

  const filteredTeachers = useMemo(() => {
    return initialTeachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.subject &&
          teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        teacher.position.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || teacher.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [initialTeachers, searchQuery, selectedCategory]);

  // Group teachers by category for display
  const groupedTeachers = useMemo(() => {
    const groups: Record<string, PublicTeacher[]> = {};
    filteredTeachers.forEach((teacher) => {
      if (!groups[teacher.category]) {
        groups[teacher.category] = [];
      }
      groups[teacher.category].push(teacher);
    });
    return groups;
  }, [filteredTeachers]);

  const categoryOrder = ["Pimpinan", "Guru Mata Pelajaran", "Staff"];

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Cari nama guru, jabatan, atau mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            <span className="text-gray-700">
              {selectedCategory === "all" ? "Semua Kategori" : selectedCategory}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsFilterOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      selectedCategory === cat
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    {cat === "all" ? "Semua Kategori" : cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Menampilkan {filteredTeachers.length} dari {initialTeachers.length} guru
        & staff
      </p>

      {/* Teachers Grid by Category */}
      {filteredTeachers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">
            Tidak ada guru yang sesuai dengan pencarian.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {categoryOrder.map((category) => {
            const teachers = groupedTeachers[category];
            if (!teachers || teachers.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  {category}
                </h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {teachers.map((teacher, index) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-50">
                        <Image
                          src={teacher.photo || "/images/default-avatar.png"}
                          alt={teacher.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 truncate">
                          {teacher.name}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {teacher.position}
                        </p>
                        {teacher.subject && (
                          <p className="text-xs text-blue-600 mt-1 truncate">
                            {teacher.subject}
                          </p>
                        )}
                        {teacher.description && (
                          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                            {teacher.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
