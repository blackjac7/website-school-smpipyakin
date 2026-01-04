"use client";

import { useState } from "react";
import PPDBStatus from "@/components/ppdb/PPDBStatus";
import PPDBStatusDetail from "@/components/ppdb/PPDBStatusDetail";
import PageHeader from "@/components/layout/PageHeader";
import toast from "react-hot-toast";

interface StatusData {
  nisn: string;
  name: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  statusMessage: string;
  feedback?: string;
  submittedAt: string;
  documentsCount: number;
  documents: Array<{
    type: string;
    url: string;
  }>;
}

export default function PPDBStatusPage() {
  const [statusNISN, setStatusNISN] = useState("");
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusCheck = async () => {
    if (!statusNISN.trim()) {
      toast.error("Silakan masukkan NISN terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setStatusData(null);

    try {
      const response = await fetch(
        `/api/ppdb/status?nisn=${encodeURIComponent(statusNISN)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengecek status");
      }

      if (result.success) {
        setStatusData(result.data);
        toast.success("Status pendaftaran ditemukan!");
      }
    } catch (error) {
      console.error("Status check error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengecek status"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Cek Status Pendaftaran"
        description="Pantau perkembangan pendaftaran Anda secara real-time"
        breadcrumbs={[
          { label: "PPDB", href: "/ppdb" },
          { label: "Cek Status", href: "/ppdb/status" },
        ]}
        image="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1920&auto=format&fit=crop"
      />

      {/* Adjusting the margin to overlap the header slightly like other pages */}
      <div className="-mt-10 relative z-10">
        {!statusData ? (
          <PPDBStatus
            statusNISN={statusNISN}
            onNISNChange={setStatusNISN}
            onStatusCheck={handleStatusCheck}
            isLoading={isLoading}
          />
        ) : (
          <div>
            <PPDBStatusDetail
              status={statusData.status}
              name={statusData.name}
              nisn={statusData.nisn}
              submittedAt={statusData.submittedAt}
              documentsCount={statusData.documentsCount}
              feedback={statusData.feedback}
              documents={statusData.documents}
            />
            {/* Button to check another NISN */}
            <div className="max-w-5xl mx-auto px-4 pb-8">
              <button
                onClick={() => {
                  setStatusData(null);
                  setStatusNISN("");
                }}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
              >
                Cek NISN Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
