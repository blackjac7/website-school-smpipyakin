import PageHeader from "@/components/layout/PageHeader";
import CalendarList from "@/components/calendar/CalendarList";
import { getPublicActivities } from "@/actions/public/calendar";

export default async function AcademicCalendarPage() {
  // Fetch activities data from database on the server
  const activitiesData = await getPublicActivities();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Kalender Akademik"
        description="Jadwal kegiatan akademik dan non-akademik SMP IP Yakin Jakarta Tahun Pelajaran 2024/2025."
        breadcrumbs={[{ label: "Akademik", href: "/academic-calendar" }]}
        image="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop"
      />

      <CalendarList initialActivities={activitiesData} />
    </div>
  );
}
