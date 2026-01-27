import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isRoleMatch } from "@/lib/roles";
import { getPendingOsisActivities, getOsisActivityHistory } from "@/actions/pembina-osis/validation";
import DashboardClient from "./_components/DashboardClient";

export const metadata = {
  title: "Dashboard Pembina OSIS | SMP IP YAKIN",
};

export default async function DashboardPembinaOsis() {
  const user = await getAuthenticatedUser();

  if (!user || !isRoleMatch(user.role, ["pembina_osis", "admin"])) {
    redirect("/login");
  }

  // Parallel data fetching
  const [pendingRes, historyRes] = await Promise.all([
    getPendingOsisActivities(),
    getOsisActivityHistory(),
  ]);

  // Serialize dates to ISO strings for client components
  const pendingActivities = pendingRes.success 
    ? pendingRes.data.map(activity => ({
        ...activity,
        date: activity.date.toISOString(),
        time: activity.time,
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString(),
      })) 
    : [];

  const historyActivities = historyRes.success 
    ? historyRes.data.map(activity => ({
        ...activity,
        date: activity.date.toISOString(),
        time: activity.time,
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString(),
      })) 
    : [];

  return (
    <DashboardClient 
      pendingActivities={pendingActivities} 
      historyActivities={historyActivities} 
    />
  );
}
