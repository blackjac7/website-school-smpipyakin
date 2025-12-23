import { Metadata } from "next";
import { getTeachersOnly } from "@/actions/public/teachers";
import TeacherList from "@/components/profile/TeacherList";

export const metadata: Metadata = {
  title: "Profil Guru | SMP IP Yakin Jakarta",
  description: "Daftar guru profesional yang mengajar di SMP IP Yakin Jakarta.",
};

export default async function GuruPage() {
  // Fetch only teachers (excluding staff) from database
  const teachersData = await getTeachersOnly();

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Tim Pengajar Profesional
        </h2>
        <p className="text-gray-600 text-lg">
          Kami memiliki tim pengajar yang berdedikasi tinggi, berpengalaman, dan
          berkomitmen untuk membimbing siswa mencapai potensi terbaiknya dalam
          akademik maupun karakter.
        </p>
      </div>

      <TeacherList initialTeachers={teachersData} />
    </div>
  );
}
