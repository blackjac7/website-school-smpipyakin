import PageHeader from "@/components/layout/PageHeader";
import ExtracurricularList from "@/components/extracurricular/ExtracurricularList";
import { getPublicExtracurriculars } from "@/actions/public/extracurricular";

export default async function ExtracurricularPage() {
  // Fetch extracurricular data from database on the server
  const activitiesData = await getPublicExtracurriculars();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Program Ekstrakurikuler"
        description="Mengembangkan bakat dan minat siswa melalui berbagai kegiatan positif di luar jam pelajaran reguler."
        breadcrumbs={[{ label: "Ekstrakurikuler", href: "/extracurricular" }]}
        image="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1920&auto=format&fit=crop"
      />

      <ExtracurricularList activities={activitiesData} />
    </div>
  );
}
