import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PPDBDashboardClient from "@/components/dashboard/ppdb/PPDBDashboardClient";

export const dynamic = "force-dynamic";

export default function PPDBDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["ppdb_admin"]}>
      <PPDBDashboardClient />
    </ProtectedRoute>
  );
}
