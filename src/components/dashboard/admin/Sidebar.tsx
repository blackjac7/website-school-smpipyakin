import { MenuItem } from "./types";
import { SidebarLogout } from "@/components/shared";
import { X } from "lucide-react";

interface SidebarProps {
  menuItems: MenuItem[];
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar component.
 * Displays the navigation sidebar for the admin dashboard.
 * Supports mobile responsive behavior with overlay and close button.
 * @param {SidebarProps} props - The component props.
 * @param {MenuItem[]} props.menuItems - Array of menu items to display.
 * @param {string} props.activeMenu - The ID of the currently active menu item.
 * @param {function} props.setActiveMenu - Function to set the active menu item.
 * @param {boolean} [props.isOpen=true] - Whether the sidebar is open (for mobile).
 * @param {function} [props.onClose] - Function to close the sidebar (for mobile).
 * @returns {JSX.Element} The rendered Sidebar component.
 */
export default function Sidebar({
  menuItems,
  activeMenu,
  setActiveMenu,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    // Close sidebar on mobile after selection
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 
        w-64 bg-white border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Mobile Close Button */}
        {onClose && (
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        )}

        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Selamat Datang, Admin
          </h1>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`sidebar-item ${activeMenu === item.id ? "active" : ""}`}
              onClick={() => handleMenuClick(item.id)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        <SidebarLogout userName="Admin System" userRole="Administrator" />
      </div>
    </>
  );
}
