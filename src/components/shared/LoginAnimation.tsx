"use client";

import { useState, useEffect } from "react";
import { LogIn, Loader2, CheckCircle } from "lucide-react";

interface LoginAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function LoginAnimation({
  isVisible,
  onComplete,
}: LoginAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const steps = [
      { delay: 0, action: () => setStep(1) }, // Show animation
      { delay: 1000, action: () => setStep(2) }, // Show progress
      { delay: 2000, action: () => setStep(3) }, // Show completion
      { delay: 3000, action: () => onComplete?.() }, // Complete
    ];

    const timers = steps.map(({ delay, action }) => setTimeout(action, delay));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="text-center">
        {/* Step 1: Show login icon */}
        {step >= 1 && (
          <div className="mb-8 animate-pulse">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
              <LogIn className="w-10 h-10 text-blue-800" />
            </div>
          </div>
        )}

        {/* Step 2: Show loading */}
        {step >= 2 && (
          <div className="mb-6 animate-fade-in">
            <Loader2 className="w-8 h-8 mx-auto text-white animate-spin" />
            <p className="text-white text-lg font-medium mt-4">
              Memverifikasi kredensial...
            </p>
            <div className="mt-4 w-64 mx-auto bg-blue-700 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full animate-pulse"
                style={{
                  width: step >= 3 ? "100%" : "60%",
                  transition: "width 1s ease-in-out",
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Show completion */}
        {step >= 3 && (
          <div className="animate-bounce">
            <div className="mb-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
            </div>
            <p className="text-white text-lg font-medium">Login berhasil!</p>
            <p className="text-blue-300 text-sm mt-2">
              Mengalihkan ke dashboard...
            </p>
          </div>
        )}
      </div>

      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 opacity-30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
