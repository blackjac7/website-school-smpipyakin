import { getSchoolStats } from "@/actions/stats";
import StatsAdmin from "@/components/dashboard/admin/StatsAdmin";

export default async function Page() {
  const stats = await getSchoolStats();
  return <StatsAdmin stats={stats} />;
}
