"use client";

import { useState } from "react";
import PPDBStatus from "@/components/ppdb/PPDBStatus";
import PageHeader from "@/components/layout/PageHeader";
import toast from "react-hot-toast";

export default function PPDBStatusPage() {
  const [statusNISN, setStatusNISN] = useState("");

  const handleStatusCheck = async () => {
    if (!statusNISN.trim()) {
      toast.error("Silakan masukkan NISN terlebih dahulu");
      return;
    }

    try {
      const response = await fetch(
        `/api/ppdb/status?nisn=${encodeURIComponent(statusNISN)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengecek status");
      }

      if (result.success) {
        const { data } = result;
        toast.success(
          `Status NISN ${statusNISN}: ${data.statusMessage}${data.feedback ? `\n\nCatatan: ${data.feedback}` : ""}`,
          { duration: 8000 }
        );
      }
    } catch (error) {
      console.error("Status check error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengecek status"
      );
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
        <PPDBStatus
          statusNISN={statusNISN}
          onNISNChange={setStatusNISN}
          onStatusCheck={handleStatusCheck}
        />
      </div>
    </div>
  );
}
