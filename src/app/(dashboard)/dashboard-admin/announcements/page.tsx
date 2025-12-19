import { getAllAnnouncements } from "@/actions/announcements";
import AnnouncementsAdmin from "@/components/dashboard/admin/AnnouncementsAdmin";

export default async function Page() {
  const announcements = await getAllAnnouncements();
  return <AnnouncementsAdmin announcements={announcements} />;
}
