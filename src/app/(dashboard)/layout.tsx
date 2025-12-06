"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

/**
 * DashboardLayout component.
 * Wraps dashboard pages with the ProtectedRoute component to ensure authentication.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The rendered DashboardLayout component.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">{children}</main>
    </ProtectedRoute>
  );
}
