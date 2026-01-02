"use client";

import React, { useState, useRef } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

interface FileInputProps {
  onFileSelect: (file: File | null) => void;
  currentFile?: File | null;
  maxSizeMB?: number;
  acceptedFormats?: string[]; // e.g., ["PDF", "DOC", "DOCX"]
  className?: string;
  label?: string;
  required?: boolean;
}

export default function FileInput({
  onFileSelect,
  currentFile,
  maxSizeMB = 10,
  acceptedFormats = ["PDF"],
  className = "",
  label = "Upload File",
  required = false,
}: FileInputProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(currentFile || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMimeTypes = (formats: string[]) => {
    const mimeMap: Record<string, string> = {
      PDF: "application/pdf",
      DOC: "application/msword",
      DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      XLS: "application/vnd.ms-excel",
      XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    return formats.map((f) => mimeMap[f.toUpperCase()]).filter(Boolean);
  };

  const handleFile = (selectedFile: File) => {
    setError(null);

    // Validate file type
    const allowedMimeTypes = getMimeTypes(acceptedFormats);
    if (!allowedMimeTypes.includes(selectedFile.type)) {
      setError(`Format tidak didukung. Gunakan: ${acceptedFormats.join(", ")}`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`File terlalu besar. Maksimal ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);
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

  const handleRemove = () => {
    setFile(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!file ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={getMimeTypes(acceptedFormats).join(",")}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            required={required}
          />

          <div className="flex flex-col items-center justify-center text-center">
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold text-blue-600">
                Klik untuk upload
              </span>{" "}
              atau drag & drop
            </p>
            <p className="text-xs text-gray-500">
              {acceptedFormats.join(", ")} (Max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <DocumentIcon className="w-10 h-10 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="ml-3 p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            title="Hapus file"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <XMarkIcon className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
