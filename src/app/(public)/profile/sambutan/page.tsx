import { User } from "lucide-react";
import { Metadata } from "next";
import SambutanContent from "@/components/profile/SambutanContent";
import { getPublicTeachers } from "@/actions/public/teachers";

export const metadata: Metadata = {
  title: "Sambutan Kepala Sekolah | SMP IP Yakin Jakarta",
  description:
    "Sambutan dari Kepala Sekolah SMP IP Yakin Jakarta mengenai visi dan komitmen pendidikan sekolah.",
};

export default async function SambutanPage() {
  const teachers = await getPublicTeachers();
  // Find "Kepala Sekolah" - case insensitive search might be safer but user confirmed "Kepala Sekolah"
  const kepsek = teachers.find(
    (t) => t.position === "Kepala Sekolah" || t.category === "Pimpinan"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Sambutan Kepala Sekolah</h2>
      </div>

      <SambutanContent teacher={kepsek || null} />
    </div>
  );
}
