import type { Metadata } from "next";
import { Check, ArrowRight } from "lucide-react";
import { getFunds } from "@/lib/funds";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { FundCard } from "@/components/opcvm/FundCard";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "OPCI au Maroc — Investir dans l'immobilier (pierre-papier) 2025",
  description:
    "Tout comprendre sur les OPCI au Maroc : définition, avantages, fiscalité et comparaison avec l'immobilier direct. Investissez dans l'immobilier professionnel via la pierre-papier avec Messidor Patrimoine.",
  path: "/opci",
});

const ADVANTAGES = [
  {
    title: "Accessibilité",
    body: "Investissez dans l'immobilier professionnel de qualité (bureaux, commerces, logistique) avec un ticket d'entrée bien inférieur à un achat en direct.",
  },
  {
    title: "Mutualisation du risque",
    body: "Votre épargne est répartie sur un portefeuille diversifié d'actifs et de locataires, ce qui réduit le risque de vacance et de défaut.",
  },
  {
    title: "Gestion déléguée",
    body: "La société de gestion, agréée par l'AMMC, s'occupe de tout : acquisition, location, entretien, arbitrages. Vous percevez des revenus sans contrainte de gestion.",
  },
  {
    title: "Revenus réguliers",
    body: "Les OPCI ont l'obligation de distribuer l'essentiel de leurs revenus locatifs, offrant un rendement potentiel régulier à leurs porteurs de parts.",
  },
  {
    title: "Liquidité améliorée",
    body: "Céder des parts d'OPCI est structurellement plus simple et plus rapide que de vendre un bien immobilier détenu en direct.",
  },
  {
    title: "Cadre réglementé",
    body: "Les OPCI sont encadrés par la loi 70-14 et supervisés par l'AMMC, avec un dépositaire et un valorisateur indépendants garantissant la transparence.",
  },
];

const COMPARISON = [
  {
    crit: "Ticket d'entrée",
    opci: "Réduit — accès mutualisé",
    direct: "Élevé — prix du bien entier",
  },
  {
    crit: "Diversification",
    opci: "Portefeuille multi-actifs",
    direct: "Concentré sur un seul bien",
  },
  {
    crit: "Gestion",
    opci: "Déléguée à un professionnel",
    direct: "À la charge du propriétaire",
  },
  {
    crit: "Liquidité",
    opci: "Cession de parts facilitée",
    direct: "Vente longue et incertaine",
  },
  {
    crit: "Revenus",
    opci: "Distribution régulière obligatoire",
    direct: "Loyers nets de charges et vacance",
  },
];

const FAQ = [
  {
    q: "Qu'est-ce qu'un OPCI au Maroc ?",
    a: "Un OPCI (Organisme de Placement Collectif Immobilier) est un véhicule d'investissement réglementé, encadré par la loi 70-14 et supervisé par l'AMMC, qui permet d'investir collectivement dans l'immobilier professionnel (bureaux, commerces, logistique). L'investisseur détient des parts et perçoit une quote-part des revenus locatifs, sans avoir à gérer les biens directement — c'est le principe de la « pierre-papier ».",
  },
  {
    q: "Quels sont les avantages d'un OPCI par rapport à l'immobilier direct ?",
    a: "L'OPCI offre un ticket d'entrée réduit, une diversification du risque sur plusieurs actifs et locataires, une gestion entièrement déléguée à une société de gestion agréée, une meilleure liquidité que l'immobilier détenu en direct, et un cadre réglementaire transparent avec dépositaire et valorisateur indépendants.",
  },
  {
    q: "Quelle est la fiscalité des OPCI au Maroc ?",
    a: "Les OPCI bénéficient d'un régime fiscal attractif prévu par le législateur pour encourager l'investissement immobilier collectif, notamment une exonération d'impôt au niveau du véhicule sous conditions de distribution. La fiscalité applicable aux revenus et plus-values dépend du profil de l'investisseur (personne physique ou morale, résident ou non-résident). Nos conseillers réalisent une analyse personnalisée de votre situation.",
  },
  {
    q: "Quel montant minimum pour investir dans un OPCI ?",
    a: "Le montant minimum varie selon le fonds et sa société de gestion. Certains OPCI destinés aux investisseurs institutionnels ont des tickets élevés, tandis que d'autres véhicules sont plus accessibles. Messidor Patrimoine vous oriente vers les OPCI adaptés à votre capacité et à vos objectifs d'investissement.",
  },
  {
    q: "Comment investir dans un OPCI avec Messidor Patrimoine ?",
    a: "Nous réalisons un bilan de votre situation, définissons la part immobilière optimale de votre allocation, sélectionnons les OPCI les plus pertinents et vous accompagnons dans la souscription ainsi que dans le suivi. Prenez rendez-vous pour un premier échange sans engagement.",
  },
];

export default async function OpciPage() {
  const funds = await getFunds({ type: "OPCI" });

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const itemList =
    funds.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "OPCI Maroc",
          numberOfItems: funds.length,
          itemListElement: funds.map((f, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: f.slug ? absoluteUrl(`/opcvm/${f.slug}`) : undefined,
            name: f.name,
          })),
        }
      : null;

  return (
    <>
      <JsonLd
        data={[
          faqPage,
          ...(itemList ? [itemList] : []),
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "OPCI", path: "/opci" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Immobilier · Pierre-papier · Maroc"
        title="OPCI : investir dans l'immobilier autrement"
        intro="Les OPCI ouvrent l'accès à l'immobilier professionnel marocain sans les contraintes de la détention directe. Comprenez leur fonctionnement, leurs avantages et leur fiscalité — puis investissez accompagné."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "OPCI", href: "/opci" },
        ]}
      />

      {/* Qu'est-ce qu'un OPCI */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">Définition</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              Qu'est-ce qu'un OPCI ?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
              <p>
                Un <strong className="font-semibold text-navy">OPCI</strong> — Organisme de Placement
                Collectif Immobilier — est un véhicule d'investissement réglementé qui permet de
                détenir de l'immobilier professionnel (bureaux, commerces, plateformes logistiques) à
                travers des parts. C'est ce qu'on appelle la « pierre-papier » : vous investissez dans
                la pierre, mais sous la forme d'un actif financier liquide.
              </p>
              <p>
                Introduits par la <strong className="font-semibold text-navy">loi 70-14</strong> et
                supervisés par l'<strong className="font-semibold text-navy">AMMC</strong>, les OPCI
                mutualisent l'épargne de nombreux investisseurs pour acquérir et gérer un portefeuille
                d'actifs immobiliers. La gestion est confiée à une société agréée, avec l'intervention
                d'un dépositaire et d'un valorisateur indépendants.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Avantages */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-deep">Pourquoi investir</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Les avantages des OPCI
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ADVANTAGES.map((a, i) => (
              <Reveal key={a.title} delay={(i % 3) * 0.08}>
                <article className="flex h-full flex-col border border-slate/50 bg-cream p-8">
                  <h3 className="font-display text-xl leading-tight text-navy">{a.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-soft">{a.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OPCI vs immobilier direct */}
      <section className="shell py-16 md:py-24">
        <Reveal>
          <p className="eyebrow text-gold-deep">Comparatif</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
            OPCI ou immobilier en direct ?
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 overflow-x-auto border border-slate/50">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-navy text-cream">
                  <th className="px-5 py-4 text-left font-semibold">Critère</th>
                  <th className="px-5 py-4 text-left font-semibold text-gold-light">OPCI</th>
                  <th className="px-5 py-4 text-left font-semibold">Immobilier direct</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.crit} className={i % 2 ? "bg-cream-light" : "bg-cream"}>
                    <td className="border-b border-slate/40 px-5 py-4 font-medium text-navy">
                      {row.crit}
                    </td>
                    <td className="border-b border-slate/40 px-5 py-4 text-navy-soft">
                      <span className="inline-flex items-start gap-2">
                        <Check size={15} className="mt-0.5 shrink-0 text-gold-deep" />
                        {row.opci}
                      </span>
                    </td>
                    <td className="border-b border-slate/40 px-5 py-4 text-navy-mute">
                      {row.direct}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* Fonds OPCI ou bloc "bientôt" */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-deep">Les fonds</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              {funds.length > 0 ? "OPCI suivis par Messidor Patrimoine" : "Sélection OPCI"}
            </h2>
          </Reveal>

          {funds.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {funds.map((f) => (
                <FundCard key={f.id} fund={f} />
              ))}
            </div>
          ) : (
            <Reveal delay={0.1}>
              <div className="mt-10 border border-gold/40 bg-gold/8 p-10 text-center md:p-14">
                <p className="eyebrow text-gold-deep">Bientôt disponible</p>
                <h3 className="mx-auto mt-4 max-w-xl font-display text-2xl leading-tight text-navy md:text-3xl">
                  Notre sélection d'OPCI arrive prochainement
                </h3>
                <p className="mx-auto mt-4 max-w-lg text-navy-soft">
                  Le marché marocain des OPCI est en plein essor. En attendant la mise en ligne de
                  notre base, nos conseillers vous orientent dès aujourd'hui vers les fonds les plus
                  adaptés à votre profil.
                </p>
                <div className="mt-8 flex justify-center">
                  <ButtonLink href="/contact" variant="dark">
                    Nous consulter
                    <ArrowRight size={15} />
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">Questions fréquentes</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              Tout savoir sur les OPCI
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="divide-y divide-slate/40 border-y border-slate/40">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-lg text-navy">
                    <span>{f.q}</span>
                    <span
                      aria-hidden
                      className="mt-1 shrink-0 text-gold-deep transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-navy-soft leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-20 text-center md:py-28">
          <Reveal>
            <p className="eyebrow text-gold-deep">Passons à l'action</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-5xl">
              Intégrer l'immobilier à votre patrimoine
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-soft">
              Nos conseillers vous aident à définir la juste part d'immobilier dans votre allocation
              et à sélectionner les OPCI adaptés à vos objectifs.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/contact" variant="dark">
                Nous contacter
                <ArrowRight size={15} />
              </ButtonLink>
              <ButtonLink href={SITE.calendly} external variant="outline">
                Prendre rendez-vous
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
