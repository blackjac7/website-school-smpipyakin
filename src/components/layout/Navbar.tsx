"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import logo from "@/assets/logo.svg";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Detect scroll to toggle navbar style
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  });

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navigation = [
    { name: "Beranda", href: "/" },
    { name: "Profil Sekolah", href: "/profile" },
    { name: "Fasilitas", href: "/facilities" },
    { name: "Ekstrakurikuler", href: "/extracurricular" },
    { name: "Berita", href: "/news" },
    { name: "Kontak", href: "/contact" },
    { name: "PPDB", href: "/ppdb" },
  ];

  const isHome = pathname === "/";
  const isActive = (href: string) => {
    if (href === "/profile") {
      return pathname.startsWith("/profile");
    }
    return pathname === href;
  };

  // Determine styles based on state
  const isTransparent = isHome && !isScrolled && !isOpen;

  const navbarClasses = twMerge(
    "fixed w-full z-50 transition-all duration-300 border-b",
    isTransparent
      ? "bg-transparent border-transparent py-4"
      : "bg-white/80 backdrop-blur-md border-gray-200 py-2 shadow-sm"
  );

  const textClasses = twMerge(
    "text-sm font-medium transition-colors",
    isTransparent
      ? "text-white hover:text-yellow-400"
      : "text-gray-700 hover:text-yellow-600"
  );

  const logoTextClasses = twMerge(
    "text-xl font-bold transition-colors",
    isTransparent ? "text-white" : "text-gray-900"
  );

  return (
    <>
      <motion.nav
        className={navbarClasses}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image src={logo} alt="Logo SMP IP Yakin" className="h-10 w-10" />
            </motion.div>
            <span className={logoTextClasses}>
              SMP IP Yakin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "px-4 py-2 rounded-full transition-all relative",
                  isActive(item.href) && !isTransparent
                    ? "text-yellow-700 font-semibold bg-yellow-50"
                    : textClasses
                )}
              >
                {item.name}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="activeTab"
                    className={clsx(
                        "absolute bottom-0 left-0 right-0 h-0.5 mx-4 rounded-full",
                         isTransparent ? "bg-yellow-400" : "bg-yellow-600"
                    )}
                  />
                )}
              </Link>
            ))}
            <Link
                href="/login"
                className={clsx(
                    "ml-4 px-5 py-2 rounded-full font-medium transition-all shadow-sm hover:shadow-md active:scale-95",
                    isTransparent
                        ? "bg-white text-yellow-600 hover:bg-yellow-50"
                        : "bg-yellow-500 text-white hover:bg-yellow-600"
                )}
            >
                Login
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={clsx(
                "p-2 rounded-full transition-colors",
                isTransparent
                    ? "text-white hover:bg-white/10"
                    : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-white md:hidden flex flex-col pt-24 px-6"
          >
            <div className="space-y-2">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={clsx(
                      "flex items-center justify-between p-4 rounded-xl text-lg font-medium transition-all",
                      isActive(item.href)
                        ? "bg-yellow-50 text-yellow-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {item.name}
                    <ChevronRight className={clsx("h-5 w-5", isActive(item.href) ? "text-yellow-600" : "text-gray-400")} />
                  </Link>
                </motion.div>
              ))}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + navigation.length * 0.05 }}
                  className="pt-4"
                >
                    <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center w-full p-4 rounded-xl bg-yellow-500 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
                    >
                        Login Portal
                    </Link>
                </motion.div>
            </div>

            {/* Decoration */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-yellow-50 to-transparent pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
