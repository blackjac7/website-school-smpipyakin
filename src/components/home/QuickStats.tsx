import * as LucideIcons from "lucide-react";
import type { SchoolStat } from "@prisma/client";

interface QuickStatsProps {
  stats?: SchoolStat[];
}

const fallbackStats = [
  { label: "Siswa aktif", value: "450+", iconName: "GraduationCap" },
  { label: "Guru & staf", value: "35+", iconName: "Users" },
  { label: "Berdiri sejak", value: "1974", iconName: "CalendarDays" },
  { label: "Prestasi", value: "100+", iconName: "Trophy" },
];

export default function QuickStats({ stats }: QuickStatsProps) {
  const items = stats?.length ? stats : fallbackStats;

  return (
    <section aria-label="Ringkasan sekolah" className="relative z-20 -mt-8 pb-8 sm:-mt-10">
      <div className="public-container">
        <div className="public-card grid grid-cols-2 overflow-hidden md:grid-cols-4">
          {items.map((stat, index) => {
            const Icon = resolveIcon(stat.iconName);
            return (
              <div
                key={stat.label}
                className={`flex min-h-32 flex-col justify-center p-5 sm:flex-row sm:items-center sm:gap-4 sm:p-6 ${index > 0 ? "border-l border-slate-200 dark:border-slate-700" : ""} ${index > 1 ? "border-t md:border-t-0" : ""}`}
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200 sm:mb-0">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                    {stat.value}
                  </strong>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {stat.label}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function resolveIcon(name?: string) {
  type Icon = React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  const icons = LucideIcons as unknown as Record<string, Icon>;
  return icons[name ?? ""] ?? icons.School;
}
