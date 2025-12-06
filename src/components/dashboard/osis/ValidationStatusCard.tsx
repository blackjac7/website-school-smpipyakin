"use client";

import { Info, Check, X } from "lucide-react";
import { ValidationStatus } from "./types";

interface ValidationStatusCardProps {
  validationStatus: ValidationStatus[];
}

/**
 * ValidationStatusCard component.
 * Displays the validation status of OSIS activities.
 * @param {ValidationStatusCardProps} props - The component props.
 * @param {ValidationStatus[]} props.validationStatus - Array of validation statuses to display.
 * @returns {JSX.Element} The rendered ValidationStatusCard component.
 */
export default function ValidationStatusCard({
  validationStatus,
}: ValidationStatusCardProps) {
  const getIcon = (label: string) => {
    switch (label) {
      case "Menunggu Review":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "Disetujui":
        return <Check className="w-4 h-4 text-green-500" />;
      case "Ditolak":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Status Validasi Kesiswaan
      </h3>
      <div className="space-y-3">
        {validationStatus.map((status, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{status.label}</span>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
              >
                {status.count} kegiatan
              </span>
              {getIcon(status.label)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
