"use client";

import React, { useState, useRef } from "react";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { uploadImageAction, deleteImageAction } from "@/actions/upload";

interface UploadedFile {
  url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

interface ImageUploadProps {
  onUpload?: (file: UploadedFile) => void;
  onRemove?: (publicId: string) => void;
  currentImage?: string;
  folder?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  className?: string;
  label?: string;
  required?: boolean;
}

export default function ImageUpload({
  onUpload,
  onRemove,
  currentImage,
  folder = "uploads",
  maxSizeMB = 5,
  acceptedFormats = ["JPEG", "PNG", "WebP"],
  className = "",
  label = "Upload Image",
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    const fileType = file.type.toLowerCase();
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(fileType)) {
      setError(`Format tidak didukung. Gunakan: ${acceptedFormats.join(", ")}`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File terlalu besar. Maksimal ${maxSizeMB}MB`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const result = await uploadImageAction(formData);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Upload gagal");
      }

      if (result.success && onUpload) {
        // Map the result to match expected format if needed, but action returns same structure
        onUpload(result.data as UploadedFile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = async () => {
    if (currentImage && onRemove) {
      try {
        // Extract public_id from current image URL if it's a Cloudinary URL
        const matches = currentImage.match(/\/v\d+\/(.+)\./);
        if (matches && matches[1]) {
          const publicId = matches[1];

          const result = await deleteImageAction(publicId);

          if (result.success) {
            onRemove(publicId);
            setPreview(null);
          }
        } else {
          // If not a Cloudinary URL, just remove from UI
          onRemove("");
          setPreview(null);
        }
      } catch (err) {
        console.error("Remove failed:", err);
        // Still remove from UI even if API call fails
        onRemove("");
        setPreview(null);
      }
    } else {
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : preview
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Uploading...</span>
            </div>
          </div>
        )}

        {preview ? (
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="text-center cursor-pointer" onClick={openFileDialog}>
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {acceptedFormats.join(", ")} up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats.map((f) => `.${f.toLowerCase()}`).join(",")}
          onChange={handleInputChange}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}
