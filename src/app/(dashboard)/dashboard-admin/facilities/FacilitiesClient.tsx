"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import { ToastConfirmModal } from "@/components/shared/ToastConfirmModal";
import {
  createFacility,
  updateFacility,
  deleteFacility,
} from "@/actions/admin/facilities";
import { Facility } from "@prisma/client";
import { CldUploadWidget } from "next-cloudinary";

interface FacilitiesClientProps {
  initialFacilities: Facility[];
}

export default function FacilitiesClient({ initialFacilities }: FacilitiesClientProps) {
  const router = useRouter();
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Facility | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    category: "OTHER",
  });

  const { showConfirm, confirmProps } = useToastConfirm();

  const filteredFacilities = facilities.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (item?: Facility) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        category: item.category,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        imageUrl: "",
        category: "OTHER",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("imageUrl", formData.imageUrl);
      data.append("category", formData.category);

      let result;
      if (editingItem) {
        result = await updateFacility(editingItem.id, data);
      } else {
        result = await createFacility(data);
      }

      if (result.success) {
        toast.success(
          editingItem ? "Fasilitas diperbarui" : "Fasilitas ditambahkan"
        );
        setIsModalOpen(false);
        // Refresh handled by Server Action revalidate, but we can optimistically update or reload
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
    showConfirm({
      title: "Hapus Fasilitas?",
      message: "Data yang dihapus tidak dapat dikembalikan.",
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        const result = await deleteFacility(id);
        if (result.success) {
          toast.success("Fasilitas dihapus");
          setFacilities((prev) => prev.filter((item) => item.id !== id));
        } else {
          toast.error(result.error || "Gagal menghapus");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Fasilitas</h1>
          <p className="text-gray-600">Kelola daftar fasilitas sekolah</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Fasilitas
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="relative h-48 w-full bg-gray-100">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
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
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                {item.category}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}

        {filteredFacilities.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Tidak ada fasilitas yang ditemukan
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? "Edit Fasilitas" : "Tambah Fasilitas"}
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
                  Nama Fasilitas
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LABORATORY">Laboratorium</option>
                  <option value="LIBRARY">Perpustakaan</option>
                  <option value="SPORTS">Olahraga</option>
                  <option value="OTHER">Lainnya</option>
                </select>
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
                  Foto
                </label>
                <div className="mt-1 flex items-center gap-4">
                  {formData.imageUrl && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_PPDB || "ml_default"}
                    onSuccess={(result: { info: { secure_url: string } }) => {
                      setFormData({
                        ...formData,
                        imageUrl: result.info.secure_url,
                      });
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Upload Foto
                      </button>
                    )}
                  </CldUploadWidget>
                </div>
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

      <ToastConfirmModal {...confirmProps} />
    </div>
  );
}
