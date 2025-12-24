import { getPPDBStatus } from "@/actions/admin/settings";
import {
  Calendar,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

interface PPDBClosedBannerProps {
  showFull?: boolean;
}

export default async function PPDBClosedBanner({
  showFull = false,
}: PPDBClosedBannerProps) {
  const result = await getPPDBStatus();

  if (!result.success || !result.data) {
    return null;
  }

  const { isOpen, message, startDate, endDate, academicYear, remainingQuota } =
    result.data;

  // If PPDB is open and has remaining quota, don't show banner
  if (isOpen && remainingQuota > 0) {
    return null;
  }

  // Check if quota is full
  const isQuotaFull = isOpen && remainingQuota <= 0;

  if (showFull) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className={`p-4 rounded-full ${
                isQuotaFull
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-orange-100 dark:bg-orange-900/30"
              }`}
            >
              {isQuotaFull ? (
                <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
              ) : (
                <Calendar className="w-12 h-12 text-orange-600 dark:text-orange-400" />
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isQuotaFull
              ? "Kuota Pendaftaran Penuh"
              : "Pendaftaran PPDB Belum Dibuka"}
          </h1>

          {/* Academic Year */}
          <p className="text-lg text-primary-600 dark:text-primary-400 font-medium mb-4">
            Tahun Ajaran {academicYear}
          </p>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>

          {/* Date Info */}
          {startDate && !isQuotaFull && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
              <div className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-200">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Jadwal Pendaftaran</span>
              </div>
              <div className="mt-2 text-blue-700 dark:text-blue-300">
                <p>
                  Mulai:{" "}
                  {new Date(startDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {endDate && (
                  <p>
                    Berakhir:{" "}
                    {new Date(endDate).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Untuk informasi lebih lanjut, silakan hubungi:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:0215403540"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <Phone className="w-4 h-4" />
                (021) 5403540
              </a>
              <a
                href="mailto:info@smpipyakin.sch.id"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <Mail className="w-4 h-4" />
                info@smpipyakin.sch.id
              </a>
            </div>
          </div>

          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // Compact banner version
  return (
    <div
      className={`p-4 rounded-lg border ${
        isQuotaFull
          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      }`}
    >
      <div className="flex items-start gap-3">
        {isQuotaFull ? (
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        ) : (
          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
        )}
        <div>
          <p
            className={`font-medium ${
              isQuotaFull
                ? "text-red-800 dark:text-red-200"
                : "text-yellow-800 dark:text-yellow-200"
            }`}
          >
            {isQuotaFull
              ? "Kuota Pendaftaran Penuh"
              : "Pendaftaran Belum Dibuka"}
          </p>
          <p
            className={`text-sm mt-1 ${
              isQuotaFull
                ? "text-red-700 dark:text-red-300"
                : "text-yellow-700 dark:text-yellow-300"
            }`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
