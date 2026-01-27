"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Camera,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Loader2,
  Keyboard,
  Video,
  VideoOff,
  Scan,
  AlertCircle,
  Volume2,
} from "lucide-react";
import { verifyScanQR, recordLateness } from "@/actions/lateness";
import toast from "react-hot-toast";
import { playScanSound, initAudio } from "@/lib/sound-effects";

interface StudentInfo {
  id: string;
  name: string | null;
  nisn: string;
  class: string | null;
  image?: string | null;
}

type ScanState =
  | "input"
  | "camera"
  | "verifying"
  | "found"
  | "error"
  | "success";

export default function LatnessScannerContent() {
  const [scanState, setScanState] = useState<ScanState>("input");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [qrInput, setQrInput] = useState("");
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [, setFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html5QrCodeRef = useRef<any>(null);

  // Trigger flash effect
  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  };

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto focus input
  useEffect(() => {
    if (scanState === "input") {
      inputRef.current?.focus();
    }
  }, [scanState]);

  const isProcessingRef = useRef(false);

  // Initialize camera scanner
  useEffect(() => {
    if (scanState === "camera") {
      setScannerReady(false);
      setIsScanning(false);
      isProcessingRef.current = false; // Reset lock
      // ... rest of init logic

      // Wait for DOM element to be ready with retry
      let retryCount = 0;
      const maxRetries = 10;

      const tryInit = () => {
        const element = document.getElementById("qr-reader");
        if (element) {
          console.log("[QR Scanner] Element found, initializing...");
          initCameraScanner();
        } else if (retryCount < maxRetries) {
          retryCount++;
          // console.log(`[QR Scanner] Element not found, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(tryInit, 200);
        } else {
          console.error("[QR Scanner] Element not found after max retries");
          setCameraError(
            "Tidak dapat memuat scanner. Silakan refresh halaman.",
          );
        }
      };

      // Initial delay then try
      const timer = setTimeout(tryInit, 300);

      return () => {
        clearTimeout(timer);
        stopCameraScanner();
      };
    }

    return () => {
      stopCameraScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanState]);

  const initCameraScanner = async () => {
    try {
      console.log("[QR Scanner] Initializing camera...");
      const { Html5Qrcode } = await import("html5-qrcode");

      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // ignore error
        }
      }

      // Optimization:
      // 1. Restrict to QR_CODE only (0 is the enum value for QR_CODE)
      // 2. Use native BarcodeDetector (Chrome/Android/iOS) if available <- HUGE SPEEDUP
      // 3. Disable verbose logging
      const html5QrCode = new Html5Qrcode("qr-reader", {
        formatsToSupport: [0], // 0 = QR_CODE
        verbose: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      });
      html5QrCodeRef.current = html5QrCode;

      // ... existing camera selection code ... (omitted for brevity, assume unchanged logic for selecting camera)
      // Actually need to include it to keep the file valid if we are replacing this whole block
      // console.log('[QR Scanner] Getting available cameras...');

      // Try to get cameras list first
      let cameraId;
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const backCamera = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("rear") ||
              d.label.toLowerCase().includes("environment"),
          );
          cameraId = backCamera ? backCamera.id : devices[0].id;
        }
      } catch {
        // console.log('[QR Scanner] Could not enumerate cameras');
      }

      // console.log('[QR Scanner] Starting scanner...');

      // Optimization: Limit resolution to prevent processing huge frames (4k etc) in JS fallback
      const videoConstraints = {
        facingMode: "environment",
        width: { min: 640, ideal: 720, max: 1280 },
        height: { min: 480, ideal: 720, max: 1280 },
        ...(cameraId ? { deviceId: cameraId } : {}),
      };

      await html5QrCode.start(
        cameraId ? { deviceId: cameraId } : videoConstraints,
        {
          fps: 30,
          // Dynamic qrbox based on view width, but keep it simple for now
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          // Optimization: lower latency
          videoConstraints: videoConstraints,
        },
        async (decodedText) => {
          // Optimization: Check lock immediately
          if (isProcessingRef.current) return;

          console.log("[QR Scanner] QR Code detected:", decodedText);
          isProcessingRef.current = true; // Lock

          handleQRScanned(decodedText);
        },
        () => {
          // Ignore scanning errors
        },
      );

      setScannerReady(true);
      setIsScanning(true);
      console.log("[QR Scanner] Camera started successfully!");
    } catch (err) {
      console.error("[QR Scanner] Camera initialization error:", err);
      let errorMsg = "Tidak dapat mengakses kamera.";
      if (err instanceof Error) {
        if (
          err.message.includes("Permission") ||
          err.message.includes("NotAllowedError")
        ) {
          errorMsg =
            "Izin kamera ditolak. Refresh halaman dan klik 'Allow' saat browser meminta izin.";
        } else if (
          err.message.includes("NotFoundError") ||
          err.message.includes("DevicesNotFoundError")
        ) {
          errorMsg =
            "Kamera tidak ditemukan. Pastikan perangkat memiliki kamera.";
        } else if (err.message.includes("NotReadableError")) {
          errorMsg =
            "Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain yang menggunakan kamera.";
        } else if (err.message.includes("OverconstrainedError")) {
          errorMsg = "Kamera tidak mendukung konfigurasi yang diminta.";
        } else if (err.message.includes("SecurityError")) {
          errorMsg =
            "Akses kamera diblokir karena alasan keamanan. Pastikan menggunakan HTTPS atau localhost.";
        } else {
          errorMsg = `Error: ${err.message}`;
        }
      }
      setCameraError(errorMsg);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // Ignore error
      }
      html5QrCodeRef.current = null;
    }
    setScannerReady(false);
    setIsScanning(false);
    isProcessingRef.current = false;
  };

  // Update handleQRScanned to play beep
  const handleQRScanned = async (qrData: string) => {
    // 1. Play beep (fire and forget to not block UI)
    playScanSound("beep").catch(console.error);

    // 2. Visual feedback
    triggerFlash();
    toast.dismiss();
    toast.loading("Memproses...", { id: "scan-loading", duration: 2000 });

    // 3. Process
    await verifyQR(qrData);

    // Note: unlock is done via useEffect when state changes to input/camera
    // But if we stay in camera (e.g. error), verifyQR sets error state which unmounts camera
    // So lock reset happens in init hook
  };

  const handleVerify = async () => {
    if (!qrInput.trim()) {
      toast.error("Masukkan data QR Code");
      return;
    }
    await verifyQR(qrInput.trim());
  };

  const verifyQR = async (qrData: string) => {
    setScanState("verifying");
    setErrorMessage("");

    // Basic length check - QR data should be reasonably long (Base64 encoded)
    if (!qrData || qrData.length < 10) {
      setErrorMessage(
        "QR Code tidak valid. Pastikan menggunakan QR Code siswa SMP IP Yakin.",
      );
      setScanState("error");
      toast.error("QR Code tidak valid!");
      return;
    }

    try {
      const result = await verifyScanQR(qrData);

      if (result.success && result.student) {
        setStudentInfo({
          id: result.student.id,
          name: result.student.name,
          nisn: result.student.nisn,
          class: result.student.class,
          image: result.student.image || null,
        });
        setScanState("found");
        await playScanSound("success");
        toast.success(`Siswa ditemukan: ${result.student.name}`);
      } else {
        setErrorMessage(
          result.error || "QR Code tidak valid atau sudah kedaluwarsa.",
        );
        setScanState("error");
        await playScanSound("error");
        toast.error(result.error || "QR Code tidak valid!");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan saat verifikasi. Silakan coba lagi.");
      setScanState("error");
      await playScanSound("error");
      toast.error("Gagal memverifikasi QR Code");
    }
  };

  const handleSubmit = async () => {
    if (!studentInfo) return;

    setIsSubmitting(true);
    try {
      const arrivalTime = currentTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const result = await recordLateness(
        studentInfo.id,
        arrivalTime,
        reason || undefined,
      );

      if (result.success) {
        setScanState("success");
        toast.success(`Keterlambatan ${studentInfo.name} berhasil dicatat`);
      } else {
        toast.error(result.error || "Gagal mencatat keterlambatan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
    setIsSubmitting(false);
  };

  const resetScanner = () => {
    setScanState("input");
    setStudentInfo(null);
    setQrInput("");
    setReason("");
    setErrorMessage("");
    setCameraError(null);
    setScannerReady(false);
    setIsScanning(false);
  };

  // Reset to camera mode (for quick rescan after error)
  const resetToCamera = () => {
    setStudentInfo(null);
    setQrInput("");
    setReason("");
    setErrorMessage("");
    setCameraError(null);
    setScannerReady(false);
    setIsScanning(false);
    setScanState("camera");
  };

  const switchToCamera = () => {
    initAudio(); // Initialize audio context on user interaction
    setScanState("camera");
    setCameraError(null);
  };

  const switchToManual = () => {
    stopCameraScanner();
    setScanState("input");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
          <Camera className="w-7 h-7 text-blue-600" />
          Scan Keterlambatan Siswa
        </h1>
        <p className="text-gray-500">
          Scan QR Code siswa dengan kamera atau input manual
        </p>
      </div>

      {/* Current Time */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-2xl font-bold">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Mode Toggle (only show on input/camera states) */}
      {(scanState === "input" || scanState === "camera") && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center gap-2">
            <button
              onClick={switchToManual}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                scanState === "input"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Input Manual
            </button>
            <button
              onClick={switchToCamera}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                scanState === "camera"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Video className="w-4 h-4" />
              Kamera
            </button>
          </div>

          <button
            onClick={() => playScanSound("success")}
            className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors px-3 py-1 rounded hover:bg-gray-50"
            title="Klik untuk tes suara"
          >
            <Volume2 className="w-3 h-3" />
            Test Audio
          </button>
        </div>
      )}

      {/* Scanner / Result Area */}
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {/* Manual Input */}
          {scanState === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl p-6 space-y-4"
            >
              <div className="text-center mb-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Keyboard className="w-10 h-10 text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm">
                  Gunakan barcode scanner USB atau masukkan data QR secara
                  manual
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data QR Code
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerify();
                  }}
                  placeholder="Scan atau paste data QR..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono"
                  autoComplete="off"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={!qrInput.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Verifikasi QR Code
              </button>
            </motion.div>
          )}

          {/* Camera Scanner */}
          {scanState === "camera" && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {cameraError ? (
                <div className="text-center py-10 px-4">
                  <VideoOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{cameraError}</p>
                  <button
                    onClick={switchToManual}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Keyboard className="w-4 h-4 inline mr-2" />
                    Gunakan Input Manual
                  </button>
                </div>
              ) : (
                <div className="relative">
                  {/* Camera Container */}
                  <div id="qr-reader" className="w-full aspect-square" />

                  {/* Scanning Overlay */}
                  {!scannerReady && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                      <Loader2 className="w-12 h-12 text-white animate-spin mb-3" />
                      <p className="text-white font-medium">Memuat kamera...</p>
                    </div>
                  )}

                  {/* Active Scanning Indicator */}
                  {scannerReady && isScanning && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg animate-pulse">
                        <Scan className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Scanning aktif...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Scan Frame Corners */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 relative">
                      {/* Corner borders */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                      {/* Scanning Line Animation */}
                      {scannerReady && (
                        <motion.div
                          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                          animate={{
                            top: ["0%", "100%", "0%"],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!cameraError && (
                <div className="p-4 bg-gray-50 border-t">
                  <p className="text-center text-gray-600 text-sm flex items-center justify-center gap-2">
                    <Scan className="w-4 h-4 text-blue-500" />
                    Arahkan QR Code siswa ke dalam kotak
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Verifying */}
          {scanState === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center justify-center"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-gray-600 mt-4 font-medium">
                Memverifikasi QR Code...
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Mohon tunggu sebentar
              </p>
            </motion.div>
          )}

          {/* Error State */}
          {scanState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
              </motion.div>
              <h3 className="text-lg font-bold text-red-700 mb-2">
                QR Code Tidak Valid
              </h3>
              <p className="text-red-600 mb-4">{errorMessage}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={resetToCamera}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Kamera
                </button>
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-flex items-center gap-2"
                >
                  <Keyboard className="w-4 h-4" />
                  Manual
                </button>
              </div>
            </motion.div>
          )}

          {/* Student Found */}
          {scanState === "found" && studentInfo && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl p-6 space-y-4"
            >
              {/* Success Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Siswa Ditemukan</span>
                </div>
              </motion.div>

              {/* Student Info */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-4 ring-green-100">
                  {studentInfo.image ? (
                    <Image
                      src={studentInfo.image}
                      alt={studentInfo.name || "Siswa"}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <User className="w-10 h-10 text-blue-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {studentInfo.name || "Tanpa Nama"}
                  </h3>
                  <p className="text-gray-500">NISN: {studentInfo.nisn}</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {studentInfo.class || "Belum Ada Kelas"}
                  </span>
                </div>
              </div>

              {/* Arrival Time */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 text-center border border-red-100">
                <p className="text-sm text-red-600 mb-1 font-medium">
                  ⏰ Waktu Kedatangan
                </p>
                <p className="text-3xl font-mono font-bold text-red-700">
                  {formatTime(currentTime)}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Terlambat masuk sekolah
                </p>
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Alasan Keterlambatan (Opsional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Masukkan alasan keterlambatan..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetScanner}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Catat Terlambat
                </button>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {scanState === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              </motion.div>
              <h3 className="text-xl font-bold text-green-700 mb-2">
                Berhasil!
              </h3>
              <p className="text-green-600 mb-4">
                Keterlambatan siswa telah dicatat ke sistem.
              </p>
              <button
                onClick={resetScanner}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <Scan className="w-4 h-4" />
                Scan Siswa Lain
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
