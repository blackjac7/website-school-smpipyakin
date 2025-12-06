import { X } from "lucide-react";
import { User } from "./types";

interface UserModalProps {
  show: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  selectedUser: User | null;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * UserModal component.
 * Displays a modal form for adding or editing a user.
 * @param {UserModalProps} props - The component props.
 * @param {boolean} props.show - Whether the modal is visible.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {"add" | "edit"} props.mode - The mode of the modal (add or edit).
 * @param {User | null} props.selectedUser - The user object to edit (if mode is "edit").
 * @param {function} props.onSubmit - Callback function to handle form submission.
 * @returns {JSX.Element | null} The rendered UserModal component or null if not shown.
 */
export default function UserModal({
  show,
  onClose,
  mode,
  selectedUser,
  onSubmit,
}: UserModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {mode === "add" ? "Tambah Pengguna Baru" : "Edit Pengguna"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                defaultValue={selectedUser?.name || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={selectedUser?.email || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                defaultValue={selectedUser?.role || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              >
                <option value="">Pilih Role</option>
                <option value="Siswa">Siswa</option>
                <option value="Guru">Guru</option>
                <option value="Kesiswaan">Kesiswaan</option>
                <option value="OSIS">OSIS</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelas/Mata Pelajaran
              </label>
              <input
                type="text"
                defaultValue={selectedUser?.class || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Contoh: XII IPA 1 atau Matematika"
              />
            </div>
          </div>
          {mode === "add" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary">
              {mode === "add" ? "Tambah Pengguna" : "Update Pengguna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
