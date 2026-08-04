import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = {
  title: "Espace Client",
  robots: { index: false, follow: false },
};

const CARDS: { title: string; description: string; href: string }[] = [
  {
    title: "Base OPCVM",
    description: "Recherchez et filtrez tous les fonds OPCVM du marché marocain.",
    href: "/opcvm",
  },
  {
    title: "Comparateur OPCVM",
    description: "Confrontez performances, risque et frais de plusieurs fonds.",
    href: "/opcvm/comparateur",
  },
  {
    title: "Simulateurs",
    description: "Projetez vos investissements et estimez votre fiscalité 2025.",
    href: "/simulateurs",
  },
  {
    title: "Blog & analyses",
    description: "Nos décryptages sur les marchés et la gestion de patrimoine.",
    href: "/blog",
  },
];

export default async function EspaceClientPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Filet de sécurité (le proxy protège déjà cette route).
  if (!user) {
    redirect("/espace-client/connexion?next=/espace-client");
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* En-tête */}
      <section className="relative overflow-hidden bg-navy-deep text-cream">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(120% 90% at 80% 0%, rgba(176,138,62,0.16) 0%, transparent 55%)",
          }}
        />
        <div className="shell relative z-10 flex flex-col gap-6 pb-14 pt-32 md:flex-row md:items-end md:justify-between md:pb-16 md:pt-40">
          <div>
            <p className="eyebrow text-gold-light">Espace Client</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.06] tracking-[-0.015em] md:text-5xl">
              Bonjour
            </h1>
            <p className="mt-4 text-sm text-cream/70">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </section>

      {/* Contenu */}
      <section className="shell py-16 md:py-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col border border-slate bg-cream-light p-7 transition-colors hover:border-gold"
            >
              <h2 className="font-display text-xl leading-tight text-navy">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-soft">
                {card.description}
              </p>
              <span className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep transition-colors group-hover:text-gold">
                Ouvrir →
              </span>
            </Link>
          ))}
        </div>

        {/* Placeholder portefeuille */}
        <div className="mt-5 border border-dashed border-slate bg-cream p-8">
          <p className="eyebrow text-navy-mute">Bientôt</p>
          <h2 className="mt-3 font-display text-2xl leading-tight text-navy">
            Mon portefeuille / Mes investissements
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-soft">
            Le suivi personnalisé de vos investissements arrive prochainement dans
            votre espace. Vous pourrez y consolider vos positions et suivre leur
            performance.
          </p>
        </div>
      </section>
    </div>
  );
}
