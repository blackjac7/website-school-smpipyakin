"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  getLatenessPointSettings,
  updateLatenessPointSettings,
} from "@/actions/lateness";

interface KesiswaanSettings {
  autoApproveNational: boolean;
  emailNotifications: boolean;
}

const SETTINGS_KEY = "kesiswaan-settings";

const defaultSettings: KesiswaanSettings = {
  autoApproveNational: false,
  emailNotifications: true,
};

export default function SettingsContent() {
  const [settings, setSettings] = useState<KesiswaanSettings>(defaultSettings);
  const [isMounted, setIsMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  // Save settings to localStorage
  const updateSetting = (key: keyof KesiswaanSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    toast.success("Pengaturan berhasil disimpan");
  };

  // Lateness point settings (server/DB-backed, not localStorage, so the
  // threshold is actually enforced when calculating points server-side)
  const [pointThreshold, setPointThreshold] = useState(3);
  const [pointsPerThreshold, setPointsPerThreshold] = useState(2);
  const [isLoadingPointSettings, setIsLoadingPointSettings] = useState(true);
  const [isSavingPointSettings, setIsSavingPointSettings] = useState(false);

  useEffect(() => {
    async function fetchPointSettings() {
      setIsLoadingPointSettings(true);
      const result = await getLatenessPointSettings();
      if (result.success && result.data) {
        setPointThreshold(result.data.threshold);
        setPointsPerThreshold(result.data.pointsPerThreshold);
      }
      setIsLoadingPointSettings(false);
    }
    fetchPointSettings();
  }, []);

  const handleSavePointSettings = async () => {
    setIsSavingPointSettings(true);
    const result = await updateLatenessPointSettings(
      pointThreshold,
      pointsPerThreshold,
    );
    if (result.success) {
      toast.success(result.message || "Pengaturan berhasil disimpan");
    } else {
      toast.error(result.error || "Gagal menyimpan pengaturan");
    }
    setIsSavingPointSettings(false);
  };

  if (!isMounted) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pengaturan Validasi
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">
                Auto-approval untuk prestasi tingkat nasional
              </h4>
              <p className="text-sm text-gray-600">
                Otomatis menyetujui prestasi tingkat nasional dan internasional
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.autoApproveNational}
                onChange={(e) =>
                  updateSetting("autoApproveNational", e.target.checked)
                }
                aria-label="Auto-approval untuk prestasi tingkat nasional"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">
                Notifikasi email untuk konten pending
              </h4>
              <p className="text-sm text-gray-600">
                Kirim email reminder untuk konten yang belum divalidasi
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  updateSetting("emailNotifications", e.target.checked)
                }
                aria-label="Notifikasi email untuk konten pending"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Catatan:</strong> Pengaturan ini disimpan di browser Anda
            dan akan tetap aktif saat Anda login kembali.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Pengaturan Poin Keterlambatan
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Atur berapa kali akumulasi keterlambatan siswa untuk mendapat poin
          pelanggaran. Poin dihitung berdasarkan total keterlambatan siswa
          sepanjang masa (tidak pernah reset).
        </p>

        {isLoadingPointSettings ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat pengaturan...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pointThreshold"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Akumulasi keterlambatan (x kali)
                </label>
                <input
                  id="pointThreshold"
                  type="number"
                  min={1}
                  value={pointThreshold}
                  onChange={(e) =>
                    setPointThreshold(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="pointsPerThreshold"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Poin yang didapat
                </label>
                <input
                  id="pointsPerThreshold"
                  type="number"
                  min={0}
                  value={pointsPerThreshold}
                  onChange={(e) =>
                    setPointsPerThreshold(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">
                Contoh: siswa yang terlambat <strong>{pointThreshold}x</strong>{" "}
                akan mendapat <strong>{pointsPerThreshold} poin</strong>,
                terlambat {pointThreshold * 2}x akan mendapat{" "}
                {pointsPerThreshold * 2} poin, dan seterusnya.
              </p>
            </div>

            <button
              onClick={handleSavePointSettings}
              disabled={isSavingPointSettings}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSavingPointSettings && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Simpan Pengaturan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
