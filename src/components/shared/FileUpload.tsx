"use client";

import React, { useState, useRef } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { FileText, Download, ExternalLink } from "lucide-react";

interface UploadedFile {
  url: string;
  key: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileType: string;
}

interface FileUploadProps {
  onUpload?: (file: UploadedFile) => void;
  onRemove?: (key: string) => void;
  currentFile?: string; // URL of current file
  folder?: string; // Folder path in R2 (proposals, announcements, guides)
  fileType?: string; // Type identifier (proposal, attachment, guide)
  maxSizeMB?: number;
  acceptedFormats?: string[]; // e.g., ["PDF", "DOC", "DOCX"]
  className?: string;
  label?: string;
  required?: boolean;
}

export default function FileUpload({
  onUpload,
  onRemove,
  currentFile,
  folder = "misc",
  fileType = "document",
  maxSizeMB = 10,
  acceptedFormats = ["PDF"],
  className = "",
  label = "Upload File",
  required = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(currentFile || null);
  const [fileName, setFileName] = useState<string | null>(null);
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

  const handleFile = async (file: File) => {
    setError(null);

    // Validate file type
    const allowedMimeTypes = getMimeTypes(acceptedFormats);
    if (!allowedMimeTypes.includes(file.type)) {
      setError(`Format tidak didukung. Gunakan: ${acceptedFormats.join(", ")}`);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`File terlalu besar. Maksimal ${maxSizeMB}MB`);
      return;
    }

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("fileType", fileType);

      const response = await fetch("/api/upload-files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Upload gagal");
      }

      setFileUrl(result.data.url);
      setFileName(result.data.fileName);

      if (onUpload) {
        onUpload(result.data as UploadedFile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
      setFileUrl(currentFile || null);
      setFileName(null);
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

  const handleRemove = () => {
    if (fileUrl && onRemove) {
      // Extract key from URL if it's an R2 URL
      const urlParts = fileUrl.split("/");
      const key = urlParts.slice(-3).join("/"); // Get folder/fileType_timestamp_name.ext
      onRemove(key);
    }
    setFileUrl(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!fileUrl ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
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
            disabled={uploading}
          />

          <div className="flex flex-col items-center text-center">
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              {uploading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  Mengupload...
                </span>
              ) : (
                <>
                  <span className="font-medium text-blue-600">
                    Klik untuk upload
                  </span>{" "}
                  atau drag & drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {acceptedFormats.join(", ")} (Maks. {maxSizeMB}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <DocumentIcon className="w-10 h-10 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {fileName || "File uploaded"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {acceptedFormats.join(", ")} • Tersimpan
              </p>
              <div className="flex gap-2 mt-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <ExternalLink className="w-3 h-3" />
                  Lihat
                </a>
                <a
                  href={fileUrl}
                  download
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <Download className="w-3 h-3" />
                  Download
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-2 text-sm text-red-600">
          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
