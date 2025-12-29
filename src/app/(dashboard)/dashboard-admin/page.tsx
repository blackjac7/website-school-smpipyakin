import { getAdminDashboardStats } from "@/actions/admin/dashboard";
import { getAuthenticatedUser } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getAuthenticatedUser();
  const statsResult = await getAdminDashboardStats();

  // Development-only debug logs: surface why counts may be zero (Unauthorized or DB error)
  if (process.env.NODE_ENV !== "production") {
    try {
      if (!statsResult.success) {
        console.error("Admin stats error:", statsResult.error);
      }
    } catch (e) {
      // Defensive: avoid throwing from logging
      console.error("Error logging admin dashboard debug info:", e);
    }
  }

  const stats =
    statsResult.success && statsResult.data
      ? statsResult.data
      : {
          counts: {
            users: 0,
            admins: 0,
            teachers: 0,
            students: 0,
            news: 0,
            announcements: 0,
            facilities: 0,
            extracurriculars: 0,
            ppdbPending: 0,
          },
          recentActivities: [],
        };

  return <DashboardClient stats={stats} userName={user?.username || "Admin"} />;
}
