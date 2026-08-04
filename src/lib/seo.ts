import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";

/**
 * Construit un objet Metadata cohérent (title, description, canonical, OG).
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  type = "website",
  images,
}: {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
  images?: string[];
}): Metadata {
  const desc = description || SITE.description;
  const canonical = absoluteUrl(path);
  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      type,
      title: title || SITE.name,
      description: desc,
      url: canonical,
      siteName: SITE.name,
      locale: SITE.locale,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title || SITE.name,
      description: desc,
    },
  };
}

/** Graphe JSON-LD sitewide : Organization (FinancialService) + WebSite. */
export function organizationGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FinancialService",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
        description: SITE.description,
        areaServed: { "@type": "Country", name: "Maroc" },
        knowsAbout: [
          "Gestion de patrimoine",
          "OPCVM",
          "OPCI",
          "Fiscalité marocaine",
          "Investissement Maroc",
          "Bourse de Casablanca",
        ],
        founder: SITE.founders.map((f) => ({ "@type": "Person", name: f.name })),
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE.city,
          addressCountry: SITE.country,
        },
        sameAs: [SITE.social.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        inLanguage: "fr",
        publisher: { "@id": `${SITE.url}/#organization` },
      },
    ],
  };
}

export function breadcrumbGraph(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
