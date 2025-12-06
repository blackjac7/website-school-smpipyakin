"use client";

import React, { useState } from "react";
import { X, Download, Eye } from "lucide-react";
import Image from "next/image";

interface ImageGalleryProps {
  images: {
    url: string;
    public_id: string;
    title?: string;
    uploadDate?: string;
  }[];
  onRemove?: (publicId: string) => void;
  className?: string;
}

export default function ImageGallery({
  images,
  onRemove,
  className = "",
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDownload = (url: string, title?: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = title || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemove = async (publicId: string) => {
    if (onRemove) {
      onRemove(publicId);
    }
  };

  if (images.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-2">
          <Eye className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-500">Belum ada gambar yang diupload</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}
      >
        {images.map((image, index) => (
          <div key={image.public_id} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={image.url}
                alt={image.title || `Image ${index + 1}`}
                width={200}
                height={200}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <button
                  onClick={() => setSelectedImage(image.url)}
                  className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Lihat gambar"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(image.url, image.title)}
                  className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                {onRemove && (
                  <button
                    onClick={() => handleRemove(image.public_id)}
                    className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                    title="Hapus"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            {image.title && (
              <p className="mt-2 text-sm text-gray-600 truncate">
                {image.title}
              </p>
            )}

            {/* Upload Date */}
            {image.uploadDate && (
              <p className="text-xs text-gray-400">
                {new Date(image.uploadDate).toLocaleDateString("id-ID")}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <Image
              src={selectedImage}
              alt="Full size"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
