"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Hook to handle page loading state.
 * Automatically sets loading to true on route change and false after a short delay.
 * @returns {boolean} The loading state.
 */
export const usePageLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsLoading(true);

    // Simulasi loading time untuk memberikan experience yang smooth
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return isLoading;
};

/**
 * Hook to handle async function loading state.
 * Manages loading and error states for asynchronous operations.
 * @returns {object} Object containing isLoading, error, and executeWithLoading function.
 */
export const useAsyncLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Executes an asynchronous function while managing loading and error states.
   * @param {function} asyncFunction - The async function to execute.
   * @returns {Promise<T | null>} The result of the async function or null if an error occurred.
   */
  const executeWithLoading = async <T,>(
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    executeWithLoading,
  };
};
