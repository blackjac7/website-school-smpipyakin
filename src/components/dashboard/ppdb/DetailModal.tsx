"use client";

import { X, Check } from "lucide-react";
import { Applicant } from "./types";

interface DetailModalProps {
  isOpen: boolean;
  applicant: Applicant | null;
  onClose: () => void;
  onValidation: (action: string, applicant: Applicant) => void;
}

/**
 * DetailModal component.
 * Displays detailed information about a PPDB applicant, including personal info, parent info, grades, and document status.
 * Allows validation (approve/reject) if the status is "Menunggu".
 * @param {DetailModalProps} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Applicant | null} props.applicant - The applicant to display details for.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {function} props.onValidation - Callback function to handle validation actions.
 * @returns {JSX.Element | null} The rendered DetailModal component or null if not open.
 */
export default function DetailModal({
  isOpen,
  applicant,
  onClose,
  onValidation,
}: DetailModalProps) {
  if (!isOpen || !applicant) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Detail Pendaftar
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Informasi Pribadi
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nama Lengkap:</span>
                  <p className="font-medium">{applicant.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">NISN:</span>
                  <p className="font-medium">{applicant.nisn}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tempat, Tanggal Lahir:</span>
                  <p className="font-medium">
                    {applicant.birthPlace}, {applicant.birthDate}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{applicant.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">No. Telepon:</span>
                  <p className="font-medium">{applicant.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Sekolah Asal:</span>
                  <p className="font-medium">{applicant.previousSchool}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Alamat:</span>
                  <p className="font-medium">{applicant.address}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Informasi Orang Tua
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nama Orang Tua:</span>
                  <p className="font-medium">{applicant.parentName}</p>
                </div>
                <div>
                  <span className="text-gray-600">No. Telepon:</span>
                  <p className="font-medium">{applicant.parentPhone}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Nilai Akademik
              </h4>
              <div className="text-sm">
                <span className="text-gray-600">Rata-rata Nilai:</span>
                <p className="text-2xl font-bold text-gray-900">
                  {applicant.grade}
                </p>
              </div>
            </div>
          </div>

          {/* Documents & Actions */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Status Dokumen
              </h4>
              <div className="space-y-2 text-sm">
                {Object.entries(applicant.documents).map(([doc, status]) => (
                  <div key={doc} className="flex items-center justify-between">
                    <span className="text-gray-600 capitalize">{doc}:</span>
                    {status ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">
                Status Saat Ini
              </h4>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${applicant.statusColor}`}
              >
                {applicant.status}
              </span>
            </div>

            {applicant.status === "Menunggu" && (
              <div className="space-y-3">
                <button
                  onClick={() => onValidation("approve", applicant)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Terima Pendaftar
                </button>
                <button
                  onClick={() => onValidation("reject", applicant)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Tolak Pendaftar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
