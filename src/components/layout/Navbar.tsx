"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.svg";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Beranda", href: "/" },
    { name: "Profil Sekolah", href: "/profile" },
    { name: "Fasilitas", href: "/facilities" },
    { name: "Ekstrakurikuler", href: "/extracurricular" },
    { name: "Berita", href: "/news" },
    { name: "Kontak", href: "/contact" },
    { name: "PPDB", href: "/ppdb" },
    { name: "Login", href: "/login" },
  ];

  const isActive = (href: string) => {
    if (href === "/profile") {
      return pathname.startsWith("/profile");
    }
    return pathname === href;
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 navbar-link">
          <Image src={logo} alt="Logo SMP IP Yakin" className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-800 hover:text-orange-500">
            SMP IP Yakin
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                isActive(item.href)
                  ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                  : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-blue-600 p-2 rounded-md"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all cursor-pointer ${
                isActive(item.href)
                  ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
