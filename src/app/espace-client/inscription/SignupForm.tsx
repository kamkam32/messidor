"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { authInputClass } from "../_components/AuthShell";

export function SignupForm() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"session" | "confirm" | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/espace-client`
            : undefined,
      },
    });

    if (error) {
      setError(error.message || "Une erreur est survenue lors de l'inscription.");
      setLoading(false);
      return;
    }

    // Si la confirmation email est désactivée, une session est déjà active.
    if (data.session) {
      setDone("session");
      router.push("/espace-client");
      router.refresh();
      return;
    }
    setDone("confirm");
    setLoading(false);
  }

  if (done === "confirm") {
    return (
      <div className="border border-slate bg-cream-light p-6">
        <p className="eyebrow text-gold-deep">Vérifiez votre boîte mail</p>
        <p className="mt-3 text-sm leading-relaxed text-navy-soft">
          Un email de confirmation vient de vous être envoyé. Cliquez sur le lien
          pour activer votre compte, puis connectez-vous.
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

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-soft">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={authInputClass}
        />
        <p className="text-xs text-navy-mute">8 caractères minimum.</p>
      </div>

      {error && (
        <p className="border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="dark" disabled={loading} className="w-full">
        {loading ? "Création…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
