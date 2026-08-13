"use client";

import { useState } from "react";
import { Clock, FileText, Shirt } from "lucide-react";
import { ReportStats } from "./types";
import LatenessReportsContent from "./LatenessReportsContent";
import AttributeReportsContent from "./AttributeReportsContent";
import ReportsContent from "./ReportsContent";
import { motion, AnimatePresence } from "framer-motion";

interface ReportsWrapperProps {
  reportStats: ReportStats;
}

type Tab = "lateness" | "attribute" | "general";

export default function ReportsWrapper({ reportStats }: ReportsWrapperProps) {
  const [activeTab, setActiveTab] = useState<Tab>("lateness");

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Tab Navigation */}
      <div role="tablist" aria-label="Jenis laporan" className="sticky top-0 z-20 grid w-full grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur md:w-fit">
        <button
          type="button"
          role="tab"
          id="report-tab-lateness"
          aria-selected={activeTab === "lateness"}
          aria-controls="report-panel"
          onClick={() => setActiveTab("lateness")}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate rounded-xl px-2 py-2.5 text-xs font-bold transition sm:gap-2 sm:px-5 sm:text-sm md:flex-none ${
            activeTab === "lateness"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Clock className="w-4 h-4 shrink-0" />
          <span className="truncate">Keterlambatan</span>
        </button>
        <button
          type="button"
          role="tab"
          id="report-tab-attribute"
          aria-selected={activeTab === "attribute"}
          aria-controls="report-panel"
          onClick={() => setActiveTab("attribute")}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate rounded-xl px-2 py-2.5 text-xs font-bold transition sm:gap-2 sm:px-5 sm:text-sm md:flex-none ${
            activeTab === "attribute"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Shirt className="w-4 h-4 shrink-0" />
          <span className="truncate">Atribut</span>
        </button>
        <button
          type="button"
          role="tab"
          id="report-tab-general"
          aria-selected={activeTab === "general"}
          aria-controls="report-panel"
          onClick={() => setActiveTab("general")}
          className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate rounded-xl px-2 py-2.5 text-xs font-bold transition sm:gap-2 sm:px-5 sm:text-sm md:flex-none ${
            activeTab === "general"
              ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="truncate">Validasi & Umum</span>
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          id="report-panel"
          role="tabpanel"
          aria-labelledby={`report-tab-${activeTab}`}
          tabIndex={0}
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {activeTab === "lateness" ? (
            <LatenessReportsContent />
          ) : activeTab === "attribute" ? (
            <AttributeReportsContent />
          ) : (
            <ReportsContent reportStats={reportStats} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
