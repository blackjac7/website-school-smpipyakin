"use client";

import { useState } from "react";
import Image from "next/image";
import { LogOut, User, Bell, Edit } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useAuth } from "./AuthProvider";
import { FormattedNotification } from "@/utils/notificationHelpers";

interface LogoutButtonProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  variant?: "simple" | "dropdown" | "profile";
  className?: string;
  onLogout?: () => void;
  onEditProfile?: () => void;
  // Mobile notifications props
  notifications?: FormattedNotification[];
  unreadCount?: number;
  onNotificationClick?: (notification: FormattedNotification) => void;
  onViewAllNotifications?: () => void;
}

export default function LogoutButton({
  userName = "User",
  userRole = "Role",
  userAvatar,
  variant = "simple",
  className = "",
  onLogout,
  onEditProfile,
  // Mobile notifications props
  notifications = [],
  unreadCount = 0,
  onNotificationClick,
  onViewAllNotifications,
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
        className={`group flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer ${
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
          className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer ${className}`}
        >
          <div className="relative">
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
            {/* Notification badge for mobile - only show on small screens */}
            {unreadCount > 0 && (
              <span className="md:hidden absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white font-semibold shadow-lg">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
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
                {/* Mobile Notifications Section */}
                <div className="md:hidden">
                  {notifications.length > 0 ? (
                    <>
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            Notifikasi
                          </span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                              {unreadCount} baru
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {notifications.slice(0, 3).map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => {
                              onNotificationClick?.(notification);
                              setShowDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <notification.icon
                                className={`w-4 h-4 ${notification.color} mt-1 flex-shrink-0`}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm ${
                                    !notification.read
                                      ? "font-semibold"
                                      : "font-medium"
                                  } text-gray-900 truncate`}
                                >
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      {notifications.length > 3 && (
                        <button
                          onClick={() => {
                            onViewAllNotifications?.();
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 hover:text-orange-500 transition-colors border-t border-gray-200 font-medium"
                        >
                          Lihat Semua Notifikasi
                        </button>
                      )}
                      <hr className="my-2 border-gray-200" />
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-6 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                          Tidak ada notifikasi
                        </p>
                      </div>
                      <hr className="my-2 border-gray-200" />
                    </>
                  )}
                </div>

                {/* Edit Profile Menu */}
                {onEditProfile && (
                  <>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        onEditProfile();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profil</span>
                    </button>
                    <hr className="my-2 border-gray-200" />
                  </>
                )}

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    confirmLogout();
                  }}
                  disabled={isLoggingOut}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer ${
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
