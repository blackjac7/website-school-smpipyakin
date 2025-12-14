"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo sekolah */}
          <div className="mb-4">
            <Image
              src="/logo.png"
              alt="SMP IP Yakin Jakarta"
              width={64}
              height={64}
              className="h-16 w-auto"
              priority
            />
          </div>

          {/* Loading Animation */}
          <div className={`${sizeClasses[size]} relative`}>
            {/* Lottie animation - hanya render di client */}
            {isMounted && (
              <DotLottieReact
                src="https://lottie.host/6b5b6fa9-6cb3-40a7-bb9e-aebbcec63c85/lHn0J6xc5S.lottie"
                loop
                autoplay
                className="w-full h-full relative z-10"
              />
            )}
          </div>

          {/* Loading Message */}
          {showMessage && (
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-blue-800 animate-pulse">
                {message}
              </p>
              <p className="text-sm text-blue-600">SMP IP Yakin Jakarta</p>
            </div>
          )}

          {/* Loading Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }
);

LoadingEffect.displayName = "LoadingEffect";

export default LoadingEffect;
