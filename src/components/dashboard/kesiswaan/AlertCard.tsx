import { AlertTriangle } from "lucide-react";

export default function AlertCard() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <div>
          <h3 className="font-medium text-yellow-800">
            Ada 12 konten menunggu persetujuan
          </h3>
          <p className="text-sm text-yellow-700">
            3 prestasi siswa, 7 kegiatan OSIS, 2 pengumuman
          </p>
        </div>
      </div>
    </div>
  );
}
