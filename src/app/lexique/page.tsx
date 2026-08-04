import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/site/Reveal";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Lexique du patrimoine : OPCVM, OPCI, fiscalité — définitions | Messidor Patrimoine",
  description:
    "Définitions claires des termes de la gestion de patrimoine au Maroc : OPCVM, OPCI, VL, actif net, SICAV, FCP, AMMC, ASFIM, TPI, plus-value immobilière, IR, SRRI, benchmark, MASI, frais de gestion.",
  path: "/lexique",
});

export default function LexiquePage() {
  const terms = [...GLOSSARY].sort((a, b) =>
    a.term.localeCompare(b.term, "fr", { sensitivity: "base" })
  );

  const definedTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${absoluteUrl("/lexique")}#termset`,
    name: "Lexique du patrimoine — Messidor Patrimoine",
    description:
      "Glossaire des termes de la gestion de patrimoine, de l'investissement et de la fiscalité au Maroc.",
    url: absoluteUrl("/lexique"),
    inLanguage: "fr",
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${absoluteUrl(`/lexique/${t.slug}`)}#term`,
      name: t.term,
      description: t.short,
      url: absoluteUrl(`/lexique/${t.slug}`),
    })),
  };

  return (
    <>
      <PageHero
        eyebrow={`${GLOSSARY.length} définitions · Patrimoine & investissement`}
        title="Lexique du patrimoine"
        image="/images/heroes/editorial-navy.jpg"
        intro="Les mots-clés de la gestion de patrimoine, des OPCVM et de la fiscalité marocaine, définis simplement. Un repère pour comprendre nos analyses et décider en connaissance de cause."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "Lexique", href: "/lexique" },
        ]}
      />
      <JsonLd
        data={[
          definedTermSet,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Lexique", path: "/lexique" },
          ]),
        ]}
      />

      <section className="shell py-16 md:py-20">
        <Reveal>
          <div className="max-w-2xl border-l-2 border-gold pl-5">
            <p className="text-navy-soft">
              Chaque terme est défini dans son contexte marocain, à jour de la réglementation
              et de la fiscalité en vigueur. Cliquez sur une entrée pour la définition complète
              et les notions liées.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-px border border-slate/50 bg-slate/50 sm:grid-cols-2 lg:grid-cols-3">
          {terms.map((t, i) => (
            <Reveal key={t.slug} delay={Math.min(i * 0.03, 0.3)}>
              <Link
                href={`/lexique/${t.slug}`}
                className="group flex h-full flex-col bg-cream p-6 transition-colors hover:bg-cream-light"
              >
                <h2 className="font-display text-xl text-navy transition-colors group-hover:text-gold-deep">
                  {t.term}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-soft">{t.short}</p>
                <span className="eyebrow mt-5 text-gold-deep">Voir la définition →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
