/** Formatage & helpers d'affichage (perfs, montants, risque). */

export function formatPct(n: number | null | undefined, withSign = true): string {
  if (n == null || Number.isNaN(n)) return "N/A";
  const sign = withSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function perfColorClass(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "text-navy-mute";
  if (n > 0) return "text-success";
  if (n < 0) return "text-danger";
  return "text-navy-soft";
}

export function formatMAD(n: number | null | undefined, decimals = 2): string {
  if (n == null || Number.isNaN(n)) return "N/A";
  return new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n) + " MAD";
}

export function formatNumber(n: number | null | undefined, decimals = 2): string {
  if (n == null || Number.isNaN(n)) return "N/A";
  return new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function riskLabel(level: number | null | undefined): string {
  if (!level) return "N/D";
  return `${level}/7`;
}

export function riskColorClass(level: number | null | undefined): string {
  if (!level) return "bg-slate/30 text-navy-soft";
  if (level <= 2) return "bg-success/12 text-success";
  if (level <= 4) return "bg-gold/15 text-gold-deep";
  return "bg-danger/12 text-danger";
}
