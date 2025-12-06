"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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

export const useAsyncLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
