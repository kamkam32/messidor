import { NextResponse, type NextRequest } from "next/server";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const INDEXNOW_KEY = "923e7b9733e60e7caecc8dbf513adb36";

/**
 * Soumet toutes les URLs du sitemap à IndexNow (Bing, Yandex, et moteurs
 * partenaires — indexation quasi-instantanée). Sécurisé par CRON_SECRET.
 * À rappeler après chaque publication importante de contenu.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const host = new URL(SITE.url).host;

  // Récupère les URLs depuis le sitemap
  let urls: string[] = [];
  try {
    const res = await fetch(`${SITE.url}/sitemap.xml`, { cache: "no-store" });
    const xml = await res.text();
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  } catch (e) {
    return NextResponse.json(
      { success: false, error: `sitemap fetch: ${e instanceof Error ? e.message : e}` },
      { status: 500 }
    );
  }

  if (urls.length === 0) {
    return NextResponse.json({ success: false, error: "Aucune URL dans le sitemap" }, { status: 404 });
  }

  // Soumission par lots de 10 000 (limite IndexNow)
  const results: { batch: number; status: number }[] = [];
  for (let i = 0; i < urls.length; i += 10000) {
    const batch = urls.slice(i, i + 10000);
    const resp = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE.url}/${INDEXNOW_KEY}.txt`,
        urlList: batch,
      }),
    });
    results.push({ batch: i / 10000, status: resp.status });
  }

  return NextResponse.json({
    success: true,
    host,
    submitted: urls.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
