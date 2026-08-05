/**
 * Configuration centrale du site Messidor Patrimoine.
 * Une seule source de vérité pour URL, marque, contacts, réseaux.
 */

export const SITE = {
  name: "Messidor Patrimoine",
  legalName: "Messidor Patrimoine",
  // Domaine canonique = www (l'apex nu pointe sur une page parquée GoDaddy)
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.messidor-patrimoine.com").replace(/\/$/, ""),
  description:
    "Cabinet de conseil en gestion de patrimoine au Maroc. Sélection OPCVM & OPCI, simulateurs fiscaux 2025, stratégie d'investissement sur-mesure du marché financier marocain.",
  locale: "fr_MA",
  lang: "fr",
  email: "kamil@messidorai.com",
  phone: "+33 6 19 06 12 15",
  whatsapp: "33619061215", // format international sans "+"
  calendly: "https://calendly.com/kamil-messidor",
  city: "Casablanca",
  country: "MA",
  founders: [
    { name: "Tarik Belghazi", role: "Associé" },
    { name: "Kamil Alami", role: "Associé" },
  ],
  social: {
    linkedin: "https://www.linkedin.com/company/messidor-patrimoine",
  },
} as const;

export function absoluteUrl(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${p}`;
}

/** Navigation principale (header). */
export const NAV = [
  { label: "Gestion de patrimoine", href: "/gestion-de-patrimoine" },
  { label: "OPCVM", href: "/opcvm" },
  { label: "OPCI", href: "/opci" },
  { label: "Immobilier", href: "/immobilier" },
  { label: "Simulateurs", href: "/simulateurs" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;
