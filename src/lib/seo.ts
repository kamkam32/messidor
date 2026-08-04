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

/** Graphe JSON-LD sitewide : Organization (FinancialService + LocalBusiness) + WebSite. */
export function organizationGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["FinancialService", "LocalBusiness"],
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        legalName: SITE.legalName,
        url: SITE.url,
        logo: `${SITE.url}/images/logomessidor.jpg`,
        image: `${SITE.url}/images/logomessidor.jpg`,
        email: SITE.email,
        telephone: SITE.phone,
        description: SITE.description,
        priceRange: "€€€",
        areaServed: [
          { "@type": "Country", name: "Maroc" },
          { "@type": "Country", name: "France" },
        ],
        knowsAbout: [
          "Gestion de patrimoine",
          "OPCVM",
          "OPCI",
          "Fiscalité marocaine",
          "Investissement Maroc",
          "Bourse de Casablanca",
          "Épargne MRE",
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
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE.url}/opcvm?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
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
