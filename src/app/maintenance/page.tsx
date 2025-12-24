import { Metadata } from "next";
import { Shield, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pemeliharaan | SMP IP Yakin Jakarta",
  description: "Website sedang dalam pemeliharaan",
};

interface MaintenancePageProps {
  searchParams: Promise<{ message?: string }>;
}

export default async function MaintenancePage({
  searchParams,
}: MaintenancePageProps) {
  const { message } = await searchParams;
  const displayMessage =
    message ||
    "Website sedang dalam pemeliharaan. Silakan kembali beberapa saat lagi.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <Shield className="w-12 h-12 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sedang Dalam Pemeliharaan
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {displayMessage}
        </p>

        {/* Estimated Time */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-8">
          <Clock className="w-4 h-4" />
          <span>Kami akan segera kembali</span>
        </div>

        {/* Contact Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Jika Anda membutuhkan bantuan segera, silakan hubungi:
          </p>
          <p className="mt-2 font-medium text-gray-900 dark:text-white">
            (021) 5403540
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            info@smpipyakin.sch.id
          </p>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Coba kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
