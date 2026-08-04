import { ImageResponse } from "next/og";
import { getPostBySlug, getPostSlugs } from "@/lib/blog";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Article — Messidor Patrimoine";

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

/** Réduit la taille de police pour les titres longs. */
function titleSize(title: string): number {
  const len = title.length;
  if (len <= 30) return 74;
  if (len <= 50) return 62;
  if (len <= 75) return 52;
  if (len <= 100) return 44;
  return 38;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const eyebrow = post?.category?.trim() || "Article";
  const title = post?.title || "Article";

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
            fontSize: titleSize(title),
            marginTop: 26,
            lineHeight: 1.08,
            maxWidth: 1020,
            display: "flex",
          }}
        >
          {title}
        </div>
        <div style={{ height: 2, width: 120, background: "#B08A3E", marginTop: 40 }} />
        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 26,
            color: "#CBA85E",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Messidor Patrimoine · Blog
        </div>
      </div>
    ),
    { ...size }
  );
}
