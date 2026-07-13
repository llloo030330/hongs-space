import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesGallery } from "@/components/sections/GallerySection";
import { seriesConfig } from "@/components/sections/photoData";
import { getPhotoSeries } from "@/lib/gallery/getPhotoSeries";

type SeriesPageProps = {
  params: Promise<{
    series: string;
  }>;
};

function getSeriesNeighbors(seriesId: string) {
  const photoSeries = getPhotoSeries();
  const index = photoSeries.findIndex((series) => series.id === seriesId);

  if (index === -1) {
    return null;
  }

  return {
    series: photoSeries[index],
    previousSeries:
      photoSeries[(index - 1 + photoSeries.length) % photoSeries.length],
    nextSeries: photoSeries[(index + 1) % photoSeries.length],
  };
}

export function generateStaticParams() {
  return seriesConfig.map((series) => ({
    series: series.id,
  }));
}

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { series: seriesId } = await params;
  const series = seriesConfig.find((item) => item.id === seriesId);

  if (!series) {
    return {
      title: "Gallery - Hong's Space",
    };
  }

  return {
    title: `${series.title} - Hong's Space`,
    description: series.description,
    openGraph: {
      title: `${series.title} - Hong's Space`,
      description: series.description,
      type: "website",
    },
  };
}

export default async function GallerySeriesPage({ params }: SeriesPageProps) {
  const { series: seriesId } = await params;
  const seriesState = getSeriesNeighbors(seriesId);

  if (!seriesState) {
    notFound();
  }

  return (
    <main className="min-h-[100svh] bg-[#f5f5f2] px-4 py-10 text-[#151515] sm:px-10 sm:py-16 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <SeriesGallery
          series={seriesState.series}
          previousSeries={seriesState.previousSeries}
          nextSeries={seriesState.nextSeries}
        />
      </div>
    </main>
  );
}
