import { ImageResponse } from "next/og";
import { getFundBySlug, getAllFundSlugs } from "@/lib/funds";
import { formatPct } from "@/lib/format";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Fiche OPCVM — Messidor Patrimoine";

export async function generateStaticParams() {
  // Ne prérend qu'une poignée de fiches pour éviter de générer ~600 images au build ;
  // le reste est rendu à la demande.
  const slugs = await getAllFundSlugs();
  return slugs.slice(0, 20).map((slug) => ({ slug }));
}

/** Réduit la taille de police pour les noms longs. */
function titleSize(name: string): number {
  const len = name.length;
  if (len <= 28) return 72;
  if (len <= 40) return 60;
  if (len <= 55) return 50;
  if (len <= 75) return 42;
  return 36;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fund = await getFundBySlug(slug);

  const eyebrow = fund
    ? `OPCVM${fund.classification ? ` · ${fund.classification}` : ""}`
    : "OPCVM";
  const name = fund?.name ?? "Fonds OPCVM";
  const ytdRaw = fund?.ytd_performance;
  const hasYtd = ytdRaw != null && !Number.isNaN(ytdRaw);
  const ytdColor = !hasYtd ? "#B9C2CE" : ytdRaw! < 0 ? "#E0776B" : "#CBA85E";
  const footerLeft = fund?.management_company ?? "OPCVM marocain";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "linear-gradient(135deg, #091320 0%, #0E1A2B 100%)",
          color: "#F6F2EA",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#CBA85E",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: titleSize(name),
            marginTop: 26,
            lineHeight: 1.05,
            maxWidth: 1020,
            display: "flex",
          }}
        >
          {name}
        </div>
        <div style={{ height: 2, width: 120, background: "#B08A3E", marginTop: 36 }} />
        <div
          style={{
            fontSize: 56,
            marginTop: 32,
            color: ytdColor,
            display: "flex",
          }}
        >
          {hasYtd ? `YTD ${formatPct(ytdRaw)}` : "Performance N/D"}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 48,
            fontSize: 26,
            color: "#B9C2CE",
          }}
        >
          <div style={{ display: "flex", maxWidth: 700, overflow: "hidden" }}>{footerLeft}</div>
          <div style={{ display: "flex", color: "#CBA85E", letterSpacing: 4, textTransform: "uppercase" }}>
            Messidor Patrimoine
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
