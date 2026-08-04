"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Fund } from "@/lib/funds";
import { FundCard } from "@/components/opcvm/FundCard";

type SortKey = "ytd_performance" | "perf_1y" | "perf_3y" | "name" | "risk_level";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "ytd_performance", label: "Performance YTD" },
  { key: "perf_1y", label: "Performance 1 an" },
  { key: "perf_3y", label: "Performance 3 ans" },
  { key: "risk_level", label: "Niveau de risque" },
  { key: "name", label: "Nom (A-Z)" },
];

const PAGE_SIZE = 24;

export function OpcvmExplorer({ funds }: { funds: Fund[] }) {
  const [query, setQuery] = useState("");
  const [classif, setClassif] = useState("");
  const [sort, setSort] = useState<SortKey>("ytd_performance");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const classifications = useMemo(() => {
    const set = new Set<string>();
    funds.forEach((f) => f.classification && set.add(f.classification));
    return [...set].sort();
  }, [funds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = funds.filter((f) => {
      if (classif && f.classification !== classif) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        (f.management_company ?? "").toLowerCase().includes(q)
      );
    });
    out.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "risk_level") return (a.risk_level ?? 99) - (b.risk_level ?? 99);
      return (b[sort] ?? -Infinity) - (a[sort] ?? -Infinity);
    });
    return out;
  }, [funds, query, classif, sort]);

  const visible = filtered.slice(0, limit);

  return (
    <div>
      {/* Barre de filtres */}
      <div className="sticky top-20 z-30 -mx-4 mb-10 border border-slate/50 bg-cream-light/95 px-4 py-4 backdrop-blur-md">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-mute" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder="Rechercher un fonds ou une société de gestion…"
              className="w-full border border-slate bg-cream py-3 pl-10 pr-3 text-sm text-navy outline-none placeholder:text-navy-mute focus:border-gold"
            />
          </div>
          <select
            value={classif}
            onChange={(e) => {
              setClassif(e.target.value);
              setLimit(PAGE_SIZE);
            }}
            className="border border-slate bg-cream px-3 py-3 text-sm text-navy outline-none focus:border-gold"
          >
            <option value="">Toutes classifications</option>
            {classifications.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="border border-slate bg-cream px-3 py-3 text-sm text-navy outline-none focus:border-gold"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                Trier : {s.label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 text-xs text-navy-mute">
          {filtered.length} fonds{classif ? ` · ${classif}` : ""}
        </p>
      </div>

      {/* Grille */}
      {visible.length === 0 ? (
        <p className="py-16 text-center text-navy-mute">Aucun fonds ne correspond à votre recherche.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((f, i) => (
            <FundCard key={f.id} fund={f} rank={sort === "ytd_performance" && !query && !classif ? i + 1 : undefined} />
          ))}
        </div>
      )}

      {limit < filtered.length && (
        <div className="mt-12 text-center">
          <button
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            className="border border-navy/30 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-colors hover:bg-navy hover:text-cream"
          >
            Afficher plus de fonds
          </button>
        </div>
      )}
    </div>
  );
}
