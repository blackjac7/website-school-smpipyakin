"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PPDBForm from "@/components/ppdb/PPDBForm";
import { useAntiBot } from "@/hooks/useAntiBot";
import toast from "react-hot-toast";
import Link from "next/link";

interface FormData {
  namaLengkap: string;
  nisn: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamatLengkap: string;
  asalSekolah: string;
  kontakOrtu: string;
  namaOrtu: string;
  emailOrtu: string;
  documents: {
    ijazah: File | null;
    aktaKelahiran: File | null;
    kartuKeluarga: File | null;
    pasFoto: File | null;
  };
}

interface UploadedDocument {
  cloudinaryId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
}

export default function PPDBRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    namaLengkap: "",
    nisn: "",
    jenisKelamin: "",
    tempatLahir: "",
    tanggalLahir: "",
    alamatLengkap: "",
    asalSekolah: "",
    kontakOrtu: "",
    namaOrtu: "",
    emailOrtu: "",
    documents: {
      ijazah: null,
      aktaKelahiran: null,
      kartuKeluarga: null,
      pasFoto: null,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Anti-bot protection for PPDB
  const antiBot = useAntiBot("ppdb", {
    enableCaptcha: true,
    enableHoneypot: true,
    enableRateLimit: true,
  });

  useEffect(() => {
    document.title = "Daftar - PPDB | SMP IP Yakin Jakarta";
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (
    documentType: keyof FormData["documents"],
    file: File | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file,
      },
    }));
  };

  const uploadSingleDocument = async (
    file: File,
    documentType: string
  ): Promise<UploadedDocument> => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("documentType", documentType);
    uploadFormData.append("nisn", formData.nisn);

    const response = await fetch("/api/ppdb/upload-r2", {
      method: "POST",
      body: uploadFormData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Upload ${documentType} gagal: ${result.error}`);
    }

    return result.data;
  };

  const uploadAllDocuments = async (): Promise<UploadedDocument[]> => {
    const uploadPromises: Promise<UploadedDocument>[] = [];

    Object.entries(formData.documents).forEach(([documentType, file]) => {
      if (file) {
        const uploadPromise = uploadSingleDocument(file, documentType);
        uploadPromises.push(uploadPromise);
      }
    });

    const uploadedDocs = await Promise.all(uploadPromises);
    return uploadedDocs.filter((doc) => doc !== null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      if (!formData.namaLengkap || !formData.nisn) {
        toast.error("Nama lengkap dan NISN wajib diisi");
        antiBot.generateCaptcha();
        return;
      }

      const antiBotValidation = antiBot.validateAntiBot();
      if (!antiBotValidation.isValid) {
        toast.error(antiBotValidation.error || "Validasi keamanan gagal");
        antiBot.generateCaptcha();
        return;
      }

      const sanitizedFormData = antiBot.sanitizeFormData({
        namaLengkap: formData.namaLengkap,
        nisn: formData.nisn,
        jenisKelamin: formData.jenisKelamin,
        tempatLahir: formData.tempatLahir,
        tanggalLahir: formData.tanggalLahir,
        alamatLengkap: formData.alamatLengkap,
        asalSekolah: formData.asalSekolah,
        kontakOrtu: formData.kontakOrtu,
        namaOrtu: formData.namaOrtu,
        emailOrtu: formData.emailOrtu,
      });

      toast.loading("Mengecek NISN...", { id: "nisn-check" });

      const checkResponse = await fetch(
        `/api/ppdb/check-nisn?nisn=${encodeURIComponent(sanitizedFormData.nisn as string)}`
      );
      const checkResult = await checkResponse.json();

      toast.dismiss("nisn-check");

      if (checkResponse.ok && checkResult.exists) {
        const existing = checkResult.data || {};
        if (existing.status === "REJECTED" && existing.allowRetry) {
          toast(
            `NISN ${sanitizedFormData.nisn} sebelumnya ditolak. Anda diizinkan mendaftar ulang SEKALI. Melanjutkan pendaftaran...`,
            { icon: "⚠️" }
          );
        } else {
          toast.error(
            `NISN ${sanitizedFormData.nisn} sudah terdaftar dalam sistem PPDB`
          );
          antiBot.generateCaptcha();
          return;
        }
      }

      const selectedFiles = Object.values(formData.documents).filter(
        (file) => file !== null
      );
      let uploadedDocs: UploadedDocument[] = [];

      if (selectedFiles.length > 0) {
        toast.loading("Mengupload dokumen...", { id: "upload-progress" });
        uploadedDocs = await uploadAllDocuments();
        toast.dismiss("upload-progress");
      }

      const submissionData = {
        namaLengkap: sanitizedFormData.namaLengkap,
        nisn: sanitizedFormData.nisn,
        jenisKelamin: sanitizedFormData.jenisKelamin,
        tempatLahir: sanitizedFormData.tempatLahir,
        tanggalLahir: sanitizedFormData.tanggalLahir,
        alamatLengkap: sanitizedFormData.alamatLengkap,
        asalSekolah: sanitizedFormData.asalSekolah,
        kontakOrtu: sanitizedFormData.kontakOrtu,
        namaOrtu: sanitizedFormData.namaOrtu,
        emailOrtu: sanitizedFormData.emailOrtu,
        documents: uploadedDocs,
      };

      const response = await fetch("/api/ppdb/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim pendaftaran");
      }

      setSubmitStatus("success");
      toast.success(
        `🎉 Pendaftaran PPDB berhasil dikirim! ${uploadedDocs.length} dokumen telah tersimpan dalam sistem.`
      );

      // Redirect to success page with registration data
      const params = new URLSearchParams({
        id: result.data.id,
        nisn: result.data.nisn,
        name: result.data.name,
        createdAt: result.data.createdAt,
      });

      router.push(`/ppdb/success?${params.toString()}`);
    } catch (error) {
      setSubmitStatus("error");
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memproses pendaftaran"
      );
      antiBot.generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div
        id="ppdb-register"
        className="max-w-4xl mx-auto px-4 pt-24 pb-12"
        style={{ scrollMarginTop: "6rem" }}
      >
        <div className="mb-6">
          <nav className="text-sm text-gray-600 mb-2">
            <Link href="/ppdb" className="underline">
              Kembali ke PPDB
            </Link>
          </nav>
          <h1 className="text-3xl font-bold">Formulir Pendaftaran PPDB</h1>
          <p className="text-gray-600 mt-2">
            Lengkapi data pendaftaran. Pastikan NISN benar.
          </p>
        </div>

        <PPDBForm
          formData={formData}
          isSubmitting={isSubmitting}
          submitStatus={submitStatus}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onFileChange={handleFileChange}
          antiBot={{
            captcha: antiBot.captcha,
            userCaptchaAnswer: antiBot.userCaptchaAnswer,
            setUserCaptchaAnswer: antiBot.setUserCaptchaAnswer,
            generateCaptcha: antiBot.generateCaptcha,
            honeypot: antiBot.honeypot,
            setHoneypot: antiBot.setHoneypot,
            honeypotFieldName: antiBot.honeypotFieldName,
            isClient: antiBot.isClient,
          }}
        />
      </div>
    </div>
  );
}
