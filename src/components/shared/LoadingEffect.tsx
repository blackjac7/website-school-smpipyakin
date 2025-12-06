"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamic import untuk Lottie Player agar aman untuk SSR
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => ({ default: mod.Player })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

interface LoadingEffectProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  showMessage?: boolean;
}

/**
 * LoadingEffect component.
 * Displays a loading screen with a Lottie animation, school logo, and loading message.
 * Optimized for SSR by dynamically importing the Lottie player.
 * @param {LoadingEffectProps} props - The component props.
 * @param {string} [props.message="Memuat halaman..."] - The loading message to display.
 * @param {"sm" | "md" | "lg"} [props.size="md"] - The size of the loading animation.
 * @param {boolean} [props.showMessage=true] - Whether to show the loading message.
 * @returns {JSX.Element} The rendered LoadingEffect component.
 */
const LoadingEffect = memo(
  ({
    message = "Memuat halaman...",
    size = "md",
    showMessage = true,
  }: LoadingEffectProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const sizeClasses = {
      sm: "h-32 w-32",
      md: "h-48 w-48",
      lg: "h-64 w-64",
    };

    useEffect(() => {
      setIsMounted(true);
    }, []);

    const handleEvent = () => {
      setIsLoaded(true);
    };

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
            {/* Fallback spinner yang selalu tampil */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            
            {/* Lottie animation - hanya render di client */}
            {isMounted && (
              <Player
                autoplay
                loop
                src="https://lottie.host/bfe8cfb2-c676-4ae0-901b-621be1bbe4b0/y4SXjX8YUR.json"
                className="w-full h-full relative z-10"
                onEvent={handleEvent}
                style={{ 
                  opacity: isLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
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
