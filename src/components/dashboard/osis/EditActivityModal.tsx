"use client";

import { X, Link } from "lucide-react";
import { updateActivity } from "@/actions/osis/activities";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { OsisActivity } from "./types";
import { format } from "date-fns";

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: OsisActivity | null;
}

const initialState = {
  success: false,
  error: "",
  message: "",
};

export default function EditActivityModal({
  isOpen,
  onClose,
  activity,
}: EditActivityModalProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, formAction, isPending] = useActionState(updateActivity as any, initialState);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Kegiatan berhasil diperbarui");
      onClose();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onClose]);

  if (!isOpen || !activity) return null;

  // Format date for input default value
  const dateStr = activity.date
    ? typeof activity.date === 'string'
        ? activity.date.split('T')[0]
        : format(new Date(activity.date), 'yyyy-MM-dd')
    : '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={activity.id} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Kegiatan
            </label>
            <input
              name="title"
              type="text"
              defaultValue={activity.title}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="Masukkan judul kegiatan"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              name="description"
              defaultValue={activity.description}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              rows={4}
              placeholder="Jelaskan detail kegiatan"
              required
              minLength={10}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                name="date"
                type="date"
                defaultValue={dateStr}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu
              </label>
              <input
                name="time"
                type="time"
                defaultValue={activity.time}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
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
                name="location"
                type="text"
                defaultValue={activity.location}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="Lokasi kegiatan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Peserta
              </label>
              <input
                name="participants"
                type="number"
                min="1"
                defaultValue={activity.participants}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                placeholder="Estimasi peserta"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Penanggung Jawab (Organizer)
            </label>
            <input
              name="organizer"
              type="text"
              defaultValue={activity.organizer}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="Nama penanggung jawab"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimasi Budget (Rp)
            </label>
            <input
              name="budget"
              type="number"
              min="0"
              defaultValue={activity.budget}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Proposal (Google Drive/PDF URL)
            </label>
             <div className="relative">
                <Link className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                    name="proposalUrl"
                    type="url"
                    defaultValue={activity.proposalUrl || ''}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    placeholder="https://"
                />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
