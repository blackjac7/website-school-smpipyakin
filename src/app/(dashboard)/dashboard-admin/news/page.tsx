import { getAllNews, getAdminNewsQueue } from "@/actions/news";
import NewsAdmin from "@/components/dashboard/admin/NewsAdmin";

export default async function Page() {
  const [news, pendingNews] = await Promise.all([
    getAllNews(),
    getAdminNewsQueue(),
  ]);

  return <NewsAdmin news={news} pendingNews={pendingNews} />;
}
