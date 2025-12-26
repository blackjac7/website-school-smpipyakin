"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { motion, Variants } from "framer-motion";
import { SchoolStat } from "@prisma/client";

interface QuickStatsProps {
  stats?: SchoolStat[];
}

const defaultStats = [
  {
    label: "Siswa Aktif",
    value: "450+",
    iconName: "GraduationCap",
  },
  {
    label: "Guru Berkualitas",
    value: "23",
    iconName: "Users",
  },
  {
    label: "Prestasi",
    value: "120+",
    iconName: "Award",
  },
  {
    label: "Ekstrakurikuler",
    value: "9",
    iconName: "Activity",
  },
];

function useCountUp(targetStr: string, duration = 800) {
  const [display, setDisplay] = React.useState<string>(targetStr);

  React.useEffect(() => {
    // Parse numeric part and suffix
    const match = String(targetStr).match(/^([\d,]+)(\D*)$/);
    if (!match) {
      setDisplay(targetStr);
      return;
    }
    const numStr = match[1].replace(/,/g, "");
    const suffix = match[2] || "";
    const target = parseInt(numStr, 10);
    if (Number.isNaN(target)) {
      setDisplay(targetStr);
      return;
    }

    let rafId: number;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const current = Math.round(target * t);
      // Add thousand separators
      const formatted = current
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      setDisplay(`${formatted}${suffix}`);
      if (t < 1) rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [targetStr, duration]);

  return display;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 12,
    },
  },
};

// Safe icon renderer (falls back to LayoutGrid)
function RenderIcon({ name }: { name?: string }) {
  type IconComponent = React.ComponentType<{ className?: string }>;
  const lucideIcons = LucideIcons as unknown as Record<string, IconComponent>;
  const Icon = name ? lucideIcons[name] : undefined;
  const Component = Icon ?? lucideIcons["LayoutGrid"];
  return <Component className="w-6 h-6 text-white" />;
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const displayStats =
    stats && stats.length > 0
      ? stats.map((s) => ({
          label: s.label,
          value: s.value,
          iconName: s.iconName,
        }))
      : defaultStats;

  return (
    <section className="relative -mt-20 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
      >
        {displayStats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </motion.div>
    </section>
  );
}

function StatCard({
  stat,
}: {
  stat: { label: string; value: string; iconName?: string };
}) {
  const displayValue = useCountUp(stat.value, 900);

  return (
    <motion.div
      variants={item}
      className="group bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg dark:shadow-black/40 hover:shadow-2xl hover:-translate-y-1 transform-gpu transition-all duration-300 border border-gray-100 dark:border-gray-700"
      style={{ willChange: "transform" }}
    >
      <div className="flex items-center justify-center mb-4 w-fit mx-auto">
        <div className="rounded-full p-3 bg-gradient-to-br from-yellow-500 to-amber-500 shadow-md flex items-center justify-center w-12 h-12 group-hover:scale-105 transition-transform">
          <RenderIcon name={stat.iconName} />
        </div>
      </div>

      <div className="text-center">
        <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {displayValue}
        </div>
        <div className="text-gray-500 dark:text-gray-300 font-medium uppercase tracking-wider text-sm mt-1">
          {stat.label}
        </div>
      </div>
    </motion.div>
  );
}
