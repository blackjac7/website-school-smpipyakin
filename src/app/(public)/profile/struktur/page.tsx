"use client";

import { Users } from "lucide-react";
import Image from "next/image";

/**
 * StrukturPage component.
 * Displays the organizational structure of the school, including the Principal, Vice Principals, Coordinators, and Staff.
 * @returns {JSX.Element} The rendered StrukturPage component.
 */
export default function StrukturPage() {
  const wakilKepala = [
    {
      name: "Megawati, S.Pd.",
      position: "Wakil Kepala Bidang Kurikulum",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=400&q=80",
    },
    {
      name: "Eko Ardi Wibowo, S.Pd.K.",
      position: "Wakil Kepala Bidang Kesiswaan",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=400&q=80",
    },
    {
      name: "Marzuki, S.Pd.",
      position: "Wakil Kepala Bidang Pembina OSIS",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=400&q=80",
    },
  ];

  const koordinator = [
    "Koordinator Mata Pelajaran",
    "Koordinator Bimbingan Konseling",
    "Koordinator Ekstrakurikuler",
    "Koordinator Tata Usaha",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Struktur Organisasi</h2>
      </div>

      {/* Kepala Sekolah */}
      <div className="flex flex-col items-center p-4 border-2 border-blue-600 rounded-lg max-w-xs mx-auto">
        <Image
          src="https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/v1732849619/kepsek_oiueq4.jpg"
          alt="Kepala Sekolah"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover mb-3"
        />
        <h3 className="font-semibold text-center">Muhamad Abduh, S.T.</h3>
        <p className="text-sm text-gray-600">Kepala Sekolah</p>
      </div>

      {/* Wakil Kepala Sekolah */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {wakilKepala.map((staff, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg"
          >
            <Image
              src={staff.image}
              alt={staff.name}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover mb-3"
            />
            <h3 className="font-semibold text-center text-sm">{staff.name}</h3>
            <p className="text-xs text-gray-600 text-center">
              {staff.position}
            </p>
          </div>
        ))}
      </div>

      {/* Koordinator */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Koordinator Bidang</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {koordinator.map((position, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="font-medium text-sm">{position}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guru dan Staff */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Guru dan Staff</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Guru Mata Pelajaran</h4>
            <p className="text-sm text-gray-600">23 Orang</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Staff Administrasi</h4>
            <p className="text-sm text-gray-600">5 Orang</p>
          </div>
        </div>
      </div>
    </div>
  );
}
