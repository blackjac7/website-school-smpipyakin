"use client";

import { useState, useEffect } from "react";
import PPDBHero from "@/components/ppdb/PPDBHero";
import PPDBInfo from "@/components/ppdb/PPDBInfo";
import PPDBForm from "@/components/ppdb/PPDBForm";
import PPDBStatus from "@/components/ppdb/PPDBStatus";

interface FormData {
  namaLengkap: string;
  nisn: string;
  jenisKelamin: string;
  tanggalLahir: string;
  alamatLengkap: string;
  asalSekolah: string;
  kontakOrtu: string;
}

export default function PPDBPage() {
  const [formData, setFormData] = useState<FormData>({
    namaLengkap: "",
    nisn: "",
    jenisKelamin: "",
    tanggalLahir: "",
    alamatLengkap: "",
    asalSekolah: "",
    kontakOrtu: "",
  });

  const [statusNISN, setStatusNISN] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Set page title
  useEffect(() => {
    document.title = "PPDB - SMP IP Yakin Jakarta";
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form submitted:", formData);
      setSubmitStatus("success");

      // Reset form after successful submission
      setFormData({
        namaLengkap: "",
        nisn: "",
        jenisKelamin: "",
        tanggalLahir: "",
        alamatLengkap: "",
        asalSekolah: "",
        kontakOrtu: "",
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusCheck = () => {
    if (statusNISN.trim()) {
      // Simulate status check with realistic responses
      const statuses = [
        "Pendaftaran Anda sedang dalam tahap verifikasi dokumen. Estimasi waktu: 2-3 hari kerja.",
        "Selamat! Pendaftaran Anda telah DITERIMA. Silakan lakukan daftar ulang tanggal 16-20 Juli 2025.",
        "Dokumen Anda perlu dilengkapi. Silakan hubungi kami via WhatsApp untuk informasi lebih lanjut.",
        "NISN tidak ditemukan dalam database. Pastikan nomor yang dimasukkan benar atau hubungi admin.",
      ];

      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];
      alert(`Status untuk NISN ${statusNISN}:\n\n${randomStatus}`);
    } else {
      alert("Silakan masukkan NISN terlebih dahulu");
    }
  };

  const handleDownloadGuide = () => {
    // Simulate PDF download
    alert(
      "Panduan PPDB akan segera diunduh. File PDF akan tersimpan di folder Download Anda."
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
