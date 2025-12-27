"use client";

import Link from "next/link";
import { ArrowLeft, Home, FileQuestion, Search, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// Floating Icon Component for background
const FloatingIcon = ({
  icon: Icon,
  delay = 0,
  duration = 5,
  x = 0,
  y = 0,
  className = "",
}: {
  icon: React.ElementType;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
}) => (
  <motion.div
    animate={{
      y: [0, y, 0],
      x: [0, x, 0],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay,
    }}
    className={`absolute opacity-10 dark:opacity-5 ${className}`}
  >
    <Icon />
  </motion.div>
);

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden relative selection:bg-school-yellow/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-school-yellow/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

        {/* Floating Icons Background */}
        <FloatingIcon icon={FileQuestion} className="w-24 h-24 top-1/4 left-1/4 text-school-blue" delay={0} duration={6} y={-20} x={10} />
        <FloatingIcon icon={Search} className="w-32 h-32 bottom-1/4 right-1/4 text-school-yellow" delay={1} duration={7} y={20} x={-10} />
        <FloatingIcon icon={AlertCircle} className="w-16 h-16 top-1/3 right-1/3 text-slate-400" delay={2} duration={5} y={-15} />
      </div>

      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-12 w-full"
        >
          {/* Animated 404 Illustration */}
          <div className="w-full h-64 md:h-80 mx-auto mb-8 relative flex items-center justify-center">
            <div className="relative flex items-center justify-center font-bold text-[8rem] md:text-[12rem] text-slate-100 dark:text-slate-700/50 leading-none select-none">

              {/* The "4" */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                4
              </motion.div>

              {/* The "0" - Animated Search Icon */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                className="relative mx-4 md:mx-8"
              >
                <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
                    <motion.div
                        animate={{
                            rotate: [0, 45, 0, -45, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="text-school-yellow/80"
                    >
                        <Search className="w-full h-full" strokeWidth={1.5} />
                    </motion.div>

                    {/* Question mark inside loop */}
                    <motion.div
                         animate={{ opacity: [0, 1, 0], y: [-10, 0, -10] }}
                         transition={{ duration: 3, repeat: Infinity }}
                         className="absolute text-school-blue/80"
                    >
                        <FileQuestion className="w-12 h-12 md:w-16 md:h-16" />
                    </motion.div>
                </div>
              </motion.div>

              {/* The second "4" */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative"
              >
                4
              </motion.div>
            </div>

            {/* Overlay Text "Not Found" */}
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-8 md:bottom-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-6 py-2 rounded-full border border-slate-200 dark:border-slate-600 shadow-lg"
             >
                <span className="font-semibold text-slate-700 dark:text-slate-200">Page Not Found</span>
             </motion.div>
          </div>

          {/* Text Content */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                Halaman Tidak Ditemukan
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300">
                Maaf, halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 pt-4"
            >
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-school-blue text-white rounded-full font-semibold shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 hover:-translate-y-0.5 transition-all group"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Kembali ke Beranda
              </Link>

              <button
                onClick={() => router.back()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-full font-semibold hover:bg-slate-50 dark:hover:bg-slate-600 transition-all group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Halaman Sebelumnya
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-sm text-slate-500 dark:text-slate-400"
        >
          Butuh bantuan? Silakan <Link href="/contact" className="text-school-blue dark:text-school-yellow hover:underline font-medium">Hubungi Kami</Link>
        </motion.p>
      </div>
    </div>
  );
}
