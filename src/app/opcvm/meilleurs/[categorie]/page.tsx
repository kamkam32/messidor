import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFunds, getClassifications, slugify } from "@/lib/funds";
import { getCategoryContent } from "@/lib/opcvm-categories";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";
import { RankingTable, formatMethodologyDate, maxUpdatedAt } from "../_components/RankingTable";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const cats = await getClassifications();
  return cats.filter((c) => c.count >= 2).map((c) => ({ categorie: slugify(c.name) }));
}

async function resolve(categorie: string) {
  const [funds, cats] = await Promise.all([getFunds({ type: "OPCVM" }), getClassifications()]);
  const cat = cats.find((c) => slugify(c.name) === categorie);
  const matched = funds
    .filter((f) => f.classification && slugify(f.classification) === categorie)
    .sort((a, b) => (b.ytd_performance ?? -Infinity) - (a.ytd_performance ?? -Infinity));
  return { cat, matched, label: cat?.name };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string }>;
}): Promise<Metadata> {
  const { categorie } = await params;
  const { matched, label } = await resolve(categorie);
  const content = getCategoryContent(categorie, label);
  if (matched.length === 0) {
    return buildMetadata({
      title: "Catégorie introuvable",
      path: `/opcvm/meilleurs/${categorie}`,
    });
  }
  return buildMetadata({
    title: `Meilleurs OPCVM ${content.label.replace(/^OPCVM\s+/i, "")} 2026 — Classement & performances`,
    description: `Classement des meilleurs ${content.label.toLowerCase()} du Maroc en 2026 : ${matched.length} fonds triés par performance YTD, avec 1 an, 3 ans, société de gestion et risque. Données ASFIM.`,
    path: `/opcvm/meilleurs/${categorie}`,
  });
}

export default async function MeilleursCategoriePage({
  params,
}: {
  params: Promise<{ categorie: string }>;
}) {
  const { categorie } = await params;
  const { matched, label } = await resolve(categorie);
  if (matched.length === 0) notFound();

  const content = getCategoryContent(categorie, label);
  const shortLabel = content.label.replace(/^OPCVM\s+/i, "");
  const top20 = matched.slice(0, 20);
  const dateLabel = formatMethodologyDate(maxUpdatedAt(matched));

  const breadcrumb = [
    { name: "Accueil", path: "/" },
    { name: "OPCVM", path: "/opcvm" },
    { name: "Meilleurs OPCVM", path: "/opcvm/meilleurs" },
    { name: content.label, path: `/opcvm/meilleurs/${categorie}` },
  ];

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Meilleurs ${content.label} Maroc 2026`,
    numberOfItems: top20.length,
    itemListElement: top20.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: f.slug ? absoluteUrl(`/opcvm/${f.slug}`) : undefined,
      name: f.name,
    })),
  };

  const faq = [
    {
      q: `Quel est le meilleur ${content.label.toLowerCase()} au Maroc en 2026 ?`,
      a: `Le classement ci-dessus trie les ${content.label.toLowerCase()} actifs par performance depuis le début de l'année. Le fonds en tête affiche la meilleure performance YTD, mais le « meilleur » fonds pour vous dépend de votre horizon de placement et de votre tolérance au risque. ${content.risk}`,
    },
    {
      q: `Comment sont classés les ${content.label.toLowerCase()} ?`,
      a: `Les fonds de la catégorie sont classés par performance depuis le début de l'année (YTD), du plus élevé au plus faible. Les performances sur 1 an et 3 ans ainsi que le niveau de risque (SRRI) sont affichés pour une comparaison au-delà du seul court terme. Les performances passées ne préjugent pas des performances futures.`,
    },
  ];
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <PageHero
        eyebrow={`Classement 2026 · ${matched.length} fonds`}
        title={`Meilleurs OPCVM ${shortLabel} du Maroc`}
        intro={content.intro}
        breadcrumb={breadcrumb.map((b) => ({ name: b.name, href: b.path }))}
      />
      <JsonLd data={[itemList, faqLd, breadcrumbGraph(breadcrumb)]} />

      <section className="shell py-16 md:py-20">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-gold-deep">Classement · Performance YTD</p>
              <h2 className="mt-3 font-display text-2xl text-navy md:text-3xl">
                Les meilleurs {content.label.toLowerCase()}
              </h2>
            </div>
            <ButtonLink href="/contact" variant="dark">
              Être conseillé
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8">
            <RankingTable funds={top20} />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6 max-w-3xl border-l-2 border-gold pl-5 text-sm leading-relaxed text-navy-soft">
            <p>{content.risk}</p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-6 max-w-3xl border-l-2 border-slate/60 pl-5 text-sm leading-relaxed text-navy-soft">
            <p className="eyebrow mb-2 text-navy-mute">Méthodologie</p>
            <p>
              Classement établi le {dateLabel} à partir des données ASFIM (Association des Sociétés de
              Gestion et Fonds d&apos;Investissement Marocains). Les {content.label.toLowerCase()}{" "}
              actifs sont triés par performance depuis le début de l&apos;année (YTD). Les performances
              passées ne préjugent pas des performances futures. Ce classement est informatif et ne
              constitue pas un conseil en investissement personnalisé.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-8">
            <ButtonLink href="/opcvm/meilleurs" variant="outline">
              Voir tous les meilleurs OPCVM
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16">
          <p className="eyebrow text-gold-deep">Questions fréquentes</p>
          <h2 className="mt-3 font-display text-2xl text-navy md:text-3xl">
            Meilleurs {content.label.toLowerCase()} — vos questions
          </h2>
          <div className="mt-8 max-w-3xl divide-y divide-slate/50 border-y border-slate/50">
            {faq.map((f) => (
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
          Besoin d&apos;aide pour choisir un {content.label.toLowerCase()} ?
        </h2>
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
