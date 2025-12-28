"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { NotificationAPIService } from "@/hooks/useNotifications";
import { FormattedNotification } from "@/utils/notificationHelpers";
import NotificationCard from "@/components/shared/NotificationCard";

export default function PPDBOfficerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<FormattedNotification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load notifications with pagination
  const loadNotifications = async (
    pageNum: number = 1,
    filterType: "all" | "unread" = "all"
  ) => {
    try {
      // Use PPDB officer-specific API endpoint
      const result = await NotificationAPIService.fetchAllNotifications({
        page: pageNum,
        filter: filterType,
        userRole: "ppdb_admin",
      });

      if (result.success) {
        if (pageNum === 1) {
          setNotifications(result.data);
        } else {
          setNotifications((prev) => [...prev, ...result.data]);
        }

        setHasMore(result.hasMore);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1, filter);
    setPage(1);
  }, [filter]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    const result = await NotificationAPIService.markNotificationAsReadByRole(
      notificationId,
      "ppdb_admin"
    );

    if (result.success) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // For PPDB, we'll mark each notification individually since there's no bulk endpoint yet
      const unreadNotifications = notifications.filter((n) => !n.read);

      for (const notification of unreadNotifications) {
        await NotificationAPIService.markNotificationAsReadByRole(
          notification.id,
          "ppdb_admin"
        );
      }

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  // Load more notifications
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage, filter);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Notifikasi PPDB
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllAsRead}
                className="text-sm text-amber-600 hover:text-orange-600 font-medium transition-colors"
              >
                Tandai Semua Dibaca
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setFilter("all")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                filter === "all"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                filter === "unread"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Belum Dibaca
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "unread"
                ? "Tidak Ada Notifikasi Belum Dibaca"
                : "Tidak Ada Notifikasi"}
            </h3>
            <p className="text-gray-500">
              {filter === "unread"
                ? "Semua notifikasi sudah dibaca"
                : "Belum ada notifikasi untuk ditampilkan"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onClick={() => markAsRead(notification.id)}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loading ? "Memuat..." : "Muat Lebih Banyak"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
