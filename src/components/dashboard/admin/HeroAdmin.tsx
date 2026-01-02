"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import ImageUpload from "@/components/shared/ImageUpload";
import {
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from "@/actions/hero";
import { HeroSlide } from "@prisma/client";
import toast from "react-hot-toast";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";

interface HeroPageProps {
  slides: HeroSlide[];
}

export default function HeroAdmin({ slides }: HeroPageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const confirmModal = useToastConfirm();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      imageSmall: formData.get("imageSmall") as string,
      imageMedium: formData.get("imageMedium") as string,
      linkPrimaryText: formData.get("linkPrimaryText") as string,
      linkPrimaryHref: formData.get("linkPrimaryHref") as string,
      linkSecondaryText: formData.get("linkSecondaryText") as string,
      linkSecondaryHref: formData.get("linkSecondaryHref") as string,
      isActive: true, // Default active
      sortOrder: 0, // Default sort order
    };

    try {
      let result;
      if (editingSlide) {
        result = await updateHeroSlide(editingSlide.id, data);
      } else {
        result = await createHeroSlide(data);
      }

      if (result.success) {
        toast.success(
          editingSlide
            ? "Slide berhasil diperbarui"
            : "Slide berhasil ditambahkan"
        );
        setIsModalOpen(false);
        setEditingSlide(null);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan slide");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan slide");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Slide",
        message: "Apakah Anda yakin ingin menghapus slide ini?",
        description: "Tindakan ini tidak dapat dibatalkan.",
        type: "danger",
        confirmText: "Hapus",
        cancelText: "Batal",
      },
      async () => {
        try {
          const result = await deleteHeroSlide(id);
          if (result.success) {
            toast.success("Slide berhasil dihapus");
            router.refresh();
          } else {
            toast.error(result.error || "Gagal menghapus slide");
          }
        } catch (error) {
          console.error("Failed to delete slide:", error);
          toast.error("Gagal menghapus slide");
        }
      }
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Hero Carousel
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola slide hero di halaman utama
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSlide(null);
            setIsModalOpen(true);
          }}
          aria-label="Tambah slide baru"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus size={20} /> Tambah Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="relative h-48 bg-gray-100">
              <Image
                src={slide.imageSmall}
                alt={slide.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{slide.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {slide.subtitle}
              </p>

              <div className="flex gap-2 mb-4 text-xs text-gray-600">
                {slide.linkPrimaryText && (
                  <span className="bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                    <LinkIcon size={12} /> {slide.linkPrimaryText}
                  </span>
                )}
                {slide.linkSecondaryText && (
                  <span className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                    <LinkIcon size={12} /> {slide.linkSecondaryText}
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setEditingSlide(slide);
                    setIsModalOpen(true);
                  }}
                  aria-label={`Edit slide ${slide.title}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  aria-label={`Hapus slide ${slide.title}`}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hero-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 id="hero-modal-title" className="text-xl font-bold">
                {editingSlide ? "Edit Slide" : "Tambah Slide"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="hero-title"
                    className="text-sm font-medium text-gray-700"
                  >
                    Judul
                  </label>
                  <input
                    id="hero-title"
                    name="title"
                    required
                    defaultValue={editingSlide?.title}
                    placeholder="Masukkan judul slide"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="hero-subtitle"
                    className="text-sm font-medium text-gray-700"
                  >
                    Subjudul
                  </label>
                  <input
                    id="hero-subtitle"
                    name="subtitle"
                    required
                    defaultValue={editingSlide?.subtitle}
                    placeholder="Masukkan subjudul slide"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="hero-image-small"
                  className="text-sm font-medium text-gray-700"
                >
                  Gambar Hero (Kecil/Mobile)
                </label>
                <ImageUpload
                  onUpload={(file) => {
                    const imageInput = document.querySelector<HTMLInputElement>(
                      'input[name="imageSmall"]'
                    );
                    if (imageInput) imageInput.value = file.url;
                  }}
                  onRemove={() => {
                    const imageInput = document.querySelector<HTMLInputElement>(
                      'input[name="imageSmall"]'
                    );
                    if (imageInput) imageInput.value = "";
                  }}
                  currentImage={editingSlide?.imageSmall || ""}
                  folder="hero/small"
                  label="Upload Gambar Mobile (640px)"
                  acceptedFormats={["JPEG", "PNG", "WebP"]}
                  maxSizeMB={2}
                />
                <input
                  type="hidden"
                  id="hero-image-small"
                  name="imageSmall"
                  defaultValue={editingSlide?.imageSmall}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="hero-image-medium"
                  className="text-sm font-medium text-gray-700"
                >
                  Gambar Hero (Sedang/Desktop)
                </label>
                <ImageUpload
                  onUpload={(file) => {
                    const imageInput = document.querySelector<HTMLInputElement>(
                      'input[name="imageMedium"]'
                    );
                    if (imageInput) imageInput.value = file.url;
                  }}
                  onRemove={() => {
                    const imageInput = document.querySelector<HTMLInputElement>(
                      'input[name="imageMedium"]'
                    );
                    if (imageInput) imageInput.value = "";
                  }}
                  currentImage={editingSlide?.imageMedium || ""}
                  folder="hero/medium"
                  label="Upload Gambar Desktop (1024px)"
                  acceptedFormats={["JPEG", "PNG", "WebP"]}
                  maxSizeMB={3}
                />
                <input
                  type="hidden"
                  id="hero-image-medium"
                  name="imageMedium"
                  defaultValue={editingSlide?.imageMedium}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <label
                    htmlFor="hero-link-primary-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Teks Tombol Utama
                  </label>
                  <input
                    id="hero-link-primary-text"
                    name="linkPrimaryText"
                    defaultValue={editingSlide?.linkPrimaryText || ""}
                    placeholder="Contoh: Daftar Sekarang"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="hero-link-primary-href"
                    className="text-sm font-medium text-gray-700"
                  >
                    URL Tombol Utama
                  </label>
                  <input
                    id="hero-link-primary-href"
                    name="linkPrimaryHref"
                    defaultValue={editingSlide?.linkPrimaryHref || ""}
                    placeholder="/ppdb"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="hero-link-secondary-text"
                    className="text-sm font-medium text-gray-700"
                  >
                    Teks Tombol Sekunder
                  </label>
                  <input
                    id="hero-link-secondary-text"
                    name="linkSecondaryText"
                    defaultValue={editingSlide?.linkSecondaryText || ""}
                    placeholder="Contoh: Pelajari Lebih Lanjut"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="hero-link-secondary-href"
                    className="text-sm font-medium text-gray-700"
                  >
                    URL Tombol Sekunder
                  </label>
                  <input
                    id="hero-link-secondary-href"
                    name="linkSecondaryHref"
                    defaultValue={editingSlide?.linkSecondaryHref || ""}
                    placeholder="/tentang"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Slide"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Toast Confirm Modal */}
      <ToastConfirmModal
        isOpen={confirmModal.isOpen}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        {...confirmModal.options}
      />
    </div>
  );
}
