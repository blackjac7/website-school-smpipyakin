import {
  getValidationQueue,
  getStudents,
  getDashboardStats,
  ValidationItem,
  DashboardStats,
} from "@/actions/kesiswaan";
import DashboardClient from "./DashboardClient";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Siswa } from "@prisma/client";

export default async function KesiswaanDashboardPage() {
  // Fetch initial data on the server
  let validationQueue: ValidationItem[] = [];
  let students: Siswa[] = [];
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
    const [queueData, studentsData, statsData] = await Promise.all([
      getValidationQueue(),
      getStudents(),
      getDashboardStats(),
    ]);
    validationQueue = queueData;
    students = studentsData;
    stats = statsData;
  } catch (error) {
    console.error("Failed to fetch kesiswaan dashboard data:", error);
    // In production build without DB access, this might fail.
    // We allow the page to render with empty data to prevent build failure.
  }

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
