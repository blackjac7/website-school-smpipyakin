import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import StudentCardSystem from "@/components/dashboard/kesiswaan/StudentCard/StudentCardSystem";
import "@/components/dashboard/kesiswaan/StudentCard/studentCard.styles.css";

export const dynamic = "force-dynamic";

export default function KartuSiswaPage() {
  return (
    <ProtectedRoute requiredRoles={["kesiswaan", "admin"]}>
      <div className="container mx-auto px-4 py-6">
        <StudentCardSystem />
      </div>
    </ProtectedRoute>
  );
}
