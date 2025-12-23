import PageHeader from "@/components/layout/PageHeader";
import NewsList from "@/components/news/NewsList";
import { getPublicNews } from "@/actions/public/news";

export default async function NewsPage() {
  // Fetch news data from database on the server
  const newsData = await getPublicNews();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Berita & Prestasi"
        description="Ikuti perkembangan terbaru, prestasi siswa, dan agenda kegiatan di lingkungan SMP IP Yakin Jakarta."
        breadcrumbs={[{ label: "Berita", href: "/news" }]}
        image="https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2670&auto=format&fit=crop"
      />

      <NewsList initialNews={newsData} />
    </div>
  );
}
