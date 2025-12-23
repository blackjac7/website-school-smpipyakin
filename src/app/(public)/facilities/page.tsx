import PageHeader from "@/components/layout/PageHeader";
import FacilitiesList from "@/components/facilities/FacilitiesList";
import { getPublicFacilities } from "@/actions/public/facilities";

export default async function FacilitiesPage() {
  // Fetch facilities data from database on the server
  const facilitiesData = await getPublicFacilities();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <PageHeader
        title="Fasilitas Sekolah"
        description="SMP IP Yakin Jakarta menyediakan fasilitas modern dan lengkap untuk mendukung proses pembelajaran dan pengembangan potensi siswa."
        breadcrumbs={[{ label: "Fasilitas", href: "/facilities" }]}
        image="https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1920&auto=format&fit=crop"
      />

      <FacilitiesList facilities={facilitiesData} />
    </div>
  );
}
