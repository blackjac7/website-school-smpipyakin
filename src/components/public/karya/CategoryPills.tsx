"use client";

import { motion } from "framer-motion";
import {
  Palette,
  Camera,
  PenTool,
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  BookHeart,
  LayoutGrid,
  Code,
  Dumbbell,
  Scale,
  MoreHorizontal,
} from "lucide-react";

interface CategoryPillsProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", name: "Semua", icon: LayoutGrid },
  { id: "seni-budaya", name: "Seni Budaya", icon: Palette },
  { id: "bahasa-indonesia", name: "B. Indonesia", icon: BookOpen },
  { id: "bahasa-inggris", name: "B. Inggris", icon: Globe },
  { id: "matematika", name: "Matematika", icon: Calculator },
  { id: "ipa", name: "IPA", icon: Beaker },
  { id: "ips", name: "IPS", icon: Globe },
  { id: "pai", name: "Agama Islam", icon: BookHeart },
  { id: "pkn", name: "PKn", icon: Scale },
  { id: "pjok", name: "PJOK", icon: Dumbbell },
  { id: "informatika", name: "Informatika", icon: Code },
  { id: "koding", name: "Koding", icon: Code },
  { id: "prakarya", name: "Prakarya", icon: PenTool },
  { id: "fotografi", name: "Fotografi", icon: Camera },
  { id: "lainnya", name: "Lainnya", icon: MoreHorizontal },
];

export default function CategoryPills({
  selectedCategory,
  onCategoryChange,
}: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {categories.map((category) => {
        const isActive = selectedCategory === category.id;
        const Icon = category.icon;

        return (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategoryChange(category.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{category.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
