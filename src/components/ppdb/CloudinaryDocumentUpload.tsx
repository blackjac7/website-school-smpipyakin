import React, { useState } from "react";
import { Upload, Check, X, AlertCircle, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface CloudinaryDocumentUploadProps {
  documentType: string;
  label: string;
  description: string;
  required: boolean;
  file: File | null;
  uploadedDocument?: {
    cloudinaryId: string;
    url: string;
    fileName: string;
  } | null;
  onFileChange: (file: File | null) => void;
  onDocumentUploaded?: (documentData: {
    cloudinaryId: string;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    documentType: string;
  }) => void;
  nisn?: string;
}

export default function CloudinaryDocumentUpload({
  documentType,
  label,
  description,
  required,
  file,
  uploadedDocument,
  onFileChange,
}: CloudinaryDocumentUploadProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] || null;

    if (!selectedFile) {
      onFileChange(null);
      return;
    }

    // Validasi ukuran file (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file tidak boleh lebih dari 5MB");
      return;
    }

    // Validasi tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Format file harus JPG, PNG, atau PDF");
      return;
    }

    // Peringatan khusus untuk PDF
    if (selectedFile.type === "application/pdf") {
      toast(
        "📄 PDF akan dikonversi menjadi gambar. Pastikan dokumen PDF hanya 1 lembar!",
        {
          icon: "⚠️",
          duration: 5000,
          style: {
            background: "#fbbf24",
            color: "#92400e",
          },
        }
      );
    }

    onFileChange(selectedFile);
    setUploadError(null);

    toast(`${label} dipilih. File akan diupload saat form disubmit.`, {
      icon: "📎",
      duration: 3000,
    });
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    setUploadError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const hasUploadedDocument = uploadedDocument || file;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            {label}
            {required && <span className="text-red-500 text-sm">*</span>}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="space-y-3">
        {!hasUploadedDocument && (
          <div className="relative">
            <input
              type="file"
              id={`upload-${documentType}`}
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors border-gray-300 hover:border-blue-400 hover:bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Klik untuk pilih file atau drag & drop
                </span>
                <span className="text-xs text-gray-500">
                  JPG, PNG, PDF (Max 5MB)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{uploadError}</span>
          </div>
        )}

        {/* Selected File (Ready for batch upload) */}
        {file && !uploadedDocument && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-800">{file.name}</p>
                <p className="text-xs text-blue-600">
                  {formatFileSize(file.size)} - Akan diupload saat form disubmit
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 transition-colors"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Successfully Uploaded File */}
        {uploadedDocument && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {uploadedDocument.fileName}
                </p>
                <p className="text-xs text-green-600">
                  Berhasil diupload ke cloud storage
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={uploadedDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                Lihat
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
