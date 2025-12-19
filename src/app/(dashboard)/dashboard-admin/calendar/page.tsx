import { getAllActivities } from "@/actions/calendar";
import CalendarAdmin from "@/components/dashboard/admin/CalendarAdmin";

export default async function Page() {
  const activities = await getAllActivities();
  return <CalendarAdmin activities={activities} />;
}
