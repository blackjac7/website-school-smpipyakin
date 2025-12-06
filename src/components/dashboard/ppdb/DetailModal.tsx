"use client";

import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  School,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Applicant } from "./types";

interface DetailModalProps {
  isOpen: boolean;
  applicant: Applicant | null;
  onClose: () => void;
  onValidation: (action: string, applicant: Applicant) => void;
}

export default function DetailModal({
  isOpen,
  applicant,
  onClose,
  onValidation,
}: DetailModalProps) {
  if (!isOpen || !applicant) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Diterima":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Ditolak":
        return "bg-red-100 text-red-700 border border-red-200";
      case "Menunggu":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const documentsInfo = [
    { key: "ijazah", label: "Ijazah/SKHUN", icon: GraduationCap },
    { key: "akta", label: "Akta Kelahiran", icon: FileText },
    { key: "kk", label: "Kartu Keluarga", icon: Users },
    { key: "foto", label: "Pas Foto", icon: User },
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Detail Pendaftar</h3>
                <p className="text-amber-100 text-sm">
                  Informasi lengkap calon siswa
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Informasi Pribadi
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Nama Lengkap</p>
                        <p className="font-semibold text-gray-900">
                          {applicant.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">NISN</p>
                        <p className="font-semibold text-gray-900">
                          {applicant.nisn}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Tempat, Tanggal Lahir
                        </p>
                        <p className="font-semibold text-gray-900">
                          {applicant.birthPlace}, {applicant.birthDate}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-900 break-all">
                          {applicant.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <School className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Sekolah Asal</p>
                        <p className="font-semibold text-gray-900">
                          {applicant.previousSchool}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Alamat Lengkap</p>
                      <p className="font-semibold text-gray-900">
                        {applicant.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900">
                    Informasi Orang Tua
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Nama Orang Tua/Wali
                      </p>
                      <p className="font-semibold text-gray-900">
                        {applicant.parentName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">
                        No. Telepon Orang Tua
                      </p>
                      <p className="font-semibold text-gray-900">
                        {applicant.parentPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  Status Pendaftaran
                </h4>
                <div className="text-center">
                  <span
                    className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(applicant.status)}`}
                  >
                    {applicant.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Tanggal Daftar: {applicant.date}
                  </p>
                </div>
              </div>

              {/* Document Status */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  Status Dokumen
                </h4>
                <div className="space-y-3">
                  {documentsInfo.map(({ key, label, icon: Icon }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {label}
                        </span>
                      </div>
                      {applicant.documents[
                        key as keyof typeof applicant.documents
                      ] ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {applicant.status === "Menunggu" && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">
                    Tindakan
                  </h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => onValidation("approve", applicant)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Terima Pendaftar
                    </button>
                    <button
                      onClick={() => onValidation("reject", applicant)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <X className="w-5 h-5" />
                      Tolak Pendaftar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
