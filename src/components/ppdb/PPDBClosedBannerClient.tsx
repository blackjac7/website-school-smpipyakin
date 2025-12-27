"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Phone,
  Mail,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { useEffect, useState } from "react";

interface PPDBClosedBannerClientProps {
  showFull: boolean;
  isQuotaFull: boolean;
  message: string;
  academicYear: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function PPDBClosedBannerClient({
  showFull,
  isQuotaFull,
  message,
  academicYear,
  startDate,
  endDate,
}: PPDBClosedBannerClientProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Countdown logic
  useEffect(() => {
    if (!startDate || isQuotaFull) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(startDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return null;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate, isQuotaFull]);

  if (showFull) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-24 pb-12 px-4">
        <AnimatedBackground />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative max-w-2xl w-full"
        >
          {/* Glassmorphism Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl p-8 md:p-12 text-center overflow-hidden">
            {/* Decorative top accent */}
            <div
              className={`absolute top-0 left-0 w-full h-2 ${
                isQuotaFull ? "bg-red-500" : "bg-school-yellow"
              }`}
            />

            {/* Icon Animation */}
            <div className="mb-8 flex justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
                className={`p-6 rounded-full shadow-lg ${
                  isQuotaFull
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : "bg-school-yellow/20 dark:bg-yellow-900/30 text-school-yellow dark:text-yellow-400"
                }`}
              >
                {isQuotaFull ? (
                  <AlertTriangle className="w-16 h-16" />
                ) : timeLeft ? (
                  <Calendar className="w-16 h-16" />
                ) : (
                  <Lock className="w-16 h-16" />
                )}
              </motion.div>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3"
            >
              {isQuotaFull
                ? "Kuota Pendaftaran Penuh"
                : timeLeft
                ? "Segera Dibuka!"
                : "Pendaftaran PPDB Ditutup"}
            </motion.h1>

            {/* Academic Year */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-school-yellow font-medium mb-6"
            >
              Tahun Ajaran {academicYear}
            </motion.p>

            {/* Countdown Timer */}
            {timeLeft && !isQuotaFull && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-4 gap-2 md:gap-4 mb-8 max-w-lg mx-auto"
              >
                <CountdownUnit value={timeLeft.days} label="Hari" />
                <CountdownUnit value={timeLeft.hours} label="Jam" />
                <CountdownUnit value={timeLeft.minutes} label="Menit" />
                <CountdownUnit value={timeLeft.seconds} label="Detik" />
              </motion.div>
            )}

            {/* Message Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-700"
            >
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                {message}
              </p>
            </motion.div>

            {/* Schedule Info */}
            {startDate && !isQuotaFull && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <div className="inline-flex flex-col md:flex-row items-center justify-center gap-4 bg-blue-50 dark:bg-blue-900/20 px-6 py-4 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold">
                    <Clock className="w-5 h-5" />
                    <span>Jadwal Pendaftaran:</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-blue-600 dark:text-blue-200">
                    <span>
                      Mulai:{" "}
                      {isClient &&
                        new Date(startDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                    </span>
                    {endDate && (
                      <>
                        <span className="hidden md:inline text-blue-300">
                          •
                        </span>
                        <span>
                          Selesai:{" "}
                          {isClient &&
                            new Date(endDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contact Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid md:grid-cols-2 gap-4 mb-8"
            >
              <a
                href="tel:0215403540"
                className="flex items-center justify-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5 text-school-blue dark:text-school-yellow" />
                </div>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  (021) 5403540
                </span>
              </a>
              <a
                href="mailto:info@smpipyakin.sch.id"
                className="flex items-center justify-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5 text-school-blue dark:text-school-yellow" />
                </div>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  info@smpipyakin.sch.id
                </span>
              </a>
            </motion.div>

            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-school-blue text-white rounded-full font-semibold shadow-lg shadow-school-blue/30 hover:shadow-school-blue/40 hover:-translate-y-0.5 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Kembali ke Beranda
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Compact banner version
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`p-4 rounded-xl border shadow-sm ${
        isQuotaFull
          ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
          : "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-2 rounded-lg ${
            isQuotaFull
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-yellow-100 dark:bg-yellow-900/30"
          }`}
        >
          {isQuotaFull ? (
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          ) : (
            <Lock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>
        <div>
          <p
            className={`font-bold text-lg ${
              isQuotaFull
                ? "text-red-800 dark:text-red-200"
                : "text-yellow-800 dark:text-yellow-200"
            }`}
          >
            {isQuotaFull
              ? "Kuota Pendaftaran Penuh"
              : timeLeft
              ? "Pendaftaran Segera Dibuka"
              : "Pendaftaran Belum Dibuka"}
          </p>
          <p
            className={`mt-1 ${
              isQuotaFull
                ? "text-red-700 dark:text-red-300"
                : "text-yellow-700 dark:text-yellow-300"
            }`}
          >
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
        {value.toString().padStart(2, "0")}
      </span>
      <span className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium mt-1">
        {label}
      </span>
    </div>
  );
}
