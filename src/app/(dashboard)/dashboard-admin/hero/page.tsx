import { getHeroSlides } from "@/actions/hero";
import HeroAdmin from "@/components/dashboard/admin/HeroAdmin";

export default async function Page() {
  const slides = await getHeroSlides();
  return <HeroAdmin slides={slides} />;
}
