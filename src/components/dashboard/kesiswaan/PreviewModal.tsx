"use client";

import { useState, useEffect } from "react";
import {
  X,
  Check,
  Edit3,
  Save,
  RotateCcw,
  Newspaper,
  Award,
  Palette,
} from "lucide-react";
import { ContentItem } from "./types";
import Image from "next/image";

interface PreviewModalProps {
  isOpen: boolean;
  content: ContentItem | null;
  onClose: () => void;
  onApprove: (
    content: ContentItem,
    updatedContent?: { title: string; description: string }
  ) => void;
  onReject: (content: ContentItem) => void;
}

export default function PreviewModal({
  isOpen,
  content,
  onClose,
  onApprove,
  onReject,
}: PreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  // Reset editing state when content changes
  useEffect(() => {
    if (content) {
      setEditedTitle(content.title);
      setEditedDescription(content.description || "");
      setIsEditing(false);
    }
  }, [content]);

  if (!isOpen || !content) return null;

  const hasChanges =
    editedTitle !== content.title ||
    editedDescription !== (content.description || "");

  const handleApprove = () => {
    if (hasChanges) {
      onApprove(content, {
        title: editedTitle,
        description: editedDescription,
      });
    } else {
      onApprove(content);
    }
  };

  const handleResetChanges = () => {
    setEditedTitle(content.title);
    setEditedDescription(content.description || "");
  };

  const getTypeBadge = () => {
    switch (content.type) {
      case "achievement":
        return {
          icon: Award,
          label: "Prestasi Siswa",
          className: "bg-yellow-100 text-yellow-700",
        };
      case "work":
        return {
          icon: Palette,
          label: "Karya Siswa",
          className: "bg-green-100 text-green-700",
        };
      case "news":
        return {
          icon: Newspaper,
          label: "Berita OSIS",
          className: "bg-blue-100 text-blue-700",
        };
      default:
        return {
          icon: Award,
          label: "Konten",
          className: "bg-gray-100 text-gray-700",
        };
    }
  };

  const typeBadge = getTypeBadge();
  const TypeIcon = typeBadge.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Preview & Validasi Konten
            </h3>
            {hasChanges && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                Sudah diedit
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Type and Status Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${typeBadge.className}`}
            >
              <TypeIcon className="w-4 h-4" />
              {typeBadge.label}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                content.status === "PENDING"
                  ? "bg-orange-100 text-orange-700"
                  : content.status === "APPROVED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {content.status === "PENDING"
                ? "Menunggu Validasi"
                : content.status === "APPROVED"
                  ? "Disetujui"
                  : "Ditolak"}
            </span>
          </div>

          {/* Title Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Judul</label>
              {!isEditing && content.status === "PENDING" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Konten
                </button>
              )}
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-4 py-3 text-xl font-bold text-gray-900 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h4 className="text-2xl font-bold text-gray-900">
                {editedTitle}
              </h4>
            )}
          </div>

          {/* Description/Content Section */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {content.type === "news" ? "Konten" : "Deskripsi"}
            </label>
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 text-gray-700 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Masukkan deskripsi atau konten..."
              />
            ) : (
              <div className="prose max-w-none bg-gray-50 rounded-lg p-4">
                {content.type === "news" ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        editedDescription ||
                        "<p class='text-gray-400'>Tidak ada konten</p>",
                    }}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {editedDescription || "Tidak ada deskripsi"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Editing Actions */}
          {isEditing && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Save className="w-4 h-4" />
                Selesai Edit
              </button>
              <button
                onClick={handleResetChanges}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          )}

          {/* Meta Information */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Penulis</span>
                <p className="font-medium text-gray-900">
                  {content.authorName}
                </p>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Kelas</span>
                <p className="font-medium text-gray-900">
                  {content.authorClass || "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Kategori</span>
                <p className="font-medium text-gray-900">
                  {content.category || "-"}
                </p>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Tanggal</span>
                <p className="font-medium text-gray-900">
                  {new Date(content.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Media Preview */}
          {(content.image || content.videoLink) && (
            <div className="border-t border-gray-200 pt-4">
              <span className="text-sm font-medium text-gray-700 block mb-3">
                Media
              </span>
              <div className="grid gap-4">
                {content.image && (
                  <div className="relative">
                    <a
                      href={content.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Image
                        src={content.image}
                        alt={content.title}
                        width={400}
                        height={300}
                        className="rounded-lg border border-gray-200 object-cover max-h-64 w-auto"
                      />
                    </a>
                  </div>
                )}
                {content.videoLink && (
                  <a
                    href={content.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors w-fit"
                  >
                    Lihat Video
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {content.status === "PENDING" && (
          <div className="flex justify-between items-center gap-3 p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {hasChanges && (
                <span className="text-amber-600">
                  * Perubahan akan disimpan saat disetujui
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onReject(content)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Tolak
              </button>
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                {hasChanges ? "Simpan & Setujui" : "Setujui"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
