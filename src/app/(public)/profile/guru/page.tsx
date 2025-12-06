import { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import Image from "next/image";

/**
 * Metadata for the Teachers & Staff page.
 */
export const metadata: Metadata = {
  title: "Profil Guru & Staff | SMP IP Yakin Jakarta",
  description:
    "Daftar guru dan staf profesional yang mengajar dan mendukung pendidikan di SMP IP Yakin Jakarta.",
};

const teachers = [
  {
    id: "1",
    name: "Drs. Ahmad Hidayat, M.Pd.",
    position: "Guru Matematika",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=400&q=80",
    description:
      "Pengalaman mengajar 15 tahun, spesialisasi dalam Olimpiade Matematika",
  },
  {
    id: "2",
    name: "Siti Nurhaliza, S.Pd.",
    position: "Guru Bahasa Inggris",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=400&q=80",
    description:
      "Lulusan University of Melbourne, berpengalaman dalam TOEFL preparation",
  },
  {
    id: "3",
    name: "H. Rahmat Wijaya, M.Si.",
    position: "Guru IPA",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=400&q=80",
    description:
      "Peneliti aktif dalam bidang sains, pembimbing tim Olimpiade Sains",
  },
  {
    id: "4",
    name: "Hj. Aminah Putri, S.Ag.",
    position: "Guru PAI",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=400&q=80",
    description: "Hafizah Al-Quran, aktif dalam program tahfiz sekolah",
  },
  {
    id: "5",
    name: "Dr. Budi Santoso, M.Pd.",
    position: "Guru Bahasa Indonesia",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=400&q=80",
    description:
      "Penulis buku pelajaran, pembimbing lomba debat dan karya tulis",
  },
  {
    id: "6",
    name: "Dewi Kartika, S.Pd.",
    position: "Guru Seni Budaya",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=400&q=80",
    description: "Seniman aktif, pembina ekstrakurikuler seni",
  },
];

/**
 * GuruStaffPage component.
 * Displays a list of teachers and staff members with their photos and descriptions.
 * @returns {JSX.Element} The rendered GuruStaffPage component.
 */
export default function GuruStaffPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Profil Guru dan Staff</h2>
      </div>

      <p className="text-gray-600 mb-8">
        Tim pengajar SMP IP Yakin Jakarta terdiri dari para profesional
        berpengalaman yang berkomitmen dalam mengembangkan potensi setiap siswa.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-lg shadow-md overflow-hidden flex"
          >
            <Image
              src={teacher.photo}
              alt={teacher.name}
              width={128}
              height={128}
              className="w-32 h-32 object-cover"
            />
            <div className="p-4 flex-1">
              <h3 className="font-semibold text-lg mb-1">{teacher.name}</h3>
              <p className="text-blue-600 text-sm mb-2">{teacher.position}</p>
              <p className="text-gray-600 text-sm">{teacher.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
