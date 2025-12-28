"use client";

import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Award,
  BookOpen,
  School,
  FileSpreadsheet,
  UserCog,
  Megaphone,
  Briefcase,
  LucideIcon,
  Calendar as CalendarIcon,
} from "lucide-react";

type Role = "siswa" | "kesiswaan" | "admin" | "osis" | "ppdb-officer";

// Helper components for icons not in the main import to avoid clutter
// Defined BEFORE usage in roleConfig to avoid ReferenceError
const Trophy = Award;

interface IllustrationConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  darkColor: string;
  darkBgColor: string;
  orbitIcons: LucideIcon[];
  particleColor: string;
}

const roleConfig: Record<Role, IllustrationConfig> = {
  siswa: {
    icon: GraduationCap,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    darkColor: "dark:text-blue-400",
    darkBgColor: "dark:bg-blue-900/30",
    orbitIcons: [BookOpen, Award, School],
    particleColor: "bg-blue-400",
  },
  osis: {
    icon: Megaphone,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    darkColor: "dark:text-yellow-400",
    darkBgColor: "dark:bg-yellow-900/30",
    orbitIcons: [Users, Award, CalendarIcon],
    particleColor: "bg-yellow-400",
  },
  kesiswaan: {
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-100",
    darkColor: "dark:text-green-400",
    darkBgColor: "dark:bg-green-900/30",
    orbitIcons: [GraduationCap, ShieldCheck, Trophy],
    particleColor: "bg-green-400",
  },
  admin: {
    icon: ShieldCheck,
    color: "text-gray-700",
    bgColor: "bg-gray-200",
    darkColor: "dark:text-gray-300",
    darkBgColor: "dark:bg-gray-700/50",
    orbitIcons: [UserCog, FileSpreadsheet, Briefcase],
    particleColor: "bg-gray-400",
  },
  "ppdb-officer": {
    icon: FileSpreadsheet,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    darkColor: "dark:text-purple-400",
    darkBgColor: "dark:bg-purple-900/30",
    orbitIcons: [Users, School, BookOpen],
    particleColor: "bg-purple-400",
  },
};

interface LoginIllustrationProps {
  role: Role;
}

const LoginIllustration = ({ role }: LoginIllustrationProps) => {
  const config = roleConfig[role];
  const MainIcon = config.icon;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Central Circle Background */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`absolute inset-0 rounded-full ${config.bgColor} ${config.darkBgColor} blur-2xl opacity-60`}
      />

      {/* Rotating Ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-full h-full rounded-full border border-dashed border-gray-300 dark:border-gray-600"
      />

      {/* Orbiting Icons */}
      {config.orbitIcons.map((Icon, index) => {
        // Position icons in a triangle/circle
        const angle = (index * 360) / config.orbitIcons.length;
        const radius = 100; // px
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
            style={{ x, y }}
            className={`absolute p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 z-10`}
          >
            <Icon size={20} className="text-gray-500 dark:text-gray-400" />
          </motion.div>
        );
      })}

      {/* Main Center Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className={`relative z-20 p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700`}
      >
        <MainIcon
          size={64}
          className={`${config.color} ${config.darkColor}`}
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Floating Particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute w-2 h-2 rounded-full ${config.particleColor}`}
          initial={{
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50,
            opacity: 0,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default LoginIllustration;
