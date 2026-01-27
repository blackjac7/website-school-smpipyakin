import {
  getValidationQueue,
  getDashboardStats,
  DashboardStats,
  ValidationQueueResult,
} from "@/actions/kesiswaan";
import DashboardClient from "./DashboardClient";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const dynamic = 'force-dynamic';

export default async function KesiswaanDashboardPage() {
  // Fetch initial data on the server
  let validationQueueResult: ValidationQueueResult = {
    items: [],
    totalCount: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };
  let stats: DashboardStats = {
    monthly: [],
    byCategory: [],
    byStatus: [],
    summary: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
    },
  };

  try {
    const [queueData, statsData] = await Promise.all([
      getValidationQueue("PENDING", 1, 10),
      getDashboardStats(),
    ]);
    validationQueueResult = queueData;
    stats = statsData;
  } catch (error) {
    console.error("Failed to fetch kesiswaan dashboard data:", error);
    // In production build without DB access, this might fail.
    // We allow the page to render with empty data to prevent build failure.
  }

  return (
    <ProtectedRoute requiredRoles={["kesiswaan"]}>
      <DashboardClient
        initialQueueResult={validationQueueResult}
        initialStats={stats}
      />
    </ProtectedRoute>
  );
}
