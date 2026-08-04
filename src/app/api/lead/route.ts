import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LeadBody = {
  website?: string; // honeypot
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  message?: string;
  subject?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referer?: string;
  landing_url?: string;
  consent_marketing?: boolean;
};

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t.slice(0, 4000) : null;
}

export async function POST(request: Request) {
  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot : un bot a rempli le champ "website" -> on répond OK sans rien insérer.
  if (str(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const email = str(body.email);
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const record = {
    email,
    first_name: str(body.first_name),
    last_name: str(body.last_name),
    phone: str(body.phone),
    message: str(body.message),
    subject: str(body.subject),
    source: "website",
    utm_source: str(body.utm_source),
    utm_medium: str(body.utm_medium),
    utm_campaign: str(body.utm_campaign),
    referer: str(body.referer),
    landing_url: str(body.landing_url),
    consent_marketing: body.consent_marketing === true,
    status: "new",
  };

  // Si le client service-role n'est pas configuré : on ne throw pas, on répond OK.
  if (!supabaseAdmin) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabaseAdmin.from("leads").insert(record);
  if (error) {
    // On ne divulgue pas le détail au client.
    console.error("[api/lead] insert error:", error.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  // Notification email (fire-and-forget) si Resend est configuré.
  if (process.env.RESEND_API_KEY) {
    void (async () => {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const name = [record.first_name, record.last_name].filter(Boolean).join(" ") || "—";
        await resend.emails.send({
          from: "Messidor <noreply@messidor-patrimoine.com>",
          to: SITE.email,
          replyTo: record.email,
          subject: `Nouveau lead — ${record.subject || "Contact"}`,
          text: [
            `Nom : ${name}`,
            `Email : ${record.email}`,
            `Téléphone : ${record.phone || "—"}`,
            `Sujet : ${record.subject || "—"}`,
            `Consentement marketing : ${record.consent_marketing ? "oui" : "non"}`,
            "",
            "Message :",
            record.message || "—",
            "",
            `Source : ${record.utm_source || "direct"} / ${record.utm_medium || "—"} / ${record.utm_campaign || "—"}`,
            `Landing : ${record.landing_url || "—"}`,
            `Referer : ${record.referer || "—"}`,
          ].join("\n"),
        });
      } catch (e) {
        console.error("[api/lead] resend error:", e);
      }
    })();
  }

  return NextResponse.json({ ok: true });
}
