"use client";

import { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LogoutAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function LogoutAnimation({
  isVisible,
  onComplete,
}: LogoutAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const steps = [
      { delay: 0, action: () => setStep(1) }, // Show animation
      { delay: 1500, action: () => setStep(2) }, // Show completion text
      { delay: 2500, action: () => onComplete?.() }, // Complete
    ];

    const timers = steps.map(({ delay, action }) => setTimeout(action, delay));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm">
      <div className="text-center">
        {/* Animation */}
        <div className="mb-4 h-48 w-48 mx-auto relative">
          <DotLottieReact
            src="/animations/school-loading.lottie"
            loop
            autoplay
            className="w-full h-full"
          />
        </div>

        {/* Text Status */}
        <div className="space-y-2 animate-fade-in">
          <p className="text-blue-900 text-xl font-semibold">
            {step < 2 ? "Mengakhiri sesi..." : "Logout Berhasil"}
          </p>
          <p className="text-blue-600 text-sm">
            {step < 2
              ? "Mohon tunggu sebentar"
              : "Mengalihkan ke halaman login..."}
          </p>
        </div>
      </div>
    </div>
  );
}
