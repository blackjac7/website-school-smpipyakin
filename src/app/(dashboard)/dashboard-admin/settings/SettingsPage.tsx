"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Calendar,
  Users,
  Bell,
  Power,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  GraduationCap,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  toggleMaintenanceMode,
  updatePPDBSettings,
  toggleFeature,
  getFeatureFlags,
  getPPDBStatus,
  getMaintenanceStatus,
  createMaintenanceSchedule,
  getMaintenanceSchedules,
  deleteMaintenanceSchedule,
  seedSettingsAction,
} from "@/actions/admin/settings";

interface FeatureFlags {
  chatbot: boolean;
  studentWorks: boolean;
  announcements: boolean;
}

interface PPDBStatus {
  isOpen: boolean;
  message: string;
  startDate: Date | null;
  endDate: Date | null;
  academicYear: string;
  quota: number;
  registeredCount: number;
  remainingQuota: number;
}

interface MaintenanceStatus {
  isActive: boolean;
  message: string;
  allowedIPs: string[];
}

interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  message: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    chatbot: true,
    studentWorks: true,
    announcements: true,
  });

  const [ppdbStatus, setPPDBStatus] = useState<PPDBStatus>({
    isOpen: false,
    message: "",
    startDate: null,
    endDate: null,
    academicYear: "2025/2026",
    quota: 100,
    registeredCount: 0,
    remainingQuota: 100,
  });

  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>(
    {
      isActive: false,
      message: "",
      allowedIPs: [],
    }
  );

  const [maintenanceSchedules, setMaintenanceSchedules] = useState<
    MaintenanceSchedule[]
  >([]);

  // PPDB Form
  const [ppdbForm, setPPDBForm] = useState({
    enabled: false,
    startDate: "",
    endDate: "",
    academicYear: "2025/2026",
    quota: 100,
    closedMessage: "",
  });

  // Maintenance Form
  const [maintenanceForm, setMaintenanceForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    message: "",
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [featuresRes, ppdbRes, maintenanceRes, schedulesRes] =
        await Promise.all([
          getFeatureFlags(),
          getPPDBStatus(),
          getMaintenanceStatus(),
          getMaintenanceSchedules(),
        ]);

      if (featuresRes.success && featuresRes.data) {
        setFeatureFlags(featuresRes.data);
      }

      if (ppdbRes.success && ppdbRes.data) {
        setPPDBStatus(ppdbRes.data);
        setPPDBForm({
          enabled: ppdbRes.data.isOpen,
          startDate: ppdbRes.data.startDate
            ? new Date(ppdbRes.data.startDate).toISOString().split("T")[0]
            : "",
          endDate: ppdbRes.data.endDate
            ? new Date(ppdbRes.data.endDate).toISOString().split("T")[0]
            : "",
          academicYear: ppdbRes.data.academicYear,
          quota: ppdbRes.data.quota,
          closedMessage: ppdbRes.data.message,
        });
      }

      if (maintenanceRes.success && maintenanceRes.data) {
        setMaintenanceStatus(maintenanceRes.data);
      }

      if (schedulesRes.success && schedulesRes.data) {
        setMaintenanceSchedules(schedulesRes.data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Feature
  const handleToggleFeature = async (feature: keyof FeatureFlags) => {
    const newValue = !featureFlags[feature];
    setFeatureFlags((prev) => ({ ...prev, [feature]: newValue }));

    const result = await toggleFeature(feature, newValue);
    if (result.success) {
      toast.success(result.message || "Berhasil");
    } else {
      setFeatureFlags((prev) => ({ ...prev, [feature]: !newValue }));
      toast.error(result.error || "Gagal mengubah fitur");
    }
  };

  // Toggle Maintenance
  const handleToggleMaintenance = async () => {
    const newValue = !maintenanceStatus.isActive;
    setSaving(true);

    const result = await toggleMaintenanceMode(
      newValue,
      maintenanceStatus.message
    );
    if (result.success) {
      setMaintenanceStatus((prev) => ({ ...prev, isActive: newValue }));
      toast.success(result.message || "Berhasil");
    } else {
      toast.error(result.error || "Gagal mengubah mode pemeliharaan");
    }

    setSaving(false);
  };

  // Save PPDB Settings
  const handleSavePPDB = async () => {
    // Client-side validation
    if (ppdbForm.startDate && ppdbForm.endDate) {
      if (new Date(ppdbForm.startDate) > new Date(ppdbForm.endDate)) {
        toast.error("Tanggal mulai tidak boleh lebih akhir dari tanggal berakhir");
        return;
      }
    }

    setSaving(true);
    const result = await updatePPDBSettings({
      enabled: ppdbForm.enabled,
      startDate: ppdbForm.startDate,
      endDate: ppdbForm.endDate,
      academicYear: ppdbForm.academicYear,
      quota: ppdbForm.quota,
      closedMessage: ppdbForm.closedMessage,
    });

    if (result.success) {
      toast.success(result.message || "Berhasil");
      loadData();
    } else {
      toast.error(result.error || "Gagal menyimpan pengaturan PPDB");
    }
    setSaving(false);
  };

  // Create Maintenance Schedule
  const handleCreateSchedule = async () => {
    if (
      !maintenanceForm.title ||
      !maintenanceForm.startTime ||
      !maintenanceForm.endTime
    ) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    setSaving(true);
    const result = await createMaintenanceSchedule({
      title: maintenanceForm.title,
      description: maintenanceForm.description,
      startTime: new Date(maintenanceForm.startTime),
      endTime: new Date(maintenanceForm.endTime),
      message: maintenanceForm.message,
    });

    if (result.success) {
      toast.success("Jadwal pemeliharaan berhasil dibuat");
      setMaintenanceForm({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        message: "",
      });
      loadData();
    } else {
      toast.error(result.error || "Gagal membuat jadwal pemeliharaan");
    }
    setSaving(false);
  };

  // Delete Schedule
  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Yakin ingin menghapus jadwal ini?")) return;

    const result = await deleteMaintenanceSchedule(id);
    if (result.success) {
      toast.success(result.message || "Berhasil");
      loadData();
    } else {
      toast.error(result.error || "Gagal menghapus jadwal");
    }
  };

  // Seed Settings
  const handleSeedSettings = async () => {
    if (!confirm("Ini akan membuat pengaturan default. Lanjutkan?")) return;

    const result = await seedSettingsAction();
    if (result.success) {
      toast.success(result.message || "Berhasil");
      loadData();
    } else {
      toast.error(result.error || "Gagal membuat pengaturan");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Pengaturan Sistem
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola mode pemeliharaan, PPDB, dan fitur website
          </p>
        </div>
        <button
          onClick={handleSeedSettings}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Reset ke Default
        </button>
      </div>

      {/* Maintenance Mode Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg ${
                maintenanceStatus.isActive
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-green-100 dark:bg-green-900/30"
              }`}
            >
              <Shield
                className={`w-6 h-6 ${
                  maintenanceStatus.isActive
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mode Pemeliharaan
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {maintenanceStatus.isActive
                  ? "Website sedang dalam mode pemeliharaan"
                  : "Website berjalan normal"}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleMaintenance}
            disabled={saving}
            className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              maintenanceStatus.isActive
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            <Power className="w-4 h-4" />
            {maintenanceStatus.isActive ? "Nonaktifkan" : "Aktifkan"}
          </button>
        </div>

        {maintenanceStatus.isActive && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Mode Pemeliharaan Aktif
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {maintenanceStatus.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PPDB Settings Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pengaturan PPDB
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kelola periode pendaftaran peserta didik baru
            </p>
          </div>
        </div>

        {/* PPDB Status Banner */}
        <div
          className={`mb-6 p-4 rounded-lg border ${
            ppdbStatus.isOpen
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${ppdbStatus.isOpen ? "text-green-600" : "text-gray-500"}`}>
                {ppdbStatus.isOpen ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
              <div>
                <span
                  className={`font-semibold text-lg block ${
                    ppdbStatus.isOpen
                      ? "text-green-800 dark:text-green-200"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {ppdbStatus.isOpen ? "PPDB Sedang Dibuka" : "PPDB Ditutup"}
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {ppdbStatus.message}
                </p>
              </div>
            </div>

            <div className="text-right min-w-[150px]">
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Terisi</span>
                  <span>{Math.round((ppdbStatus.registeredCount / ppdbStatus.quota) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${
                      ppdbStatus.remainingQuota === 0
                        ? 'bg-red-500'
                        : ppdbStatus.remainingQuota < 10
                          ? 'bg-orange-500'
                          : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, (ppdbStatus.registeredCount / ppdbStatus.quota) * 100)}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {ppdbStatus.registeredCount} / {ppdbStatus.quota} Pendaftar
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Sisa kuota: {ppdbStatus.remainingQuota}
              </p>
            </div>
          </div>
        </div>

        {/* PPDB Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Informasi Pengaturan Otomatis</p>
              <p>Jika tanggal diatur, sistem akan otomatis:</p>
              <ul className="list-disc ml-4 mt-1 space-y-0.5 opacity-90">
                <li>Menampilkan &quot;Akan Dibuka&quot; jika tanggal sekarang &lt; Tanggal Mulai.</li>
                <li>Menutup pendaftaran jika tanggal sekarang &gt; Tanggal Berakhir.</li>
                <li>Menutup pendaftaran jika Kuota terpenuhi.</li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={ppdbForm.enabled}
                  onChange={(e) =>
                    setPPDBForm((prev) => ({
                      ...prev,
                      enabled: e.target.checked,
                    }))
                  }
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">
                Aktifkan Sistem PPDB
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-14">
              Switch utama untuk mengizinkan pendaftaran. Jika OFF, PPDB akan selalu tutup.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Mulai (Opsional)
            </label>
            <input
              type="date"
              value={ppdbForm.startDate}
              onChange={(e) =>
                setPPDBForm((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Berakhir (Opsional)
            </label>
            <input
              type="date"
              value={ppdbForm.endDate}
              onChange={(e) =>
                setPPDBForm((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tahun Ajaran
            </label>
            <input
              type="text"
              value={ppdbForm.academicYear}
              onChange={(e) =>
                setPPDBForm((prev) => ({
                  ...prev,
                  academicYear: e.target.value,
                }))
              }
              placeholder="2025/2026"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kuota Pendaftaran
            </label>
            <input
              type="number"
              value={ppdbForm.quota}
              onChange={(e) =>
                setPPDBForm((prev) => ({
                  ...prev,
                  quota: Number(e.target.value),
                }))
              }
              min={1}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pesan Saat PPDB Ditutup
            </label>
            <textarea
              value={ppdbForm.closedMessage}
              onChange={(e) =>
                setPPDBForm((prev) => ({
                  ...prev,
                  closedMessage: e.target.value,
                }))
              }
              rows={2}
              placeholder="Contoh: Pendaftaran PPDB belum dibuka. Mohon kembali lagi nanti."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleSavePPDB}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Menyimpan..." : "Simpan Pengaturan PPDB"}
          </button>
        </div>
      </div>

      {/* Feature Flags Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fitur Website
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aktifkan atau nonaktifkan fitur tertentu
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Chatbot Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  AI Chatbot
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Asisten virtual untuk pengunjung
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggleFeature("chatbot")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                featureFlags.chatbot
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  featureFlags.chatbot ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Student Works Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Galeri Karya Siswa
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tampilkan karya siswa di halaman publik
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggleFeature("studentWorks")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                featureFlags.studentWorks
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  featureFlags.studentWorks ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Announcements Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Pengumuman
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tampilkan pengumuman di halaman utama
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggleFeature("announcements")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                featureFlags.announcements
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  featureFlags.announcements ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Scheduled Maintenance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Jadwal Pemeliharaan
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Atur jadwal pemeliharaan terjadwal
            </p>
          </div>
        </div>

        {/* Create Schedule Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul Pemeliharaan
            </label>
            <input
              type="text"
              value={maintenanceForm.title}
              onChange={(e) =>
                setMaintenanceForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              placeholder="Contoh: Update Sistem Database"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Waktu Mulai
            </label>
            <input
              type="datetime-local"
              value={maintenanceForm.startTime}
              onChange={(e) =>
                setMaintenanceForm((prev) => ({
                  ...prev,
                  startTime: e.target.value,
                }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Waktu Selesai
            </label>
            <input
              type="datetime-local"
              value={maintenanceForm.endTime}
              onChange={(e) =>
                setMaintenanceForm((prev) => ({
                  ...prev,
                  endTime: e.target.value,
                }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pesan Pemeliharaan
            </label>
            <textarea
              value={maintenanceForm.message}
              onChange={(e) =>
                setMaintenanceForm((prev) => ({
                  ...prev,
                  message: e.target.value,
                }))
              }
              rows={2}
              placeholder="Pesan yang akan ditampilkan selama pemeliharaan..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={handleCreateSchedule}
              disabled={saving}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              Buat Jadwal
            </button>
          </div>
        </div>

        {/* Existing Schedules */}
        {maintenanceSchedules.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Jadwal Aktif
            </h3>
            {maintenanceSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {schedule.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(schedule.startTime).toLocaleString("id-ID")} -{" "}
                    {new Date(schedule.endTime).toLocaleString("id-ID")}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Belum ada jadwal pemeliharaan
          </p>
        )}
      </div>
    </div>
  );
}
