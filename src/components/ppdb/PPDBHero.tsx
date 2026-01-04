"use client";

import { GraduationCap, Calendar, Users, Award, Search } from "lucide-react";
import Link from "next/link";

export default function PPDBHero() {
  const highlights = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Pendaftaran Online",
      desc: "24/7 Mudah & Cepat",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Tenaga Pendidik",
      desc: "Profesional & Berpengalaman",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Prestasi Unggul",
      desc: "100+ Penghargaan",
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "Fasilitas Lengkap",
      desc: "Laboratorium Modern",
    },
  ];

  // NOTE: Daftar sekarang navigates to a dedicated registration page instead of scrolling

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="text-center text-white">
          <div className="mb-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Pendaftaran Peserta Didik Baru
              <span className="block text-yellow-300">(PPDB)</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Bergabunglah dengan keluarga besar SMP IP Yakin Jakarta! Wujudkan
              masa depan gemilang bersama pendidikan berkualitas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up animation-delay-200">
            <Link
              href="/ppdb/register"
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/ppdb/status"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Cek Status Pendaftaran
            </Link>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up animation-delay-400">
            {highlights.map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <div className="text-yellow-300 mb-3 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-blue-100 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            className="fill-gray-50 dark:fill-gray-900"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
}
