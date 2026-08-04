"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { authInputClass } from "../_components/AuthShell";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/espace-client";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Identifiants incorrects. Vérifiez votre email et votre mot de passe.");
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
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
          autoComplete="username email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authInputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-soft">
            Mot de passe
          </label>
          <Link href="/espace-client/reset" className="text-xs text-gold-deep underline underline-offset-2 hover:text-gold">
            Oublié ?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={authInputClass}
        />
      </div>

      {error && (
        <p className="border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="dark" disabled={loading} className="w-full">
        {loading ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
