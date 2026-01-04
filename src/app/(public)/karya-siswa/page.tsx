import PageHeader from "@/components/layout/PageHeader";
import KaryaGallery from "@/components/public/karya/KaryaGallery";
import { Metadata } from "next";
import { getSettingTyped } from "@/lib/siteSettings";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Galeri Karya Siswa | Modern School",
  description:
    "Koleksi karya kreatif, inovasi, dan prestasi siswa Modern School dalam berbagai bidang.",
};

export default async function KaryaSiswaPage() {
  const studentWorksEnabled =
    (await getSettingTyped<boolean>("feature.studentWorks")) ?? true;
  if (!studentWorksEnabled) return notFound();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <PageHeader
        title="Galeri Karya Siswa"
        description="Wadah kreativitas dan inovasi siswa-siswi berprestasi"
        image="https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2070&auto=format&fit=crop"
        breadcrumbs={[{ label: "Karya Siswa", href: "/karya-siswa" }]}
      />

      <KaryaGallery />
    </main>
  );
}
