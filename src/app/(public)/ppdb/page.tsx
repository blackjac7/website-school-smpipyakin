"use client";

import { useState, useEffect } from "react";
import PPDBHero from "@/components/ppdb/PPDBHero";
import PPDBInfo from "@/components/ppdb/PPDBInfo";
import PPDBForm from "@/components/ppdb/PPDBForm";
import PPDBStatus from "@/components/ppdb/PPDBStatus";
import { useAntiBot } from "@/hooks/useAntiBot";
import toast from "react-hot-toast";

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

export default function PPDBPage() {
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

  const [statusNISN, setStatusNISN] = useState("");
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

  // Set page title
  useEffect(() => {
    document.title = "PPDB - SMP IP Yakin Jakarta";
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

  // Function to upload all selected documents
  const uploadAllDocuments = async (): Promise<UploadedDocument[]> => {
    const uploadPromises: Promise<UploadedDocument>[] = [];

    // Upload each selected document
    Object.entries(formData.documents).forEach(([documentType, file]) => {
      if (file) {
        const uploadPromise = uploadSingleDocument(file, documentType);
        uploadPromises.push(uploadPromise);
      }
    });

    // Wait for all uploads to complete
    const uploadedDocs = await Promise.all(uploadPromises);
    return uploadedDocs.filter((doc) => doc !== null); // Remove any failed uploads
  };

  // Function to upload a single document
  const uploadSingleDocument = async (
    file: File,
    documentType: string
  ): Promise<UploadedDocument> => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("documentType", documentType);
    uploadFormData.append("nisn", formData.nisn);

    // Use R2 endpoint instead of Cloudinary
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Validate required fields
      if (!formData.namaLengkap || !formData.nisn) {
        toast.error("Nama lengkap dan NISN wajib diisi");
        return;
      }

      // Validate anti-bot measures
      const antiBotValidation = antiBot.validateAntiBot();
      if (!antiBotValidation.isValid) {
        toast.error(antiBotValidation.error || "Validasi keamanan gagal");
        return;
      }

      // Sanitize form data
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

      // Debug: Log current state
      console.log("=== DEBUGGING FORM SUBMISSION ===");
      console.log("Sanitized Form Data:", sanitizedFormData);
      console.log(
        "Selected Documents:",
        Object.entries(formData.documents).filter(([, file]) => file !== null)
      );

      // Step 1: Check if NISN already exists
      toast.loading("Mengecek NISN...", { id: "nisn-check" });

      const checkResponse = await fetch(
        `/api/ppdb/check-nisn?nisn=${encodeURIComponent(sanitizedFormData.nisn as string)}`
      );
      const checkResult = await checkResponse.json();

      toast.dismiss("nisn-check");

      if (checkResponse.ok && checkResult.exists) {
        toast.error(
          `NISN ${sanitizedFormData.nisn} sudah terdaftar dalam sistem PPDB`
        );
        return;
      }

      console.log("NISN check passed:", checkResult.message);

      // Step 2: Upload documents if NISN is available
      let uploadedDocs: UploadedDocument[] = [];
      const selectedFiles = Object.entries(formData.documents).filter(
        ([, file]) => file !== null
      );

      if (selectedFiles.length > 0) {
        toast.loading("Mengupload dokumen...", { id: "upload-progress" });
        uploadedDocs = await uploadAllDocuments();
        toast.dismiss("upload-progress");
        console.log("Uploaded Documents:", uploadedDocs);
      }

      console.log("Uploaded Documents Count:", uploadedDocs.length);

      // Step 3: Submit basic data + document URLs to database
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

      console.log("Submission Data:", submissionData);

      // Submit to backend API
      toast.loading("Menyimpan data pendaftaran...", { id: "submit-progress" });
      const response = await fetch("/api/ppdb/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      toast.dismiss("submit-progress");
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Pendaftaran gagal");
      }

      setSubmitStatus("success");
      toast.success(
        `🎉 Pendaftaran PPDB berhasil dikirim! ${uploadedDocs.length} dokumen telah tersimpan dalam sistem.`
      );

      // Reset form after successful submission
      setFormData({
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

      // Scroll to success message
      setTimeout(() => {
        const formSection = document.getElementById("ppdb-form");
        if (formSection) {
          formSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (error) {
      setSubmitStatus("error");
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memproses pendaftaran"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusCheck = async () => {
    if (!statusNISN.trim()) {
      toast.error("Silakan masukkan NISN terlebih dahulu");
      return;
    }

    try {
      const response = await fetch(
        `/api/ppdb/status?nisn=${encodeURIComponent(statusNISN)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengecek status");
      }

      if (result.success) {
        const { data } = result;
        toast.success(
          `Status NISN ${statusNISN}: ${data.statusMessage}${data.feedback ? `\n\nCatatan: ${data.feedback}` : ""}`,
          { duration: 8000 }
        );
      }
    } catch (error) {
      console.error("Status check error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengecek status"
      );
    }
  };

  const handleDownloadGuide = () => {
    // Simulate PDF download
    toast.success(
      "Panduan PPDB akan segera diunduh. File PDF akan tersimpan di folder Download Anda.",
      { duration: 5000 }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <PPDBHero />

      {/* Information Section */}
      <PPDBInfo onDownloadGuide={handleDownloadGuide} />

      {/* Registration Form */}
      <div id="ppdb-form">
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

      {/* Status Check Section */}
      <PPDBStatus
        statusNISN={statusNISN}
        onNISNChange={setStatusNISN}
        onStatusCheck={handleStatusCheck}
      />
    </div>
  );
}
