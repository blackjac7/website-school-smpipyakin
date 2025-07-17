"use client";

import { useState } from "react";
import Image from "next/image";
import { LogOut, Settings, User } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useAuth } from "./AuthProvider";

interface LogoutButtonProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  variant?: "simple" | "dropdown" | "profile";
  className?: string;
  onLogout?: () => void;
}

export default function LogoutButton({
  userName = "User",
  userRole = "Role",
  userAvatar,
  variant = "simple",
  className = "",
  onLogout,
}: LogoutButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };

  const confirmLogout = () => {
    setShowConfirmModal(true);
  };

  // Simple logout button
  if (variant === "simple") {
    return (
      <button
        onClick={confirmLogout}
        disabled={isLoggingOut}
        className={`group flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 ${
          isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <LogOut
          className={`w-4 h-4 transition-transform duration-200 ${
            isLoggingOut ? "animate-spin" : "group-hover:scale-110"
          }`}
        />
        <span className="text-sm font-medium">
          {isLoggingOut ? "Keluar..." : "Logout"}
        </span>
      </button>
    );
  }

  // Profile dropdown variant
  if (variant === "profile" || variant === "dropdown") {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 ${className}`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={32}
                height={32}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          {variant === "profile" && (
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown Content */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              {/* User Info Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt={userName}
                        width={40}
                        height={40}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-600">{userRole}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Add profile edit functionality here
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <User className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Add settings functionality here
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <Settings className="w-4 h-4" />
                  <span>Pengaturan</span>
                </button>

                <hr className="my-2 border-gray-200" />

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    confirmLogout();
                  }}
                  disabled={isLoggingOut}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 ${
                    isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <LogOut
                    className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`}
                  />
                  <span>{isLoggingOut ? "Keluar..." : "Logout"}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleLogout}
          userName={userName}
          isLoading={isLoggingOut}
        />
      </div>
    );
  }

  return null;
}
