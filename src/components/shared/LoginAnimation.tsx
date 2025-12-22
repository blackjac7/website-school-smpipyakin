"use client";

import { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LoginAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function LoginAnimation({
  isVisible,
  onComplete,
}: LoginAnimationProps) {
  const [step, setStep] = useState<"loading" | "success">("loading");

  useEffect(() => {
    if (!isVisible) {
      setStep("loading"); // Reset state when closed
      return;
    }

    // Sequence:
    // 0ms: Start (Loading)
    // 2000ms: Success
    // 3500ms: Complete (Redirect)

    const successTimer = setTimeout(() => {
      setStep("success");
    }, 2000);

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 3500);

    return () => {
      clearTimeout(successTimer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-300"
    >
      <div className="w-full max-w-sm mx-auto p-6 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {step === "loading" ? (
            <motion.div
              key="loading"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="h-48 w-48 mb-4">
                <DotLottieReact
                  src="/animations/school-loading.lottie"
                  loop
                  autoplay
                  className="w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Memverifikasi...
              </h3>
              <p className="text-gray-500 text-sm">
                Mohon tunggu, sedang memeriksa data anda.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center"
            >
              <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-100/50">
                <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Login Berhasil!
              </h3>
              <p className="text-gray-500">
                Mengalihkan anda ke dashboard...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
