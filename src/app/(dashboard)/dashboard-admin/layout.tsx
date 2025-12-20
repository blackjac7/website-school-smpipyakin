"use client";

import { Sidebar } from "@/components/dashboard/admin/Sidebar";
import { useState } from "react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} />
      <div className="flex-1 p-8 overflow-y-auto h-screen">{children}</div>
    </div>
  );
}
