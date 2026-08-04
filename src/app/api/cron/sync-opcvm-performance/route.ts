import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { parseOPCVMExcel, downloadOPCVMFile } from "@/lib/services/opcvm-excel-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Cron quotidien : télécharge le fichier ASFIM du jour, parse, et met à jour
 * les perfs OPCVM (fund_performance_history + funds). Léger (fetch + xlsx),
 * aucun navigateur headless -> ne peut plus faire tomber la base.
 * Planifié dans vercel.json. Sécurisé par CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Service role non configuré" }, { status: 500 });
  }

  // Sur les 12 derniers jours, on récupère le fichier le PLUS COMPLET
  // (les fichiers du jour sont souvent vides ou partiels — seuls les fonds à
  //  VL quotidienne sont remplis ; le fichier hebdomadaire contient tout l'univers).
  // On s'arrête dès qu'un fichier "complet" (>= 400 fonds) est trouvé, sinon on
  // garde le plus fourni rencontré.
  type Parsed = { date: string; funds: import("@/lib/services/opcvm-excel-parser").OPCVMPerformanceData[] };
  let download: { buffer: Buffer; fileName: string; date: string } | null = null;
  let parsed: Parsed | null = null;
  const base = new Date();
  for (let i = 0; i <= 12; i++) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dl = await downloadOPCVMFile(d, "quotidien");
    if (!dl) continue;
    const p = await parseOPCVMExcel(dl.buffer, dl.fileName);
    if (p.funds.length === 0) continue;
    if (!parsed || p.funds.length > parsed.funds.length) {
      parsed = p;
      download = dl;
    }
    if (p.funds.length >= 400) break; // fichier complet
  }

  if (!download || !parsed) {
    return NextResponse.json(
      { success: false, error: "Aucun fichier ASFIM avec données sur les 12 derniers jours" },
      { status: 404 }
    );
  }

  // Archivage best-effort dans le bucket Storage
  try {
    await supabaseAdmin.storage
      .from("opcvm-archives")
      .upload(`${new Date().getFullYear()}/${download.fileName}`, download.buffer, {
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: true,
      });
  } catch {
    /* non bloquant */
  }

  const { data: dbFunds, error: fundsError } = await supabaseAdmin
    .from("funds")
    .select("id, code, name, isin_code");
  if (fundsError) {
    return NextResponse.json({ success: false, error: fundsError.message }, { status: 500 });
  }

  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const results = { matched: 0, upserted: 0, notMatched: 0, errors: [] as string[] };
  const now = new Date().toISOString();

  // Index de correspondance O(1)
  const byIsin = new Map<string, string>();
  const byCode = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const f of dbFunds!) {
    if (f.isin_code) byIsin.set(f.isin_code, f.id);
    if (f.code) byCode.set(f.code, f.id);
    if (f.name) byName.set(norm(f.name), f.id);
  }

  const historyRows: Record<string, unknown>[] = [];
  const fundUpdates: { id: string; values: Record<string, unknown> }[] = [];

  for (const ex of parsed.funds) {
    const fundId =
      (ex.isinCode && byIsin.get(ex.isinCode)) ||
      (ex.code && byCode.get(ex.code)) ||
      byName.get(norm(ex.name));
    if (!fundId) {
      results.notMatched++;
      continue;
    }
    results.matched++;
    historyRows.push({
      fund_id: fundId,
      date: parsed.date,
      nav: ex.nav,
      asset_value: ex.assetValue,
      perf_1d: ex.perf1d,
      perf_1w: ex.perf1w,
      perf_1m: ex.perf1m,
      perf_3m: ex.perf3m,
      perf_6m: ex.perf6m,
      perf_ytd: ex.perfYtd,
      perf_1y: ex.perf1y,
      perf_2y: ex.perf2y,
      perf_3y: ex.perf3y,
      perf_5y: ex.perf5y,
      source_file: download.fileName,
      updated_at: now,
    });
    fundUpdates.push({
      id: fundId,
      values: {
        nav: ex.nav,
        asset_value: ex.assetValue,
        perf_1d: ex.perf1d,
        perf_1w: ex.perf1w,
        perf_1m: ex.perf1m,
        perf_3m: ex.perf3m,
        perf_6m: ex.perf6m,
        ytd_performance: ex.perfYtd,
        perf_1y: ex.perf1y,
        perf_2y: ex.perf2y,
        perf_3y: ex.perf3y,
        perf_5y: ex.perf5y,
        updated_at: now,
      },
    });
  }

  // 1) Bulk upsert de l'historique (par lots de 500)
  for (let i = 0; i < historyRows.length; i += 500) {
    const chunk = historyRows.slice(i, i + 500);
    const { error } = await supabaseAdmin
      .from("fund_performance_history")
      .upsert(chunk, { onConflict: "fund_id,date" });
    if (error) results.errors.push(`history[${i}]: ${error.message}`);
  }

  // 2) Update des dernières valeurs sur funds (en parallèle, par lots de 25)
  for (let i = 0; i < fundUpdates.length; i += 25) {
    const chunk = fundUpdates.slice(i, i + 25);
    const res = await Promise.all(
      chunk.map((u) => supabaseAdmin!.from("funds").update(u.values).eq("id", u.id))
    );
    results.upserted += res.filter((r) => !r.error).length;
    res.forEach((r) => r.error && results.errors.push(r.error.message));
  }

  return NextResponse.json({
    success: true,
    date: parsed.date,
    fileName: download.fileName,
    totalParsed: parsed.funds.length,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
