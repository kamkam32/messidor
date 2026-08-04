import { supabaseAnon } from "@/lib/supabase/anon";

export type FundType = "OPCVM" | "OPCI";

export interface Fund {
  id: string;
  name: string;
  slug: string | null;
  code: string | null;
  isin_code: string | null;
  type: FundType;
  category: string | null;
  classification: string | null;
  management_company: string | null;
  legal_nature: string | null;
  benchmark_index: string | null;
  risk_level: number | null;
  nav: number | null;
  asset_value: number | null;
  ytd_performance: number | null;
  perf_1d: number | null;
  perf_1w: number | null;
  perf_1m: number | null;
  perf_3m: number | null;
  perf_6m: number | null;
  perf_1y: number | null;
  perf_2y: number | null;
  perf_3y: number | null;
  perf_5y: number | null;
  minimum_investment: number | null;
  subscription_fee: number | null;
  redemption_fee: number | null;
  management_fees: number | null;
  inception_date: string | null;
  is_active: boolean | null;
  updated_at: string | null;
}

const LIST_COLUMNS =
  "id,name,slug,code,isin_code,type,category,classification,management_company,legal_nature,benchmark_index,risk_level,nav,asset_value,ytd_performance,perf_1d,perf_1w,perf_1m,perf_3m,perf_6m,perf_1y,perf_2y,perf_3y,perf_5y,minimum_investment,subscription_fee,redemption_fee,management_fees,inception_date,is_active,updated_at";

/** Nombre total de fonds actifs (pour la home / preuve). */
export async function getFundsCount(type?: FundType): Promise<number> {
  try {
    let q = supabaseAnon.from("funds").select("id", { count: "exact", head: true }).eq("is_active", true);
    if (type) q = q.eq("type", type);
    const { count } = await q;
    return count ?? 0;
  } catch {
    return 0;
  }
}

/** Liste des fonds (par défaut OPCVM actifs), triée par perf YTD desc. */
export async function getFunds(opts: {
  type?: FundType;
  limit?: number;
  orderBy?: keyof Fund;
  ascending?: boolean;
} = {}): Promise<Fund[]> {
  const { type = "OPCVM", limit, orderBy = "ytd_performance", ascending = false } = opts;
  try {
    let q = supabaseAnon
      .from("funds")
      .select(LIST_COLUMNS)
      .eq("is_active", true)
      .eq("type", type)
      .order(orderBy as string, { ascending, nullsFirst: false });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return (data as Fund[]) ?? [];
  } catch {
    return [];
  }
}

export async function getTopFunds(limit = 10, type: FundType = "OPCVM"): Promise<Fund[]> {
  return getFunds({ type, limit, orderBy: "ytd_performance", ascending: false });
}

export async function getFundBySlug(slug: string): Promise<Fund | null> {
  try {
    const { data } = await supabaseAnon.from("funds").select(LIST_COLUMNS).eq("slug", slug).maybeSingle();
    return (data as Fund) ?? null;
  } catch {
    return null;
  }
}

/** Tous les slugs (generateStaticParams). */
export async function getAllFundSlugs(): Promise<string[]> {
  try {
    const { data } = await supabaseAnon
      .from("funds")
      .select("slug")
      .eq("is_active", true)
      .not("slug", "is", null);
    return (data ?? []).map((r: { slug: string }) => r.slug).filter(Boolean);
  } catch {
    return [];
  }
}

/** Sociétés de gestion distinctes (landings). */
export async function getManagementCompanies(): Promise<{ name: string; count: number }[]> {
  try {
    const { data } = await supabaseAnon
      .from("funds")
      .select("management_company")
      .eq("is_active", true)
      .not("management_company", "is", null);
    const counts = new Map<string, number>();
    for (const row of (data ?? []) as { management_company: string }[]) {
      const k = row.management_company.trim();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

/** Classifications distinctes (Actions, Monétaire…) avec compte. */
export async function getClassifications(): Promise<{ name: string; count: number }[]> {
  try {
    const { data } = await supabaseAnon
      .from("funds")
      .select("classification")
      .eq("is_active", true)
      .eq("type", "OPCVM")
      .not("classification", "is", null);
    const counts = new Map<string, number>();
    for (const row of (data ?? []) as { classification: string }[]) {
      const k = row.classification.trim();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

/** Perf history d'un fonds. */
export interface PerfPoint {
  date: string;
  nav: number | null;
  perf_ytd: number | null;
  perf_1y: number | null;
}

export async function getFundHistory(fundId: string): Promise<PerfPoint[]> {
  try {
    const { data } = await supabaseAnon
      .from("fund_performance_history")
      .select("date,nav,perf_ytd,perf_1y")
      .eq("fund_id", fundId)
      .order("date", { ascending: true });
    return (data as PerfPoint[]) ?? [];
  } catch {
    return [];
  }
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
