"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, Plus, Scale } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { Fund } from "@/lib/funds";
import { formatPct, perfColorClass, formatNumber, riskLabel } from "@/lib/format";

const MAX = 4;

const ROWS: { label: string; render: (f: Fund) => React.ReactNode }[] = [
  { label: "Société de gestion", render: (f) => f.management_company ?? "—" },
  { label: "Classification", render: (f) => f.classification ?? "—" },
  {
    label: "Performance YTD",
    render: (f) => (
      <span className={`font-medium ${perfColorClass(f.ytd_performance)}`}>
        {formatPct(f.ytd_performance)}
      </span>
    ),
  },
  {
    label: "Performance 1 an",
    render: (f) => (
      <span className={`font-medium ${perfColorClass(f.perf_1y)}`}>{formatPct(f.perf_1y)}</span>
    ),
  },
  {
    label: "Performance 3 ans",
    render: (f) => (
      <span className={`font-medium ${perfColorClass(f.perf_3y)}`}>{formatPct(f.perf_3y)}</span>
    ),
  },
  { label: "Niveau de risque", render: (f) => riskLabel(f.risk_level) },
  {
    label: "Valeur liquidative",
    render: (f) => (f.nav != null ? `${formatNumber(f.nav)} MAD` : "—"),
  },
  {
    label: "Frais de gestion",
    render: (f) => (f.management_fees != null ? formatPct(f.management_fees, false) : "—"),
  },
];

const BAR_COLORS = ["#B08A3E", "#0E1A2B", "#8A6A2A", "#35435A"];

export function Comparateur({ funds }: { funds: Fund[] }) {
  const [selected, setSelected] = useState<Fund[]>([]);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const ids = new Set(selected.map((s) => s.id));
    return funds
      .filter(
        (f) =>
          !ids.has(f.id) &&
          (f.name.toLowerCase().includes(q) ||
            (f.management_company ?? "").toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [funds, query, selected]);

  const add = (f: Fund) => {
    if (selected.length >= MAX) return;
    setSelected((s) => [...s, f]);
    setQuery("");
  };
  const remove = (id: string) => setSelected((s) => s.filter((f) => f.id !== id));

  const chartData = useMemo(
    () =>
      selected.map((f, i) => ({
        name: f.name.length > 22 ? `${f.name.slice(0, 22)}…` : f.name,
        ytd: f.ytd_performance ?? 0,
        color: BAR_COLORS[i % BAR_COLORS.length],
      })),
    [selected]
  );

  return (
    <div>
      {/* Recherche + ajout */}
      <div className="border border-slate/50 bg-cream-light p-5">
        <label className="eyebrow text-gold-deep">Ajouter un fonds ({selected.length}/{MAX})</label>
        <div className="relative mt-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-mute" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={selected.length >= MAX}
            placeholder={
              selected.length >= MAX
                ? "Maximum de 4 fonds atteint — retirez-en un pour continuer"
                : "Rechercher un fonds ou une société de gestion…"
            }
            className="w-full border border-slate bg-cream py-3 pl-10 pr-3 text-sm text-navy outline-none placeholder:text-navy-mute focus:border-gold disabled:opacity-50"
          />
          {results.length > 0 && (
            <ul className="absolute z-40 mt-1 max-h-72 w-full overflow-y-auto border border-slate bg-cream shadow-lg">
              {results.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => add(f)}
                    className="flex w-full items-center justify-between gap-3 border-b border-slate/40 px-4 py-3 text-left transition-colors hover:bg-cream-light"
                  >
                    <span>
                      <span className="block text-sm font-medium text-navy">{f.name}</span>
                      {f.management_company && (
                        <span className="block text-xs uppercase tracking-wide text-navy-mute">
                          {f.management_company}
                        </span>
                      )}
                    </span>
                    <Plus size={16} className="shrink-0 text-gold-deep" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* État vide */}
      {selected.length === 0 ? (
        <div className="mt-10 flex flex-col items-center border border-dashed border-slate/60 bg-cream-light px-6 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
            <Scale size={26} strokeWidth={1.6} />
          </span>
          <h2 className="mt-6 font-display text-2xl text-navy">Comparez jusqu'à 4 fonds</h2>
          <p className="mt-3 max-w-md text-navy-soft">
            Recherchez un fonds ci-dessus et ajoutez-le au comparateur pour confronter performances,
            risque, valeur liquidative et frais côte à côte.
          </p>
        </div>
      ) : (
        <>
          {/* Tableau comparatif */}
          <div className="mt-10 overflow-x-auto border border-slate/50">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr>
                  <th className="w-44 bg-navy px-4 py-4 text-left align-bottom text-xs font-semibold uppercase tracking-[0.16em] text-cream/60">
                    Fonds
                  </th>
                  {selected.map((f) => (
                    <th
                      key={f.id}
                      className="bg-navy px-4 py-4 text-left align-top text-cream"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display text-base leading-tight">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => remove(f.id)}
                          aria-label={`Retirer ${f.name}`}
                          className="shrink-0 text-cream/50 transition-colors hover:text-gold-light"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr key={row.label} className={i % 2 ? "bg-cream-light" : "bg-cream"}>
                    <td className="border-b border-slate/40 px-4 py-3 text-navy-mute">
                      {row.label}
                    </td>
                    {selected.map((f) => (
                      <td
                        key={f.id}
                        className="border-b border-l border-slate/40 px-4 py-3 text-navy"
                      >
                        {row.render(f)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-3" />
                  {selected.map((f) => (
                    <td key={f.id} className="border-l border-slate/40 px-4 py-3">
                      {f.slug ? (
                        <Link
                          href={`/opcvm/${f.slug}`}
                          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep underline underline-offset-4 hover:text-gold"
                        >
                          Voir la fiche
                        </Link>
                      ) : null}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Graphe YTD */}
          <div className="mt-10 border border-slate/50 bg-cream-light p-6">
            <p className="eyebrow text-gold-deep">Performance YTD comparée</p>
            <div className="mt-6 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 24, right: 8, bottom: 0, left: 0 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6B7789" }}
                    stroke="#C3C9D2"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6B7789" }}
                    width={48}
                    stroke="#C3C9D2"
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Bar dataKey="ytd" radius={[2, 2, 0, 0]}>
                    <LabelList
                      dataKey="ytd"
                      position="top"
                      formatter={(v: React.ReactNode) => formatPct(Number(v))}
                      style={{ fill: "#0E1A2B", fontSize: 12, fontWeight: 600 }}
                    />
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
