import { User } from "lucide-react";
import { Metadata } from "next";
import SambutanContent from "@/components/profile/SambutanContent";

export const metadata: Metadata = {
  title: "Sambutan Kepala Sekolah | SMP IP Yakin Jakarta",
  description:
    "Sambutan dari Kepala Sekolah SMP IP Yakin Jakarta, Muhamad Abduh, S.T., mengenai visi dan komitmen pendidikan sekolah.",
};

export default function SambutanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Sambutan Kepala Sekolah</h2>
      </div>

      <SambutanContent />
    </div>
  );
}
