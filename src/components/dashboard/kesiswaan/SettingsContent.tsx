"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Catatan:</strong> Pengaturan ini disimpan di browser Anda dan
          akan tetap aktif saat Anda login kembali.
        </p>
      </div>
    </div>
  );
}
