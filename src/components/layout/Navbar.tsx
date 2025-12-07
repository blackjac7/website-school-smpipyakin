"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.svg";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Handle scroll effect
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Beranda", href: "/" },
    { name: "Profil Sekolah", href: "/profile" },
    { name: "Fasilitas", href: "/facilities" },
    { name: "Ekstrakurikuler", href: "/extracurricular" },
    { name: "Berita", href: "/news" },
    { name: "Kontak", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/profile") {
      return pathname.startsWith("/profile");
    }
    return pathname === href;
  };

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border/40 py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 bg-white p-0.5 transition-all group-hover:border-primary">
            <Image
              src={logo}
              alt="Logo SMP IP Yakin"
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span
              className={cn(
                "text-lg font-bold leading-none tracking-tight transition-colors",
                isScrolled ? "text-foreground" : "text-white drop-shadow-md"
              )}
            >
              SMP IP Yakin
            </span>
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wider opacity-90",
                isScrolled ? "text-muted-foreground" : "text-white/90 drop-shadow-sm"
              )}
            >
              Jakarta
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors hover:text-primary rounded-full",
                isActive(item.href)
                  ? "text-primary font-bold"
                  : isScrolled
                  ? "text-muted-foreground"
                  : "text-white/90 hover:text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* CTA Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant={isScrolled ? "outline" : "secondary"} size="sm" className={cn(!isScrolled && "bg-white/10 text-white hover:bg-white/20 border-white/20")}>
             <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-lg shadow-primary/20">
             <Link href="/ppdb">Daftar PPDB</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "hover:bg-primary/10",
                  !isScrolled && "text-white hover:text-white hover:bg-white/10"
                )}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-primary/20">
              <SheetHeader className="text-left border-b pb-4 mb-4">
                <div className="flex items-center gap-2">
                   <Image src={logo} alt="Logo" width={32} height={32} />
                   <SheetTitle>Menu Utama</SheetTitle>
                </div>
              </SheetHeader>
              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center py-3 px-4 text-sm font-medium rounded-md transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="my-4 border-t border-border/50" />
                 <Link
                    href="/login"
                    className="flex items-center py-3 px-4 text-sm font-medium rounded-md hover:bg-accent"
                  >
                    Login Portal
                  </Link>
                   <Link
                    href="/ppdb"
                    className="flex items-center py-3 px-4 text-sm font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 mt-2 justify-center"
                  >
                    Daftar PPDB Online
                  </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
