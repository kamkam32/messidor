/**
 * Mapping des sociétés de gestion vers leurs logos
 */
export const MANAGEMENT_COMPANY_LOGOS: Record<string, string> = {
  'AD CAPITAL ASSET MANAGEMENT': '/images/adcapital.png',
  'AFG ASSET MANAGEMENT': '/images/AFG (2).png',
  'AFRICAPITAL MANAGEMENT': '/images/africacapital.png',
  'ALPHAVEST ASSET MANAGEMENT': '/images/alphavest.jpg',
  'ATLAS CAPITAL MANAGEMENT': '/images/atlas_capital_maroc_logo.jpg',
  'BMCE CAPITAL GESTION': '/images/bmce capital.jpg',
  'CAPITAL TRUST GESTION': '/images/logo_capital_trust.png',
  'CDG CAPITAL GESTION': '/images/CDG capital.png',
  'CFG GESTION': '/images/cfg_bank.jpg',
  'CIH CAPITAL MANAGEMENT': '/images/cih.png',
  'IRG ASSET MANAGEMENT': '/images/IRG.png',
  'MAROGEST': '/images/Marogest.png',
  'RED MED ASSET MANAGEMENT': '/images/Red med.png',
  'RMA ASSET MANAGEMENT': '/images/RMA asset management.jpg',
  'SAHAM CAPITAL GESTION': '/images/Saham capital.png',
  'STERLING ASSET MANAGEMENT': '/images/STERLING ASSET MANAGEMENT.webp',
  'TWIN CAPITAL GESTION': '/images/TWIN CAPITAL GESTION.jpg',
  'TWIN CAPITAL Gestion': '/images/TWIN CAPITAL GESTION.jpg', // doublon avec casse différente
  'UPLINE CAPITAL MANAGEMENT': '/images/UPLINE CAPITAL MANAGEMENT.jpg',
  'VALORIS MANAGEMENT': '/images/VALORIS MANAGEMENT.jpg',
  'WAFA GESTION': '/images/WAFA GESTION.png',
  'WINEO GESTION': '/images/WINEO GESTION.png',
}

/**
 * Récupère le logo de la société de gestion
 * @param managementCompany - Nom de la société de gestion
 * @returns Chemin vers le logo ou un placeholder par défaut
 */
export function getManagementCompanyLogo(managementCompany: string | null | undefined): string {
  if (!managementCompany) {
    return '/images/logomessidor.jpg' // Logo par défaut
  }

  return MANAGEMENT_COMPANY_LOGOS[managementCompany] || '/images/logomessidor.jpg'
}
