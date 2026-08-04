import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/site";
import { getAllFundSlugs, getManagementCompanies, slugify } from "@/lib/funds";
import { getAllPosts } from "@/lib/blog";
import { SIMULATORS } from "@/lib/simulators";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/gestion-de-patrimoine"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/opcvm"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/opcvm/comparateur"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/opci"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/simulateurs"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  const simulatorEntries: MetadataRoute.Sitemap = SIMULATORS.map((s) => ({
    url: absoluteUrl(`/simulateurs/${s.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  const [fundSlugs, companies, posts] = await Promise.all([
    getAllFundSlugs(),
    getManagementCompanies(),
    Promise.resolve(getAllPosts()),
  ]);

  const fundEntries: MetadataRoute.Sitemap = fundSlugs.map((slug) => ({
    url: absoluteUrl(`/opcvm/${slug}`),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const companyEntries: MetadataRoute.Sitemap = companies
    .filter((c) => c.count >= 2)
    .map((c) => ({
      url: absoluteUrl(`/opcvm/societe/${slugify(c.name)}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...simulatorEntries,
    ...fundEntries,
    ...companyEntries,
    ...postEntries,
  ];
}
