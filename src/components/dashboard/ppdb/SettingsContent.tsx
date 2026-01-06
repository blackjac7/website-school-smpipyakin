"use client";

import {
  Settings,
  Calendar,
  FileText,
  Bell,
  Shield,
  Save,
  Clock,
  Mail,
  Database,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import FileInput from "@/components/shared/FileInput";

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState("general");
  const [guideFile, setGuideFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentGuideUrl, setCurrentGuideUrl] = useState("");
  const [settings, setSettings] = useState({
    registrationPeriod: {
      startDate: "2025-01-01",
      endDate: "2025-03-31",
      isActive: true,
    },
    requirements: {
      minGrade: 70,
      maxAge: 15,
      requiredDocuments: ["ijazah", "akta", "kk", "foto", "raport"],
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      autoReply: true,
    },
    system: {
      maxApplicants: 500,
      autoBackup: true,
      dataRetention: 365,
    },
  });

  const tabs = [
    { id: "general", label: "Umum", icon: Settings },
    { id: "registration", label: "Pendaftaran", icon: Calendar },
    { id: "requirements", label: "Persyaratan", icon: FileText },
    { id: "guide", label: "Panduan PPDB", icon: BookOpen },
    { id: "notifications", label: "Notifikasi", icon: Bell },
    { id: "system", label: "Sistem", icon: Database },
  ];

  const handleSave = async () => {
    // Upload guide file if exists
    if (guideFile && activeTab === "guide") {
      setUploading(true);
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", guideFile);
        uploadFormData.append("folder", "guides");
        uploadFormData.append("fileType", "guide");

        const response = await fetch("/api/upload-files", {
          method: "POST",
          body: uploadFormData,
        });

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || "Upload gagal");
        }

        setCurrentGuideUrl(result.data.url);
        setGuideFile(null);
        toast.success("Panduan berhasil diupload");
      } catch {
        toast.error("Gagal upload panduan");
      } finally {
        setUploading(false);
      }
    } else {
      toast.success("Pengaturan berhasil disimpan");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Pengaturan PPDB</h3>
        </div>
        <p className="text-gray-700">
          Konfigurasi sistem penerimaan peserta didik baru sesuai dengan
          kebijakan sekolah
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Pengaturan Umum
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Sekolah
                      </label>
                      <input
                        type="text"
                        defaultValue="SMP IP Yakin"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tahun Ajaran
                      </label>
                      <input
                        type="text"
                        defaultValue="2025/2026"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alamat Sekolah
                      </label>
                      <textarea
                        rows={4}
                        defaultValue="Jl. Pendidikan No. 123, Jakarta Selatan"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "registration" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Periode Pendaftaran
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={settings.registrationPeriod.startDate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          registrationPeriod: {
                            ...settings.registrationPeriod,
                            startDate: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={settings.registrationPeriod.endDate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          registrationPeriod: {
                            ...settings.registrationPeriod,
                            endDate: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <h5 className="font-semibold text-amber-900">
                        Status Pendaftaran
                      </h5>
                      <p className="text-sm text-amber-700">
                        Pendaftaran saat ini{" "}
                        {settings.registrationPeriod.isActive
                          ? "AKTIF"
                          : "TIDAK AKTIF"}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.registrationPeriod.isActive}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              registrationPeriod: {
                                ...settings.registrationPeriod,
                                isActive: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "requirements" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Persyaratan Pendaftaran
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nilai Minimum
                    </label>
                    <input
                      type="number"
                      value={settings.requirements.minGrade}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requirements: {
                            ...settings.requirements,
                            minGrade: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Usia Maksimal
                    </label>
                    <input
                      type="number"
                      value={settings.requirements.maxAge}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          requirements: {
                            ...settings.requirements,
                            maxAge: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Dokumen yang Diperlukan
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { id: "ijazah", label: "Ijazah/SKHUN" },
                      { id: "akta", label: "Akta Kelahiran" },
                      { id: "kk", label: "Kartu Keluarga" },
                      { id: "foto", label: "Pas Foto" },
                      { id: "raport", label: "Rapor" },
                    ].map((doc) => (
                      <label
                        key={doc.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={settings.requirements.requiredDocuments.includes(
                            doc.id
                          )}
                          onChange={(e) => {
                            const newDocs = e.target.checked
                              ? [
                                  ...settings.requirements.requiredDocuments,
                                  doc.id,
                                ]
                              : settings.requirements.requiredDocuments.filter(
                                  (d) => d !== doc.id
                                );
                            setSettings({
                              ...settings,
                              requirements: {
                                ...settings.requirements,
                                requiredDocuments: newDocs,
                              },
                            });
                          }}
                          className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {doc.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "guide" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Panduan PPDB
                  </h4>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-700">
                    Upload file panduan pendaftaran PPDB dalam format PDF. File
                    ini akan tersedia untuk diunduh oleh calon pendaftar.
                  </p>
                </div>

                {currentGuideUrl && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      File saat ini:{" "}
                      <a
                        href={currentGuideUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Lihat panduan
                      </a>
                    </p>
                  </div>
                )}
                <FileInput
                  onFileSelect={setGuideFile}
                  currentFile={guideFile}
                  label="Upload Panduan PPDB (PDF)"
                  acceptedFormats={["PDF"]}
                  maxSizeMB={10}
                  required={false}
                />

                {(currentGuideUrl || guideFile) && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <h5 className="font-semibold text-green-900">
                          Panduan Tersimpan
                        </h5>
                        <p className="text-sm text-green-700">
                          File panduan berhasil diupload dan dapat diakses oleh
                          calon pendaftar
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Pengaturan Notifikasi
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <h5 className="font-semibold text-gray-900">
                          Email Notifications
                        </h5>
                        <p className="text-sm text-gray-600">
                          Kirim notifikasi melalui email
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailEnabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              emailEnabled: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-green-600" />
                      <div>
                        <h5 className="font-semibold text-gray-900">
                          Auto Reply
                        </h5>
                        <p className="text-sm text-gray-600">
                          Balas otomatis pesan pendaftar
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.autoReply}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              autoReply: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "system" && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">
                    Pengaturan Sistem
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maksimal Pendaftar
                    </label>
                    <input
                      type="number"
                      value={settings.system.maxApplicants}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          system: {
                            ...settings.system,
                            maxApplicants: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Retensi Data (hari)
                    </label>
                    <input
                      type="number"
                      value={settings.system.dataRetention}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          system: {
                            ...settings.system,
                            dataRetention: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <h5 className="font-semibold text-gray-900">
                        Auto Backup
                      </h5>
                      <p className="text-sm text-gray-600">
                        Backup otomatis data setiap hari
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.system.autoBackup}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          system: {
                            ...settings.system,
                            autoBackup: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
              <button
                onClick={handleSave}
                disabled={uploading}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {uploading ? "Mengupload..." : "Simpan Pengaturan"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
