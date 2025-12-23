"use client";

import { useState } from "react";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useAuth } from "./AuthProvider";

interface SidebarLogoutProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  className?: string;
  onLogout?: () => void;
}

export default function SidebarLogout({
  userName = "User",
  userRole = "Role",
  userAvatar,
  className = "",
  onLogout,
}: SidebarLogoutProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };

  return (
    <>
      <div className={`border-t border-gray-200 p-4 ${className}`}>
        {/* User Info */}
        <div className="flex items-center gap-3 mb-3">
          {userAvatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 shadow-sm flex-shrink-0">
              <Image
                src={userAvatar}
                alt={userName}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate">{userRole}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 ${
            isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <LogOut className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`} />
          <span className="font-medium">
            {isLoggingOut ? "Keluar..." : "Logout"}
          </span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleLogout}
        userName={userName}
        isLoading={isLoggingOut}
      />
    </>
  );
}
