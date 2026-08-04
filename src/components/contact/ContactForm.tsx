"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "sending" | "sent" | "error";

const SUBJECTS = [
  "Conseil patrimonial",
  "OPCVM",
  "OPCI",
  "Fiscalité",
  "Autre",
] as const;

const inputClass =
  "w-full border border-slate bg-cream px-3 py-3 text-sm text-navy outline-none transition-colors focus:border-gold";

function captureContext() {
  if (typeof window === "undefined") {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      referer: null,
      landing_url: null,
    };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    referer: document.referrer || null,
    landing_url: window.location.href,
  };
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      website: (data.get("website") as string) || "", // honeypot
      first_name: (data.get("first_name") as string) || "",
      last_name: (data.get("last_name") as string) || "",
      email: (data.get("email") as string) || "",
      phone: (data.get("phone") as string) || "",
      subject: (data.get("subject") as string) || "",
      message: (data.get("message") as string) || "",
      consent_marketing: data.get("consent_marketing") === "on",
      ...captureContext(),
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({ ok: false }));
      if (res.ok && json.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg(
          json?.error === "invalid_email"
            ? "Veuillez saisir une adresse email valide."
            : "Une erreur est survenue. Merci de réessayer."
        );
      }
    } catch {
      setStatus("error");
      setErrorMsg("Impossible d'envoyer le message. Vérifiez votre connexion.");
    }
  }

  if (status === "sent") {
    return (
      <div className="border border-slate bg-cream-light p-8">
        <p className="eyebrow text-gold-deep">Message reçu</p>
        <h3 className="mt-4 font-display text-2xl leading-tight text-navy">
          Merci, votre demande est bien enregistrée.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-navy-soft">
          Nous vous recontactons sous 24h. Pour un échange immédiat, vous pouvez
          aussi réserver un créneau ou nous écrire sur WhatsApp.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-navy-mute underline underline-offset-4 transition-colors hover:text-navy"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {/* Honeypot anti-spam : hors écran, non affiché aux utilisateurs. */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Ne pas remplir ce champ</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="first_name" className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-soft">
            Prénom
          </label>
          <input id="first_name" name="first_name" type="text" autoComplete="given-name" className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="last_name" className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-soft">
            Nom
          </label>
          <input id="last_name" name="last_name" type="text" autoComplete="family-name" className={inputClass} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-soft">
            Email <span className="text-gold-deep">*</span>
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-soft">
            Téléphone
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-soft">
          Sujet
        </label>
        <select id="subject" name="subject" defaultValue={SUBJECTS[0]} className={inputClass}>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-soft">
          Message
        </label>
        <textarea id="message" name="message" rows={5} className={`${inputClass} resize-y`} />
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed text-navy-soft">
        <input
          type="checkbox"
          name="consent_marketing"
          className="mt-1 h-4 w-4 shrink-0 accent-gold"
        />
        <span>
          J&apos;accepte de recevoir des conseils et informations de Messidor Patrimoine.
          Mes données restent confidentielles et ne sont jamais cédées à des tiers.
        </span>
      </label>

      {status === "error" && errorMsg && (
        <p className="border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {errorMsg}
        </p>
      )}

      <div>
        <Button type="submit" variant="dark" disabled={status === "sending"}>
          {status === "sending" ? "Envoi en cours…" : "Envoyer ma demande"}
        </Button>
      </div>
    </form>
  );
}
