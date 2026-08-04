import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Accueille explicitement tous les robots, y compris les IA génératives
        // (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) — objectif GEO.
        userAgent: "*",
        allow: "/",
        disallow: ["/espace-client", "/api/", "/_next/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
