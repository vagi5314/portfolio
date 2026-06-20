import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.author} — Portfolio`,
    short_name: SITE.author,
    description: `${SITE.author} is a data scientist in ${SITE.location}, building data-science pipelines, ML models, and n8n automations.`,
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0E0E10",
    theme_color: "#0E0E10",
    categories: ["portfolio", "data-science", "productivity"],
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
