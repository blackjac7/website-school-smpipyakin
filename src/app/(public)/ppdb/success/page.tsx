"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  User,
  Clock,
  Download,
  Share2,
  Home,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function PPDBSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [registrationData, setRegistrationData] = useState<{
    id: string;
    nisn: string;
    name: string;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    // Get data from URL params
    const id = searchParams.get("id");
    const nisn = searchParams.get("nisn");
    const name = searchParams.get("name");
    const createdAt = searchParams.get("createdAt");

    if (!id || !nisn || !name || !createdAt) {
      // Redirect to PPDB home if no data
      router.push("/ppdb");
      return;
    }

    setRegistrationData({ id, nisn, name, createdAt });

    // Trigger confetti animation
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#4F46E5", "#7C3AED", "#EC4899"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#4F46E5", "#7C3AED", "#EC4899"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    document.title = "Pendaftaran Berhasil - PPDB SMP IP Yakin";
  }, [searchParams, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (registrationData && navigator.share) {
      try {
        await navigator.share({
          title: "Pendaftaran PPDB Berhasil",
          text: `Saya telah berhasil mendaftar PPDB SMP IP Yakin dengan NISN ${registrationData.nisn}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Pendaftaran PPDB berhasil! NISN: ${registrationData?.nisn}`
      );
      alert("Informasi berhasil disalin ke clipboard!");
    }
  };

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formattedDate = new Date(registrationData.createdAt).toLocaleDateString(
    "id-ID",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6 print:shadow-none">
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-3">Selamat! 🎉</h1>
            <p className="text-xl text-green-50">
              Pendaftaran PPDB Anda Berhasil Dikirim
            </p>
          </div>

          <div className="p-8">
            {/* Registration Details */}
            <div className="max-w-md mx-auto mb-8">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl p-8 border-4 border-indigo-200 text-center shadow-xl">
                <div className="flex justify-center mb-4">
                  <div className="bg-indigo-500 rounded-full p-3 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
                  NISN Anda
                </h3>
                <p className="text-5xl font-bold text-indigo-600 tracking-wider mb-4">
                  {registrationData.nisn}
                </p>
                <div className="bg-white/70 backdrop-blur rounded-xl p-4 mt-4">
                  <p className="text-sm text-gray-700 font-medium">
                    💡 Gunakan NISN ini untuk mengecek status pendaftaran Anda
                  </p>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informasi Pendaftar
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nama Lengkap</p>
                  <p className="font-semibold text-gray-800">
                    {registrationData.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tanggal Daftar</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-800">
                      {formattedDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-8 border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Langkah Selanjutnya
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Tunggu Verifikasi
                    </p>
                    <p className="text-sm text-gray-600">
                      Tim kami akan memverifikasi dokumen Anda dalam 2-3 hari
                      kerja
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Cek Status</p>
                    <p className="text-sm text-gray-600">
                      Pantau status pendaftaran menggunakan NISN atau Nomor
                      Pendaftaran
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Notifikasi via WhatsApp
                    </p>
                    <p className="text-sm text-gray-600">
                      Anda akan menerima update status melalui WhatsApp orang
                      tua
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                ⚠️ Catatan Penting
              </h3>
              <ul className="space-y-2 text-sm text-yellow-900">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Simpan <strong>NISN</strong> Anda dengan baik untuk mengecek
                    status pendaftaran
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Pastikan nomor WhatsApp orang tua aktif untuk menerima
                    notifikasi
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Jika ada dokumen yang perlu diperbaiki, Anda akan dihubungi
                    melalui WhatsApp
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>
                    Hasil seleksi akan diumumkan maksimal 7 hari setelah
                    pendaftaran
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Download className="w-5 h-5" />
                Cetak Bukti Pendaftaran
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Share2 className="w-5 h-5" />
                Bagikan
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 print:hidden">
          <Link
            href="/ppdb/status"
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-indigo-200"
          >
            <Search className="w-5 h-5" />
            Cek Status Pendaftaran
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-gray-200"
          >
            <Home className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            body {
              background: white !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:shadow-none {
              box-shadow: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
