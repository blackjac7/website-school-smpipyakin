"use client";

import { memo, useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LoadingEffectProps {
  message?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showMessage?: boolean;
  /**
   * When true (default), the loader fills the entire viewport height and has
   * a solid background — use this for full page / route level loading.
   * When false, the loader only takes up the space it needs so it can be
   * dropped inline inside a card, section, or list without pushing the
   * layout to a full screen height. This is the single source of truth for
   * every loading state across the dashboard — always prefer this component
   * over ad-hoc spinners so the loading experience stays consistent.
   */
  fullScreen?: boolean;
}

const LoadingEffect = memo(
  ({
    message = "Memuat halaman...",
    size = "md",
    showMessage = true,
    fullScreen = true,
  }: LoadingEffectProps) => {
    const [isMounted, setIsMounted] = useState(false);

    const sizeClasses = {
      xs: "h-16 w-16",
      sm: "h-24 w-24 sm:h-32 sm:w-32",
      md: "h-36 w-36 sm:h-48 sm:w-48",
      lg: "h-48 w-48 sm:h-64 sm:w-64",
    };

    useEffect(() => {
      setIsMounted(true);
    }, []);

    return (
      <div
        className={
          fullScreen
            ? "flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 px-4"
            : "flex flex-col items-center justify-center py-10 px-4"
        }
      >
        <div className="flex flex-col items-center space-y-4">
          {/* Loading Animation */}
          <div
            className={`${sizeClasses[size]} relative flex items-center justify-center`}
          >
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
              <div className="w-1/2 h-1/2 border-4 border-gray-100 dark:border-gray-700 border-t-(--color-school-yellow) rounded-full animate-spin" />
            )}
          </div>

          {/* Loading Message */}
          {showMessage && (
            <div className="text-center space-y-1">
              <p className="text-base sm:text-lg font-medium text-blue-900 dark:text-blue-300 animate-pulse">
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);

LoadingEffect.displayName = "LoadingEffect";

export default LoadingEffect;
