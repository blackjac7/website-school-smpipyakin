"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, CheckCheck, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { NotificationAPIService } from "@/hooks/useNotifications";
import type { FormattedNotification } from "@/utils/notificationHelpers";
import NotificationCard from "@/components/shared/NotificationCard";
import LoadingEffect from "@/components/shared/LoadingEffect";
import { DASHBOARD_COPY, WORKSPACE_CONFIG, type DashboardWorkspace } from "./dashboard-config";

interface DashboardNotificationsPageProps {
  workspace: DashboardWorkspace;
  title?: string;
  userRole?: "admin" | "kesiswaan" | "osis" | "siswa" | "ppdb_admin";
}

export default function DashboardNotificationsPage({
  workspace,
  title,
  userRole,
}: DashboardNotificationsPageProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<FormattedNotification[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"load" | "mark-all" | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = useCallback(async (pageNum = 1, filterType: "all" | "unread" = "all") => {
    if (pageNum > 1) setBusyAction("load");
    try {
      const result = await NotificationAPIService.fetchAllNotifications({
        page: pageNum,
        filter: filterType,
        userRole,
      });
      if (!result.success) {
        toast.error(result.error || "Notifikasi gagal dimuat");
        return;
      }
      setNotifications((current) => pageNum === 1 ? result.data : [...current, ...result.data]);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Notifikasi gagal dimuat. Silakan coba lagi.");
    } finally {
      setInitialLoading(false);
      setBusyAction(null);
    }
  }, [userRole]);

  useEffect(() => {
    setInitialLoading(true);
    setPage(1);
    void loadNotifications(1, filter);
  }, [filter, loadNotifications]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  const markAsRead = async (notificationId: string) => {
    const result = await NotificationAPIService.markNotificationAsReadByRole(notificationId, userRole);
    if (result.success) {
      setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, read: true } : item));
    } else {
      toast.error(result.error || "Status notifikasi gagal diperbarui");
    }
  };

  const markAllAsRead = async () => {
    if (!unreadCount) return;
    setBusyAction("mark-all");
    try {
      if (userRole === "ppdb_admin") {
        const results = await Promise.all(
          notifications.filter((item) => !item.read).map((item) =>
            NotificationAPIService.markNotificationAsReadByRole(item.id, userRole),
          ),
        );
        if (results.some((result) => !result.success)) throw new Error("Sebagian notifikasi gagal diperbarui");
      } else {
        const result = await NotificationAPIService.markAllNotificationsAsReadByRole(userRole);
        if (!result.success) throw new Error(result.error || "Gagal menandai semua notifikasi");
      }
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      toast.success("Semua notifikasi ditandai sudah dibaca");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Status notifikasi gagal diperbarui");
    } finally {
      setBusyAction(null);
    }
  };

  if (initialLoading) return <LoadingEffect message="Memuat notifikasi..." />;

  const workspaceTitle = WORKSPACE_CONFIG[workspace].title;
  const pageTitle = title || `Notifikasi ${workspaceTitle}`;

  return (
    <div className="dashboard-workspace min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => router.back()} className="dashboard-icon-button" aria-label="Kembali ke dashboard">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex min-w-0 items-center gap-3">
              <div className="dashboard-icon-box"><Bell className="h-5 w-5" aria-hidden="true" /></div>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-black tracking-tight text-slate-950 sm:text-xl">{pageTitle}</h1>
                <p className="hidden text-xs text-slate-500 sm:block">{unreadCount ? `${unreadCount} notifikasi perlu dibaca` : DASHBOARD_COPY.notificationRead}</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={markAllAsRead} disabled={!unreadCount || busyAction === "mark-all"} className="dashboard-button dashboard-button-secondary shrink-0">
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{busyAction === "mark-all" ? "Memproses..." : "Tandai semua dibaca"}</span>
            <span className="sm:hidden">Tandai dibaca</span>
          </button>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <div role="tablist" aria-label="Filter notifikasi" className="dashboard-segmented mb-5">
          {(["all", "unread"] as const).map((value) => (
            <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={filter === value ? "is-active" : ""}>
              {value === "all" ? "Semua" : "Belum dibaca"}
            </button>
          ))}
        </div>

        {notifications.length === 0 ? (
          <section className="dashboard-empty-state" aria-live="polite">
            <div className="dashboard-empty-icon"><Inbox className="h-7 w-7" aria-hidden="true" /></div>
            <h2>{filter === "unread" ? "Semua notifikasi sudah dibaca" : "Belum ada notifikasi"}</h2>
            <p>{filter === "unread" ? "Tidak ada informasi yang memerlukan perhatian saat ini." : "Informasi baru akan muncul di halaman ini."}</p>
          </section>
        ) : (
          <div className="space-y-3" aria-live="polite">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} onClick={() => !notification.read && void markAsRead(notification.id)} />
            ))}
            {hasMore && (
              <div className="pt-4 text-center">
                <button type="button" onClick={() => { const nextPage = page + 1; setPage(nextPage); void loadNotifications(nextPage, filter); }} disabled={busyAction === "load"} className="dashboard-button dashboard-button-secondary">
                  {busyAction === "load" ? "Memuat..." : DASHBOARD_COPY.loadMore}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
