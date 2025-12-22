"use client";

import { memo, useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LoadingEffectProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  showMessage?: boolean;
}

const LoadingEffect = memo(
  ({
    message = "Memuat halaman...",
    size = "md",
    showMessage = true,
  }: LoadingEffectProps) => {
    const [isMounted, setIsMounted] = useState(false);

    const sizeClasses = {
      sm: "h-32 w-32",
      md: "h-48 w-48",
      lg: "h-64 w-64",
    };

    useEffect(() => {
      setIsMounted(true);
    }, []);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center space-y-4">
          {/* Loading Animation */}
          <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
            {/* Lottie animation - client side only */}
            {isMounted ? (
              <DotLottieReact
                src="/animations/school-loading.lottie"
                loop
                autoplay
                className="w-full h-full"
              />
            ) : (
              /* Fallback for Server Side Rendering (SSR) and initial Client load */
              /* Prevents white screen flash */
              <div className="w-1/2 h-1/2 border-4 border-gray-100 border-t-[var(--color-school-yellow)] rounded-full animate-spin" />
            )}
          </div>

          {/* Loading Message */}
          {showMessage && (
            <div className="text-center space-y-1">
              <p className="text-lg font-medium text-blue-900 animate-pulse">
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

LoadingEffect.displayName = "LoadingEffect";

export default LoadingEffect;
