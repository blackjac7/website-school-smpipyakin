"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Mic2, Layers } from "lucide-react";

import MenstruationTab from "@/components/dashboard/osis/worship/MenstruationTab";
import AdzanTab from "@/components/dashboard/osis/worship/AdzanTab";
import CarpetTab from "@/components/dashboard/osis/worship/CarpetTab";
import ExportButton from "@/components/dashboard/osis/worship/ExportButton";

interface PageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  menstruationRecords: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adzanSchedules: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  carpetSchedules: any[];
  onRefresh?: () => void;
}

// Separate client component to handle tabs and interactivity
export default function ReligiousDashboardClient({
  menstruationRecords,
  adzanSchedules,
  carpetSchedules,
  onRefresh
}: PageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "menstruation";

  const tabs = [
    {
      id: "menstruation",
      label: "Absensi Sholat Putri",
      icon: Heart,
      color: "text-pink-600",
      bg: "bg-pink-100",
    },
    {
      id: "adzan",
      label: "Jadwal Adzan",
      icon: Mic2,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      id: "carpet",
      label: "Jadwal Karpet",
      icon: Layers,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
  ];

  const handleTabChange = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Determine which data to export
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exportData: any[] = [];
  let exportType: "MENSTRUATION" | "ADZAN" | "CARPET" = "MENSTRUATION";

  if (activeTab === "menstruation") {
    exportData = menstruationRecords;
    exportType = "MENSTRUATION";
  } else if (activeTab === "adzan") {
    exportData = adzanSchedules;
    exportType = "ADZAN";
  } else {
    exportData = carpetSchedules;
    exportType = "CARPET";
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
                ${activeTab === tab.id ? "text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}
              `}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative z-10 flex items-center gap-2`}>
                <tab.icon
                  size={16}
                  className={activeTab === tab.id ? tab.color : ""}
                />
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <ExportButton
          data={exportData}
          filename={`Laporan_${activeTab === 'menstruation' ? 'Absensi_Sholat_Putri' : activeTab}`}
          type={exportType}
        />
      </div>

      {/* Content */}
      <div className="min-h-125">
        {activeTab === "menstruation" && (
          <MenstruationTab records={menstruationRecords} onRefresh={onRefresh} />
        )}
        {activeTab === "adzan" && <AdzanTab schedules={adzanSchedules} onRefresh={onRefresh} />}
        {activeTab === "carpet" && <CarpetTab schedules={carpetSchedules} onRefresh={onRefresh} />}
      </div>
    </div>
  );
}
