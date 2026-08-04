"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/espace-client/connexion");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className="text-xs font-semibold uppercase tracking-[0.16em] text-cream/70 underline underline-offset-4 transition-colors hover:text-cream disabled:opacity-50"
    >
      {loading ? "Déconnexion…" : "Se déconnecter"}
    </button>
  );
}
