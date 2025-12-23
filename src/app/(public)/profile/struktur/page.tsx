import { Metadata } from "next";
import { getPublicTeachers } from "@/actions/public/teachers";
import StrukturOrganisasi from "@/components/profile/StrukturOrganisasi";

export const metadata: Metadata = {
  title: "Struktur Organisasi | SMP Islam PY",
  description:
    "Struktur organisasi sekolah SMP Islam PY - Kepemimpinan dan jajaran pengurus sekolah",
};

export default async function StrukturPage() {
  const teachers = await getPublicTeachers();

  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-6xl mx-auto">
        <StrukturOrganisasi teachers={teachers} />
      </div>
    </section>
  );
}
