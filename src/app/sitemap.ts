import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: "2026-10-10",
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
