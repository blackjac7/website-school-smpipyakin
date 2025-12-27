import { getAdminDashboardStats } from "@/actions/admin/dashboard";
import { getAuthenticatedUser } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getAuthenticatedUser();
  const statsResult = await getAdminDashboardStats();

  const stats = statsResult.success && statsResult.data
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
          ppdbPending: 0
        },
        recentActivities: []
      };

  return (
    <DashboardClient
      stats={stats}
      userName={user?.username || "Admin"}
    />
  );
}
