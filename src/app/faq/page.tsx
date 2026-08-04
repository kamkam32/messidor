import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "FAQ — Gestion de patrimoine, OPCVM, OPCI & fiscalité au Maroc",
  description:
    "Toutes les réponses sur la gestion de patrimoine au Maroc : OPCVM, OPCI, fiscalité (IR, TPI, plus-values), épargne MRE et accompagnement Messidor Patrimoine. Questions fréquentes, réponses claires.",
  path: "/faq",
});

/**
 * Item de FAQ.
 * - `a` : réponse en texte brut, utilisée pour le JSON-LD (FAQPage).
 * - `body` : rendu enrichi optionnel (liens internes) pour l'affichage.
 *   Si absent, on affiche `a`.
 */
type FaqItem = { q: string; a: string; body?: ReactNode };
type FaqSection = { eyebrow: string; title: string; items: FaqItem[] };

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link href={href} className="font-medium text-gold-deep underline decoration-gold/40 underline-offset-2 transition-colors hover:text-navy">
    {children}
  </Link>
);

const SECTIONS: FaqSection[] = [
  {
    eyebrow: "Les fondamentaux",
    title: "Gestion de patrimoine",
    items: [
      {
        q: "Qu'est-ce que la gestion de patrimoine ?",
        a: "La gestion de patrimoine consiste à organiser, valoriser et transmettre l'ensemble de vos actifs (financiers, immobiliers, professionnels) en cohérence avec vos objectifs de vie, votre horizon de placement et votre tolérance au risque. Elle articule allocation d'actifs, optimisation fiscale, prévoyance et préparation de la transmission.",
        body: (
          <>
            La gestion de patrimoine consiste à organiser, valoriser et transmettre l'ensemble de
            vos actifs (financiers, immobiliers, professionnels) en cohérence avec vos objectifs de
            vie, votre horizon de placement et votre tolérance au risque. Elle articule allocation
            d'actifs, optimisation fiscale, prévoyance et préparation de la transmission. Un{" "}
            <A href="/simulateurs/bilan-patrimonial">bilan patrimonial</A> constitue généralement le
            point de départ.
          </>
        ),
      },
      {
        q: "Pourquoi faire appel à un conseiller en gestion de patrimoine au Maroc ?",
        a: "Un conseiller indépendant apporte une vision d'ensemble, une sélection rigoureuse des supports (OPCVM, OPCI) et une lecture de la fiscalité marocaine souvent complexe. Il vous évite les erreurs d'allocation, adapte votre stratégie à l'évolution du marché financier marocain et vous accompagne dans la durée.",
      },
      {
        q: "À partir de quel montant est-il pertinent d'être accompagné ?",
        a: "Il n'existe pas de seuil universel. Ce qui compte, c'est d'avoir un projet (constituer une épargne, préparer sa retraite, transmettre, diversifier) et une capacité d'épargne régulière ou un capital à structurer. Un premier échange permet de déterminer si un accompagnement est utile à votre situation.",
        body: (
          <>
            Il n'existe pas de seuil universel. Ce qui compte, c'est d'avoir un projet (constituer
            une épargne, préparer sa retraite, transmettre, diversifier) et une capacité d'épargne
            régulière ou un capital à structurer. Un premier échange permet de déterminer si un
            accompagnement est utile à votre situation —{" "}
            <A href="/contact">prenez contact</A> pour en discuter.
          </>
        ),
      },
      {
        q: "Comment définit-on une allocation d'actifs adaptée à mon profil ?",
        a: "L'allocation dépend de votre horizon de placement, de vos objectifs et de votre tolérance au risque. On répartit alors le capital entre classes d'actifs (monétaire, obligataire, actions, immobilier) pour rechercher un couple rendement/risque cohérent. Cette répartition est réévaluée périodiquement selon les marchés et l'évolution de votre situation.",
      },
    ],
  },
  {
    eyebrow: "Placements financiers",
    title: "OPCVM",
    items: [
      {
        q: "Qu'est-ce qu'un OPCVM ?",
        a: "Un OPCVM (Organisme de Placement Collectif en Valeurs Mobilières) est un fonds qui mutualise l'épargne de nombreux investisseurs pour l'investir en valeurs mobilières (actions, obligations, titres monétaires). Chaque investisseur détient des parts et bénéficie d'une gestion professionnelle et d'une diversification, avec une liquidité généralement quotidienne.",
        body: (
          <>
            Un OPCVM (Organisme de Placement Collectif en Valeurs Mobilières) est un fonds qui
            mutualise l'épargne de nombreux investisseurs pour l'investir en valeurs mobilières
            (actions, obligations, titres monétaires). Chaque investisseur détient des parts et
            bénéficie d'une gestion professionnelle et d'une diversification, avec une liquidité
            généralement quotidienne. Découvrez notre{" "}
            <A href="/opcvm">sélection d'OPCVM au Maroc</A>.
          </>
        ),
      },
      {
        q: "Quelles sont les grandes catégories d'OPCVM ?",
        a: "On distingue principalement les OPCVM monétaires (placements courts, faible risque), les OPCVM obligataires (court terme ou moyen/long terme), les OPCVM actions (exposés à la Bourse de Casablanca), les OPCVM diversifiés (mélange d'actions et d'obligations) et les OPCVM contractuels. Chaque catégorie répond à un horizon et à un niveau de risque différents.",
        body: (
          <>
            On distingue principalement les OPCVM monétaires (placements courts, faible risque), les
            OPCVM obligataires (court terme ou moyen/long terme), les OPCVM actions (exposés à la
            Bourse de Casablanca), les OPCVM diversifiés (mélange d'actions et d'obligations) et les
            OPCVM contractuels. Chaque catégorie répond à un horizon et à un niveau de risque
            différents — les définitions utiles figurent dans notre{" "}
            <A href="/lexique">lexique</A>.
          </>
        ),
      },
      {
        q: "Qu'est-ce que le SRRI d'un fonds ?",
        a: "Le SRRI (Synthetic Risk and Reward Indicator) est un indicateur de risque et de rendement gradué de 1 à 7 : 1 correspond au risque le plus faible (fonds monétaires) et 7 au plus élevé (fonds actions volatils). Il aide à comparer rapidement le profil de risque des fonds, sans présumer des performances futures.",
      },
      {
        q: "Où trouver les performances et données officielles des OPCVM marocains ?",
        a: "Les données de référence du marché (encours, performances, classifications) sont publiées par l'ASFIM, l'association professionnelle des sociétés de gestion, et supervisées par l'AMMC. Messidor Patrimoine s'appuie sur ces sources pour analyser et comparer les fonds de façon objective.",
        body: (
          <>
            Les données de référence du marché (encours, performances, classifications) sont
            publiées par l'ASFIM, l'association professionnelle des sociétés de gestion, et
            supervisées par l'AMMC. Messidor Patrimoine s'appuie sur ces sources pour analyser et
            comparer les fonds de façon objective. Vous pouvez aussi{" "}
            <A href="/simulateurs/epargne-opcvm">simuler la croissance d'un placement OPCVM</A>.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Pierre-papier",
    title: "OPCI",
    items: [
      {
        q: "Qu'est-ce qu'un OPCI et en quoi diffère-t-il d'un OPCVM ?",
        a: "Un OPCI (Organisme de Placement Collectif Immobilier) investit dans l'immobilier professionnel (bureaux, commerces, logistique), là où l'OPCVM investit en valeurs mobilières. L'OPCI permet d'accéder à la « pierre-papier » : des revenus locatifs et une exposition immobilière sous forme de parts, sans gérer les biens en direct. Il est encadré par la loi 70-14 et supervisé par l'AMMC.",
        body: (
          <>
            Un OPCI (Organisme de Placement Collectif Immobilier) investit dans l'immobilier
            professionnel (bureaux, commerces, logistique), là où l'OPCVM investit en valeurs
            mobilières. L'OPCI permet d'accéder à la « pierre-papier » : des revenus locatifs et une
            exposition immobilière sous forme de parts, sans gérer les biens en direct. Il est
            encadré par la loi 70-14 et supervisé par l'AMMC. Tout est détaillé sur notre{" "}
            <A href="/opci">page dédiée aux OPCI</A>.
          </>
        ),
      },
      {
        q: "Quels sont les principaux avantages d'un OPCI ?",
        a: "L'OPCI offre un ticket d'entrée mutualisé, une diversification sur plusieurs actifs et locataires, une gestion entièrement déléguée à une société agréée, une meilleure liquidité que l'immobilier détenu en direct, ainsi qu'une distribution régulière des revenus locatifs.",
      },
      {
        q: "Faut-il choisir l'OPCI ou l'immobilier en direct ?",
        a: "Les deux approches sont complémentaires. L'immobilier direct offre un contrôle total mais exige un capital important, une gestion active et supporte une faible liquidité. L'OPCI apporte diversification, gestion déléguée et cession de parts facilitée. Le bon équilibre dépend de votre patrimoine global et de vos objectifs — c'est précisément le rôle du conseil.",
        body: (
          <>
            Les deux approches sont complémentaires. L'immobilier direct offre un contrôle total
            mais exige un capital important, une gestion active et supporte une faible liquidité.
            L'OPCI apporte diversification, gestion déléguée et cession de parts facilitée. Le bon
            équilibre dépend de votre patrimoine global et de vos objectifs — c'est précisément le
            rôle du <A href="/gestion-de-patrimoine">conseil en gestion de patrimoine</A>.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Impôts & optimisation",
    title: "Fiscalité au Maroc",
    items: [
      {
        q: "Quel est le barème de l'impôt sur le revenu (IR) au Maroc en 2025 ?",
        a: "Le barème 2025 comporte cinq tranches : 0 % jusqu'à 40 000 MAD, 10 % de 40 001 à 60 000, 20 % de 60 001 à 80 000, 34 % de 80 001 à 180 000 et 37 % au-delà de 180 000 MAD. L'impôt s'applique par tranches successives sur le revenu net imposable.",
        body: (
          <>
            Le barème 2025 comporte cinq tranches : 0 % jusqu'à 40 000 MAD, 10 % de 40 001 à 60 000,
            20 % de 60 001 à 80 000, 34 % de 80 001 à 180 000 et 37 % au-delà de 180 000 MAD.
            L'impôt s'applique par tranches successives sur le revenu net imposable. Estimez le vôtre
            avec le <A href="/simulateurs/impot-revenu-maroc">simulateur d'IR 2025</A>.
          </>
        ),
      },
      {
        q: "Comment est calculée la TPI (Taxe sur les Profits Immobiliers) ?",
        a: "La TPI est en principe égale à 20 % de la plus-value imposable (prix de cession diminué du prix de revient réévalué et des abattements applicables). Elle ne peut être inférieure à une cotisation minimale de 3 % du prix de cession. Des exonérations existent, notamment pour la résidence principale sous conditions de durée d'occupation.",
        body: (
          <>
            La TPI est en principe égale à 20 % de la plus-value imposable (prix de cession diminué
            du prix de revient réévalué et des abattements applicables). Elle ne peut être inférieure
            à une cotisation minimale de 3 % du prix de cession. Des exonérations existent, notamment
            pour la résidence principale sous conditions de durée d'occupation. Le{" "}
            <A href="/simulateurs/plus-value-immobiliere-tpi">simulateur de plus-value (TPI)</A> vous
            donne un ordre de grandeur.
          </>
        ),
      },
      {
        q: "Comment sont imposées les plus-values sur OPCVM ?",
        a: "Les plus-values réalisées sur les OPCVM actions et diversifiés sont soumises à un prélèvement de 15 %. Les produits de placements à revenu fixe (OPCVM obligataires, comptes sur livret) sont, eux, imposés à 20 %. La fiscalité effective peut varier selon votre situation personnelle.",
      },
      {
        q: "Peut-on réduire légalement sa fiscalité patrimoniale au Maroc ?",
        a: "Oui, dans le cadre de la loi. Plusieurs leviers existent : choix du support d'investissement et de son régime, durée de détention (abattements), dispositifs d'épargne spécifiques et bonne structuration de la transmission. Chaque situation étant particulière, une analyse personnalisée est indispensable avant toute décision.",
        body: (
          <>
            Oui, dans le cadre de la loi. Plusieurs leviers existent : choix du support
            d'investissement et de son régime, durée de détention (abattements), dispositifs
            d'épargne spécifiques et bonne structuration de la transmission. Chaque situation étant
            particulière, une analyse personnalisée est indispensable avant toute décision —{" "}
            <A href="/contact">échangez avec un conseiller</A>.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Marocains du monde",
    title: "Investir en tant que MRE",
    items: [
      {
        q: "Un MRE peut-il investir en OPCVM et OPCI au Maroc ?",
        a: "Oui. Les Marocains résidant à l'étranger peuvent investir dans les OPCVM et OPCI marocains, généralement via un compte en devises ou en dirhams convertibles. Ces investissements permettent de conserver un lien économique avec le Maroc tout en diversifiant leur patrimoine.",
        body: (
          <>
            Oui. Les Marocains résidant à l'étranger peuvent investir dans les OPCVM et OPCI
            marocains, généralement via un compte en devises ou en dirhams convertibles. Ces
            investissements permettent de conserver un lien économique avec le Maroc tout en
            diversifiant leur patrimoine. Nous accompagnons spécifiquement les{" "}
            <A href="/mre">MRE dans leur stratégie patrimoniale</A>.
          </>
        ),
      },
      {
        q: "Quels sont les points d'attention fiscaux pour un MRE ?",
        a: "Un MRE doit tenir compte à la fois de la fiscalité marocaine et de celle de son pays de résidence, ainsi que des conventions fiscales bilatérales visant à éviter la double imposition. La qualité de résident ou de non-résident influe sur le traitement des revenus et plus-values. Une coordination entre les deux régimes est essentielle.",
      },
      {
        q: "Comment rapatrier ou faire fructifier une épargne constituée à l'étranger ?",
        a: "Plusieurs solutions existent selon vos objectifs : placement en OPCVM/OPCI, immobilier, ou constitution d'une épargne de long terme au Maroc. Le choix dépend de votre horizon, de votre régime de change et de votre fiscalité. Un bilan permet d'arbitrer entre les options en toute clarté.",
        body: (
          <>
            Plusieurs solutions existent selon vos objectifs : placement en OPCVM/OPCI, immobilier,
            ou constitution d'une épargne de long terme au Maroc. Le choix dépend de votre horizon,
            de votre régime de change et de votre fiscalité. Un{" "}
            <A href="/simulateurs">bilan chiffré</A> permet d'arbitrer entre les options en toute
            clarté.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Notre cabinet",
    title: "Messidor Patrimoine & aspects pratiques",
    items: [
      {
        q: "Qui est Messidor Patrimoine ?",
        a: "Messidor Patrimoine est un cabinet de conseil en gestion de patrimoine dédié au marché marocain. Nous sélectionnons les OPCVM et OPCI, proposons des simulateurs fiscaux à jour et construisons des stratégies d'investissement sur-mesure pour les résidents comme pour les MRE.",
        body: (
          <>
            Messidor Patrimoine est un cabinet de conseil en gestion de patrimoine dédié au marché
            marocain. Nous sélectionnons les <A href="/opcvm">OPCVM</A> et{" "}
            <A href="/opci">OPCI</A>, proposons des <A href="/simulateurs">simulateurs fiscaux</A> à
            jour et construisons des stratégies d'investissement sur-mesure pour les résidents comme
            pour les MRE.
          </>
        ),
      },
      {
        q: "Comment se déroule un premier rendez-vous ?",
        a: "Le premier échange est sans engagement. Il sert à comprendre votre situation, vos objectifs et votre horizon. Nous établissons ensuite un bilan patrimonial, puis formulons des recommandations d'allocation et de fiscalité. Vous restez libre de vos décisions à chaque étape.",
        body: (
          <>
            Le premier échange est sans engagement. Il sert à comprendre votre situation, vos
            objectifs et votre horizon. Nous établissons ensuite un bilan patrimonial, puis formulons
            des recommandations d'allocation et de fiscalité. Vous restez libre de vos décisions à
            chaque étape. <A href="/contact">Réservez votre premier rendez-vous</A>.
          </>
        ),
      },
      {
        q: "Les simulateurs remplacent-ils un conseil personnalisé ?",
        a: "Non. Nos simulateurs fournissent des estimations indicatives à partir des règles générales en vigueur. Ils ne tiennent pas compte de toutes les particularités de votre situation (revenus catégoriels multiples, régimes spécifiques, conventions fiscales). Ils constituent un point de départ, pas une décision.",
        body: (
          <>
            Non. Nos <A href="/simulateurs">simulateurs</A> fournissent des estimations indicatives à
            partir des règles générales en vigueur. Ils ne tiennent pas compte de toutes les
            particularités de votre situation (revenus catégoriels multiples, régimes spécifiques,
            conventions fiscales). Ils constituent un point de départ, pas une décision.
          </>
        ),
      },
      {
        q: "Investir comporte-t-il des risques ?",
        a: "Oui. Tout investissement présente un risque, y compris de perte en capital, en particulier sur les supports actions ou immobiliers. Les performances passées ne préjugent pas des performances futures. C'est pourquoi la diversification, l'horizon de placement et l'adéquation au profil de risque sont au cœur de notre méthode.",
      },
    ],
  },
];

export default function FaqPage() {
  const allQuestions = SECTIONS.flatMap((s) => s.items);

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allQuestions.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          faqPage,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Vos questions · Nos réponses"
        title="Questions fréquentes"
        image="/images/heroes/editorial-navy.jpg"
        intro="Gestion de patrimoine, OPCVM, OPCI, fiscalité marocaine, épargne MRE : les réponses claires aux questions que l'on nous pose le plus souvent. Pour votre situation précise, un conseiller reste à votre écoute."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "FAQ", href: "/faq" },
        ]}
      />

      {SECTIONS.map((section, sIdx) => (
        <section
          key={section.title}
          className={
            sIdx % 2 === 0
              ? "shell py-16 md:py-24"
              : "border-t border-slate/40 bg-cream-light"
          }
        >
          <div className={sIdx % 2 === 0 ? "" : "shell py-16 md:py-24"}>
            <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
              <Reveal>
                <p className="eyebrow text-gold-deep">{section.eyebrow}</p>
                <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
                  {section.title}
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="divide-y divide-slate/40 border-y border-slate/40">
                  {section.items.map((f) => (
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
                      <p className="mt-3 leading-relaxed text-navy-soft">{f.body ?? f.a}</p>
                    </details>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="border-t border-slate/40">
        <div className="shell py-20 text-center md:py-28">
          <Reveal>
            <p className="eyebrow text-gold-deep">Une question plus précise ?</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-5xl">
              Parlons de votre situation
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-soft">
              Chaque patrimoine est unique. Nos conseillers répondent à vos questions et construisent
              avec vous une stratégie adaptée au marché marocain — sans engagement.
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
