"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, X, Clock } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";
import ImageUpload from "@/components/shared/ImageUpload";
import {
  createExtracurricular,
  updateExtracurricular,
  deleteExtracurricular,
} from "@/actions/admin/extracurricular";
import { Extracurricular } from "@prisma/client";

interface ExtracurricularClientProps {
  initialData: Extracurricular[];
}

export default function ExtracurricularClient({
  initialData,
}: ExtracurricularClientProps) {
  const router = useRouter();
  const [data, setData] = useState<Extracurricular[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Extracurricular | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    schedule: "",
    image: "",
  });

  const { showConfirm, ...confirmState } = useToastConfirm();

  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (item?: Extracurricular) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title,
        description: item.description || "",
        schedule: item.schedule || "",
        image: item.image || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: "",
        description: "",
        schedule: "",
        image: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("schedule", formData.schedule);
      form.append("image", formData.image);

      let result;
      if (editingItem) {
        result = await updateExtracurricular(editingItem.id, form);
      } else {
        result = await createExtracurricular(form);
      }

      if (result.success) {
        toast.success(
          editingItem
            ? "Ekstrakurikuler diperbarui"
            : "Ekstrakurikuler ditambahkan"
        );
        setIsModalOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm(
      {
        title: "Hapus Ekstrakurikuler?",
        message: "Data yang dihapus tidak dapat dikembalikan.",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        const result = await deleteExtracurricular(id);
        if (result.success) {
          toast.success("Ekstrakurikuler dihapus");
          setData((prev) => prev.filter((item) => item.id !== id));
        } else {
          toast.error(result.error || "Gagal menghapus");
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Ekstrakurikuler
          </h1>
          <p className="text-gray-600">
            Kelola kegiatan ekstrakurikuler sekolah
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Ekskul
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari ekstrakurikuler..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="relative h-48 w-full bg-gray-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-2 bg-white/90 rounded-full text-blue-600 hover:text-blue-700 shadow-sm"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-white/90 rounded-full text-red-600 hover:text-red-700 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-2 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {item.schedule || "Jadwal belum diatur"}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Tidak ada ekstrakurikuler yang ditemukan
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem
                  ? "Edit Ekstrakurikuler"
                  : "Tambah Ekstrakurikuler"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kegiatan
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jadwal (Hari, Jam)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Senin, 15:00 WIB"
                  value={formData.schedule}
                  onChange={(e) =>
                    setFormData({ ...formData, schedule: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foto Ekstrakurikuler
                </label>
                <ImageUpload
                  onUpload={(file) => {
                    setFormData({ ...formData, image: file.url });
                  }}
                  onRemove={() => {
                    setFormData({ ...formData, image: "" });
                  }}
                  currentImage={formData.image}
                  folder="extracurricular"
                  label="Upload Foto Kegiatan"
                  acceptedFormats={["JPEG", "PNG", "WebP"]}
                  maxSizeMB={4}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastConfirmModal
        isOpen={confirmState.isOpen}
        message={confirmState.options.message}
        title={confirmState.options.title}
        description={confirmState.options.description}
        type={confirmState.options.type}
        confirmText={confirmState.options.confirmText}
        cancelText={confirmState.options.cancelText}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
        showCloseButton={confirmState.options.showCloseButton}
        isLoading={confirmState.isLoading}
      />
    </div>
  );
}
