"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X, ChevronRight } from "lucide-react";
import { SidebarLogout } from "@/components/shared";
import { useAuth } from "@/components/shared/AuthProvider";
import { DashboardSidebarProps } from "./types";
import { DASHBOARD_COPY } from "./dashboard-config";

export default function DashboardSidebar({
  menuItems,
  activeMenu,
  setActiveMenu,
  isSidebarOpen = true,
  setIsSidebarOpen,
  title = "Dashboard",
  subtitle = "SCHOOL AREA",
  userRole,
  userAvatar,
  workspace,
}: DashboardSidebarProps) {
  const { user } = useAuth();
  const displayRole = userRole || user?.role || "User";
  const navigationId = workspace
    ? `${workspace}-navigation`
    : `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-navigation`;
  const sections = menuItems.reduce<Array<{ label: string; items: typeof menuItems }>>(
    (groups, item) => {
      const label = item.section || DASHBOARD_COPY.navigation;
      const current = groups.find((group) => group.label === label);
      if (current) current.items.push(item);
      else groups.push({ label, items: [item] });
      return groups;
    },
    [],
  );

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && setIsSidebarOpen && (
          <motion.button
            type="button"
            aria-label="Tutup sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        id={navigationId}
        aria-label={`Navigasi ${title}`}
        aria-hidden={!isSidebarOpen ? true : undefined}
        inert={!isSidebarOpen ? true : undefined}
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,18rem)] flex-col border-r border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:static lg:w-72 lg:translate-x-0 lg:shadow-none"
      >
        <div className="relative overflow-hidden bg-slate-950 px-5 pb-6 pt-5 text-white">
          <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white ring-2 ring-amber-300/80">
                <Image src="/logo.png" alt="Logo SMP IP YAKIN" fill sizes="44px" className="object-contain p-1" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight">{title}</p>
                <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">{subtitle}</p>
              </div>
            </div>
            {setIsSidebarOpen && (
              <button type="button" onClick={() => setIsSidebarOpen(false)} className="rounded-xl p-2 text-blue-100 hover:bg-white/10 lg:hidden" aria-label={`Tutup menu ${title}`}>
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="relative mt-6 rounded-2xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">{DASHBOARD_COPY.activeWorkspace}</p>
            <p className="mt-1 truncate text-sm font-bold">{displayRole}</p>
            <p className="mt-0.5 text-xs text-blue-200">SMP IP Yakin · {DASHBOARD_COPY.currentSchoolYear}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={title}>
          <div className="space-y-5">
            {sections.map((section) => <div key={section.label}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{section.label}</p>
              <div className="space-y-1">{section.items.map((item) => {
              const isActive = activeMenu === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (setIsSidebarOpen && window.innerWidth < 1024) setIsSidebarOpen(false);
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${isActive ? "bg-blue-700 text-white shadow-md shadow-blue-700/15" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-amber-300" : "text-slate-400 group-hover:text-blue-600"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge ? <span className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-black ${isActive ? "bg-white/20 text-white" : "bg-rose-100 text-rose-700"}`}>{item.badge > 99 ? "99+" : item.badge}</span> : null}
                  {isActive && <ChevronRight className="h-4 w-4 text-blue-100" aria-hidden="true" />}
                </button>
              );
            })}</div></div>)}
          </div>
        </nav>

        <div className="border-t border-slate-100 bg-slate-50/80 p-3">
          <SidebarLogout userName={user?.name || user?.username || displayRole} userRole={displayRole} userAvatar={userAvatar} />
        </div>
      </motion.aside>
    </>
  );
}
