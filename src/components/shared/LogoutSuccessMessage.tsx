"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

interface LogoutSuccessMessageProps {
  className?: string;
}

export default function LogoutSuccessMessage({
  className = "",
}: LogoutSuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user just logged out
    const justLoggedOut = sessionStorage.getItem("justLoggedOut");
    if (justLoggedOut) {
      setIsVisible(true);
      sessionStorage.removeItem("justLoggedOut");

      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm animate-in slide-in-from-right">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900">
              Logout Berhasil
            </p>
            <p className="mt-1 text-sm text-green-700">
              Anda telah berhasil keluar dari sistem. Silakan login kembali
              untuk mengakses dashboard.
            </p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 ml-3 text-green-400 hover:text-green-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
