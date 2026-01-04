"use client";

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Mail,
  Phone,
  School,
  Download,
} from "lucide-react";

interface StatusDetailProps {
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  name: string;
  nisn: string;
  submittedAt: string;
  documentsCount: number;
  feedback?: string;
  documents?: Array<{
    type: string;
    url: string;
  }>;
}

export default function PPDBStatusDetail({
  status,
  name,
  nisn,
  submittedAt,
  documentsCount,
  feedback,
  documents,
}: StatusDetailProps) {
  const statusConfig = {
    PENDING: {
      color: "yellow",
      bgGradient: "from-yellow-50 to-amber-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      icon: Clock,
      title: "Sedang Diproses",
      message:
        "Pendaftaran Anda sedang dalam tahap verifikasi dokumen oleh tim kami.",
      estimasi: "Estimasi waktu: 2-3 hari kerja",
    },
    ACCEPTED: {
      color: "green",
      bgGradient: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      icon: CheckCircle2,
      title: "Diterima",
      message: "Selamat! Pendaftaran Anda telah DITERIMA.",
      estimasi: "Silakan lakukan daftar ulang tanggal 16-20 Juli 2025",
    },
    REJECTED: {
      color: "red",
      bgGradient: "from-red-50 to-rose-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      icon: AlertTriangle,
      title: "Perlu Perbaikan",
      message:
        "Ada dokumen atau informasi yang perlu dilengkapi atau diperbaiki.",
      estimasi: "Silakan hubungi admin untuk informasi lebih lanjut",
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const formattedDate = new Date(submittedAt).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const documentTypeLabels: Record<string, string> = {
    ijazah: "Ijazah/SKHUN SD",
    aktaKelahiran: "Akta Kelahiran",
    kartuKeluarga: "Kartu Keluarga",
    pasFoto: "Pas Foto",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Status Header */}
      <div
        className={`bg-gradient-to-r ${config.bgGradient} rounded-3xl shadow-2xl overflow-hidden mb-8 border-4 ${config.borderColor}`}
      >
        <div className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className={`${config.iconBg} rounded-full p-4 shadow-lg`}>
              <StatusIcon className={`w-16 h-16 ${config.iconColor}`} />
            </div>
          </div>
          <h2 className={`text-4xl font-bold mb-3 ${config.textColor}`}>
            {config.title}
          </h2>
          <p className="text-lg text-gray-700 mb-2">{config.message}</p>
          <p className="text-sm text-gray-600 font-medium">{config.estimasi}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Personal Info */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="w-6 h-6 text-indigo-600" />
            Informasi Pendaftar
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Nama Lengkap</p>
                <p className="font-semibold text-gray-800 text-lg">{name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">NISN</p>
                <p className="font-semibold text-gray-800 text-lg">{nisn}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Tanggal Pendaftaran</p>
                <p className="font-semibold text-gray-800">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Ringkasan
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200">
              <p className="text-sm text-indigo-600 mb-1">Status</p>
              <p className={`font-bold text-lg ${config.textColor}`}>
                {config.title}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
              <p className="text-sm text-purple-600 mb-1">Dokumen</p>
              <p className="font-bold text-lg text-purple-800">
                {documentsCount} / 4
              </p>
              <p className="text-xs text-purple-600 mt-1">Dokumen terupload</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section (if any) */}
      {feedback && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6 text-indigo-600" />
            Catatan dari Tim Panitia
          </h3>
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
            <p className="text-gray-700 leading-relaxed">{feedback}</p>
          </div>
        </div>
      )}

      {/* Documents Section */}
      {documents && documents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Dokumen yang Telah Diunggah
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {documentTypeLabels[doc.type] || doc.type}
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Terupload
                    </p>
                  </div>
                </div>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  title="Lihat dokumen"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline/Next Steps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          Tahapan Seleksi
        </h3>
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Steps */}
          <div className="space-y-6">
            <div className="relative flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold z-10">
                ✓
              </div>
              <div className="pb-6">
                <p className="font-semibold text-gray-800">
                  Pendaftaran Diterima
                </p>
                <p className="text-sm text-gray-600">
                  Formulir dan dokumen telah diterima sistem
                </p>
              </div>
            </div>

            <div className="relative flex gap-4">
              <div
                className={`flex-shrink-0 w-8 h-8 ${
                  status === "PENDING" || status === "ACCEPTED"
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                } text-white rounded-full flex items-center justify-center font-bold z-10`}
              >
                {status === "PENDING" || status === "ACCEPTED" ? "⏳" : "2"}
              </div>
              <div className="pb-6">
                <p className="font-semibold text-gray-800">
                  Verifikasi Dokumen
                </p>
                <p className="text-sm text-gray-600">
                  Tim panitia sedang memverifikasi kelengkapan dokumen
                </p>
              </div>
            </div>

            <div className="relative flex gap-4">
              <div
                className={`flex-shrink-0 w-8 h-8 ${
                  status === "ACCEPTED"
                    ? "bg-green-500"
                    : status === "REJECTED"
                      ? "bg-red-500"
                      : "bg-gray-300"
                } text-white rounded-full flex items-center justify-center font-bold z-10`}
              >
                {status === "ACCEPTED"
                  ? "✓"
                  : status === "REJECTED"
                    ? "⚠"
                    : "3"}
              </div>
              <div className="pb-6">
                <p className="font-semibold text-gray-800">Pengumuman Hasil</p>
                <p className="text-sm text-gray-600">
                  {status === "ACCEPTED"
                    ? "Selamat! Anda diterima sebagai siswa baru"
                    : status === "REJECTED"
                      ? "Dokumen perlu dilengkapi atau diperbaiki"
                      : "Menunggu keputusan panitia"}
                </p>
              </div>
            </div>

            {status === "ACCEPTED" && (
              <div className="relative flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold z-10">
                  4
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Daftar Ulang</p>
                  <p className="text-sm text-gray-600">
                    Lakukan daftar ulang pada tanggal yang telah ditentukan
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Help Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Butuh Bantuan?</h3>
        <p className="text-gray-700 mb-4">
          Jika Anda memiliki pertanyaan atau memerlukan bantuan, silakan hubungi
          kami melalui:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
            <Phone className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-600">Telepon</p>
              <p className="font-semibold text-gray-800">0812-3456-7890</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
            <Mail className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-600">Email</p>
              <p className="font-semibold text-gray-800">
                ppdb@smpipyakin.sch.id
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
            <School className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs text-gray-600">Datang Langsung</p>
              <p className="font-semibold text-gray-800">
                Senin - Jumat 08:00 - 15:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
