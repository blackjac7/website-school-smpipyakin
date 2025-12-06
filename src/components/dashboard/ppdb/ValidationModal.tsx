"use client";

import { X, CheckCircle, AlertTriangle, User, FileText } from "lucide-react";
import { Applicant } from "./types";
import { useState } from "react";

interface ValidationModalProps {
  isOpen: boolean;
  applicant: Applicant | null;
  validationAction: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ValidationModal({
  isOpen,
  applicant,
  validationAction,
  onClose,
  onSubmit,
}: ValidationModalProps) {
  const [note, setNote] = useState("");

  if (!isOpen || !applicant) return null;

  const isApproval = validationAction === "approve";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
    setNote("");
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div
          className={`${isApproval ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-red-500 to-red-600"} px-6 py-4 text-white`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {isApproval ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {isApproval ? "Terima Pendaftar" : "Tolak Pendaftar"}
                </h3>
                <p className="text-white/80 text-sm">
                  {isApproval
                    ? "Konfirmasi penerimaan calon siswa"
                    : "Konfirmasi penolakan calon siswa"}
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

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Applicant Info */}
            <div
              className={`${isApproval ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} rounded-xl p-4 border`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-8 h-8 ${isApproval ? "bg-green-500" : "bg-red-500"} rounded-lg flex items-center justify-center`}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Informasi Pendaftar
                  </h4>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Nama Lengkap</p>
                  <p className="font-semibold text-gray-900">
                    {applicant.name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">NISN</p>
                    <p className="font-medium text-gray-900">
                      {applicant.nisn}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nilai Rata-rata</p>
                    <p className="font-medium text-gray-900">
                      {applicant.grade}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText className="w-4 h-4" />
                Catatan {isApproval ? "Penerimaan" : "Penolakan"}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                rows={4}
                placeholder={
                  isApproval
                    ? "Selamat! Anda diterima sebagai siswa baru. Silakan lakukan daftar ulang sesuai jadwal yang ditentukan..."
                    : "Mohon maaf, pendaftaran Anda belum dapat kami terima. Silakan lengkapi dokumen yang diperlukan..."
                }
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Catatan ini akan dikirimkan kepada pendaftar melalui email
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className={`px-6 py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isApproval
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                }`}
              >
                {isApproval ? "Terima Pendaftar" : "Tolak Pendaftar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
