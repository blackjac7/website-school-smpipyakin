"use client";

import { useState, useCallback } from "react";

interface ToastConfirmOptions {
  title?: string;
  message: string;
  description?: string;
  type?: "warning" | "danger" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
  showCloseButton?: boolean;
}

interface ToastConfirmState {
  isOpen: boolean;
  isLoading: boolean;
  options: ToastConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export function useToastConfirm() {
  const [state, setState] = useState<ToastConfirmState>({
    isOpen: false,
    isLoading: false,
    options: { message: "" },
    onConfirm: () => {},
    onCancel: () => {},
  });

  const showConfirm = useCallback(
    (
      options: ToastConfirmOptions,
      onConfirm: () => void | Promise<void>,
      onCancel?: () => void
    ) => {
      setState({
        isOpen: true,
        isLoading: false,
        options,
        onConfirm: async () => {
          try {
            setState((prev) => ({ ...prev, isLoading: true }));
            await onConfirm();
            setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            console.error("Confirm action failed:", error);
          }
        },
        onCancel: () => {
          setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          if (onCancel) onCancel();
        },
      });
    },
    []
  );

  const hideConfirm = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
  }, []);

  return {
    ...state,
    showConfirm,
    hideConfirm,
  };
}
