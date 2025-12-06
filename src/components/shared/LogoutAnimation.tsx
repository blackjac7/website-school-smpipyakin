"use client";

import { useState, useEffect } from "react";
import { LogOut, Loader2 } from "lucide-react";

interface LogoutAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

/**
 * LogoutAnimation component.
 * Displays a multi-step animation during the logout process.
 * @param {LogoutAnimationProps} props - The component props.
 * @param {boolean} props.isVisible - Whether the animation should be visible.
 * @param {function} [props.onComplete] - Callback function to execute when the animation completes.
 * @returns {JSX.Element | null} The rendered LogoutAnimation component or null if not visible.
 */
export default function LogoutAnimation({
  isVisible,
  onComplete,
}: LogoutAnimationProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center">
        {/* Step 1: Show logout icon */}
        {step >= 1 && (
          <div className="mb-8 animate-pulse">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
              <LogOut className="w-10 h-10 text-gray-800" />
            </div>
          </div>
        )}

        {/* Step 2: Show loading */}
        {step >= 2 && (
          <div className="mb-6 animate-fade-in">
            <Loader2 className="w-8 h-8 mx-auto text-white animate-spin" />
            <p className="text-white text-lg font-medium mt-4">
              Mengakhiri sesi...
            </p>
            <div className="mt-4 w-64 mx-auto bg-gray-700 rounded-full h-2">
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
            <p className="text-white text-lg font-medium">Logout berhasil!</p>
            <p className="text-gray-300 text-sm mt-2">
              Mengalihkan ke halaman login...
            </p>
          </div>
        )}
      </div>

      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white opacity-20 rounded-full animate-float"
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
