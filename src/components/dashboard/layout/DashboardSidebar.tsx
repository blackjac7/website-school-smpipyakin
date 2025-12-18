"use client";

import { X } from "lucide-react";
import { SidebarLogout } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { DashboardSidebarProps } from "./types";

export default function DashboardSidebar({
  menuItems,
  activeMenu,
  setActiveMenu,
  isSidebarOpen = true,
  setIsSidebarOpen,
  title = "Dashboard",
  subtitle = "SCHOOL AREA",
  userRole,
}: DashboardSidebarProps) {
  const { user } = useAuth();
  const displayRole = userRole || user?.role || "User";
  const displayTitle = title;
  const displaySubtitle = subtitle;

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const menuItemVariants = {
    hover: { scale: 1.02, x: 4 },
    tap: { scale: 0.98 },
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && setIsSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col shadow-xl lg:shadow-none h-full"
      >
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 bg-blue-900 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-white">
                <Image
                  src="https://res.cloudinary.com/dvnyimxmi/image/upload/v1733055884/logo_svl2lq.png"
                  alt="Logo"
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">{displayTitle}</h1>
                <p className="text-xs text-blue-200 font-medium tracking-wide uppercase">
                  {displaySubtitle}
                </p>
              </div>
            </div>
            {/* Mobile Close Button */}
            {setIsSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Menu Utama
          </div>
          {menuItems.map((item) => {
            const isActive = activeMenu === item.id;
            return (
              <motion.div
                key={item.id}
                variants={menuItemVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setActiveMenu(item.id)}
                className={`
                  relative flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-colors duration-200
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <SidebarLogout
            userName={user?.name || user?.username || displayRole}
            userRole={displayRole}
          />
        </div>
      </motion.div>
    </>
  );
}
