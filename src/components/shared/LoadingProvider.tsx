"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import LoadingEffect from "./LoadingEffect";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  loadingMessage: string;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Hook to access the loading context.
 * @returns {LoadingContextType} The loading context value.
 * @throws {Error} If used outside of a LoadingProvider.
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

/**
 * LoadingProvider component.
 * Manages the global loading state and displays the LoadingEffect overlay when loading.
 * @param {LoadingProviderProps} props - The component props.
 * @param {ReactNode} props.children - The child components.
 * @returns {JSX.Element} The rendered LoadingProvider component.
 */
export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memuat...");

  /**
   * Shows the loading overlay with a specific message.
   * @param {string} [message="Memuat..."] - The loading message.
   */
  const showLoading = (message: string = "Memuat...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  /**
   * Hides the loading overlay.
   */
  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setIsLoading,
        showLoading,
        hideLoading,
        loadingMessage,
      }}
    >
      {children}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white">
          <LoadingEffect message={loadingMessage} />
        </div>
      )}
    </LoadingContext.Provider>
  );
};
