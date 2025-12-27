"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, Mail, Phone, Settings, Hammer, AlertCircle } from "lucide-react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";

// Rotating Gear Component
const RotatingGear = ({
  size = 48,
  color = "text-slate-400",
  duration = 10,
  reverse = false,
  className = ""
}: {
  size?: number;
  color?: string;
  duration?: number;
  reverse?: boolean;
  className?: string;
}) => (
  <motion.div
    animate={{ rotate: reverse ? -360 : 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear" }}
    className={`absolute ${className} ${color}`}
  >
    <Settings size={size} />
  </motion.div>
);

export default function MaintenancePageClient({ message }: { message?: string }) {
  const displayMessage =
    message ||
    "Website sedang dalam pemeliharaan sistem. Kami sedang meningkatkan performa dan fitur untuk pengalaman yang lebih baik.";

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900 text-white">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black z-0" />

      {/* Animated Mesh Grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-0" />

      {/* Gears Animation Scene */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <RotatingGear
          size={120}
          color="text-slate-700/50"
          duration={20}
          className="top-1/4 left-1/4 opacity-20"
        />
        <RotatingGear
          size={200}
          color="text-slate-600/30"
          duration={30}
          reverse
          className="-bottom-12 -right-12 opacity-30"
        />
        <RotatingGear
          size={80}
          color="text-blue-500/10"
          duration={15}
          className="top-1/3 right-1/3"
        />
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 w-full max-w-lg px-6"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]" />

          {/* Animated Illustration */}
          <div className="flex justify-center mb-8 relative">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="text-orange-500"
              >
                <Settings size={64} />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-2 -right-4 text-blue-500"
              >
                <Settings size={40} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: [0, 1, 0], y: -20 }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="absolute -top-4 -right-4"
              >
                <Hammer className="text-slate-400 w-6 h-6" />
              </motion.div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-linear-to-r from-orange-400 to-orange-200">
                Under Maintenance
              </h1>
              <div className="h-1 w-16 bg-orange-500/30 mx-auto rounded-full mb-6" />
            </motion.div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-300 mb-8 leading-relaxed"
            >
              {displayMessage}
            </motion.p>

            {/* Estimated Time Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full text-slate-400 text-sm mb-8 border border-slate-700"
            >
              <Clock size={14} />
              <span>Estimasi: Segera Kembali</span>
            </motion.div>

            {/* Emergency Contact */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-3 mb-8"
            >
               <a
                href="tel:0215403540"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <Phone className="w-5 h-5 text-orange-400 mb-2" />
                <span className="text-xs text-slate-400">(021) 5403540</span>
              </a>
              <a
                href="mailto:info@smpipyakin.sch.id"
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <Mail className="w-5 h-5 text-orange-400 mb-2" />
                <span className="text-xs text-slate-400">Email Kami</span>
              </a>
            </motion.div>

            {/* Home Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                href="/"
                className="group inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Coba akses beranda</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
