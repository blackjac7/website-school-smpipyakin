"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Target, History, Building2, MessageSquare, Users } from "lucide-react";

const menuItems = [
  { path: "/profile/visi-misi", label: "Visi & Misi", icon: Target },
  { path: "/profile/sejarah", label: "Sejarah", icon: History },
  { path: "/profile/struktur", label: "Struktur", icon: Building2 },
  { path: "/profile/sambutan", label: "Sambutan", icon: MessageSquare },
  { path: "/profile/guru", label: "Guru", icon: Users },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activePage =
    menuItems.find((item) => item.path === pathname) || menuItems[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <PageHeader
        title={activePage.label}
        description="Mengenal lebih dekat profil, sejarah, dan nilai-nilai luhur SMP IP Yakin Jakarta."
        breadcrumbs={[
          { label: "Profil", href: "/profile" },
          { label: activePage.label, href: pathname },
        ]}
        image="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {/* Horizontal Tab Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-2 mb-6"
        >
          <div className="flex items-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 min-h-[400px]"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
