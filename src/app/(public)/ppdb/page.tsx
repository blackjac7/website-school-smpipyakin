import { Metadata } from "next";
import { getPPDBStatus } from "@/actions/admin/settings";
import PPDBClosedBanner from "@/components/ppdb/PPDBClosedBanner";
import { PPDBPageClient, type PPDBStatus } from "./PPDBPageClient";

export const metadata: Metadata = {
  title: "PPDB - Penerimaan Peserta Didik Baru | SMP IP Yakin Jakarta",
  description:
    "Daftar menjadi siswa baru SMP IP Yakin Jakarta. Informasi lengkap mengenai persyaratan, jadwal, dan tata cara pendaftaran peserta didik baru.",
  keywords:
    "PPDB SMP IP Yakin, pendaftaran siswa baru, sekolah SMP Jakarta, PPDB online",
};

export default async function PPDBPage() {
  const ppdbStatus = await getPPDBStatus();

  // Check if PPDB is closed
  if (ppdbStatus.success && ppdbStatus.data) {
    const {
      isOpen,
      remainingQuota,
      registeredCount,
      quota,
      academicYear,
      startDate,
      endDate,
    } = ppdbStatus.data;

    // If PPDB is closed or quota is full, show closed banner
    if (!isOpen || remainingQuota <= 0) {
      return <PPDBClosedBanner showFull />;
    }

    // Transform data for client component
    const clientStatus: PPDBStatus = {
      isOpen,
      message: isOpen
        ? "Pendaftaran PPDB sedang dibuka"
        : "Pendaftaran PPDB ditutup",
      quota: {
        total: quota,
        registered: registeredCount,
        remaining: remainingQuota,
      },
      period: {
        start: startDate ? new Date(startDate) : null,
        end: endDate ? new Date(endDate) : null,
        academicYear,
      },
    };

    return <PPDBPageClient ppdbStatus={clientStatus} />;
  }

  // Fallback if status check failed - show form with default status
  const defaultStatus: PPDBStatus = {
    isOpen: true,
    message: "Pendaftaran PPDB",
  };

  return <PPDBPageClient ppdbStatus={defaultStatus} />;
}
