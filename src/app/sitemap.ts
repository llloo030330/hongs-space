import type { MetadataRoute } from "next";
import { seriesConfig } from "@/components/sections/photoData";

const siteUrl = "https://hongs-space.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/gallery",
    "/projects/wechat-ordering-system",
    "/experiments/brain-garden",
  ];
  const galleryRoutes = seriesConfig.map((series) => `/gallery/${series.id}`);

  return [...staticRoutes, ...galleryRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}
