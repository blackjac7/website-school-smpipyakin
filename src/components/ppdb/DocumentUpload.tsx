"use client";

import { useState, useRef } from "react";
import { Upload, File, CheckCircle, X, Eye, AlertCircle } from "lucide-react";

interface DocumentUploadProps {
  label: string;
  documentType: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export default function DocumentUpload({
  label,
  documentType,
  file,
  onFileChange,
  required = false,
  maxSize = 5,
  acceptedTypes = ["image/*", "application/pdf"],
}: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (selectedFile: File): boolean => {
    setUploadError("");

    // Check file size
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setUploadError(`Ukuran file maksimal ${maxSize}MB`);
      return false;
    }

    // Check file type
    const isValidType = acceptedTypes.some((type) => {
      if (type.includes("*")) {
        return selectedFile.type.startsWith(type.split("*")[0]);
      }
      return selectedFile.type === type;
    });

    if (!isValidType) {
      setUploadError("Format file tidak didukung");
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      onFileChange(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
      return "🖼️";
    } else if (extension === "pdf") {
      return "📄";
    }
    return "📄";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? "border-amber-400 bg-amber-50"
              : "border-gray-300 hover:border-amber-400 hover:bg-amber-50"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center space-y-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDragOver ? "bg-amber-200" : "bg-gray-100"
              }`}
            >
              <Upload
                className={`w-6 h-6 ${
                  isDragOver ? "text-amber-600" : "text-gray-400"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Klik untuk upload atau drag & drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPG, PNG maksimal {maxSize}MB
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">{getFileIcon(file.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            </div>
            <div className="flex items-center space-x-2 ml-3">
              <button
                type="button"
                onClick={() => {
                  // Preview file (could implement modal preview)
                  console.log("Preview:", file);
                }}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Hapus"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{uploadError}</span>
        </div>
      )}

      {/* File Requirements */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <p className="font-medium mb-1">Persyaratan:</p>
        <ul className="space-y-1">
          <li>• Format: PDF, JPG, PNG</li>
          <li>• Ukuran maksimal: {maxSize}MB</li>
          <li>• Dokumen harus jelas dan dapat dibaca</li>
          {documentType === "pasFoto" && (
            <li>• Foto formal dengan latar belakang putih/merah</li>
          )}
        </ul>
      </div>
    </div>
  );
}
