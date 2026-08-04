import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFunds, getFundsCount, getClassifications, slugify } from "@/lib/funds";
import { getCategoryContent } from "@/lib/opcvm-categories";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { OpcvmExplorer } from "@/components/opcvm/OpcvmExplorer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/site/Reveal";

const OPCVM_FAQ = [
  {
    q: "Qu'est-ce qu'un OPCVM ?",
    a: "Un OPCVM (Organisme de Placement Collectif en Valeurs Mobilières) est un fonds qui collecte l'épargne de plusieurs investisseurs pour l'investir en actions, obligations ou instruments monétaires. Chaque investisseur détient des parts dont la valeur (VL) évolue avec le portefeuille du fonds.",
  },
  {
    q: "Quels sont les types d'OPCVM au Maroc ?",
    a: "On distingue principalement les OPCVM Actions, Obligataires (court terme OCT et moyen/long terme OMLT), Monétaires, Diversifiés et Contractuels. Chaque catégorie correspond à un couple rendement/risque différent.",
  },
  {
    q: "Comment sont calculées les performances des OPCVM ?",
    a: "Les performances proviennent des publications officielles de l'ASFIM et sont mises à jour chaque jour ouvré. Elles sont exprimées en pourcentage sur plusieurs horizons (YTD, 1 an, 3 ans, 5 ans) à partir de la valeur liquidative.",
  },
  {
    q: "Comment choisir un OPCVM ?",
    a: "Il faut aligner la catégorie du fonds avec votre horizon de placement et votre tolérance au risque, comparer les performances sur plusieurs périodes, le niveau de risque (SRRI 1 à 7) et les frais de gestion. Un conseiller Messidor peut vous aider à construire une allocation adaptée.",
  },
];

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "OPCVM Maroc 2025 — Comparateur & performances des fonds",
  description:
    "Comparez tous les fonds OPCVM du Maroc : performances YTD, 1 an et 3 ans, niveau de risque et société de gestion. Données actualisées quotidiennement.",
  path: "/opcvm",
});

export default async function OpcvmPage() {
  const [funds, count, classifications] = await Promise.all([
    getFunds({ type: "OPCVM" }),
    getFundsCount("OPCVM"),
    getClassifications(),
  ]);

  const categories = classifications.filter((c) => c.count >= 2);

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: OPCVM_FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const top = funds.slice(0, 10);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top OPCVM Maroc",
    numberOfItems: top.length,
    itemListElement: top.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: f.slug ? absoluteUrl(`/opcvm/${f.slug}`) : undefined,
      name: f.name,
    })),
  };

  return (
    <>
      <PageHero
        eyebrow={`${count}+ fonds suivis · Mise à jour quotidienne`}
        title="La base OPCVM du Maroc"
        intro="Recherchez, filtrez et comparez les fonds OPCVM marocains. Performances, risque et société de gestion — pour bâtir une allocation éclairée."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "OPCVM", href: "/opcvm" },
        ]}
      />
      <JsonLd data={[itemList, faqLd, breadcrumbGraph([
        { name: "Accueil", path: "/" },
        { name: "OPCVM", path: "/opcvm" },
      ])]} />

      {/* Explorer par catégorie */}
      {categories.length > 0 && (
        <section className="border-b border-slate/40 bg-cream-light">
          <div className="shell py-14">
            <p className="eyebrow text-gold-deep">Explorer par catégorie</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => {
                const slug = slugify(c.name);
                const content = getCategoryContent(slug, c.name);
                return (
                  <Link
                    key={c.name}
                    href={`/opcvm/categorie/${slug}`}
                    className="group flex items-center justify-between border border-slate/50 bg-cream p-5 transition-colors hover:bg-cream-light"
                  >
                    <span>
                      <span className="font-display text-lg text-navy group-hover:text-gold-deep">
                        {content.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-navy-mute">{c.count} fonds</span>
                    </span>
                    <ArrowRight size={16} className="text-navy-mute transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="shell py-16 md:py-20">
        <OpcvmExplorer funds={funds} />
      </section>

      {/* Contenu définitionnel + FAQ (SEO/GEO) */}
      <section className="border-t border-slate/40 bg-navy text-cream">
        <div className="shell py-16 md:py-20">
          <Reveal>
            <p className="eyebrow text-gold-light">Comprendre les OPCVM</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-tight md:text-4xl">
              Tout savoir sur les OPCVM au Maroc
            </h2>
          </Reveal>
          <div className="mt-10 max-w-3xl divide-y divide-cream/15 border-y border-cream/15">
            {OPCVM_FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer list-none font-display text-lg text-cream">
                  {f.q}
                </summary>
                <p className="mt-3 text-cream/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
