"use client";

import { GraduationCap, X } from "lucide-react";
import { MenuItem } from "./types";
import { SidebarLogout } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";

interface SidebarProps {
  menuItems: MenuItem[];
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

export default function Sidebar({
  menuItems,
  activeMenu,
  setActiveMenu,
  isSidebarOpen = true,
  setIsSidebarOpen,
}: SidebarProps) {
  const { user } = useAuth();
  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && setIsSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
        `}
      >
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Dashboard PPDB
                </h1>
                <p className="text-xs text-gray-600">Officer Panel</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            {setIsSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-amber-500 hover:text-white transition-colors cursor-pointer group"
              >
                <X className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </button>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activeMenu === item.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg transform scale-105"
                  : "text-gray-700 hover:text-amber-600 hover:bg-amber-50 hover:transform hover:scale-102"
              }`}
              onClick={() => setActiveMenu(item.id)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        <SidebarLogout
          userName={user?.name || user?.username || "PPDB Officer"}
          userRole="Officer PPDB"
        />
      </div>
    </>
  );
}
