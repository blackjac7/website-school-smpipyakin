"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
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
  AlertTriangle,
  UserX,
  ShieldAlert,
  Info,
  Undo2,
  Volume2,
  Shirt,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  KeyRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { verifyScanQR, recordLateness, deleteLatenessRecord } from "@/actions/lateness";
import {
  verifyAttributeScanQR,
  recordAttributeViolation,
  deleteAttributeViolation,
} from "@/actions/attributes";
import toast from "react-hot-toast";
import { playScanSound, initAudio } from "@/lib/sound-effects";
import { cn } from "@/lib/utils";
import AttributeChecklist from "./AttributeChecklist";
import { getScanWindowStatus } from "@/lib/scan-window";
import { requestScanTimeOverride } from "@/actions/osis/scanOverride";

interface StudentInfo {
  id: string;
  name: string | null;
  nisn: string;
  class: string | null;
  image?: string | null;
}

interface AttributeItemData {
  id: string;
  name: string;
  description?: string | null;
}

type ScanMode = "lateness" | "attribute";

type ScanState =
  | "input"
  | "camera"
  | "verifying"
  | "found"
  | "duplicate"
  | "error"
  | "success";

/**
 * Per-mode visual identity. The two QR categories share ONE category-less QR
 * per student, so "wrong tab" can't be rejected from data — it has to be
 * prevented by making the active mode impossible to miss. Warm (amber) vs cool
 * (indigo) is distinguishable at a glance and safe on the blue↔yellow axis for
 * the common colorblindness types; it's always paired with a distinct icon +
 * label so we never lean on color alone.
 *
 * Every value is a COMPLETE Tailwind class string. Do not build these with
 * template literals like `bg-${c}-600` — Tailwind v4's JIT only ships classes
 * it can find verbatim in the source.
 */
const MODE_THEME = {
  lateness: {
    label: "Keterlambatan",
    icon: Clock,
    duty: "Catat siswa yang terlambat masuk sekolah",
    window: "Jam pencatatan 06:31–09:00 WIB",
    gradient: "from-amber-500 to-orange-500",
    solidButton: "bg-amber-600 hover:bg-amber-700",
    tint: "bg-amber-50",
    border: "border-amber-200",
    ring: "ring-amber-200",
    accentText: "text-amber-700",
    accentIconBg: "bg-amber-100",
    frameBorder: "border-amber-500",
    scanLineVia: "via-amber-500",
    spinnerRing: "border-amber-500",
    spinnerBg: "bg-amber-100",
    spinnerText: "text-amber-600",
    focusRing: "focus-visible:ring-amber-500",
    inputFocus: "focus:border-amber-500 focus:ring-amber-500",
    submitLabel: "Catat Keterlambatan",
    successVerb: "Keterlambatan",
    scanTimeLabel: "⏰ Waktu Kedatangan",
    scanTimeHint: "Terlambat masuk sekolah",
  },
  attribute: {
    label: "Pelanggaran Atribut",
    icon: Shirt,
    duty: "Periksa kelengkapan atribut seragam siswa",
    window: "Jam pencatatan 06:31–14:00 WIB",
    gradient: "from-indigo-500 to-violet-500",
    solidButton: "bg-indigo-600 hover:bg-indigo-700",
    tint: "bg-indigo-50",
    border: "border-indigo-200",
    ring: "ring-indigo-200",
    accentText: "text-indigo-700",
    accentIconBg: "bg-indigo-100",
    frameBorder: "border-indigo-500",
    scanLineVia: "via-indigo-500",
    spinnerRing: "border-indigo-500",
    spinnerBg: "bg-indigo-100",
    spinnerText: "text-indigo-600",
    focusRing: "focus-visible:ring-indigo-500",
    inputFocus: "focus:border-indigo-500 focus:ring-indigo-500",
    submitLabel: "Catat Pelanggaran Atribut",
    successVerb: "Pelanggaran atribut",
    scanTimeLabel: "👕 Waktu Pemeriksaan",
    scanTimeHint: "Pemeriksaan atribut siswa",
  },
} as const;

type ErrorTone = "red" | "amber" | "slate";

interface ScanErrorInfo {
  title: string;
  message: string;
  icon: LucideIcon;
  tone: ErrorTone;
}

/**
 * Map the server's existing Indonesian error strings to a specific, honest
 * heading + icon + tone. This is intentionally client-only: the server already
 * returns a precise message, so we just categorize it instead of adding new
 * server error codes. If those strings are reworded, update these matchers.
 *
 * Tone semantics stay mode-independent: red = genuine error, amber = a timing
 * situation (informational, not the scanner's fault), slate = unexpected.
 */
function categorizeScanError(message: string): {
  title: string;
  icon: LucideIcon;
  tone: ErrorTone;
} {
  // Timing first: these messages carry "WIB"/"waktunya"/"berakhir" and are
  // never the QR's fault, so they must not fall through to "QR tidak terbaca".
  if (/waktunya|berakhir|wib/i.test(message)) {
    return {
      title: /berakhir/i.test(message)
        ? "Waktu Pencatatan Berakhir"
        : "Belum Waktunya",
      icon: Clock,
      tone: "amber",
    };
  }
  if (/tidak ditemukan/i.test(message)) {
    return { title: "Siswa Tidak Ditemukan", icon: UserX, tone: "red" };
  }
  if (/unauthorized|akses/i.test(message)) {
    return { title: "Akses Ditolak", icon: ShieldAlert, tone: "red" };
  }
  if (/tidak valid|terbaca|dikenali/i.test(message)) {
    return { title: "QR Code Tidak Terbaca", icon: AlertTriangle, tone: "red" };
  }
  return { title: "Terjadi Kesalahan", icon: AlertCircle, tone: "slate" };
}

/** Full class strings per error tone (JIT-safe). */
const TONE_STYLES: Record<
  ErrorTone,
  {
    container: string;
    iconBg: string;
    iconText: string;
    title: string;
    body: string;
  }
> = {
  red: {
    container: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
    iconText: "text-red-500",
    title: "text-red-700",
    body: "text-red-600",
  },
  amber: {
    container: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100",
    iconText: "text-amber-500",
    title: "text-amber-700",
    body: "text-amber-600",
  },
  slate: {
    container: "bg-slate-50 border-slate-200",
    iconBg: "bg-slate-100",
    iconText: "text-slate-500",
    title: "text-slate-700",
    body: "text-slate-600",
  },
};

/** How long after a save the OSIS member can undo it (mirrors the server). */
const UNDO_WINDOW_SECONDS = 5;

export default function LatnessScannerContent() {
  const [mode, setMode] = useState<ScanMode>("lateness");
  const [scanState, setScanState] = useState<ScanState>("input");
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [qrInput, setQrInput] = useState("");
  const [reason, setReason] = useState("");
  const [attributeItems, setAttributeItems] = useState<AttributeItemData[]>([]);
  const [checkedAttributeIds, setCheckedAttributeIds] = useState<string[]>([]);
  const [attributeNotes, setAttributeNotes] = useState("");
  const [errorInfo, setErrorInfo] = useState<ScanErrorInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [overrideTokens, setOverrideTokens] = useState<
    Partial<Record<ScanMode, { token: string; expiresAt: number }>>
  >({});
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isRequestingOverride, setIsRequestingOverride] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [, setFlash] = useState(false);
  // Undo ("prevent by clarity, recover by undo"): after a successful save we
  // keep just enough to reverse it, and count down the window client-side.
  const [lastRecord, setLastRecord] = useState<{
    recordId: string;
    mode: ScanMode;
    studentName: string;
  } | null>(null);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(0);
  const [isUndoing, setIsUndoing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const theme = MODE_THEME[mode];
  const windowStatus = getScanWindowStatus(mode, currentTime);
  const activeOverride = overrideTokens[mode];
  const overrideActive = Boolean(
    activeOverride && activeOverride.expiresAt > currentTime.getTime(),
  );
  const scannerAllowed = windowStatus.isOpen || overrideActive;
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

  useEffect(() => {
    setOverrideTokens((current) => {
      const next = { ...current };
      let changed = false;
      for (const scanMode of ["lateness", "attribute"] as const) {
        if (next[scanMode] && next[scanMode]!.expiresAt <= Date.now()) {
          delete next[scanMode];
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [currentTime]);

  // Undo countdown: tick down while the success screen offers an undo. When it
  // reaches 0 the button auto-hides (the server also stops accepting the undo).
  useEffect(() => {
    if (scanState !== "success" || undoSecondsLeft <= 0) return;
    const t = setTimeout(() => setUndoSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [scanState, undoSecondsLeft]);

  // Auto focus input
  useEffect(() => {
    if (scanState === "input") {
      inputRef.current?.focus();
    }
  }, [scanState]);

  const isProcessingRef = useRef(false);

  // Initialize camera scanner
  useEffect(() => {
    if (scanState === "camera" && scannerAllowed) {
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
  }, [scanState, scannerAllowed]);

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
    if (!scannerAllowed) return;
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
    if (!scannerAllowed) {
      setShowOverrideModal(true);
      return;
    }
    if (!qrInput.trim()) {
      toast.error("Masukkan data QR Code");
      return;
    }
    await verifyQR(qrInput.trim());
  };

  // Categorize a server (or client) error message into an honest heading +
  // icon + tone, then show the error panel. The body keeps the server's
  // precise wording; only the heading is derived.
  const showScanError = async (message: string) => {
    const info = categorizeScanError(message);
    setErrorInfo({ ...info, message });
    setScanState("error");
    await playScanSound("error");
    toast.error(info.title);
  };

  // "Sudah tercatat hari ini" is benign, not an error — the student card the
  // server already returns is reused here so the OSIS member sees WHO is
  // duplicated instead of a scary red "QR invalid".
  const showDuplicate = async (student: {
    id: string;
    name: string | null;
    nisn: string;
    class: string | null;
  }) => {
    setStudentInfo({
      id: student.id,
      name: student.name,
      nisn: student.nisn,
      class: student.class,
      image: null,
    });
    setScanState("duplicate");
    await playScanSound("error");
    toast(`${student.name || "Siswa"} sudah tercatat hari ini`, { icon: "ℹ️" });
  };

  const verifyQR = async (qrData: string) => {
    if (!scannerAllowed) {
      setScanState("input");
      setShowOverrideModal(true);
      return;
    }
    setScanState("verifying");
    setErrorInfo(null);

    // Client-side sanity check: a real payload is a longish Base64 string.
    if (!qrData || qrData.length < 10) {
      await showScanError(
        "QR Code tidak terbaca. Pastikan ini QR Code kartu siswa SMP IP Yakin, tidak buram atau terpotong.",
      );
      return;
    }

    try {
      // Call each mode's action in its own branch so `result` keeps its own
      // precise type instead of collapsing into an untyped union.
      if (mode === "attribute") {
        const result = await verifyAttributeScanQR(
          qrData,
          activeOverride?.token,
        );
        if (result.success && result.student) {
          setStudentInfo({
            id: result.student.id,
            name: result.student.name,
            nisn: result.student.nisn,
            class: result.student.class,
            image: result.student.image || null,
          });
          setAttributeItems(result.attributeItems || []);
          setCheckedAttributeIds([]);
          setAttributeNotes("");
          setScanState("found");
          await playScanSound("success");
          toast.success(`Siswa ditemukan: ${result.student.name}`);
        } else if (
          "alreadyRecorded" in result &&
          result.alreadyRecorded &&
          result.student
        ) {
          await showDuplicate(result.student);
        } else {
          await showScanError(
            result.error || "Terjadi kesalahan. Silakan coba lagi.",
          );
        }
      } else {
        const result = await verifyScanQR(qrData, activeOverride?.token);
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
        } else if (
          "alreadyRecorded" in result &&
          result.alreadyRecorded &&
          result.student
        ) {
          await showDuplicate(result.student);
        } else {
          await showScanError(
            result.error || "Terjadi kesalahan. Silakan coba lagi.",
          );
        }
      }
    } catch {
      await showScanError(
        "Terjadi kesalahan saat verifikasi. Silakan coba lagi.",
      );
    }
  };

  const handleSubmit = async () => {
    if (!studentInfo) return;

    if (mode === "attribute" && checkedAttributeIds.length === 0) {
      toast.error("Pilih minimal satu atribut yang dilanggar");
      return;
    }

    setIsSubmitting(true);
    try {
      const arrivalTime = currentTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      });

      const result =
        mode === "lateness"
          ? await recordLateness(
              studentInfo.id,
              arrivalTime,
              reason || undefined,
              activeOverride?.token,
            )
          : await recordAttributeViolation(
              studentInfo.id,
              arrivalTime,
              checkedAttributeIds,
              attributeNotes || undefined,
              activeOverride?.token,
            );

      if (result.success) {
        // Remember just enough to undo, and open the countdown window. The
        // `in` + truthiness check narrows recordId to a definite string; if it
        // were ever missing we still confirm success, just without the undo.
        if ("recordId" in result && result.recordId) {
          setLastRecord({
            recordId: result.recordId,
            mode,
            studentName: studentInfo.name || "Siswa",
          });
          setUndoSecondsLeft(UNDO_WINDOW_SECONDS);
        }
        setScanState("success");
        toast.success(
          `${theme.successVerb} ${studentInfo.name} berhasil dicatat`,
        );
      } else {
        toast.error(
          result.error ||
            (mode === "lateness"
              ? "Gagal mencatat keterlambatan"
              : "Gagal mencatat pelanggaran atribut"),
        );
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
    setIsSubmitting(false);
  };

  // Undo the record we just committed. The server independently re-checks that
  // the caller owns it and the window hasn't elapsed, so this can only ever
  // reverse an "undo just now" — never a general OSIS delete.
  const handleUndo = async () => {
    if (!lastRecord) return;
    setIsUndoing(true);
    try {
      const result =
        lastRecord.mode === "lateness"
          ? await deleteLatenessRecord(lastRecord.recordId)
          : await deleteAttributeViolation(lastRecord.recordId);

      if (result.success) {
        toast.success("Pencatatan dibatalkan");
        setLastRecord(null);
        setUndoSecondsLeft(0);
        resetScanner();
      } else {
        toast.error(result.error || "Gagal membatalkan pencatatan");
      }
    } catch {
      toast.error("Gagal membatalkan pencatatan");
    }
    setIsUndoing(false);
  };

  const resetScanner = () => {
    setScanState("input");
    setStudentInfo(null);
    setQrInput("");
    setReason("");
    setAttributeItems([]);
    setCheckedAttributeIds([]);
    setAttributeNotes("");
    setErrorInfo(null);
    setCameraError(null);
    setScannerReady(false);
    setIsScanning(false);
    setLastRecord(null);
    setUndoSecondsLeft(0);
  };

  // Reset to camera mode (for quick rescan after error)
  const resetToCamera = () => {
    setStudentInfo(null);
    setQrInput("");
    setReason("");
    setAttributeItems([]);
    setCheckedAttributeIds([]);
    setAttributeNotes("");
    setErrorInfo(null);
    setCameraError(null);
    setScannerReady(false);
    setIsScanning(false);
    setScanState("camera");
  };

  const switchMode = (newMode: ScanMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    resetScanner();
  };

  const toggleAttributeId = (id: string) => {
    setCheckedAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleNoViolation = () => {
    toast.success(
      `Atribut ${studentInfo?.name || "siswa"} lengkap, tidak ada yang dicatat`,
    );
    resetScanner();
  };

  const switchToCamera = () => {
    if (!scannerAllowed) {
      setShowOverrideModal(true);
      return;
    }
    initAudio(); // Initialize audio context on user interaction
    setScanState("camera");
    setCameraError(null);
  };

  const switchToManual = () => {
    stopCameraScanner();
    setScanState("input");
  };

  const handleRequestOverride = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsRequestingOverride(true);
    setOverrideError(null);

    try {
      const result = await requestScanTimeOverride({
        adminUsername,
        adminPassword,
        mode,
      });

      if (!result.success || !result.token || !result.expiresAt) {
        setOverrideError(result.error || "Verifikasi Admin gagal.");
        return;
      }

      setOverrideTokens((current) => ({
        ...current,
        [mode]: { token: result.token, expiresAt: result.expiresAt },
      }));
      setAdminUsername("");
      setAdminPassword("");
      setShowOverrideModal(false);
      toast.success("Akses khusus aktif selama 10 menit");
    } catch {
      setOverrideError("Tidak dapat memverifikasi Admin. Silakan coba lagi.");
    } finally {
      setIsRequestingOverride(false);
    }
  };

  const revokeOverride = () => {
    setOverrideTokens((current) => {
      const next = { ...current };
      delete next[mode];
      return next;
    });
    stopCameraScanner();
    resetScanner();
    toast.success("Akses khusus dinonaktifkan");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Jakarta",
    });
  };

  return (
    <div className="space-y-6">
      {/* One context panel: mode, schedule, live status, and scanner access. */}
      {(scanState === "input" || scanState === "camera") && (
        <div className="max-w-md mx-auto space-y-3">
          {/* Mode toggle. Each button carries its OWN
          fixed mode color so the choice reads even before you commit — active =
          that mode's gradient, inactive = quiet white outline. */}
          <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => switchMode("lateness")}
            aria-pressed={mode === "lateness"}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              mode === "lateness"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm focus-visible:ring-amber-500"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 focus-visible:ring-gray-400",
            )}
          >
            <Clock className="w-4 h-4" />
            Keterlambatan
          </button>
          <button
            onClick={() => switchMode("attribute")}
            aria-pressed={mode === "attribute"}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              mode === "attribute"
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm focus-visible:ring-indigo-500"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 focus-visible:ring-gray-400",
            )}
          >
            <Shirt className="w-4 h-4" />
            Atribut
          </button>
          </div>

          <div
            className={cn(
              "rounded-2xl border p-4 sm:p-5",
              scannerAllowed
                ? overrideActive
                  ? "border-violet-200 bg-violet-50"
                  : "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50",
            )}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", scannerAllowed ? (overrideActive ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700") : "bg-amber-100 text-amber-700")}>
                {scannerAllowed ? <theme.icon className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{theme.label}</p>
                    <p className="font-bold text-gray-900">
                      {overrideActive ? "Akses Admin aktif" : scannerAllowed ? "Scanner aktif" : windowStatus.phase === "after" ? "Jam scan telah berakhir" : "Belum waktunya scan"}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", scannerAllowed ? (overrideActive ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700") : "bg-amber-100 text-amber-800")}>
                    {overrideActive ? "OVERRIDE" : scannerAllowed ? "AKTIF" : "TERKUNCI"}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-gray-900"><Clock className="h-4 w-4" />{formatTime(currentTime)} WIB</span>
                  <span>Jadwal {windowStatus.startTime}–{windowStatus.endTime} WIB</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{theme.duty}</p>
                {!scannerAllowed && (
                  <div className="mt-3 space-y-3">
                    <p className="text-xs font-medium text-amber-800">Dibuka {windowStatus.nextOpenLabel}</p>
                    <button type="button" onClick={() => { setOverrideError(null); setShowOverrideModal(true); }} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2">
                      <KeyRound className="h-4 w-4" /> Minta akses Admin
                    </button>
                  </div>
                )}
                {overrideActive && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-violet-700">Berakhir pukul {new Date(activeOverride!.expiresAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })} WIB.</p>
                    <button type="button" onClick={revokeOverride} className="shrink-0 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100">Akhiri akses</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual/Camera Input Toggle (only show on input/camera states).
          Kept neutral (grey) so it never competes with the mode identity —
          this picks the input METHOD, not the recording category. */}
      {scannerAllowed && (scanState === "input" || scanState === "camera") && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center gap-2">
            <button
              onClick={switchToManual}
              aria-pressed={scanState === "input"}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500",
                scanState === "input"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              <Keyboard className="w-4 h-4" />
              Input Manual
            </button>
            <button
              onClick={switchToCamera}
              aria-pressed={scanState === "camera"}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500",
                scanState === "camera"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              <Video className="w-4 h-4" />
              Kamera
            </button>
          </div>

          <button
            onClick={() => playScanSound("success")}
            className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors px-3 py-1 rounded hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
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
          {scannerAllowed && scanState === "input" && (
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
                  className={cn(
                    "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 text-center font-mono outline-none",
                    theme.inputFocus,
                  )}
                  autoComplete="off"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={!qrInput.trim()}
                className={cn(
                  "w-full px-4 py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  theme.solidButton,
                  theme.focusRing,
                )}
              >
                <CheckCircle2 className="w-5 h-5" />
                Verifikasi QR Code
              </button>
            </motion.div>
          )}

          {/* Camera Scanner */}
          {scannerAllowed && scanState === "camera" && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {cameraError ? (
                <div className="text-center py-10 px-6">
                  <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <VideoOff className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-red-700 mb-2">
                    Masalah Kamera
                  </h3>
                  <p className="text-red-600 text-sm mb-5">{cameraError}</p>
                  <button
                    onClick={switchToManual}
                    className="px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                  >
                    <Keyboard className="w-4 h-4" />
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
                      <div
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg",
                          !prefersReducedMotion && "animate-pulse",
                        )}
                      >
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
                      {/* Corner borders (mode-colored) */}
                      <div
                        className={cn(
                          "absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg",
                          theme.frameBorder,
                        )}
                      />
                      <div
                        className={cn(
                          "absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg",
                          theme.frameBorder,
                        )}
                      />
                      <div
                        className={cn(
                          "absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg",
                          theme.frameBorder,
                        )}
                      />
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg",
                          theme.frameBorder,
                        )}
                      />

                      {/* Scanning Line — animated, or a static guide when the
                          user prefers reduced motion. */}
                      {scannerReady &&
                        (prefersReducedMotion ? (
                          <div
                            className={cn(
                              "absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent to-transparent",
                              theme.scanLineVia,
                            )}
                          />
                        ) : (
                          <motion.div
                            className={cn(
                              "absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent to-transparent",
                              theme.scanLineVia,
                            )}
                            animate={{
                              top: ["0%", "100%", "0%"],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!cameraError && (
                <div className="p-4 bg-gray-50 border-t">
                  <p className="text-center text-gray-600 text-sm flex items-center justify-center gap-2">
                    <Scan className={cn("w-4 h-4", theme.accentText)} />
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
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center",
                    theme.spinnerBg,
                  )}
                >
                  <Loader2
                    className={cn(
                      "w-10 h-10",
                      theme.spinnerText,
                      !prefersReducedMotion && "animate-spin",
                    )}
                  />
                </div>
                {!prefersReducedMotion && (
                  <motion.div
                    className={cn(
                      "absolute inset-0 rounded-full border-4 border-t-transparent",
                      theme.spinnerRing,
                    )}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </div>
              <p className="text-gray-600 mt-4 font-medium">
                Memverifikasi QR Code...
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Mohon tunggu sebentar
              </p>
            </motion.div>
          )}

          {/* Error State — heading/icon/tone come from categorizeScanError;
              the body keeps the server's precise message. */}
          {scanState === "error" && errorInfo && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "border-2 rounded-2xl p-8 text-center",
                TONE_STYLES[errorInfo.tone].container,
              )}
            >
              <motion.div
                initial={prefersReducedMotion ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div
                  className={cn(
                    "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4",
                    TONE_STYLES[errorInfo.tone].iconBg,
                  )}
                >
                  <errorInfo.icon
                    className={cn(
                      "w-10 h-10",
                      TONE_STYLES[errorInfo.tone].iconText,
                    )}
                  />
                </div>
              </motion.div>
              <h3
                className={cn(
                  "text-lg font-bold mb-2",
                  TONE_STYLES[errorInfo.tone].title,
                )}
              >
                {errorInfo.title}
              </h3>
              <p className={cn("mb-4", TONE_STYLES[errorInfo.tone].body)}>
                {errorInfo.message}
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={resetToCamera}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                >
                  <Video className="w-4 h-4" />
                  Kamera
                </button>
                <button
                  onClick={resetScanner}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
                >
                  <Keyboard className="w-4 h-4" />
                  Manual
                </button>
              </div>
            </motion.div>
          )}

          {/* Duplicate — benign info, NOT a red error. Reuses the student card
              the server already returns so the member sees WHO is duplicated. */}
          {scanState === "duplicate" && studentInfo && (
            <motion.div
              key="duplicate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Info className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-700">
                  Sudah Tercatat Hari Ini
                </h3>
                <p className="text-blue-600 text-sm mt-1">
                  {mode === "lateness"
                    ? "Keterlambatan siswa ini sudah dicatat hari ini."
                    : "Pelanggaran atribut siswa ini sudah dicatat hari ini."}
                </p>
              </div>

              {/* Mini student card */}
              <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-blue-100 text-left">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {studentInfo.name || "Tanpa Nama"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    NISN: {studentInfo.nisn} ·{" "}
                    {studentInfo.class || "Belum Ada Kelas"}
                  </p>
                </div>
              </div>

              <button
                onClick={resetScanner}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              >
                <Scan className="w-4 h-4" />
                Scan Siswa Lain
              </button>
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
                <div
                  className={cn(
                    "w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-4",
                    theme.ring,
                  )}
                >
                  {studentInfo.image ? (
                    <Image
                      src={studentInfo.image}
                      alt={studentInfo.name || "Siswa"}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-full h-full flex items-center justify-center",
                        theme.tint,
                      )}
                    >
                      <User className={cn("w-10 h-10", theme.accentText)} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {studentInfo.name || "Tanpa Nama"}
                  </h3>
                  <p className="text-gray-500">NISN: {studentInfo.nisn}</p>
                  <span
                    className={cn(
                      "inline-block mt-1 px-3 py-1 rounded-full text-sm",
                      theme.accentIconBg,
                      theme.accentText,
                    )}
                  >
                    {studentInfo.class || "Belum Ada Kelas"}
                  </span>
                </div>
              </div>

              {/* Scan Time (mode-colored) */}
              <div
                className={cn(
                  "rounded-xl p-4 text-center border",
                  theme.tint,
                  theme.border,
                )}
              >
                <p className={cn("text-sm mb-1 font-medium", theme.accentText)}>
                  {theme.scanTimeLabel}
                </p>
                <p
                  className={cn(
                    "text-3xl font-mono font-bold tabular-nums",
                    theme.accentText,
                  )}
                >
                  {formatTime(currentTime)}
                </p>
                <p className={cn("text-xs mt-1 opacity-80", theme.accentText)}>
                  {theme.scanTimeHint}
                </p>
              </div>

              {mode === "lateness" ? (
                /* Reason Input */
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Alasan keterlambatan (opsional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Masukkan alasan keterlambatan..."
                    className={cn(
                      "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 resize-none outline-none",
                      theme.inputFocus,
                    )}
                    rows={3}
                  />
                </div>
              ) : (
                <AttributeChecklist
                  items={attributeItems}
                  selectedIds={checkedAttributeIds}
                  onToggle={toggleAttributeId}
                  notes={attributeNotes}
                  onNotesChange={setAttributeNotes}
                />
              )}

              {/* Actions */}
              {mode === "attribute" && (
                <button
                  onClick={handleNoViolation}
                  className="w-full px-4 py-2.5 border border-green-300 text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Tidak ada pelanggaran
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={resetScanner}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
                >
                  Batal
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    (mode === "attribute" && checkedAttributeIds.length === 0)
                  }
                  className={cn(
                    "flex-1 px-4 py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    theme.solidButton,
                    theme.focusRing,
                  )}
                >
                  {isSubmitting ? (
                    <Loader2
                      className={cn(
                        "w-5 h-5",
                        !prefersReducedMotion && "animate-spin",
                      )}
                    />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  {theme.submitLabel}
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
                initial={prefersReducedMotion ? false : { scale: 0 }}
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
              <p className="text-green-600 mb-6">
                {(lastRecord?.mode ?? mode) === "lateness"
                  ? "Keterlambatan siswa telah dicatat ke sistem."
                  : "Pelanggaran atribut siswa telah dicatat ke sistem."}
              </p>
              <div className="flex flex-col gap-2">
                {lastRecord && undoSecondsLeft > 0 && (
                  <button
                    onClick={handleUndo}
                    disabled={isUndoing}
                    className="w-full px-4 py-3 border border-green-300 text-green-700 bg-white rounded-xl hover:bg-green-50 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                  >
                    {isUndoing ? (
                      <Loader2
                        className={cn(
                          "w-4 h-4",
                          !prefersReducedMotion && "animate-spin",
                        )}
                      />
                    ) : (
                      <Undo2 className="w-4 h-4" />
                    )}
                    {isUndoing
                      ? "Membatalkan..."
                      : `Urungkan (${undoSecondsLeft})`}
                  </button>
                )}
                <button
                  onClick={resetScanner}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500"
                >
                  <Scan className="w-4 h-4" />
                  Scan Siswa Lain
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showOverrideModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-override-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isRequestingOverride) {
                setShowOverrideModal(false);
              }
            }}
          >
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl"
            >
              <div className="relative overflow-hidden bg-blue-950 px-5 pb-6 pt-5 text-white sm:px-6">
                <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-amber-400/20 blur-2xl" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-blue-950 shadow-lg shadow-amber-400/20">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOverrideModal(false)}
                    disabled={isRequestingOverride}
                    className="rounded-xl p-2 text-blue-100 hover:bg-white/10 disabled:opacity-50"
                    aria-label="Tutup verifikasi Admin"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                    Persetujuan di luar jadwal
                  </p>
                  <h2 id="scan-override-title" className="mt-2 text-2xl font-black">
                    Verifikasi akun Admin
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-blue-100">
                    Akses hanya berlaku untuk mode {theme.label.toLowerCase()}
                    selama 10 menit dan tidak membuka fitur Admin lainnya.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRequestOverride} className="space-y-4 p-5 sm:p-6">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-bold">Catatan keamanan</p>
                  <p className="mt-1 leading-5 text-amber-800">
                    Admin harus memasukkan username dan passwordnya sendiri.
                    Password tidak disimpan di perangkat ini.
                  </p>
                </div>

                <div>
                  <label htmlFor="override-admin-username" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Username Admin
                  </label>
                  <input
                    id="override-admin-username"
                    value={adminUsername}
                    onChange={(event) => setAdminUsername(event.target.value)}
                    autoComplete="username"
                    required
                    disabled={isRequestingOverride}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100"
                    placeholder="Masukkan username Admin"
                  />
                </div>

                <div>
                  <label htmlFor="override-admin-password" className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Password Admin
                  </label>
                  <div className="relative">
                    <input
                      id="override-admin-password"
                      type={showAdminPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(event) => setAdminPassword(event.target.value)}
                      autoComplete="current-password"
                      required
                      minLength={8}
                      disabled={isRequestingOverride}
                      className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-12 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-100"
                      placeholder="Masukkan password Admin"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword((value) => !value)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 hover:text-gray-700"
                      aria-label={showAdminPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showAdminPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {overrideError && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    {overrideError}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setShowOverrideModal(false)}
                    disabled={isRequestingOverride}
                    className="min-h-12 flex-1 rounded-xl border border-gray-200 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isRequestingOverride || !adminUsername || !adminPassword}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {isRequestingOverride ? (
                      <Loader2 className={cn("h-5 w-5", !prefersReducedMotion && "animate-spin")} />
                    ) : (
                      <KeyRound className="h-5 w-5" />
                    )}
                    {isRequestingOverride ? "Memverifikasi..." : "Aktifkan 10 menit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
