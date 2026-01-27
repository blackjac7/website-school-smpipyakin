"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import { QrCode, Download, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { getStudentQRCode } from "@/actions/lateness";

interface StudentQRCodeProps {
  siswaId: string;
}

export default function StudentQRCode({ siswaId }: StudentQRCodeProps) {
  const [qrData, setQrData] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<{ name: string | null; nisn: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQR() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getStudentQRCode(siswaId);
        if (response.success) {
          setQrData(response.qrData || null);
          setStudentInfo(response.student || null);
        } else {
          setError(response.error || "Gagal mengambil QR Code");
        }
      } catch {
        setError("Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    }

    fetchQR();
  }, [siswaId]);

  const handleDownload = () => {
    const svg = document.getElementById("student-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${studentInfo?.nisn || "siswa"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
        <p className="text-gray-400">Memuat QR Code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <QrCode className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-400">QR Code belum tersedia</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center"
    >
      {/* QR Code Card */}
      <div className="bg-white p-6 rounded-2xl shadow-xl mb-4">
        <QRCode
          id="student-qr-code"
          value={qrData}
          size={200}
          level="M"
          bgColor="#ffffff"
          fgColor="#1e1b4b"
        />
      </div>

      {/* Student Info */}
      {studentInfo && (
        <div className="text-center mb-4">
          <p className="text-white font-semibold text-lg">{studentInfo.name || "Siswa"}</p>
          <p className="text-gray-400">NISN: {studentInfo.nisn}</p>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
      >
        <Download className="w-4 h-4" />
        Download QR
      </button>

      {/* Instructions */}
      <p className="text-gray-500 text-sm mt-4 text-center max-w-xs">
        Tunjukkan QR Code ini ke petugas OSIS jika terlambat datang ke sekolah
      </p>
    </motion.div>
  );
}
