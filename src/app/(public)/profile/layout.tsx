"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";

const menuItems = [
  { path: "/profile/visi-misi", label: "Visi & Misi" },
  { path: "/profile/sejarah", label: "Sejarah Sekolah" },
  { path: "/profile/struktur", label: "Struktur Organisasi" },
  { path: "/profile/sambutan", label: "Sambutan Kepala Sekolah" },
  { path: "/profile/guru", label: "Profil Guru" },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const activePage = menuItems.find(item => item.path === pathname) || menuItems[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
       <PageHeader
        title={activePage.label}
        description="Mengenal lebih dekat profil, sejarah, dan nilai-nilai luhur SMP IP Yakin Jakarta."
        breadcrumbs={[
            { label: "Profil", href: "/profile" },
            { label: activePage.label, href: pathname }
        ]}
        image="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2670&auto=format&fit=crop"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-72 flex-shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4 px-4 pt-2">Menu Profil</h3>
                <nav className="space-y-1">
                {menuItems.map((item) => (
                    <Link
                    key={item.path}
                    href={item.path}
                    className={clsx(
                        "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                        pathname === item.path
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                    )}
                    >
                    <span className="font-medium">{item.label}</span>
                    {pathname === item.path && (
                        <ChevronRight className="w-4 h-4 animate-pulse" />
                    )}
                    </Link>
                ))}
                </nav>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-8 min-h-[500px]"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
