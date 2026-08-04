import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFunds, getClassifications, slugify } from "@/lib/funds";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";
import { RankingTable, formatMethodologyDate, maxUpdatedAt } from "./_components/RankingTable";

export const revalidate = 3600;

const TITLE = "Meilleurs OPCVM du Maroc 2026 — Classement par performance";
const DESCRIPTION =
  "Classement des meilleurs OPCVM du Maroc en 2026 : top 20 des fonds triés par performance YTD, avec performances 1 an, 3 ans, société de gestion et niveau de risque. Données ASFIM.";

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/opcvm/meilleurs",
});

const FAQ = [
  {
    q: "Quel est le meilleur OPCVM au Maroc en 2026 ?",
    a: "Le meilleur OPCVM dépend de votre objectif et de votre horizon. En performance brute depuis le début de l'année, le classement est mené par les fonds Actions les plus dynamiques ; pour une trésorerie sécurisée, ce sont les fonds monétaires qui priment. Notre classement ci-dessus trie les OPCVM par performance YTD, mais le « meilleur » fonds reste celui adapté à votre profil de risque.",
  },
  {
    q: "Comment sont classés les OPCVM dans ce comparatif ?",
    a: "Les fonds actifs sont classés par performance depuis le début de l'année (YTD), du plus élevé au plus faible. Nous affichons également les performances sur 1 an et 3 ans ainsi que le niveau de risque (échelle SRRI de 1 à 7) pour permettre une lecture au-delà de la seule performance de court terme.",
  },
  {
    q: "La performance passée garantit-elle les résultats futurs ?",
    a: "Non. Les performances passées ne préjugent pas des performances futures. Un OPCVM en tête du classement une année peut sous-performer la suivante. La performance doit toujours être analysée en regard du risque, des frais et de la régularité du fonds sur plusieurs années.",
  },
];

export default async function MeilleursOpcvmPage() {
  const [funds, cats] = await Promise.all([
    getFunds({ type: "OPCVM" }),
    getClassifications(),
  ]);

  const ranked = [...funds].sort(
    (a, b) => (b.ytd_performance ?? -Infinity) - (a.ytd_performance ?? -Infinity)
  );
  const top20 = ranked.slice(0, 20);
  const dateLabel = formatMethodologyDate(maxUpdatedAt(funds));

  const breadcrumb = [
    { name: "Accueil", path: "/" },
    { name: "OPCVM", path: "/opcvm" },
    { name: "Meilleurs OPCVM", path: "/opcvm/meilleurs" },
  ];

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Meilleurs OPCVM du Maroc 2026",
    numberOfItems: top20.length,
    itemListElement: top20.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: f.slug ? absoluteUrl(`/opcvm/${f.slug}`) : undefined,
      name: f.name,
    })),
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const eligibleCats = cats.filter((c) => c.count >= 2);

  return (
    <>
      <PageHero
        eyebrow={`Classement 2026 · ${funds.length} OPCVM analysés`}
        title="Meilleurs OPCVM du Maroc 2026"
        image="/images/heroes/abstract-finance.jpg"
        intro="Le classement des OPCVM marocains les plus performants, triés par rendement depuis le début de l'année. Performances 1 an et 3 ans, société de gestion et niveau de risque pour chaque fonds — mis à jour à partir des données ASFIM."
        breadcrumb={breadcrumb.map((b) => ({ name: b.name, href: b.path }))}
      />
      <JsonLd data={[itemList, faqLd, breadcrumbGraph(breadcrumb)]} />

      <section className="shell py-16 md:py-20">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-gold-deep">Top 20 · Performance YTD</p>
              <h2 className="mt-3 font-display text-2xl text-navy md:text-3xl">
                Le classement des meilleurs OPCVM
              </h2>
            </div>
            <ButtonLink href="/contact" variant="dark">
              Être conseillé
            </ButtonLink>
          </div>
        </Reveal>

        {top20.length > 0 ? (
          <Reveal delay={0.05}>
            <div className="mt-8">
              <RankingTable funds={top20} />
            </div>
          </Reveal>
        ) : (
          <p className="mt-8 text-navy-soft">
            Le classement est momentanément indisponible. Contactez-nous pour une sélection à jour.
          </p>
        )}

        <Reveal delay={0.1}>
          <div className="mt-8 max-w-3xl border-l-2 border-gold pl-5 text-sm leading-relaxed text-navy-soft">
            <p className="eyebrow mb-2 text-navy-mute">Méthodologie</p>
            <p>
              Classement établi le {dateLabel} à partir des données ASFIM (Association des Sociétés de
              Gestion et Fonds d&apos;Investissement Marocains). Les OPCVM actifs sont triés par
              performance depuis le début de l&apos;année (YTD). Les performances passées ne préjugent
              pas des performances futures : un OPCVM doit toujours être apprécié au regard de son
              risque, de ses frais et de sa régularité. Ce classement est informatif et ne constitue
              pas un conseil en investissement personnalisé.
            </p>
          </div>
        </Reveal>
      </section>

      {eligibleCats.length > 0 && (
        <section className="border-t border-slate/40 bg-cream-light">
          <div className="shell py-16">
            <Reveal>
              <p className="eyebrow text-gold-deep">Par catégorie</p>
              <h2 className="mt-3 font-display text-2xl text-navy md:text-3xl">
                Meilleurs OPCVM par classification
              </h2>
              <p className="mt-4 max-w-2xl text-navy-soft">
                Consultez le classement détaillé des meilleurs fonds au sein de chaque grande famille
                d&apos;OPCVM : Actions, Monétaires, Obligataires, Diversifiés.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {eligibleCats.map((c, i) => (
                <Reveal key={c.name} delay={0.04 * (i % 3)}>
                  <Link
                    href={`/opcvm/meilleurs/${slugify(c.name)}`}
                    className="group flex items-center justify-between gap-3 border border-slate/50 bg-cream p-5 transition-colors hover:bg-cream-dark"
                  >
                    <span>
                      <span className="font-display text-lg text-navy transition-colors group-hover:text-gold-deep">
                        Meilleurs OPCVM {c.name}
                      </span>
                      <span className="mt-1 block text-xs uppercase tracking-wide text-navy-mute">
                        {c.count} fonds
                      </span>
                    </span>
                    <ArrowRight
                      size={16}
                      className="shrink-0 text-navy transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16">
          <p className="eyebrow text-gold-deep">Questions fréquentes</p>
          <h2 className="mt-3 font-display text-2xl text-navy md:text-3xl">
            Meilleurs OPCVM — ce qu&apos;il faut savoir
          </h2>
          <div className="mt-8 max-w-3xl divide-y divide-slate/50 border-y border-slate/50">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer list-none font-display text-lg text-navy">
                  {f.q}
                </summary>
                <p className="mt-3 text-navy-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-16 text-center">
        <div className="mx-auto h-px w-12 bg-gold" />
        <h2 className="mx-auto mt-8 max-w-2xl font-display text-2xl text-navy md:text-3xl">
          Quel OPCVM pour votre situation ?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-navy-soft">
          La performance ne fait pas tout. Nos conseillers vous aident à sélectionner les fonds
          adaptés à votre horizon, votre fiscalité et votre tolérance au risque.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/contact" variant="dark">
            Être conseillé
          </ButtonLink>
          <ButtonLink href={SITE.calendly} external variant="outline">
            Prendre rendez-vous
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
