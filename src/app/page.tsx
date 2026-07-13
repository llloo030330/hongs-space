import { HomeHero } from "@/components/home/HomeHero";
import { getPhotoSeries } from "@/lib/gallery/getPhotoSeries";

export default function Home() {
  const photoSeries = getPhotoSeries();
  const currentYear = new Date().getFullYear();

  return <HomeHero photoSeries={photoSeries} currentYear={currentYear} />;
}
