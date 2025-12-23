"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <ErrorBoundary>
        <main className="min-h-screen bg-gray-50">{children}</main>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
