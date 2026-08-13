"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronDown, LogIn, Menu, X } from "lucide-react";
import logo from "@/assets/logo.svg";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  isPublicNavItemActive,
  publicNavigation,
  schoolIdentity,
} from "@/lib/public-site";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 24));

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const transparent = pathname === "/" && !scrolled && !mobileOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        transparent
          ? "border-white/10 bg-slate-950/20 text-white backdrop-blur-sm"
          : "border-slate-200/80 bg-white/95 text-slate-950 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:text-white",
      )}
    >
      <nav
        aria-label="Navigasi utama"
        className="public-container flex h-18 items-center justify-between gap-4"
      >
        <Link
          href="/"
          aria-label={`${schoolIdentity.name}, kembali ke beranda`}
          className="focus-ring flex min-w-0 items-center gap-3 rounded-xl"
        >
          <Image src={logo} alt="" className="h-10 w-10 shrink-0" priority />
          <span className="min-w-0">
            <span className="block truncate text-base font-bold leading-tight sm:text-lg">
              {schoolIdentity.shortName}
            </span>
            <span
              className={cn(
                "hidden text-xs sm:block",
                transparent ? "text-white/70" : "text-slate-500 dark:text-slate-400",
              )}
            >
              Jakarta Barat
            </span>
          </span>
        </Link>

        <div ref={navRef} className="hidden items-center gap-1 xl:flex">
          {publicNavigation.map((item) => {
            const active = isPublicNavItemActive(pathname, item);
            const expanded = openMenu === item.label;

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenMenu(item.label)}
                onMouseLeave={() => item.children && setOpenMenu(null)}
              >
                {item.children ? (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-haspopup="menu"
                    onClick={() => setOpenMenu(expanded ? null : item.label)}
                    className={cn(
                      "focus-ring inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold transition-colors",
                      active
                        ? transparent
                          ? "bg-white/14 text-white"
                          : "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
                        : transparent
                          ? "text-white/90 hover:bg-white/10"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden="true"
                      className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors",
                      active
                        ? transparent
                          ? "bg-white/14 text-white"
                          : "bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
                        : transparent
                          ? "text-white/90 hover:bg-white/10"
                          : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
                    )}
                  >
                    {item.label}
                  </Link>
                )}

                <AnimatePresence>
                  {item.children && expanded && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-0 top-full w-80 pt-2"
                    >
                      <div className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-950 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              role="menuitem"
                              key={child.href}
                              href={child.href}
                              className={cn(
                                "focus-ring flex gap-3 rounded-xl p-3 transition-colors",
                                childActive
                                  ? "bg-blue-50 dark:bg-blue-950/50"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-800",
                              )}
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-800 dark:bg-slate-800 dark:text-blue-300">
                                <ChildIcon aria-hidden="true" className="h-5 w-5" />
                              </span>
                              <span>
                                <span className="block text-sm font-bold">{child.label}</span>
                                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                  {child.description}
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <Link href="/ppdb" className="public-button-primary ml-2 min-h-11 px-4 py-2 text-sm">
            PPDB
          </Link>
          <Link
            href="/login"
            className={cn(
              "focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-colors",
              transparent
                ? "text-white hover:bg-white/10"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
            )}
          >
            <LogIn aria-hidden="true" className="h-4 w-4" /> Portal
          </Link>
          <ThemeToggle variant="icon" />
        </div>

        <div className="flex items-center gap-1 xl:hidden">
          <ThemeToggle variant="minimal" />
          <button
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            onClick={() => setMobileOpen((value) => !value)}
            className={cn(
              "focus-ring flex h-11 w-11 items-center justify-center rounded-xl",
              transparent ? "text-white hover:bg-white/10" : "hover:bg-slate-100 dark:hover:bg-slate-800",
            )}
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 py-4 text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-white xl:hidden"
          >
            <div className="mx-auto max-w-2xl space-y-2">
              {publicNavigation.map((item) => {
                const active = isPublicNavItemActive(pathname, item);
                const expanded = openMenu === item.label;
                return (
                  <div key={item.label}>
                    {item.children ? (
                      <>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => setOpenMenu(expanded ? null : item.label)}
                          className={cn(
                            "focus-ring flex min-h-12 w-full items-center justify-between rounded-xl px-4 text-left font-semibold",
                            active ? "bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100" : "hover:bg-slate-100 dark:hover:bg-slate-900",
                          )}
                        >
                          {item.label}
                          <ChevronDown className={cn("h-5 w-5 transition-transform", expanded && "rotate-180")} />
                        </button>
                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1 py-2 pl-3">
                                {item.children.map((child) => {
                                  const ChildIcon = child.icon;
                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className="focus-ring flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
                                    >
                                      <ChildIcon aria-hidden="true" className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                                      {child.label}
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "focus-ring flex min-h-12 items-center rounded-xl px-4 font-semibold",
                          active ? "bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100" : "hover:bg-slate-100 dark:hover:bg-slate-900",
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}

              <div className="grid grid-cols-1 gap-2 border-t border-slate-200 pt-4 dark:border-slate-800 sm:grid-cols-2">
                <Link href="/ppdb" className="public-button-primary min-h-12">
                  Informasi PPDB
                </Link>
                <Link href="/login" className="public-button-secondary min-h-12">
                  <LogIn aria-hidden="true" className="h-5 w-5" /> Masuk Portal
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
