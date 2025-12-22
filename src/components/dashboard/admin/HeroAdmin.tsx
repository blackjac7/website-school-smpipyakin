"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { createHeroSlide, updateHeroSlide, deleteHeroSlide } from "@/actions/hero";
import { HeroSlide } from "@prisma/client";
import toast from "react-hot-toast";

interface HeroPageProps {
  slides: HeroSlide[];
}

export default function HeroAdmin({ slides }: HeroPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
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
      if (editingSlide) {
        await updateHeroSlide(editingSlide.id, data);
        toast.success("Hero slide updated");
      } else {
        await createHeroSlide(data);
        toast.success("Hero slide created");
      }
      setIsModalOpen(false);
      setEditingSlide(null);
    } catch (error) {
      toast.error("Failed to save slide");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    try {
      await deleteHeroSlide(id);
      toast.success("Slide deleted");
    } catch (error) {
      toast.error("Failed to delete slide");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hero Carousel Management</h1>
        <button
          onClick={() => { setEditingSlide(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Add Slide
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
              <img src={slide.imageSmall} alt={slide.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{slide.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{slide.subtitle}</p>

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
                  onClick={() => { setEditingSlide(slide); setIsModalOpen(true); }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">{editingSlide ? 'Edit Slide' : 'New Slide'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input name="title" required defaultValue={editingSlide?.title} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subtitle</label>
                  <input name="subtitle" required defaultValue={editingSlide?.subtitle} className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL (Small/Mobile)</label>
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-gray-400" />
                  <input name="imageSmall" required defaultValue={editingSlide?.imageSmall} placeholder="https://..." className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL (Medium/Desktop)</label>
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-gray-400" />
                  <input name="imageMedium" required defaultValue={editingSlide?.imageMedium} placeholder="https://..." className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Link Text</label>
                  <input name="linkPrimaryText" defaultValue={editingSlide?.linkPrimaryText || ''} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Primary Link URL</label>
                  <input name="linkPrimaryHref" defaultValue={editingSlide?.linkPrimaryHref || ''} className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Secondary Link Text</label>
                  <input name="linkSecondaryText" defaultValue={editingSlide?.linkSecondaryText || ''} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Secondary Link URL</label>
                  <input name="linkSecondaryHref" defaultValue={editingSlide?.linkSecondaryHref || ''} className="w-full p-2 border rounded-lg" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save Slide'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
