"use client";

import { useState } from "react";
import { Clock, History } from "lucide-react";
import PendingActivitiesList from "./PendingActivitiesList";
import ActivityHistoryList from "./ActivityHistoryList";

interface OsisActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  budget: number;
  participants: number;
  organizer: string;
  status: string;
  author?: {
    username: string;
  };
}

interface DashboardClientProps {
  pendingActivities: OsisActivity[];
  historyActivities: OsisActivity[];
}

export default function DashboardClient({ 
  pendingActivities, 
  historyActivities 
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");

  return (
    <div className="container mx-auto p-6 space-y-8 min-h-screen bg-gray-50/50">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Dashboard Pembina OSIS
        </h1>
        <p className="text-gray-500">
          Kelola dan validasi proposal program kerja dari OSIS
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white text-card-foreground">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <h3 className="tracking-tight text-sm font-medium opacity-90">
              Menunggu Validasi
            </h3>
            <Clock className="h-4 w-4 opacity-75" />
          </div>
          <div>
            <div className="text-3xl font-bold">{pendingActivities.length}</div>
            <p className="text-xs opacity-75 mt-1">Proposal baru</p>
          </div>
        </div>
        <div className="rounded-xl border bg-white shadow-sm p-6 text-card-foreground">
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <h3 className="tracking-tight text-sm font-medium text-gray-600">
              Total Diproses
            </h3>
            <History className="h-4 w-4 text-gray-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {historyActivities.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">Disetujui/Ditolak</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="grid w-full grid-cols-2 max-w-[400px] mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-sm font-medium transition-all ${
              activeTab === "pending"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Clock className="w-4 h-4" />
            Menunggu Validasi
            {pendingActivities.length > 0 && (
              <span className="ml-1 rounded-full bg-blue-100 text-blue-600 px-2 py-0.5 text-xs font-bold">
                {pendingActivities.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center justify-center gap-2 rounded-md py-2 px-3 text-sm font-medium transition-all ${
              activeTab === "history"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat
          </button>
        </div>

        {activeTab === "pending" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <PendingActivitiesList activities={pendingActivities} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ActivityHistoryList activities={historyActivities} />
          </div>
        )}
      </div>
    </div>
  );
}
