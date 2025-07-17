"use client";

import { X } from "lucide-react";
import { Applicant } from "./types";

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
  if (!isOpen || !applicant) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {validationAction === "approve"
              ? "Terima Pendaftar"
              : "Tolak Pendaftar"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Pendaftar:</p>
            <p className="font-medium">{applicant.name}</p>
            <p className="text-sm text-gray-600">NISN: {applicant.nisn}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan{" "}
              {validationAction === "approve" ? "Penerimaan" : "Penolakan"}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              rows={4}
              placeholder={`Berikan catatan untuk ${validationAction === "approve" ? "penerimaan" : "penolakan"} pendaftar...`}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg transition-colors ${
                validationAction === "approve"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {validationAction === "approve" ? "Terima" : "Tolak"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
