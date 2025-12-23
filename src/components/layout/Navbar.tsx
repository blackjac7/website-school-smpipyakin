"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  School,
  Users,
  Building2,
  Target,
  History,
  Calendar,
  Trophy,
  BookOpen,
  Palette,
  LogIn,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Dropdown item interface
interface DropdownItem {
  name: string;
  href: string;
  icon?: React.ElementType;
  description?: string;
}

interface NavItem {
  name: string;
  href: string;
  dropdown?: DropdownItem[];
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Detect scroll to toggle navbar style
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileExpandedMenu(null);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation structure with dropdowns
  const navigation: NavItem[] = [
    { name: "Beranda", href: "/" },
    {
      name: "Profil",
      href: "/profile",
      dropdown: [
        {
          name: "Visi & Misi",
          href: "/profile/visi-misi",
          icon: Target,
          description: "Tujuan dan cita-cita sekolah",
        },
        {
          name: "Sejarah Sekolah",
          href: "/profile/sejarah",
          icon: History,
          description: "Perjalanan dan prestasi sekolah",
        },
        {
          name: "Struktur Organisasi",
          href: "/profile/struktur",
          icon: Building2,
          description: "Kepemimpinan sekolah",
        },
        {
          name: "Sambutan Kepsek",
          href: "/profile/sambutan",
          icon: School,
          description: "Pesan dari Kepala Sekolah",
        },
        {
          name: "Guru & Tenaga Pendidik",
          href: "/profile/guru",
          icon: Users,
          description: "Tim pengajar profesional",
        },
      ],
    },
    {
      name: "Akademik",
      href: "/academic-calendar",
      dropdown: [
        {
          name: "Kalender Akademik",
          href: "/academic-calendar",
          icon: Calendar,
          description: "Jadwal kegiatan sekolah",
        },
        {
          name: "Ekstrakurikuler",
          href: "/extracurricular",
          icon: Trophy,
          description: "Kegiatan pengembangan diri",
        },
        {
          name: "Fasilitas",
          href: "/facilities",
          icon: Building2,
          description: "Sarana dan prasarana",
        },
        {
          name: "Karya Siswa",
          href: "/karya-siswa",
          icon: Palette,
          description: "Galeri kreativitas siswa",
        },
      ],
    },
    { name: "Berita", href: "/news" },
    { name: "Kontak", href: "/contact" },
    { name: "PPDB", href: "/ppdb" },
  ];

  const isHome = pathname === "/";

  const isActive = (href: string) => {
    if (href === "/profile") {
      return pathname.startsWith("/profile");
    }
    if (href === "/academic-calendar") {
      return (
        pathname.startsWith("/academic-calendar") ||
        pathname.startsWith("/extracurricular") ||
        pathname.startsWith("/facilities") ||
        pathname.startsWith("/karya-siswa")
      );
    }
    return pathname === href;
  };

  const isDropdownItemActive = (href: string) => pathname === href;

  // Determine styles based on state
  const isTransparent = isHome && !isScrolled && !isOpen;

  const navbarClasses = twMerge(
    "fixed w-full z-50 transition-all duration-300 border-b",
    isTransparent
      ? "bg-transparent border-transparent py-4"
      : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-gray-200 dark:border-gray-800 py-2 shadow-sm"
  );

  const textClasses = twMerge(
    "text-sm font-medium transition-colors",
    isTransparent
      ? "text-white hover:text-yellow-400"
      : "text-gray-700 dark:text-gray-200 hover:text-yellow-600 dark:hover:text-yellow-400"
  );

  const logoTextClasses = twMerge(
    "text-xl font-bold transition-colors",
    isTransparent ? "text-white" : "text-gray-900 dark:text-white"
  );

  const handleDropdownToggle = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleMobileMenuToggle = (name: string) => {
    setMobileExpandedMenu(mobileExpandedMenu === name ? null : name);
  };

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
            <span className={logoTextClasses}>SMP IP Yakin</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  // Dropdown Menu Item
                  <button
                    onClick={() => handleDropdownToggle(item.name)}
                    onMouseEnter={() => setActiveDropdown(item.name)}
                    className={clsx(
                      "flex items-center gap-1 px-4 py-2 rounded-full transition-all",
                      isActive(item.href) && !isTransparent
                        ? "text-yellow-700 font-semibold bg-yellow-50"
                        : textClasses
                    )}
                  >
                    {item.name}
                    <ChevronDown
                      className={clsx(
                        "h-4 w-4 transition-transform duration-200",
                        activeDropdown === item.name && "rotate-180"
                      )}
                    />
                  </button>
                ) : (
                  // Regular Menu Item
                  <Link
                    href={item.href}
                    className={clsx(
                      "px-4 py-2 rounded-full transition-all relative block",
                      item.name === "PPDB"
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-yellow-600 hover:to-orange-600 hover:scale-105"
                        : isActive(item.href) && !isTransparent
                          ? "text-yellow-700 font-semibold bg-yellow-50"
                          : textClasses
                    )}
                  >
                    {item.name}
                    {isActive(item.href) && item.name !== "PPDB" && (
                      <motion.div
                        layoutId="activeTab"
                        className={clsx(
                          "absolute bottom-0 left-0 right-0 h-0.5 mx-4 rounded-full",
                          isTransparent ? "bg-yellow-400" : "bg-yellow-600"
                        )}
                      />
                    )}
                  </Link>
                )}

                {/* Dropdown Panel */}
                <AnimatePresence>
                  {item.dropdown && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onMouseLeave={() => setActiveDropdown(null)}
                      className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden py-2"
                    >
                      {item.dropdown.map((dropItem) => {
                        const Icon = dropItem.icon || BookOpen;
                        return (
                          <Link
                            key={dropItem.href}
                            href={dropItem.href}
                            onClick={() => setActiveDropdown(null)}
                            className={clsx(
                              "flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                              isDropdownItemActive(dropItem.href) &&
                                "bg-yellow-50 dark:bg-yellow-900/30"
                            )}
                          >
                            <div
                              className={clsx(
                                "p-2 rounded-lg",
                                isDropdownItemActive(dropItem.href)
                                  ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p
                                className={clsx(
                                  "font-medium text-sm",
                                  isDropdownItemActive(dropItem.href)
                                    ? "text-yellow-700 dark:text-yellow-400"
                                    : "text-gray-900 dark:text-gray-100"
                                )}
                              >
                                {dropItem.name}
                              </p>
                              {dropItem.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {dropItem.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            <Link
              href="/login"
              className={clsx(
                "ml-2 px-5 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 active:scale-95",
                isTransparent
                  ? "bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white hover:text-yellow-600"
                  : "bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-yellow-400 shadow-sm hover:shadow-md"
              )}
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>

            {/* Theme Toggle - positioned after Login as settings action */}
            <ThemeToggle variant="icon" className="ml-2" />
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle variant="minimal" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={clsx(
                "p-2 rounded-full transition-colors",
                isTransparent
                  ? "text-white hover:bg-white/10"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
            className="fixed inset-0 z-40 bg-white dark:bg-gray-900 lg:hidden flex flex-col pt-20 overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-1">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + index * 0.03 }}
                >
                  {item.dropdown ? (
                    // Mobile Dropdown
                    <div>
                      <button
                        onClick={() => handleMobileMenuToggle(item.name)}
                        className={clsx(
                          "flex items-center justify-between w-full p-4 rounded-xl text-base font-medium transition-all",
                          isActive(item.href)
                            ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        {item.name}
                        <ChevronDown
                          className={clsx(
                            "h-5 w-5 transition-transform duration-200",
                            mobileExpandedMenu === item.name && "rotate-180"
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {mobileExpandedMenu === item.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 py-2 space-y-1">
                              {item.dropdown.map((dropItem) => {
                                const Icon = dropItem.icon || BookOpen;
                                return (
                                  <Link
                                    key={dropItem.href}
                                    href={dropItem.href}
                                    onClick={() => setIsOpen(false)}
                                    className={clsx(
                                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                                      isDropdownItemActive(dropItem.href)
                                        ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    )}
                                  >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                      {dropItem.name}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    // Regular Mobile Link
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        "flex items-center justify-between p-4 rounded-xl text-base font-medium transition-all",
                        item.name === "PPDB"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md"
                          : isActive(item.href)
                            ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      {item.name}
                      <ChevronRight
                        className={clsx(
                          "h-5 w-5",
                          item.name === "PPDB"
                            ? "text-white/80"
                            : isActive(item.href)
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-gray-400 dark:text-gray-500"
                        )}
                      />
                    </Link>
                  )}
                </motion.div>
              ))}

              {/* Mobile Login Button */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + navigation.length * 0.03 }}
                className="pt-4"
              >
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full p-4 rounded-xl bg-gray-900 dark:bg-yellow-500 text-white dark:text-gray-900 font-semibold text-base shadow-lg active:scale-95 transition-transform"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Masuk Portal</span>
                </Link>
              </motion.div>
            </div>

            {/* Footer Info */}
            <div className="mt-auto p-6 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                2025 SMP Islam Terpadu IP Yakin Jakarta
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
