"use client";

import { X, Save } from "lucide-react";
import { Activity } from "./types";

interface EditActivityModalProps {
  isOpen: boolean;
  activity: Activity | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * EditActivityModal component.
 * Displays a modal form for editing an existing activity in the OSIS dashboard.
 * @param {EditActivityModalProps} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Activity | null} props.activity - The activity to edit.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {function} props.onSubmit - Callback function to handle form submission.
 * @returns {JSX.Element | null} The rendered EditActivityModal component or null if not open.
 */
export default function EditActivityModal({
  isOpen,
  activity,
  onClose,
  onSubmit,
}: EditActivityModalProps) {
  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Kegiatan</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Kegiatan
            </label>
            <input
              type="text"
              defaultValue={activity.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              defaultValue={activity.description}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              rows={4}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                defaultValue="2025-02-15"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu
              </label>
              <input
                type="time"
                defaultValue="08:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi
              </label>
              <input
                type="text"
                defaultValue={activity.location}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Peserta
              </label>
              <input
                type="number"
                defaultValue={activity.participants}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (Rp)
            </label>
            <input
              type="number"
              defaultValue={activity.budget}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Kegiatan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
