import {
  getValidationQueue,
  getStudents,
  getDashboardStats,
} from "@/actions/kesiswaan";
import DashboardClient from "./DashboardClient";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default async function KesiswaanDashboardPage() {
  // Fetch initial data on the server
  const [validationQueue, students, stats] = await Promise.all([
    getValidationQueue(),
    getStudents(),
    getDashboardStats(),
  ]);

  return (
    <ProtectedRoute requiredRoles={["kesiswaan"]}>
      <DashboardClient
        initialQueue={validationQueue}
        initialStudents={students}
        initialStats={stats}
      />
    </ProtectedRoute>
  );
}
