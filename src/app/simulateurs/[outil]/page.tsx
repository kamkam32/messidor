import type { Metadata } from "next";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { SIMULATORS, getSimulator } from "@/lib/simulators";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";

import { ImpotRevenuCalc } from "@/components/simulateurs/ImpotRevenuCalc";
import { PlusValueTpiCalc } from "@/components/simulateurs/PlusValueTpiCalc";
import { EpargneOpcvmCalc } from "@/components/simulateurs/EpargneOpcvmCalc";
import { SuccessionCalc } from "@/components/simulateurs/SuccessionCalc";
import { BilanPatrimonialCalc } from "@/components/simulateurs/BilanPatrimonialCalc";

export const revalidate = 3600;

type Params = { outil: string };

const CALCULATORS: Record<string, ComponentType> = {
  "impot-revenu-maroc": ImpotRevenuCalc,
  "plus-value-immobiliere-tpi": PlusValueTpiCalc,
  "epargne-opcvm": EpargneOpcvmCalc,
  succession: SuccessionCalc,
  "bilan-patrimonial": BilanPatrimonialCalc,
};

const FAQ: Record<string, { q: string; a: string }[]> = {
  "impot-revenu-maroc": [
    {
      q: "Quel est le barème de l'IR au Maroc en 2025 ?",
      a: "Le barème 2025 comporte cinq tranches : 0 % jusqu'à 40 000 MAD, 10 % de 40 001 à 60 000, 20 % de 60 001 à 80 000, 34 % de 80 001 à 180 000 et 37 % au-delà de 180 000 MAD.",
    },
    {
      q: "Comment est calculé le revenu imposable ?",
      a: "On part du revenu brut annuel duquel on retranche les déductions admises (frais professionnels, charges familiales, cotisations sociales et de retraite, intérêts de prêt logement). L'impôt s'applique ensuite au revenu net imposable par tranches successives.",
    },
    {
      q: "Le simulateur remplace-t-il ma déclaration fiscale ?",
      a: "Non. Il fournit une estimation indicative. Votre situation réelle peut dépendre de retenues à la source, de revenus catégoriels multiples ou d'un régime professionnel spécifique.",
    },
  ],
  "plus-value-immobiliere-tpi": [
    {
      q: "Comment se calcule la TPI au Maroc ?",
      a: "La TPI est égale à 20 % de la plus-value imposable (prix de vente diminué du prix de revient réévalué et des abattements). Elle ne peut être inférieure à la cotisation minimale de 3 % du prix de vente.",
    },
    {
      q: "Quels abattements s'appliquent selon la durée de détention ?",
      a: "Au-delà de la 5ᵉ année, un abattement de 3 % par année supplémentaire s'applique sur la plus-value, plafonné à 20 %.",
    },
    {
      q: "La résidence principale est-elle exonérée de TPI ?",
      a: "Oui, la vente de la résidence principale occupée depuis au moins 6 ans est exonérée si le prix de cession n'excède pas 4 000 000 MAD. Au-delà, une taxation de 3 % s'applique sur la fraction excédentaire.",
    },
  ],
  "epargne-opcvm": [
    {
      q: "Comment est imposée la plus-value d'un OPCVM au Maroc ?",
      a: "Les plus-values réalisées sur les OPCVM actions et diversifiés sont soumises à un prélèvement de 15 %. Les produits de placements à revenu fixe (obligataires, comptes sur livret) sont imposés à 20 %.",
    },
    {
      q: "Le simulateur tient-il compte des intérêts composés ?",
      a: "Oui. Chaque année, les gains nets d'impôt sont réinvestis et s'ajoutent au capital, qui produit à son tour des intérêts l'année suivante.",
    },
    {
      q: "Les rendements affichés sont-ils garantis ?",
      a: "Non. Les taux proposés sont des moyennes indicatives par classe d'actifs. Les performances passées ne préjugent pas des performances futures.",
    },
  ],
  succession: [
    {
      q: "Comment est réparti l'héritage selon la Moudawana ?",
      a: "Le conjoint reçoit 1/8 en présence d'enfants (1/4 sinon), les parents 1/6 en présence d'enfants (1/3 sinon), puis le reste est partagé entre les enfants à raison de deux parts par garçon et une part par fille.",
    },
    {
      q: "Ce simulateur couvre-t-il toutes les situations successorales ?",
      a: "Non. Il s'agit d'un calcul simplifié des cas les plus fréquents. Les configurations particulières (frères et sœurs, legs, dettes de la succession) requièrent l'avis d'un notaire ou d'un adoul.",
    },
  ],
  "bilan-patrimonial": [
    {
      q: "Qu'est-ce que le patrimoine net ?",
      a: "C'est la différence entre l'ensemble de vos actifs (liquidités, placements, immobilier, autres biens) et vos passifs (crédit immobilier et autres emprunts).",
    },
    {
      q: "Quel ratio d'endettement est considéré comme sain ?",
      a: "En règle générale, un ratio d'endettement (passifs / actifs) inférieur à 50 % est considéré comme sain. Au-delà, la structure patrimoniale mérite une attention particulière.",
    },
  ],
};

export function generateStaticParams(): Params[] {
  return SIMULATORS.map((s) => ({ outil: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { outil } = await params;
  const sim = getSimulator(outil);
  if (!sim) return buildMetadata({ title: "Simulateur introuvable" });
  return {
    ...buildMetadata({
      title: `${sim.title} — Simulateur gratuit`,
      description: sim.description,
      path: `/simulateurs/${sim.slug}`,
    }),
    keywords: sim.keywords,
  };
}

export default async function SimulateurOutilPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { outil } = await params;
  const sim = getSimulator(outil);
  if (!sim) notFound();

  const Calculator = CALCULATORS[sim.slug];
  const faqs = FAQ[sim.slug] ?? [];

  const breadcrumb = [
    { name: "Accueil", href: "/" },
    { name: "Simulateurs", href: "/simulateurs" },
    { name: sim.short, href: `/simulateurs/${sim.slug}` },
  ];

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: sim.title,
    description: sim.description,
    url: absoluteUrl(`/simulateurs/${sim.slug}`),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    inLanguage: "fr",
    keywords: sim.keywords.join(", "),
    offers: { "@type": "Offer", price: 0, priceCurrency: "MAD" },
    provider: { "@type": "FinancialService", name: SITE.name, url: SITE.url },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // Guide "HowTo" généré génériquement à partir du simulateur (surface de réponse IA / GEO).
  const howToSteps = [
    {
      name: "Renseigner vos données",
      text: `Saisissez les informations demandées par le simulateur « ${sim.short} » (montants, durée, situation) directement dans le formulaire.`,
    },
    {
      name: "Lancer le calcul",
      text: "Le résultat se met à jour automatiquement à partir des règles et barèmes en vigueur au Maroc. Aucune inscription n'est requise.",
    },
    {
      name: "Lire et interpréter le résultat",
      text: `Consultez l'estimation fournie par le simulateur ${sim.title} : elle donne un ordre de grandeur indicatif, à affiner selon votre situation réelle.`,
    },
    {
      name: "Être accompagné par un conseiller",
      text: "Transformez cette estimation en stratégie : un conseiller Messidor Patrimoine analyse votre situation et vous accompagne de façon personnalisée.",
    },
  ];

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `Comment calculer ${sim.short.toLowerCase()} avec le simulateur Messidor`,
    description: sim.description,
    inLanguage: "fr",
    totalTime: "PT2M",
    step: howToSteps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: absoluteUrl(`/simulateurs/${sim.slug}#etape-${i + 1}`),
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="Simulateur gratuit · Fiscalité 2025"
        title={sim.title}
        intro={sim.description}
        breadcrumb={breadcrumb}
      />
      <JsonLd
        data={[
          webApp,
          faqSchema,
          howTo,
          breadcrumbGraph(breadcrumb.map((b) => ({ name: b.name, path: b.href }))),
        ]}
      />

      <section className="shell py-16 md:py-20">
        <Calculator />
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="border-t border-slate bg-cream-light py-16 md:py-20">
          <div className="shell">
            <Reveal>
              <p className="eyebrow text-gold-deep">Questions fréquentes</p>
              <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
                Ce qu&apos;il faut savoir
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-px border border-slate bg-slate md:grid-cols-2">
              {faqs.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.05}>
                  <div className="h-full bg-cream-light p-8">
                    <h3 className="font-display text-lg leading-snug text-navy">{f.q}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy-soft">{f.a}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lead CTA */}
      <section className="bg-navy-deep py-20 text-cream md:py-28">
        <div className="shell">
          <Reveal>
            <p className="eyebrow text-gold-light">Aller plus loin</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight md:text-5xl">
              Transformez cette estimation en stratégie
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/75">
              Un simulateur donne un ordre de grandeur. Un conseiller Messidor Patrimoine
              construit avec vous une stratégie fiscale et d&apos;investissement sur-mesure,
              adaptée au marché marocain.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/contact" variant="gold">
                Prendre contact
              </ButtonLink>
              <ButtonLink href={SITE.calendly} variant="outline-light" external>
                Réserver un rendez-vous
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
