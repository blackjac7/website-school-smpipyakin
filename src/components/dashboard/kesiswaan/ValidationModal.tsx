import { X } from "lucide-react";
import { ContentItem } from "./types";
import { useState } from "react";

interface ValidationModalProps {
  isOpen: boolean;
  content: ContentItem | null;
  validationAction: "approve" | "reject";
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
}

export default function ValidationModal({
  isOpen,
  content,
  validationAction,
  onClose,
  onSubmit,
}: ValidationModalProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !content) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(note);
    setIsSubmitting(false);
    setNote("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">Konten:</p>
            <p className="font-medium">{content.title}</p>
            <p className="text-sm text-gray-600">Oleh: {content.authorName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan{" "}
              {validationAction === "approve" ? "Persetujuan" : "Penolakan"}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              rows={4}
              placeholder={`Berikan catatan untuk ${validationAction === "approve" ? "persetujuan" : "penolakan"} konten...`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-lg ${
                validationAction === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50`}
            >
              {isSubmitting ? "Memproses..." : (validationAction === "approve" ? "Setujui" : "Tolak")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
