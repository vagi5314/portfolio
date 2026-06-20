import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects.map((p) => ({
      url: `${SITE.url}/work/${p.slug}`,
      lastModified: new Date(`${p.year}-12-01`),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}