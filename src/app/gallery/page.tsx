import Link from "next/link";
import { SeriesSelector } from "@/components/sections/GallerySection";
import { getPhotoSeries } from "@/lib/gallery/getPhotoSeries";

export const metadata = {
  title: "Gallery - Hong's Space",
  description: "A quiet archive of photography series by Hong.",
};

export default function GalleryPage() {
  const photoSeries = getPhotoSeries();

  return (
    <main className="min-h-[100svh] bg-[#f5f5f2] px-5 py-12 text-[#151515] sm:px-10 sm:py-20 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-black/[0.07] px-5 text-[11px] font-medium tracking-[0.14em] text-black/42 transition duration-300 hover:border-black/[0.13] hover:bg-white/30 hover:text-black/62 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
          >
            {"<-"} Hong&apos;s Space
          </Link>
          <h1 className="mt-9 text-3xl font-medium tracking-[0.01em] text-black/78 sm:mt-10 sm:text-5xl">
            Gallery
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-8 text-black/44 sm:text-sm sm:leading-7">
            Quiet series gathered as a personal photography archive.
          </p>
        </div>

        <SeriesSelector photoSeries={photoSeries} />
      </div>
    </main>
  );
}
