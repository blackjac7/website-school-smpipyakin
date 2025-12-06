"use client";

import { useState } from "react";
import { useAuth } from "@/components/shared/AuthProvider";

interface UserMenuProps {
  className?: string;
}

/**
 * UserMenu component.
 * Displays the current user's profile information and a logout button.
 * Can be toggled open and closed.
 * @param {UserMenuProps} props - The component props.
 * @returns {JSX.Element | null} The UserMenu component.
 */
export function UserMenu({ className = "" }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();

  if (!user) return null;

  /**
   * Handles the logout action.
   * Closes the menu and calls the logout function from useAuth.
   */
  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
          <span className="text-indigo-600 font-medium text-sm">
            {user.name?.charAt(0) || user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-left">
          <div className="font-medium">{user.name || user.username}</div>
          <div className="text-xs text-gray-500 capitalize">{user.role}</div>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-900">
              {user.name || user.username}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="text-xs text-gray-400 capitalize mt-1">
              Role: {user.role}
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              isLoggingOut
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
