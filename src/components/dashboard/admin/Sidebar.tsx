import { MenuItem } from "./types";
import { SidebarLogout } from "@/components/shared";
import { X } from "lucide-react";
import { useAuth } from "@/components/shared/AuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  menuItems: MenuItem[];
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  menuItems,
  activeMenu,
  setActiveMenu,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const { user } = useAuth();

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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Close Button */}
        {onClose && (
          <div className="lg:hidden flex justify-end p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">
            Portal Admin
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Manage Sekolah & Konten</p>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                activeMenu === item.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
             <SidebarLogout
                userName={user?.name || user?.username || "Admin System"}
                userRole="Administrator"
             />
        </div>
      </div>
    </>
  );
}
