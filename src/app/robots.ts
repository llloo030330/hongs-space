import type { MetadataRoute } from "next";

const siteUrl = "https://hongs-space.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/lab/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
