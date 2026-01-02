import { X, Check } from "lucide-react";
import { ContentItem } from "./types";

interface PreviewModalProps {
  isOpen: boolean;
  content: ContentItem | null;
  onClose: () => void;
  onApprove: (content: ContentItem) => void;
  onReject: (content: ContentItem) => void;
}

export default function PreviewModal({
  isOpen,
  content,
  onClose,
  onApprove,
  onReject,
}: PreviewModalProps) {
  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Preview Konten
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            {/* Type Badge */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                content.type === "achievement"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {content.type === "achievement" ? "Prestasi" : "Karya"}
            </span>
            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                content.status === "PENDING"
                  ? "bg-orange-100 text-orange-700"
                  : content.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {content.status}
            </span>
          </div>

          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              {content.title}
            </h4>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {content.description || "Tidak ada deskripsi"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Penulis:</span>
                <p className="font-medium">{content.authorName}</p>
              </div>
              <div>
                <span className="text-gray-600">Kelas:</span>
                <p className="font-medium">{content.authorClass || "-"}</p>
              </div>
              <div>
                <span className="text-gray-600">Kategori:</span>
                <p className="font-medium">{content.category || "-"}</p>
              </div>
              <div>
                <span className="text-gray-600">Media:</span>
                <div className="space-y-1">
                  {content.image && (
                    <a
                      href={content.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      Lihat Gambar
                    </a>
                  )}
                  {content.videoLink && (
                    <a
                      href={content.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline block"
                    >
                      Lihat Video
                    </a>
                  )}
                  {!content.image && !content.videoLink && (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => onReject(content)}
              className="btn-danger flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Tolak
            </button>
            <button
              onClick={() => onApprove(content)}
              className="btn-success flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Setujui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
