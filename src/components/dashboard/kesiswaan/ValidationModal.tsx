import { X } from "lucide-react";
import { ContentItem } from "./types";

interface ValidationModalProps {
  isOpen: boolean;
  content: ContentItem | null;
  validationAction: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * ValidationModal component.
 * Displays a modal form for validating (approving or rejecting) content.
 * @param {ValidationModalProps} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {ContentItem | null} props.content - The content item being validated.
 * @param {string} props.validationAction - The action being performed ("approve" or "reject").
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSubmit - Function to handle form submission.
 * @returns {JSX.Element | null} The rendered ValidationModal component or null if not open.
 */
export default function ValidationModal({
  isOpen,
  content,
  validationAction,
  onClose,
  onSubmit,
}: ValidationModalProps) {
  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {validationAction === "approve" ? "Setujui Konten" : "Tolak Konten"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Konten:</p>
            <p className="font-medium">{content.title}</p>
            <p className="text-sm text-gray-600">Oleh: {content.author}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan{" "}
              {validationAction === "approve" ? "Persetujuan" : "Penolakan"}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              rows={4}
              placeholder={`Berikan catatan untuk ${validationAction === "approve" ? "persetujuan" : "penolakan"} konten...`}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <button
              type="submit"
              className={
                validationAction === "approve" ? "btn-success" : "btn-danger"
              }
            >
              {validationAction === "approve" ? "Setujui" : "Tolak"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
