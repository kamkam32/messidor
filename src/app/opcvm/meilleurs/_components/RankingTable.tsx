import Link from "next/link";
import type { Fund } from "@/lib/funds";
import { formatPct, perfColorClass, riskLabel, riskColorClass } from "@/lib/format";

/**
 * Tableau de classement numéroté (rang, fonds, société, YTD, 1 an, 3 ans, risque).
 * Lignes striées (bg-cream / bg-cream-light), filets hairline, scroll horizontal sur mobile.
 */
export function RankingTable({ funds }: { funds: Fund[] }) {
  return (
    <div className="overflow-x-auto border border-slate/50">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate/50 bg-navy text-cream">
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">
              Rang
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">
              Fonds
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em]">
              Société
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em]">
              YTD
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em]">
              1 an
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.14em]">
              3 ans
            </th>
            <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.14em]">
              Risque
            </th>
          </tr>
        </thead>
        <tbody>
          {funds.map((f, i) => {
            const rank = i + 1;
            const striped = i % 2 === 0 ? "bg-cream" : "bg-cream-light";
            return (
              <tr
                key={f.id}
                className={`border-b border-slate/40 last:border-b-0 ${striped} transition-colors hover:bg-cream-dark`}
              >
                <td className="px-4 py-3 align-middle">
                  <span className="inline-flex h-7 w-7 items-center justify-center bg-navy text-xs font-semibold text-cream">
                    {rank}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle">
                  {f.slug ? (
                    <Link
                      href={`/opcvm/${f.slug}`}
                      className="font-display text-[15px] leading-tight text-navy transition-colors hover:text-gold-deep"
                    >
                      {f.name}
                    </Link>
                  ) : (
                    <span className="font-display text-[15px] leading-tight text-navy">{f.name}</span>
                  )}
                  {f.classification && (
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-navy-mute">
                      {f.classification}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 align-middle text-xs uppercase tracking-wide text-navy-soft">
                  {f.management_company ?? "—"}
                </td>
                <td className={`px-4 py-3 text-right align-middle font-medium tabular-nums ${perfColorClass(f.ytd_performance)}`}>
                  {formatPct(f.ytd_performance)}
                </td>
                <td className={`px-4 py-3 text-right align-middle tabular-nums ${perfColorClass(f.perf_1y)}`}>
                  {formatPct(f.perf_1y)}
                </td>
                <td className={`px-4 py-3 text-right align-middle tabular-nums ${perfColorClass(f.perf_3y)}`}>
                  {formatPct(f.perf_3y)}
                </td>
                <td className="px-4 py-3 text-center align-middle">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${riskColorClass(
                      f.risk_level
                    )}`}
                  >
                    {riskLabel(f.risk_level)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Formate la date de mise à jour (max updated_at) en français long. */
export function formatMethodologyDate(iso: string | null | undefined): string {
  if (!iso) return "à partir des dernières données disponibles";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "à partir des dernières données disponibles";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Renvoie la date ISO de mise à jour la plus récente d'une liste de fonds. */
export function maxUpdatedAt(funds: Fund[]): string | null {
  let max: string | null = null;
  for (const f of funds) {
    if (f.updated_at && (max === null || f.updated_at > max)) max = f.updated_at;
  }
  return max;
}
