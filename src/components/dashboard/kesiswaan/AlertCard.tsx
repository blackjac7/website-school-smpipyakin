import { AlertTriangle } from "lucide-react";

interface AlertCardProps {
  count?: number;
}

export default function AlertCard({ count = 0 }: AlertCardProps) {
  if (count === 0) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <div>
          <h3 className="font-medium text-yellow-800">
            Ada {count} konten menunggu persetujuan
          </h3>
          <p className="text-sm text-yellow-700">
            Segera tinjau konten untuk dipublikasikan.
          </p>
        </div>
      </div>
    </div>
  );
}
