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
    <div
      role="group"
      aria-label="Filter kategori berita"
      className="mx-auto mb-10 flex max-w-fit flex-wrap justify-center gap-2 rounded-full border border-slate-200 bg-white/95 p-1.5 shadow-lg shadow-slate-900/10 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95"
    >
      {categories.map(({ id, label, icon: Icon }) => {
        const isActive = activeCategory === id;
        return (
          <button
            key={id}
            onClick={() => onCategoryChange(id)}
            className={clsx(
              "focus-ring relative inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
              isActive
                ? "text-white"
                : "text-slate-700 hover:bg-slate-100 hover:text-blue-800 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-blue-200"
            )}
            aria-pressed={isActive}
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
