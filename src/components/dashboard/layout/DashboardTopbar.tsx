"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Menu } from "lucide-react";
import { LogoutButton } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { DASHBOARD_COPY, WORKSPACE_CONFIG, getWorkspacePageMeta, type DashboardNotification, type DashboardWorkspace } from "./dashboard-config";

interface DashboardTopbarProps {
  workspace: DashboardWorkspace;
  activePage: string;
  notifications: DashboardNotification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  unreadCount: number;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onMarkAsRead?: (notificationId: string) => void;
  onEditProfile?: () => void;
}

export default function DashboardTopbar({
  workspace,
  activePage,
  notifications,
  showNotifications,
  setShowNotifications,
  unreadCount,
  onToggleSidebar,
  isSidebarOpen = false,
  onMarkAsRead,
  onEditProfile,
}: DashboardTopbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const meta = getWorkspacePageMeta(workspace, activePage);
  const Icon = meta.icon;
  const role = WORKSPACE_CONFIG[workspace].role;
  const notificationPath = workspace === "pembina-osis" ? null : `/dashboard-${workspace}/notifications`;
  const notificationId = useId();
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotifications) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !notificationPanelRef.current?.contains(target) &&
        !notificationButtonRef.current?.contains(target)
      ) {
        setShowNotifications(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        notificationButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowNotifications, showNotifications]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {onToggleSidebar && <button type="button" onClick={onToggleSidebar} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700 lg:hidden" aria-label={isSidebarOpen ? "Tutup navigasi" : "Buka navigasi"} aria-controls={`${workspace}-navigation`} aria-expanded={isSidebarOpen}><Menu className="h-5 w-5" aria-hidden="true" /></button>}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Icon className="h-5 w-5" /></div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-black tracking-tight text-slate-950 sm:text-lg">{meta.title}</h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block">{meta.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <button ref={notificationButtonRef} type="button" onClick={() => setShowNotifications(!showNotifications)} className={`relative rounded-xl p-2.5 transition ${showNotifications ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-100 hover:text-blue-700"}`} aria-label={`${DASHBOARD_COPY.notifications}${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ""}`} aria-expanded={showNotifications} aria-controls={notificationId} aria-haspopup="dialog">
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div ref={notificationPanelRef} id={notificationId} role="dialog" aria-label={DASHBOARD_COPY.notifications} initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} className="absolute right-0 mt-2 w-[min(92vw,23rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3"><p className="font-bold text-slate-950">{DASHBOARD_COPY.notifications}</p><p className="mt-0.5 text-xs text-slate-500">{unreadCount ? `${unreadCount} perlu dibaca` : DASHBOARD_COPY.notificationRead}</p></div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length ? notifications.map((notification) => <button type="button" key={notification.id} onClick={() => !notification.read && onMarkAsRead?.(notification.id)} disabled={notification.read} className={`block w-full border-b border-slate-100 p-4 text-left enabled:hover:bg-slate-50 disabled:cursor-default ${!notification.read ? "bg-blue-50/50" : ""}`} aria-label={`${notification.read ? "Sudah dibaca" : "Belum dibaca"}: ${notification.title || notification.type}`}><div className="flex gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.type === "success" ? "bg-emerald-500" : notification.type === "pending" ? "bg-amber-500" : "bg-blue-600"}`} aria-hidden="true" /><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{notification.title || notification.type}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{notification.message}</p><p className="mt-1.5 text-[11px] text-slate-400">{notification.time}</p></div></div></button>) : <div className="p-8 text-center"><BellOff className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" /><p className="mt-2 text-sm text-slate-500">{DASHBOARD_COPY.noNotifications}</p></div>}
                  </div>
                  {notificationPath && notifications.length > 0 && <div className="border-t border-slate-100 bg-slate-50 p-2"><button type="button" onClick={() => { setShowNotifications(false); router.push(notificationPath); }} className="w-full rounded-xl px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">Lihat semua notifikasi</button></div>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <LogoutButton variant="profile" userName={user?.name || user?.username || "User"} userRole={role} className="ml-1" onEditProfile={onEditProfile} />
        </div>
      </div>
    </header>
  );
}
