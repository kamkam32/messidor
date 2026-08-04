import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SIMULATORS } from "@/lib/simulators";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Simulateurs fiscaux & patrimoniaux Maroc 2025 — gratuits",
  description:
    "Nos simulateurs gratuits : impôt sur le revenu (IR) 2025, plus-value immobilière (TPI), épargne & OPCVM, succession et bilan patrimonial. Estimations immédiates selon la fiscalité marocaine.",
  path: "/simulateurs",
});

const BREADCRUMB = [
  { name: "Accueil", href: "/" },
  { name: "Simulateurs", href: "/simulateurs" },
];

export default function SimulateursPage() {
  return (
    <>
      <PageHero
        eyebrow="Outils gratuits · Fiscalité marocaine 2025"
        title="Simulateurs patrimoniaux"
        intro="Cinq calculateurs pour estimer votre fiscalité, projeter votre épargne et faire le point sur votre patrimoine — en quelques secondes, sans inscription."
        breadcrumb={BREADCRUMB}
      />
      <JsonLd data={breadcrumbGraph(BREADCRUMB.map((b) => ({ name: b.name, path: b.href })))} />

      <section className="shell py-16 md:py-24">
        <div className="grid gap-px border border-slate bg-slate sm:grid-cols-2 lg:grid-cols-3">
          {SIMULATORS.map((sim, i) => {
            const Icon = sim.icon;
            return (
              <Reveal key={sim.slug} delay={i * 0.05}>
                <Link
                  href={`/simulateurs/${sim.slug}`}
                  className="group flex h-full flex-col bg-cream-light p-8 transition-colors hover:bg-cream"
                >
                  <span className="flex h-11 w-11 items-center justify-center border border-slate text-gold-deep transition-colors group-hover:border-gold group-hover:text-gold">
                    <Icon size={20} strokeWidth={1.6} />
                  </span>
                  <h2 className="mt-6 font-display text-xl leading-snug text-navy">
                    {sim.short}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-soft">
                    {sim.description}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-colors group-hover:text-gold-deep">
                    Ouvrir le simulateur
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-navy-mute">
          Les résultats sont fournis à titre indicatif, sur la base de la fiscalité marocaine
          2025. Ils ne constituent pas un conseil personnalisé. Pour une étude sur-mesure,
          échangez avec un conseiller Messidor Patrimoine.
        </p>
      </section>
    </>
  );
}
