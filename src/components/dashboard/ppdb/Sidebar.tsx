"use client";

import { Users, X } from "lucide-react";
import { MenuItem } from "./types";
import { SidebarLogout } from "@/components/shared";

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
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        `}
      >
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  PPDB Dashboard
                </h1>
              </div>
            </div>
            {/* Mobile Close Button */}
            {setIsSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeMenu === item.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveMenu(item.id)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        <SidebarLogout
          userName="PPDB Officer"
          userRole="Penerimaan Siswa Baru"
        />
      </div>
    </>
  );
}
