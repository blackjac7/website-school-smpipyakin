"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, CheckCircle, Info } from "lucide-react";

interface ToastConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  description?: string;
  type?: "warning" | "danger" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  showCloseButton?: boolean;
}

export default function ToastConfirmModal({
  isOpen,
  title,
  message,
  description,
  type = "warning",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  isLoading = false,
  showCloseButton = true,
}: ToastConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading, onCancel]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const modalElements = Array.from(focusableElements).filter((el) => {
      const modal = el.closest('[data-modal="confirm"]');
      return modal !== null;
    });

    if (modalElements.length > 0) {
      (modalElements[0] as HTMLElement).focus();
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-600" />;
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case "danger":
        return "bg-red-100";
      case "warning":
        return "bg-yellow-100";
      case "info":
        return "bg-blue-100";
      case "success":
        return "bg-green-100";
      default:
        return "bg-yellow-100";
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "warning":
        return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
      case "info":
        return "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";
      case "success":
        return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
      default:
        return "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500";
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
      onClick={(e) => {
        // Prevent close on backdrop click when loading
        if (!isLoading && e.target === e.currentTarget) {
          onCancel();
        }
      }}
      data-modal="confirm"
    >
      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div
            className={`w-12 h-12 ${getIconBgColor()} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            {getIcon()}
          </div>

          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {title}
              </h3>
            )}
            <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Close Button */}
          {showCloseButton && !isLoading && (
            <button
              onClick={onCancel}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${getConfirmButtonColor()} ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memproses...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
