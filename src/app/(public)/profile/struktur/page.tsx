"use client";

import { User, GraduationCap, School, LucideIcon } from "lucide-react";
import Image from "next/image";
import { teachers } from "@/lib/data/teachers";
import { motion } from "framer-motion";

// Helper components for connectors
const VerticalLine = ({ height = "h-8", className = "" }: { height?: string, className?: string }) => (
  <div className={`w-0.5 bg-gray-300 mx-auto ${height} ${className}`} />
);

const HorizontalLine = ({ width = "w-full", className = "" }: { width?: string, className?: string }) => (
  <div className={`h-0.5 bg-gray-300 mx-auto ${width} ${className}`} />
);

const OrgCard = ({
  image,
  name,
  position,
  color = "blue",
  delay = 0
}: {
  image: string,
  name: string,
  position: string,
  color?: "blue" | "gray",
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className={`flex flex-col items-center bg-white p-5 rounded-xl border ${color === "blue" ? "border-blue-200" : "border-gray-200"} shadow-sm hover:shadow-md transition-shadow relative z-10`}
  >
    <div className="relative w-20 h-20 mb-3">
      <Image
        src={image}
        alt={name}
        fill
        className="rounded-full object-cover bg-gray-100"
      />
    </div>
    <h3 className="font-bold text-gray-900 text-center text-sm leading-tight">{name}</h3>
    <p className="text-gray-500 text-xs text-center mt-1 px-2">
      {position}
    </p>
  </motion.div>
);

const SummaryCard = ({
  icon: Icon,
  title,
  subtitle,
  colorClass,
  bgClass,
  textClass
}: {
  icon: LucideIcon,
  title: string,
  subtitle: string,
  colorClass: string,
  bgClass: string,
  textClass: string
}) => (
  <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={`bg-white p-6 rounded-xl border ${colorClass} shadow-sm flex flex-col items-center w-64 relative z-10`}
  >
      <div className={`w-12 h-12 ${bgClass} rounded-full flex items-center justify-center mb-3 ${textClass}`}>
          <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-1 text-center">{subtitle}</p>
  </motion.div>
);

export default function StrukturPage() {
  const kepsek = teachers.find((t) => t.position === "Kepala Sekolah");
  const kepalaTU = teachers.find((t) => t.position === "Kepala Tata Usaha");
  const operator = teachers.find((t) => t.position === "Operator Sekolah");
  const wakaList = teachers.filter((t) => t.position.includes("Wakil Kepala"));

  const guruCount = teachers.filter(t => t.category === "Guru Mata Pelajaran").length;
  const staffCount = teachers.filter(t => t.category === "Staff").length || 5;

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold text-gray-900">Struktur Organisasi</h2>
        <p className="text-gray-500">Tahun Ajaran 2024/2025</p>
      </motion.div>

      {/* Tree Diagram Layout */}
      <div className="relative flex flex-col items-center">

        {/* Level 1: Kepala Sekolah */}
        <div className="relative z-10 mb-8 flex flex-col items-center">
           {kepsek && (
             <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="flex flex-col items-center bg-white p-6 rounded-2xl border-2 border-blue-600 shadow-lg max-w-[280px] z-20 relative"
             >
                <div className="relative w-28 h-28 mb-4">
                  <Image
                    src={kepsek.photo}
                    alt={kepsek.name}
                    fill
                    className="rounded-full object-cover border-4 border-blue-50"
                  />
                </div>
                <h3 className="font-bold text-gray-900 text-lg text-center leading-tight">{kepsek.name}</h3>
                <p className="text-blue-600 font-medium text-sm text-center mt-1">{kepsek.position}</p>
             </motion.div>
           )}
           <VerticalLine height="h-12" />
           <HorizontalLine width="w-[352px] hidden md:block" />
        </div>

        {/* Level 2: TU & Operator */}
        <div className="relative w-full max-w-4xl px-4 mb-8">
            {/* Mobile: Simple stack */}
            <div className="md:hidden flex flex-col items-center space-y-8">
               <VerticalLine height="h-8 -mt-8" />
               {kepalaTU && <OrgCard image={kepalaTU.photo} name={kepalaTU.name} position={kepalaTU.position} color="gray" />}
               <VerticalLine />
               {operator && <OrgCard image={operator.photo} name={operator.name} position={operator.position} color="gray" />}
               <VerticalLine />
            </div>

            {/* Desktop: Grid */}
            <div className="hidden md:flex justify-center gap-24 relative">
                 {/* Connectors from top horizontal line */}
                 <div className="absolute -top-8 left-[calc(50%-176px)] flex flex-col items-center">
                    <VerticalLine height="h-8" />
                 </div>
                 <div className="absolute -top-8 right-[calc(50%-176px)] flex flex-col items-center">
                    <VerticalLine height="h-8" />
                 </div>

                 {kepalaTU && (
                   <div className="w-64">
                     <OrgCard image={kepalaTU.photo} name={kepalaTU.name} position={kepalaTU.position} color="gray" />
                   </div>
                 )}
                 {operator && (
                   <div className="w-64">
                     <OrgCard image={operator.photo} name={operator.name} position={operator.position} color="gray" />
                   </div>
                 )}
            </div>

            {/* Connector to merge back for Wakasek */}
            <div className="hidden md:flex justify-center mt-8 relative">
                 <div className="absolute -top-8 left-[calc(50%-176px)] w-0.5 h-8 bg-gray-300"></div>
                 <div className="absolute -top-8 right-[calc(50%-176px)] w-0.5 h-8 bg-gray-300"></div>
                 <div className="absolute top-0 w-[352px] h-0.5 bg-gray-300 left-1/2 -translate-x-1/2"></div>
                 <VerticalLine height="h-12" className="mt-0" />
            </div>
        </div>

        {/* Level 3: Wakasek */}
        <div className="relative w-full max-w-5xl px-4 mb-12">
           <div className="md:hidden flex flex-col items-center space-y-8">
              {wakaList.map((waka) => (
                <div key={waka.id} className="flex flex-col items-center">
                  <OrgCard image={waka.photo} name={waka.name} position={waka.position} />
                  <VerticalLine />
                </div>
              ))}
           </div>

           <div className="hidden md:block">
              <HorizontalLine width="w-2/3" />
              <div className="grid grid-cols-3 gap-8 pt-8 relative">
                 {/* Vertical lines from horizontal bar */}
                 <VerticalLine height="h-8 absolute -top-0 left-[16.666%]" />
                 <VerticalLine height="h-8 absolute -top-0 left-1/2 -translate-x-1/2" />
                 <VerticalLine height="h-8 absolute -top-0 right-[16.666%]" />

                 {wakaList.map((waka, idx) => (
                   <div key={waka.id} className="flex flex-col items-center">
                     <OrgCard image={waka.photo} name={waka.name} position={waka.position} delay={idx * 0.1} />
                   </div>
                 ))}
              </div>

              {/* Converge lines at bottom */}
              <div className="relative mt-0 h-12">
                  <div className="absolute bottom-0 left-[16.666%] right-[16.666%] h-0.5 bg-gray-300"></div>
                  <VerticalLine height="h-full absolute bottom-0 left-[16.666%]" />
                  <VerticalLine height="h-full absolute bottom-0 left-1/2 -translate-x-1/2" />
                  <VerticalLine height="h-full absolute bottom-0 right-[16.666%]" />

                  {/* Single line down from center of convergence */}
                  <VerticalLine height="h-12 absolute top-full left-1/2 -translate-x-1/2" />
              </div>
           </div>
        </div>

        {/* Level 4, 5, 6: Stacked Central */}
        <div className="flex flex-col items-center space-y-0 mt-12 md:mt-12">
            {/* Wali Kelas */}
            <SummaryCard
                icon={User}
                title="Wali Kelas"
                subtitle="Membimbing & Memonitor Kelas"
                colorClass="border-blue-200"
                bgClass="bg-blue-100"
                textClass="text-blue-600"
            />
            <VerticalLine height="h-12" />

            {/* Dewan Guru */}
            <SummaryCard
                icon={GraduationCap}
                title="Dewan Guru"
                subtitle="Tenaga Pendidik Profesional"
                colorClass="border-yellow-200"
                bgClass="bg-yellow-100"
                textClass="text-yellow-600"
            />
            <VerticalLine height="h-12" />

            {/* Siswa */}
            <SummaryCard
                icon={School}
                title="Siswa / OSIS"
                subtitle="Generasi Penerus Bangsa"
                colorClass="border-green-200"
                bgClass="bg-green-100"
                textClass="text-green-600"
            />
        </div>

        {/* Stats Footer */}
        <div className="mt-24 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-gray-100">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-gray-900 text-lg">Guru Mata Pelajaran</h4>
              <p className="text-blue-600 text-sm mt-1">Profesional & Berkompeten</p>
            </div>
            <span className="text-4xl font-black text-blue-200">{guruCount}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-6 bg-yellow-50 rounded-xl border border-yellow-100 flex items-center justify-between"
          >
            <div>
              <h4 className="font-bold text-gray-900 text-lg">Staff Administrasi</h4>
              <p className="text-yellow-600 text-sm mt-1">Pelayanan Prima</p>
            </div>
            <span className="text-4xl font-black text-yellow-200">{staffCount}</span>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
