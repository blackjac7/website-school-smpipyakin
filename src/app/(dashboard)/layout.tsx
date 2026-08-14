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
        <main className="dashboard-app min-h-dvh bg-slate-50 text-slate-950">
          <a
            href="#main-content"
            className="sr-only z-[100] rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Lewati ke konten utama
          </a>
          {children}
        </main>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}
