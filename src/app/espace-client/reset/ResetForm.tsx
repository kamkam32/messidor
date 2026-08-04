"use client";

import { useMemo, useState, type FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { authInputClass } from "../_components/AuthShell";

export function ResetForm() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/espace-client`
          : undefined,
    });

    if (error) {
      setError(error.message || "Une erreur est survenue. Merci de réessayer.");
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="border border-slate bg-cream-light p-6">
        <p className="eyebrow text-gold-deep">Email envoyé</p>
        <p className="mt-3 text-sm leading-relaxed text-navy-soft">
          Si un compte est associé à cette adresse, vous recevrez un lien pour
          réinitialiser votre mot de passe.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-soft">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClass}
        />
      </div>

      {error && (
        <p className="border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="dark" disabled={loading} className="w-full">
        {loading ? "Envoi…" : "Envoyer le lien"}
      </Button>
    </form>
  );
}
