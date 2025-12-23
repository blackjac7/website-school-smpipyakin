"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { clsx } from "clsx";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: { label: string; href: string }[];
  image?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  image,
}: PageHeaderProps) {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center overflow-hidden">
      {/* Background Image/Overlay */}
      <div className="absolute inset-0 z-0">
        {image ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700" />
        )}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

        {/* Animated Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
        <motion.nav
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center items-center gap-2 text-sm md:text-base text-gray-300 mb-4"
        >
          <Link href="/" className="hover:text-yellow-400 transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <Link
                href={crumb.href}
                className={clsx(
                  "transition-colors hover:text-yellow-400",
                  index === breadcrumbs.length - 1
                    ? "text-yellow-400 font-semibold"
                    : "text-gray-300"
                )}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </motion.nav>

        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight"
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Wave Bottom Decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24">
        <svg
          className="h-full w-full text-gray-50 dark:text-gray-900 fill-current"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fillOpacity="1"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}
