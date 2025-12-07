"use client";

import { GraduationCap, Users, Award, Activity } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function QuickStats() {
  const stats = [
    {
      label: "Siswa Aktif",
      value: "450+",
      icon: <GraduationCap className="w-8 h-8 text-yellow-500" />,
    },
    {
      label: "Guru Berkualitas",
      value: "23+",
      icon: <Users className="w-8 h-8 text-yellow-500" />,
    },
    {
      label: "Prestasi",
      value: "100+",
      icon: <Award className="w-8 h-8 text-yellow-500" />,
    },
    {
      label: "Ekstrakurikuler",
      value: "9+",
      icon: <Activity className="w-8 h-8 text-yellow-500" />,
    },
  ];

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 50
        }
    },
  };

  return (
    <section className="bg-white relative -mt-20 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            variants={item}
            key={index}
            className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow text-center border border-gray-100"
          >
            <div className="flex justify-center mb-4 p-4 bg-yellow-50 rounded-full w-fit mx-auto">
                {stat.icon}
            </div>
            <div className="text-4xl font-extrabold text-gray-900 mb-2">
              {stat.value}
            </div>
            <div className="text-gray-500 font-medium uppercase tracking-wider text-sm">
                {stat.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
