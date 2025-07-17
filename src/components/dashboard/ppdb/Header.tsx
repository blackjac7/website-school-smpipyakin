"use client";

import { Menu } from "lucide-react";
import { LogoutButton } from "@/components/shared";

interface HeaderProps {
  activeMenu: string;
  onToggleSidebar?: () => void;
}

const getHeaderTitle = (activeMenu: string) => {
  switch (activeMenu) {
    case "validation":
      return "Penerimaan Peserta Didik Baru";
    case "reports":
      return "Laporan PPDB";
    case "settings":
      return "Pengaturan PPDB";
    default:
      return "Dashboard PPDB";
  }
};

export default function Header({ activeMenu, onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {getHeaderTitle(activeMenu)}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LogoutButton
            variant="profile"
            userName="PPDB Officer"
            userRole="Penerimaan Siswa Baru"
            className="ml-2"
          />
        </div>
      </div>
    </header>
  );
}
