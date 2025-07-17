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

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memuat...");

  const showLoading = (message: string = "Memuat...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

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
