"use client";

import { Award, Users } from "lucide-react";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", label: "Semua", icon: null },
  { id: "achievement", label: "Prestasi", icon: Award },
  { id: "activity", label: "Kegiatan", icon: Users },
];

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-8 justify-center">
      {categories.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onCategoryChange(id)}
          className={`inline-flex items-center px-4 py-2 rounded-full transition-colors cursor-pointer ${
            activeCategory === id
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-orange-500 hover:text-white"
          }`}
        >
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {label}
        </button>
      ))}
    </div>
  );
}
