"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { getSchoolStats, createSchoolStat, updateSchoolStat, deleteSchoolStat } from "@/actions/stats";
import { SchoolStat } from "@prisma/client";
import toast from "react-hot-toast";
import * as LucideIcons from "lucide-react";

interface StatsPageProps {
  stats: SchoolStat[];
}

export default function StatsAdmin({ stats }: StatsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<SchoolStat | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to render dynamic icon
  const renderIcon = (iconName: string) => {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[iconName];
    return Icon ? <Icon size={24} className="text-yellow-500" /> : <LayoutGrid size={24} />;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      label: formData.get("label") as string,
      value: formData.get("value") as string,
      iconName: formData.get("iconName") as string,
      isActive: true,
    };

    try {
      if (editingStat) {
        await updateSchoolStat(editingStat.id, data);
        toast.success("Stat updated");
      } else {
        await createSchoolStat(data);
        toast.success("Stat created");
      }
      setIsModalOpen(false);
      setEditingStat(null);
    } catch (error) {
      toast.error("Failed to save stat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stat?")) return;
    try {
      await deleteSchoolStat(id);
      toast.success("Stat deleted");
    } catch (error) {
      toast.error("Failed to delete stat");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quick Stats Management</h1>
        <button
          onClick={() => { setEditingStat(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Add Stat
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center relative group"
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
               <button onClick={() => { setEditingStat(stat); setIsModalOpen(true); }} className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                  <Pencil size={14} />
               </button>
               <button onClick={() => handleDelete(stat.id)} className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100">
                  <Trash2 size={14} />
               </button>
            </div>

            <div className="flex justify-center mb-4 p-3 bg-yellow-50 rounded-full w-fit mx-auto">
              {renderIcon(stat.iconName)}
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-gray-500 font-medium uppercase text-xs tracking-wider">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingStat ? 'Edit Stat' : 'New Stat'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Label</label>
                <input name="label" required defaultValue={editingStat?.label} placeholder="e.g. Siswa Aktif" className="w-full p-2 border rounded-lg" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Value</label>
                <input name="value" required defaultValue={editingStat?.value} placeholder="e.g. 450+" className="w-full p-2 border rounded-lg" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icon Name (Lucide React)</label>
                <input name="iconName" required defaultValue={editingStat?.iconName} placeholder="e.g. GraduationCap, Users, Award" className="w-full p-2 border rounded-lg" />
                <p className="text-xs text-gray-500">Use exact component names from lucide-react</p>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save Stat'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
