"use client";

import { FileText, Info } from "lucide-react";
import CloudinaryDocumentUpload from "./CloudinaryDocumentUpload";

interface UploadedDocument {
  cloudinaryId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
}

interface DocumentsSectionProps {
  documents: {
    ijazah: File | null;
    aktaKelahiran: File | null;
    kartuKeluarga: File | null;
    pasFoto: File | null;
  };
  uploadedDocuments?: UploadedDocument[];
  onFileChange: (
    documentType: keyof DocumentsSectionProps["documents"],
    file: File | null
  ) => void;
  onDocumentUploaded?: (documentData: UploadedDocument) => void;
  nisn?: string;
}

export default function DocumentsSection({
  documents,
  uploadedDocuments = [],
  onFileChange,
}: DocumentsSectionProps) {
  const documentList = [
    {
      key: "ijazah" as const,
      label: "Ijazah/SKHUN SD",
      required: false,
      description:
        "Scan/foto ijazah atau SKHUN dari sekolah dasar. Format: JPG/PNG/PDF (1 lembar)",
    },
    {
      key: "aktaKelahiran" as const,
      label: "Akta Kelahiran",
      required: false,
      description:
        "Scan/foto akta kelahiran yang jelas. Format: JPG/PNG/PDF (1 lembar)",
    },
    {
      key: "kartuKeluarga" as const,
      label: "Kartu Keluarga",
      required: false,
      description:
        "Scan/foto kartu keluarga terbaru. Format: JPG/PNG/PDF (1 lembar)",
    },
    {
      key: "pasFoto" as const,
      label: "Pas Foto",
      required: false,
      description:
        "Foto formal dengan latar belakang putih/merah. Format: JPG/PNG/PDF (1 lembar)",
    },
  ];

  const selectedCount = Object.values(documents).filter(
    (doc) => doc !== null
  ).length;

  const getUploadedDocument = (docType: string) => {
    return uploadedDocuments.find((doc) => doc.documentType === docType);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Upload Dokumen</h3>
          <p className="text-sm text-gray-600">
            Upload dokumen pendaftaran (opsional, namun sangat direkomendasikan
            untuk mempercepat proses verifikasi)
          </p>
        </div>
      </div>

      {/* Important Notice for PDF */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚠️</span>
          <span className="text-sm font-semibold text-amber-900">
            Penting: Ketentuan Upload PDF
          </span>
        </div>
        <p className="text-xs text-amber-800">
          📄 File PDF akan otomatis dikonversi menjadi gambar untuk keamanan
          sistem.
          <br />
          📋 Pastikan dokumen PDF hanya berisi <strong>1 lembar saja</strong>,
          tidak boleh multi-halaman.
          <br />
          💡 Untuk hasil terbaik, gunakan format JPG atau PNG.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-900">
              Progress Pilih Dokumen
            </span>
          </div>
          <span className="text-sm font-bold text-green-700">
            {selectedCount}/{documentList.length} Dokumen
          </span>
        </div>

        <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{
              width: `${(selectedCount / documentList.length) * 100}%`,
            }}
          ></div>
        </div>

        <p className="text-xs text-green-700 mt-2">
          {selectedCount === 0
            ? "📋 Pilih dokumen yang ingin diupload (opsional namun direkomendasikan)"
            : selectedCount === documentList.length
              ? "✅ Semua dokumen sudah dipilih! Akan diupload saat form disubmit"
              : `📄 ${selectedCount} dari ${documentList.length} dokumen sudah dipilih`}
        </p>
      </div>

      {/* Documents Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentList.map((doc) => (
          <CloudinaryDocumentUpload
            key={doc.key}
            documentType={doc.key}
            label={doc.label}
            description={doc.description}
            required={doc.required}
            file={documents[doc.key]}
            uploadedDocument={getUploadedDocument(doc.key)}
            onFileChange={(file: File | null) => onFileChange(doc.key, file)}
          />
        ))}
      </div>

      {/* Important Notes */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <h4 className="text-sm font-semibold text-amber-900 mb-2">
          📋 Catatan Penting:
        </h4>
        <ul className="text-xs text-amber-800 space-y-1">
          <li>
            • <strong>Pilih file dokumen</strong> - Upload otomatis saat form
            disubmit
          </li>
          <li>• Pastikan semua dokumen dapat dibaca dengan jelas</li>
          <li>• Format file yang diterima: PDF, JPG, PNG</li>
          <li>• Ukuran maksimal setiap file: 5MB</li>
          <li>• Dokumen dengan tanda (*) wajib diupload</li>
          <li>• Dokumen akan tersimpan aman di cloud storage</li>
        </ul>
      </div>

      {/* Digital Storage Benefits */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
        <h4 className="text-sm font-semibold text-green-900 mb-2">
          ✨ Keuntungan Sistem Digital:
        </h4>
        <ul className="text-xs text-green-800 space-y-1">
          <li>• Proses pendaftaran lebih cepat dan efisien</li>
          <li>• Tidak perlu datang ke sekolah untuk menyerahkan berkas</li>
          <li>• Dokumen tersimpan aman dan dapat diakses kapan saja</li>
          <li>• Status verifikasi dapat dipantau secara real-time</li>
          <li>• Ramah lingkungan dengan mengurangi penggunaan kertas</li>
        </ul>
      </div>
    </div>
  );
}
