"use client";

import { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogoutAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function LogoutAnimation({
  isVisible,
  onComplete,
}: LogoutAnimationProps) {
  useEffect(() => {
    if (!isVisible) return;

    // Sequence:
    // 0ms: Start (Loading)
    // 2000ms: Complete (Redirect/Close)

    const timer = setTimeout(() => {
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
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
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          {/* Animation */}
          <div className="h-48 w-48 mb-4">
            <DotLottieReact
              src="/animations/school-loading.lottie"
              loop
              autoplay
              className="w-full h-full"
            />
          </div>

          {/* Text Status */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-blue-900">
              Sampai Jumpa!
            </h3>
            <p className="text-gray-500 text-sm">
              Sedang mengakhiri sesi anda...
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
