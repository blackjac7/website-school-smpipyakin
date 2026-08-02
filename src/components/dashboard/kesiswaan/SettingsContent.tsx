"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  Loader2,
  Shirt,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";
import {
  getLatenessPointSettings,
  updateLatenessPointSettings,
} from "@/actions/lateness";
import {
  getAttributePointSettings,
  updateAttributePointSettings,
  getAttributeItemsForManagement,
  createAttributeItem,
  updateAttributeItem,
  deleteAttributeItem,
} from "@/actions/attributes";

interface AttributeItemRow {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  order: number;
  usageCount: number;
}

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

  // Attribute violation point settings (server/DB-backed, mirrors lateness)
  const [attrPointThreshold, setAttrPointThreshold] = useState(3);
  const [attrPointsPerThreshold, setAttrPointsPerThreshold] = useState(2);
  const [isLoadingAttrPointSettings, setIsLoadingAttrPointSettings] =
    useState(true);
  const [isSavingAttrPointSettings, setIsSavingAttrPointSettings] =
    useState(false);

  useEffect(() => {
    async function fetchAttrPointSettings() {
      setIsLoadingAttrPointSettings(true);
      const result = await getAttributePointSettings();
      if (result.success && result.data) {
        setAttrPointThreshold(result.data.threshold);
        setAttrPointsPerThreshold(result.data.pointsPerThreshold);
      }
      setIsLoadingAttrPointSettings(false);
    }
    fetchAttrPointSettings();
  }, []);

  const handleSaveAttrPointSettings = async () => {
    setIsSavingAttrPointSettings(true);
    const result = await updateAttributePointSettings(
      attrPointThreshold,
      attrPointsPerThreshold,
    );
    if (result.success) {
      toast.success(result.message || "Pengaturan berhasil disimpan");
    } else {
      toast.error(result.error || "Gagal menyimpan pengaturan");
    }
    setIsSavingAttrPointSettings(false);
  };

  // Attribute items management (CRUD)
  const [attributeItems, setAttributeItems] = useState<AttributeItemRow[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAttributeItems = async () => {
    setIsLoadingItems(true);
    const result = await getAttributeItemsForManagement();
    if (result.success && result.data) {
      setAttributeItems(result.data);
    }
    setIsLoadingItems(false);
  };

  useEffect(() => {
    loadAttributeItems();
  }, []);

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      toast.error("Nama atribut tidak boleh kosong");
      return;
    }
    setIsAddingItem(true);
    const result = await createAttributeItem(newItemName.trim());
    if (result.success) {
      toast.success(result.message || "Atribut berhasil ditambahkan");
      setNewItemName("");
      await loadAttributeItems();
    } else {
      toast.error(result.error || "Gagal menambahkan atribut");
    }
    setIsAddingItem(false);
  };

  const startEdit = (item: AttributeItemRow) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      toast.error("Nama atribut tidak boleh kosong");
      return;
    }
    setIsSavingEdit(true);
    const result = await updateAttributeItem(id, { name: editName.trim() });
    if (result.success) {
      toast.success(result.message || "Atribut berhasil diperbarui");
      setEditingId(null);
      await loadAttributeItems();
    } else {
      toast.error(result.error || "Gagal memperbarui atribut");
    }
    setIsSavingEdit(false);
  };

  const handleToggleActive = async (item: AttributeItemRow) => {
    const result = await updateAttributeItem(item.id, {
      active: !item.active,
    });
    if (result.success) {
      toast.success(
        !item.active ? "Atribut diaktifkan" : "Atribut dinonaktifkan",
      );
      await loadAttributeItems();
    } else {
      toast.error(result.error || "Gagal memperbarui atribut");
    }
  };

  const handleDeleteItem = async (id: string) => {
    setDeletingId(id);
    const result = await deleteAttributeItem(id);
    if (result.success) {
      toast.success(result.message || "Atribut berhasil dihapus");
      await loadAttributeItems();
    } else {
      toast.error(result.error || "Gagal menghapus atribut");
    }
    setDeletingId(null);
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Shirt className="w-5 h-5 text-red-600" />
          Pengaturan Poin Pelanggaran Atribut
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Atur berapa kali akumulasi pelanggaran atribut siswa untuk mendapat
          poin pelanggaran. Poin dihitung berdasarkan total pelanggaran atribut
          siswa sepanjang masa (tidak pernah reset).
        </p>

        {isLoadingAttrPointSettings ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat pengaturan...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="attrPointThreshold"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Akumulasi pelanggaran (x kali)
                </label>
                <input
                  id="attrPointThreshold"
                  type="number"
                  min={1}
                  value={attrPointThreshold}
                  onChange={(e) =>
                    setAttrPointThreshold(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="attrPointsPerThreshold"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Poin yang didapat
                </label>
                <input
                  id="attrPointsPerThreshold"
                  type="number"
                  min={0}
                  value={attrPointsPerThreshold}
                  onChange={(e) =>
                    setAttrPointsPerThreshold(
                      Math.max(0, Number(e.target.value)),
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600">
                Contoh: siswa yang melanggar atribut{" "}
                <strong>{attrPointThreshold}x</strong> akan mendapat{" "}
                <strong>{attrPointsPerThreshold} poin</strong>, melanggar{" "}
                {attrPointThreshold * 2}x akan mendapat{" "}
                {attrPointsPerThreshold * 2} poin, dan seterusnya.
              </p>
            </div>

            <button
              onClick={handleSaveAttrPointSettings}
              disabled={isSavingAttrPointSettings}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSavingAttrPointSettings && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Simpan Pengaturan
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Shirt className="w-5 h-5 text-red-600" />
          Daftar Atribut Seragam
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Kelola daftar atribut yang bisa diceklis OSIS saat memeriksa
          pelanggaran atribut siswa.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddItem();
            }}
            placeholder="Nama atribut baru (mis. Topi)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddItem}
            disabled={isAddingItem}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
          >
            {isAddingItem ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Tambah
          </button>
        </div>

        {isLoadingItems ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat daftar atribut...
          </div>
        ) : attributeItems.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4">
            Belum ada atribut. Tambahkan atribut pertama di atas.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {attributeItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 ${
                  item.active ? "bg-white" : "bg-gray-50"
                }`}
              >
                {editingId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(item.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      autoFocus
                      className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      disabled={isSavingEdit}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Simpan"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Batal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          item.active ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {item.name}
                        {!item.active && (
                          <span className="ml-2 text-xs font-normal text-gray-400">
                            (nonaktif)
                          </span>
                        )}
                      </p>
                      {item.usageCount > 0 && (
                        <p className="text-xs text-gray-400">
                          Digunakan {item.usageCount}x
                        </p>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={item.active}
                        onChange={() => handleToggleActive(item)}
                        aria-label={`Aktifkan/nonaktifkan ${item.name}`}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                    <button
                      onClick={() => startEdit(item)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                      aria-label={`Ubah nama ${item.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                      aria-label={`Hapus ${item.name}`}
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
