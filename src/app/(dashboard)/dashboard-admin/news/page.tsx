import { getAllNews } from "@/actions/news";
import NewsAdmin from "@/components/dashboard/admin/NewsAdmin";

export default async function Page() {
  const news = await getAllNews();
  return <NewsAdmin news={news} />;
}
