import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { parseOPCVMExcel, downloadTodayOPCVMFile } from "@/lib/services/opcvm-excel-parser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  const download = await downloadTodayOPCVMFile();
  if (!download) {
    return NextResponse.json(
      { success: false, error: "Fichier ASFIM introuvable (aujourd'hui/hier)" },
      { status: 404 }
    );
  }

  const parsed = await parseOPCVMExcel(download.buffer, download.fileName);

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

  for (const ex of parsed.funds) {
    let fund =
      (ex.isinCode && dbFunds!.find((f) => f.isin_code === ex.isinCode)) ||
      (ex.code && dbFunds!.find((f) => f.code === ex.code)) ||
      dbFunds!.find((f) => norm(f.name) === norm(ex.name));

    if (!fund) {
      results.notMatched++;
      continue;
    }
    results.matched++;

    const { error: perfError } = await supabaseAdmin.from("fund_performance_history").upsert(
      {
        fund_id: fund.id,
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
        updated_at: new Date().toISOString(),
      },
      { onConflict: "fund_id,date" }
    );
    if (perfError) {
      results.errors.push(`${fund.name}: ${perfError.message}`);
      continue;
    }

    await supabaseAdmin
      .from("funds")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", fund.id);
    results.upserted++;
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
