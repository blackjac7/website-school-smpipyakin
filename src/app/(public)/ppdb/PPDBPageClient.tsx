"use client";

import { useEffect } from "react";
import Link from "next/link";
import PPDBHero from "@/components/ppdb/PPDBHero";
import PPDBInfo from "@/components/ppdb/PPDBInfo";
import toast from "react-hot-toast";

export interface PPDBStatus {
  isOpen: boolean;
  message: string;
  quota?: {
    total: number;
    registered: number;
    remaining: number;
  };
  period?: {
    start: Date | null;
    end: Date | null;
    academicYear: string;
  };
}

export function PPDBPageClient({
  ppdbStatus: _ppdbStatus,
}: {
  ppdbStatus: PPDBStatus;
}) {
  // Keep the server-provided status variable referenced (reserved for future UI improvements)
  void _ppdbStatus;

  // Set page title
  useEffect(() => {
    document.title = "PPDB - SMP IP Yakin Jakarta";
  }, []);

  const handleDownloadGuide = () => {
    // Simulate PDF download
    toast.success(
      "Panduan PPDB akan segera diunduh. File PDF akan tersimpan di folder Download Anda.",
      { duration: 5000 }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <PPDBHero />

      {/* Information Section */}
      <PPDBInfo onDownloadGuide={handleDownloadGuide} />

      {/* Registration CTA — form moved to a dedicated page */}
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl p-8 shadow">
          <h3 className="text-xl font-semibold mb-4">Ingin mendaftar?</h3>
          <p className="text-gray-600 mb-6">
            Mulai Pendaftaran — Isi formulir singkat, unggah dokumen, selesai
            dalam beberapa menit.
          </p>
          <Link
            href="/ppdb/register"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 px-6 rounded-full"
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
