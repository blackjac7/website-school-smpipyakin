"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  MapPin,
  Calendar,
  School,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MessageSquare,
  Save,
  UserCheck,
  UserX,
  Loader2,
  FileCheck,
  FileX,
  Star,
  Users,
  Home,
  Baby,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Applicant {
  id: string;
  name: string;
  nisn: string;
  gender: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  address: string | null;
  asalSekolah: string | null;
  parentContact: string | null;
  parentName: string | null;
  parentEmail: string | null;
  status: string;
  statusColor?: string;
  feedback: string | null;
  documents?: {
    ijazah: boolean;
    akta: boolean;
    kk: boolean;
    foto: boolean;
  };
  documentUrls?: {
    ijazahUrl: string | null;
    aktaKelahiranUrl: string | null;
    kartuKeluargaUrl: string | null;
    pasFotoUrl: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

interface ApplicantDetailModalProps {
  isOpen: boolean;
  applicant: Applicant | null;
  onClose: () => void;
  onStatusUpdate: (id: string, status: string, feedback: string) => void;
}

export default function ApplicantDetailModal({
  isOpen,
  applicant,
  onClose,
  onStatusUpdate,
}: ApplicantDetailModalProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [validationAction, setValidationAction] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (applicant) {
      setFeedback(applicant.feedback || "");
      setValidationAction("");
    }
  }, [applicant]);

  if (!isOpen || !applicant) return null;

  const handleValidationSubmit = async () => {
    if (!validationAction) {
      toast.error("Pilih tindakan validasi terlebih dahulu");
      return;
    }

    if (validationAction === "REJECTED" && !feedback.trim()) {
      toast.error("Feedback wajib diisi untuk penolakan");
      return;
    }

    setIsSubmitting(true);

    try {
      await onStatusUpdate(applicant.id, validationAction, feedback);

      // Notification Simulation
      toast.success(`Notifikasi email dikirim ke ${applicant.parentEmail || 'pemohon'}`, {
         icon: '📧',
         duration: 4000
      });

      // WhatsApp Prompt
      if (applicant.parentContact) {
          let phone = applicant.parentContact.replace(/\D/g, '');
          if (phone.startsWith('0')) phone = '62' + phone.substring(1);

          const message = encodeURIComponent(
             `Yth. Bpk/Ibu ${applicant.parentName || 'Wali'}, status pendaftaran Calon Siswa ${applicant.name} telah diperbarui menjadi ${validationAction === 'ACCEPTED' ? 'DITERIMA' : validationAction === 'REJECTED' ? 'DITOLAK' : 'PENDING'}. ${feedback ? 'Catatan: ' + feedback : ''} - Panitia PPDB SMP IP Yakin`
          );

          const waLink = `https://wa.me/${phone}?text=${message}`;

          toast((t) => (
            <div className="flex flex-col gap-2">
                <span>Kirim notifikasi WhatsApp?</span>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            window.open(waLink, '_blank');
                            toast.dismiss(t.id);
                        }}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold"
                    >
                        Kirim WA
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-200 px-2 py-1 rounded text-xs"
                    >
                        Nanti
                    </button>
                </div>
            </div>
          ), { duration: 6000 });
      }

      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal memperbarui status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock className="w-4 h-4" />
            Menunggu Review
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="w-4 h-4" />
            Diterima
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-4 h-4" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <AlertTriangle className="w-4 h-4" />
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateStr: string | Date | null) => {
    if (!dateStr) return "Tidak diisi";
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateAge = (birthDate: string | Date | null) => {
    if (!birthDate) return "Tidak diisi";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return `${age} tahun`;
  };

  const openImagePreview = (url: string) => {
    setPreviewImage(url);
  };

  const tabs = [
    { id: "personal", label: "Data Pribadi", icon: User },
    { id: "documents", label: "Dokumen", icon: FileText },
    { id: "validation", label: "Validasi", icon: CheckCircle },
  ];

  const documentTypes = [
    {
      key: "foto",
      label: "Pas Foto",
      urlKey: "pasFotoUrl",
      icon: User,
      required: true,
    },
    {
      key: "ijazah",
      label: "Ijazah/SKHUN",
      urlKey: "ijazahUrl",
      icon: GraduationCap,
      required: true,
    },
    {
      key: "akta",
      label: "Akta Kelahiran",
      urlKey: "aktaKelahiranUrl",
      icon: Baby,
      required: true,
    },
    {
      key: "kk",
      label: "Kartu Keluarga",
      urlKey: "kartuKeluargaUrl",
      icon: Home,
      required: true,
    },
  ];

  const completedDocs = documentTypes.filter(
    (doc) => applicant.documents?.[doc.key as keyof typeof applicant.documents]
  ).length;

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{applicant.name}</h2>
                  <p className="text-blue-100">NISN: {applicant.nisn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(applicant.status)}
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-6 bg-black/20 p-1 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Personal Data Tab */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                {/* Basic Info Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Informasi Dasar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Nama Lengkap
                        </label>
                        <p className="text-gray-900 font-medium">
                          {applicant.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          NISN
                        </label>
                        <p className="text-gray-900 font-medium">
                          {applicant.nisn}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Jenis Kelamin
                        </label>
                        <p className="text-gray-900 font-medium">
                          {applicant.gender === "L"
                            ? "Laki-laki"
                            : applicant.gender === "P"
                              ? "Perempuan"
                              : "Tidak diisi"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Tempat Lahir
                        </label>
                        <p className="text-gray-900 font-medium">
                          {applicant.birthPlace || "Tidak diisi"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Tanggal Lahir
                        </label>
                        <p className="text-gray-900 font-medium">
                          {formatDate(applicant.birthDate)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Usia
                        </label>
                        <p className="text-gray-900 font-medium">
                          {calculateAge(applicant.birthDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Alamat
                  </h3>
                  <p className="text-gray-900">
                    {applicant.address || "Tidak diisi"}
                  </p>
                </div>

                {/* Parent Info Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    Data Orang Tua/Wali
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Nama
                      </label>
                      <p className="text-gray-900 font-medium">
                        {applicant.parentName || "Tidak diisi"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        No. Telepon
                      </label>
                      <p className="text-gray-900 font-medium">
                        {applicant.parentContact || "Tidak diisi"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-gray-900 font-medium break-all">
                        {applicant.parentEmail || "Tidak diisi"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* School Info Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <School className="w-5 h-5 text-amber-600" />
                    Asal Sekolah
                  </h3>
                  <p className="text-gray-900 font-medium">
                    {applicant.asalSekolah || "Tidak diisi"}
                  </p>
                </div>

                {/* Registration Info */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    Informasi Pendaftaran
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Tanggal Daftar
                      </label>
                      <p className="text-gray-900 font-medium">
                        {formatDate(applicant.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Terakhir Update
                      </label>
                      <p className="text-gray-900 font-medium">
                        {formatDate(applicant.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="space-y-6">
                {/* Document Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Kelengkapan Dokumen
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-blue-600">
                        {completedDocs}
                      </div>
                      <div className="text-sm text-gray-500">
                        / {documentTypes.length}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(completedDocs / documentTypes.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {completedDocs === documentTypes.length
                        ? "Semua dokumen lengkap"
                        : `${documentTypes.length - completedDocs} dokumen belum dilengkapi`}
                    </p>
                  </div>
                </div>

                {/* Document List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documentTypes.map((doc) => {
                    const isAvailable =
                      applicant.documents?.[
                        doc.key as keyof typeof applicant.documents
                      ];
                    const url =
                      applicant.documentUrls?.[
                        doc.urlKey as keyof typeof applicant.documentUrls
                      ];

                    return (
                      <div
                        key={doc.key}
                        className={`rounded-xl p-4 border-2 transition-all ${
                          isAvailable
                            ? "bg-green-50 border-green-200 shadow-sm"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isAvailable ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              <doc.icon
                                className={`w-5 h-5 ${
                                  isAvailable
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {doc.label}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                {isAvailable ? (
                                  <span className="inline-flex items-center gap-1 text-sm text-green-700">
                                    <FileCheck className="w-3 h-3" />
                                    Tersedia
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-sm text-red-700">
                                    <FileX className="w-3 h-3" />
                                    Tidak tersedia
                                  </span>
                                )}
                                {doc.required && (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                    Wajib
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isAvailable && url && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => openImagePreview(url)}
                                className="w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center transition-colors"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Validation Tab */}
            {activeTab === "validation" && (
              <div className="space-y-6">
                {/* Current Status */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-gray-600" />
                    Status Saat Ini
                  </h3>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(applicant.status)}
                    <div className="text-sm text-gray-600">
                      Terakhir diperbarui: {formatDate(applicant.updatedAt)}
                    </div>
                  </div>
                </div>

                {/* Current Feedback */}
                {applicant.feedback && (
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-600" />
                      Feedback Sebelumnya
                    </h3>
                    <p className="text-gray-800 bg-white p-4 rounded-lg border">
                      {applicant.feedback}
                    </p>
                  </div>
                )}

                {/* Validation Actions */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Tindakan Validasi
                  </h3>

                  <div className="space-y-4">
                    {/* Action Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => setValidationAction("ACCEPTED")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          validationAction === "ACCEPTED"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                        }`}
                      >
                        <UserCheck className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Terima</div>
                        <div className="text-sm text-gray-600">
                          Pendaftar diterima
                        </div>
                      </button>

                      <button
                        onClick={() => setValidationAction("REJECTED")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          validationAction === "REJECTED"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                        }`}
                      >
                        <UserX className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Tolak</div>
                        <div className="text-sm text-gray-600">
                          Pendaftar ditolak
                        </div>
                      </button>

                      <button
                        onClick={() => setValidationAction("PENDING")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          validationAction === "PENDING"
                            ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                            : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50"
                        }`}
                      >
                        <Clock className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-medium">Pending</div>
                        <div className="text-sm text-gray-600">
                          Perlu review lagi
                        </div>
                      </button>
                    </div>

                    {/* Feedback Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan/Feedback
                        {validationAction === "REJECTED" && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder={
                          validationAction === "ACCEPTED"
                            ? "Selamat! Anda diterima di sekolah kami..."
                            : validationAction === "REJECTED"
                              ? "Mohon maaf, pendaftaran Anda belum dapat kami terima karena..."
                              : "Berikan catatan untuk pendaftar..."
                        }
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleValidationSubmit}
                        disabled={!validationAction || isSubmitting}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                          validationAction && !isSubmitting
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isSubmitting ? "Menyimpan..." : "Simpan Validasi"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={previewImage}
              alt="Document preview"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              unoptimized
            />
          </div>
        </div>
      )}
    </>
  );
}
