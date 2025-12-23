"use client";

import {
  LucideIcon,
  FolderOpen,
  Search,
  FileQuestion,
  Inbox,
} from "lucide-react";
import { motion } from "framer-motion";

export type EmptyStateVariant = "default" | "search" | "filter" | "inbox";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: EmptyStateVariant;
  className?: string;
}

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: FolderOpen,
  search: Search,
  filter: FileQuestion,
  inbox: Inbox,
};

const variantColors: Record<EmptyStateVariant, string> = {
  default: "text-gray-400 bg-gray-100",
  search: "text-blue-400 bg-blue-100",
  filter: "text-amber-400 bg-amber-100",
  inbox: "text-purple-400 bg-purple-100",
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = "default",
  className = "",
}: EmptyStateProps) {
  const IconComponent = icon || variantIcons[variant];
  const colorClass = variantColors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${colorClass}`}
      >
        <IconComponent className="w-8 h-8" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-900 text-center mb-2"
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-500 text-center max-w-md mb-4"
        >
          {description}
        </motion.p>
      )}

      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

// Compact empty state for inline use
export function EmptyStateCompact({
  icon,
  message,
  variant = "default",
  className = "",
}: {
  icon?: LucideIcon;
  message: string;
  variant?: EmptyStateVariant;
  className?: string;
}) {
  const IconComponent = icon || variantIcons[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center py-8 ${className}`}
    >
      <IconComponent className="w-10 h-10 text-gray-300 mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
