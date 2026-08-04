import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Messidor Patrimoine — Gestion de patrimoine au Maroc";

export default function OpengraphImage() {
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
            fontSize: 30,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#CBA85E",
          }}
        >
          Messidor Patrimoine
        </div>
        <div style={{ fontSize: 68, marginTop: 28, lineHeight: 1.05, maxWidth: 900 }}>
          Gestion de patrimoine au Maroc
        </div>
        <div style={{ fontSize: 30, marginTop: 28, color: "#B9C2CE" }}>
          OPCVM · OPCI · Fiscalité · Simulateurs 2025
        </div>
        <div style={{ height: 2, width: 120, background: "#B08A3E", marginTop: 40 }} />
      </div>
    ),
    { ...size }
  );
}
