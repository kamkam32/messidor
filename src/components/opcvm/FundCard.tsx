import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Fund } from "@/lib/funds";
import { formatPct, perfColorClass, riskLabel, riskColorClass } from "@/lib/format";

export function FundCard({ fund, rank }: { fund: Fund; rank?: number }) {
  const href = fund.slug ? `/opcvm/${fund.slug}` : "#";
  return (
    <Link
      href={href}
      className="group relative flex flex-col border border-slate/50 bg-cream p-6 transition-colors hover:bg-cream-light"
    >
      {rank != null && (
        <span className="absolute -top-px left-6 -translate-y-1/2 bg-navy px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cream">
          #{rank}
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          {fund.classification && (
            <span className="eyebrow text-gold-deep">{fund.classification}</span>
          )}
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${riskColorClass(
            fund.risk_level
          )}`}
        >
          Risque {riskLabel(fund.risk_level)}
        </span>
      </div>

      <h3 className="mt-3 font-display text-lg leading-tight text-navy transition-colors group-hover:text-gold-deep">
        {fund.name}
      </h3>
      {fund.management_company && (
        <p className="mt-1 text-xs uppercase tracking-wide text-navy-mute">
          {fund.management_company}
        </p>
      )}

      <div className="mt-5 border border-slate/40 bg-cream-light p-4 text-center">
        <p className="eyebrow text-navy-mute">Performance YTD</p>
        <p className={`mt-1 font-display text-3xl ${perfColorClass(fund.ytd_performance)}`}>
          {formatPct(fund.ytd_performance)}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[
          { l: "1M", v: fund.perf_1m },
          { l: "3M", v: fund.perf_3m },
          { l: "1A", v: fund.perf_1y },
          { l: "3A", v: fund.perf_3y },
        ].map((p) => (
          <div key={p.l} className="border border-slate/40 py-2">
            <dt className="text-[10px] uppercase text-navy-mute">{p.l}</dt>
            <dd className={`text-xs font-medium ${perfColorClass(p.v)}`}>{formatPct(p.v)}</dd>
          </div>
        ))}
      </dl>

      <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-transform group-hover:translate-x-1">
        Voir la fiche <ArrowRight size={13} />
      </span>
    </Link>
  );
}
