"use client";

import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden relative selection:bg-school-yellow/30">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-school-yellow/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
      </div>

      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-2xl rounded-3xl p-8 md:p-12 w-full"
        >
          {/* Lottie Animation Area */}
          <div className="w-full max-w-[320px] md:max-w-[400px] h-64 md:h-80 mx-auto mb-8 relative">
             {isMounted ? (
              <DotLottieReact
                src="/animations/404.lottie"
                loop
                autoplay
                className="w-full h-full"
              />
            ) : (
              // Fallback skeleton while loading
              <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
                 <span className="text-9xl font-bold text-slate-200 dark:text-slate-700">404</span>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
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
                onClick={() => window.history.back()}
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
