/**
 * Mapping des sociétés de gestion vers leurs logos (dans /public/images).
 * Retourne null si aucun logo connu -> l'UI affiche alors les initiales.
 */
export const MANAGEMENT_COMPANY_LOGOS: Record<string, string> = {
  "AD CAPITAL ASSET MANAGEMENT": "/images/adcapital.png",
  "AFG ASSET MANAGEMENT": "/images/AFG (2).png",
  "AFRICAPITAL MANAGEMENT": "/images/africacapital.png",
  "ALPHAVEST ASSET MANAGEMENT": "/images/alphavest.jpg",
  "ATLAS CAPITAL MANAGEMENT": "/images/atlas_capital_maroc_logo.jpg",
  "BMCE CAPITAL GESTION": "/images/bmce capital.jpg",
  "CAPITAL TRUST GESTION": "/images/logo_capital_trust.png",
  "CDG CAPITAL GESTION": "/images/CDG capital.png",
  "CFG GESTION": "/images/cfg_bank.jpg",
  "CIH CAPITAL MANAGEMENT": "/images/cih.png",
  "IRG ASSET MANAGEMENT": "/images/IRG.png",
  MAROGEST: "/images/Marogest.png",
  "RED MED ASSET MANAGEMENT": "/images/Red med.png",
  "RMA ASSET MANAGEMENT": "/images/RMA asset management.jpg",
  "SAHAM CAPITAL GESTION": "/images/Saham capital.png",
  "STERLING ASSET MANAGEMENT": "/images/STERLING ASSET MANAGEMENT.webp",
  "TWIN CAPITAL GESTION": "/images/TWIN CAPITAL GESTION.jpg",
  "UPLINE CAPITAL MANAGEMENT": "/images/UPLINE CAPITAL MANAGEMENT.jpg",
  "VALORIS MANAGEMENT": "/images/VALORIS MANAGEMENT.jpg",
  "WAFA GESTION": "/images/WAFA GESTION.png",
  "WINEO GESTION": "/images/WINEO GESTION.png",
};

/** Logo de la société (ou null si inconnu). Insensible à la casse. */
export function getManagementCompanyLogo(company: string | null | undefined): string | null {
  if (!company) return null;
  const direct = MANAGEMENT_COMPANY_LOGOS[company];
  if (direct) return direct;
  const upper = company.toUpperCase().trim();
  const key = Object.keys(MANAGEMENT_COMPANY_LOGOS).find((k) => k.toUpperCase() === upper);
  return key ? MANAGEMENT_COMPANY_LOGOS[key] : null;
}

/** Initiales de secours (max 2 lettres). */
export function companyInitials(company: string | null | undefined): string {
  if (!company) return "?";
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
