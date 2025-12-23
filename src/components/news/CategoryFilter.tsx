"use client";

import { Award, Users, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", label: "Semua Berita", icon: LayoutGrid },
  { id: "achievement", label: "Prestasi", icon: Award },
  { id: "activity", label: "Kegiatan", icon: Users },
];

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-full shadow-sm max-w-fit mx-auto mb-10">
      {categories.map(({ id, label, icon: Icon }) => {
        const isActive = activeCategory === id;
        return (
          <button
            key={id}
            onClick={() => onCategoryChange(id)}
            className={clsx(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              isActive
                ? "text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-blue-600 rounded-full shadow-md"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
