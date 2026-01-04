import { Bell } from "lucide-react";
import { getPublicAnnouncements } from "@/actions/public/announcements";
import AnnouncementsList from "@/components/announcements/AnnouncementsList";
import { getSettingTyped } from "@/lib/siteSettings";
import { notFound } from "next/navigation";

export default async function AnnouncementsPage() {
  // Respect feature flag
  const announcementsEnabled =
    (await getSettingTyped<boolean>("feature.announcements")) ?? true;
  if (!announcementsEnabled) return notFound();

  // Fetch announcements data from database on the server
  const announcementsData = await getPublicAnnouncements();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4">
            <Bell className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pengumuman Sekolah
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Informasi penting dan pengumuman terbaru seputar kegiatan akademik
            dan non-akademik di SMP IP Yakin Jakarta.
          </p>
        </div>

        <AnnouncementsList initialAnnouncements={announcementsData} />
      </div>
    </div>
  );
}
