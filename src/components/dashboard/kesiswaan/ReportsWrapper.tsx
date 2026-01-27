"use client";

import { useState } from "react";
import { Clock, FileText } from "lucide-react";
import { ReportStats } from "./types";
import LatenessReportsContent from "./LatenessReportsContent";
import ReportsContent from "./ReportsContent";
import { motion, AnimatePresence } from "framer-motion";

interface ReportsWrapperProps {
  reportStats: ReportStats;
}

type Tab = "lateness" | "general";

export default function ReportsWrapper({ reportStats }: ReportsWrapperProps) {
  const [activeTab, setActiveTab] = useState<Tab>("lateness");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 flex space-x-1 w-full md:w-fit">
        <button
          onClick={() => setActiveTab("lateness")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "lateness"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Clock className="w-4 h-4" />
          Keterlambatan
        </button>
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === "general"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          Validasi & Umum
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "lateness" ? (
            <LatenessReportsContent />
          ) : (
            <ReportsContent reportStats={reportStats} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
