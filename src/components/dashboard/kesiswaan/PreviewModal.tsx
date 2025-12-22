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
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (content.status as any) === "Prestasi"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {content.status}
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              {content.type}
            </span>
          </div>

          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              {content.title}
            </h4>
            <div className="prose max-w-none">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <p className="text-gray-700 leading-relaxed">{(content as any).content || content.description}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Penulis:</span>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <p className="font-medium">{(content as any).author || (content as any).studentName}</p>
              </div>
              <div>
                <span className="text-gray-600">Tanggal:</span>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <p className="font-medium">{(content as any).date || (content as any).submittedDate}</p>
              </div>
              <div>
                <span className="text-gray-600">Lampiran:</span>
                <div className="space-y-1">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {((content as any).attachments || []).map((file: any, index: any) => (
                    <p
                      key={index}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      {file}
                    </p>
                  ))}
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
