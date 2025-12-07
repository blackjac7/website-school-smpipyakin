import { Bell, Menu, User } from "lucide-react";
import { LogoutButton } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { Notification } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as React from "react";

interface HeaderProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notifications: Notification[];
  onToggleSidebar?: () => void;
}

export default function Header({
  showNotifications,
  setShowNotifications,
  notifications,
  onToggleSidebar,
}: HeaderProps) {
  const { user } = useAuth();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-4 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Dashboard Admin
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
             <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                 {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <Card className="absolute right-0 mt-2 w-[90vw] sm:w-80 bg-popover border-border z-50 shadow-lg">
                <CardHeader className="p-4 border-b border-border pb-2">
                   <CardTitle className="text-sm font-semibold">Notifikasi</CardTitle>
                </CardHeader>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada notifikasi baru</div>
                  ) : (
                      notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                          "p-4 border-b border-border last:border-0 hover:bg-accent/50 transition-colors cursor-pointer",
                           !notification.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0",
                            notification.type === "alert"
                              ? "bg-destructive"
                              : notification.type === "success"
                                ? "bg-green-500"
                                : "bg-blue-500"
                          )}
                        />
                        <div className="flex-1 space-y-1">
                          <p className={cn("text-sm leading-none", !notification.read ? "font-semibold text-foreground" : "text-muted-foreground")}>
                            {notification.title || notification.type}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="h-6 w-px bg-border mx-1" />

          {/* User Profile */}
          <div className="flex items-center gap-2">
              <div className="hidden md:block text-right">
                  <p className="text-sm font-medium leading-none">{user?.name || user?.username || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <div className="rounded-full bg-primary/10 p-1">
                 <LogoutButton
                    variant="ghost"
                    userName=""
                    userRole=""
                    className="h-8 w-8 p-0 rounded-full"
                    icon={<User className="h-5 w-5"/>}
                  />
              </div>
          </div>
        </div>
      </div>
    </header>
  );
}
