import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  TrendingUp,
  Building2,
  Landmark,
  Coins,
  ShieldCheck,
  Compass,
  Globe2,
  AlertTriangle,
} from "lucide-react";
import { getFundsCount } from "@/lib/funds";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Investir au Maroc en 2026 : le guide complet",
  description:
    "Le guide de référence pour investir au Maroc en 2026 : classes d'actifs (OPCVM, OPCI, bourse de Casablanca, immobilier, or), construction d'une stratégie par horizon et profil de risque, fiscalité de l'épargne, cas des MRE et erreurs à éviter. Un panorama complet, adossé aux données ASFIM et à la réglementation AMMC.",
  path: "/investir-au-maroc",
  type: "article",
});

/* -------------------------------------------------------------------------- */
/*  Table des matières (pilote la nav d'ancres + garantit la cohérence)       */
/* -------------------------------------------------------------------------- */
const SECTIONS: { id: string; label: string }[] = [
  { id: "pourquoi", label: "Pourquoi investir au Maroc" },
  { id: "classes-actifs", label: "Les grandes classes d'actifs" },
  { id: "opcvm", label: "Les OPCVM" },
  { id: "opci", label: "L'immobilier via les OPCI" },
  { id: "bourse", label: "La bourse de Casablanca" },
  { id: "immobilier-or", label: "Immobilier direct & or" },
  { id: "strategie", label: "Définir sa stratégie" },
  { id: "diversification", label: "Diversification & allocation" },
  { id: "fiscalite", label: "La fiscalité de l'épargne" },
  { id: "mre", label: "Le cas des MRE" },
  { id: "erreurs", label: "Les erreurs à éviter" },
  { id: "accompagnement", label: "Comment se faire accompagner" },
];

/* -------------------------------------------------------------------------- */
/*  Données éditoriales                                                        */
/* -------------------------------------------------------------------------- */
const ASSET_CLASSES = [
  {
    icon: Coins,
    name: "Monétaire",
    horizon: "< 1 an",
    risk: "Très faible (SRRI 1-2)",
    role: "Trésorerie, épargne de précaution, liquidité disponible.",
  },
  {
    icon: Landmark,
    name: "Obligataire",
    horizon: "1 à 3 ans +",
    risk: "Faible à modéré (SRRI 2-4)",
    role: "Revenu régulier, stabilisation d'un portefeuille, sensibilité aux taux.",
  },
  {
    icon: TrendingUp,
    name: "Actions / Bourse",
    horizon: "5 ans +",
    risk: "Élevé (SRRI 5-7)",
    role: "Moteur de performance long terme, exposition à l'économie marocaine.",
  },
  {
    icon: Building2,
    name: "Immobilier (OPCI)",
    horizon: "5 à 10 ans +",
    risk: "Modéré à élevé",
    role: "Revenus locatifs, diversification « pierre-papier », protection réelle.",
  },
  {
    icon: ShieldCheck,
    name: "Diversifié",
    horizon: "3 ans +",
    risk: "Modéré (SRRI 3-5)",
    role: "Allocation clé en main mêlant plusieurs classes d'actifs.",
  },
  {
    icon: Coins,
    name: "Or",
    horizon: "Long terme",
    risk: "Volatil",
    role: "Valeur refuge, couverture contre l'inflation et l'incertitude.",
  },
];

const SRRI_ROWS = [
  { level: "1 – 2", profil: "Prudent", ex: "Monétaire, obligataire court terme", perte: "Faible" },
  { level: "3 – 4", profil: "Équilibré", ex: "Diversifié, obligataire moyen terme", perte: "Modérée" },
  { level: "5 – 7", profil: "Dynamique", ex: "Actions, OPCVM actions", perte: "Élevée" },
];

const ALLOCATION_ROWS = [
  { profil: "Prudent", monetaire: "30 %", obligataire: "50 %", actions: "10 %", immo: "10 %" },
  { profil: "Équilibré", monetaire: "15 %", obligataire: "35 %", actions: "30 %", immo: "20 %" },
  { profil: "Dynamique", monetaire: "5 %", obligataire: "20 %", actions: "50 %", immo: "25 %" },
];

// Barème IR annuel (grille progressive de référence). Chiffres indicatifs — à confirmer
// avec la Loi de Finances en vigueur via le simulateur et l'article dédiés.
const IR_ROWS = [
  { tranche: "0 – 30 000 MAD", taux: "0 %", note: "Exonéré" },
  { tranche: "30 001 – 50 000 MAD", taux: "10 %", note: "—" },
  { tranche: "50 001 – 60 000 MAD", taux: "20 %", note: "—" },
  { tranche: "60 001 – 80 000 MAD", taux: "30 %", note: "—" },
  { tranche: "80 001 – 180 000 MAD", taux: "34 %", note: "—" },
  { tranche: "> 180 000 MAD", taux: "37 %", note: "Tranche marginale supérieure" },
];

const ERREURS = [
  {
    title: "Laisser dormir son épargne",
    body: "Un capital non investi perd mécaniquement de la valeur face à l'inflation. Le compte sur carnet ou le compte courant ne sont pas des stratégies patrimoniales.",
  },
  {
    title: "Investir sans horizon défini",
    body: "Placer sur des actions un argent dont on aura besoin dans six mois expose à devoir vendre au pire moment. L'horizon détermine la classe d'actifs.",
  },
  {
    title: "Concentrer sur un seul actif",
    body: "Tout miser sur un appartement, un fonds ou une valeur augmente le risque sans augmenter le rendement attendu. La diversification reste la seule protection gratuite.",
  },
  {
    title: "Négliger les frais",
    body: "Frais de souscription, de gestion, de rachat : sur la durée, quelques dixièmes de point rognent lourdement la performance nette. Ils doivent être comparés systématiquement.",
  },
  {
    title: "Oublier la fiscalité",
    body: "La performance qui compte est la performance nette d'impôt. Ignorer l'IR, la TPI ou la structure de détention peut coûter plusieurs points de rendement.",
  },
  {
    title: "Réagir à l'émotion",
    body: "Acheter au sommet par euphorie, vendre au creux par panique : le principal ennemi de l'investisseur est souvent lui-même. La discipline prime sur l'intuition.",
  },
];

const FAQ = [
  {
    q: "Combien faut-il pour commencer à investir au Maroc ?",
    a: "Il n'existe pas de montant universel. Certains OPCVM sont accessibles avec quelques milliers de dirhams, tandis que d'autres véhicules (OPCI institutionnels, club deals immobiliers) requièrent des tickets plus élevés. L'essentiel n'est pas le montant de départ mais la régularité et l'adéquation du placement à votre horizon et à votre profil de risque. Un premier échange permet de définir le point d'entrée le plus pertinent pour votre situation.",
  },
  {
    q: "Quel est le placement le plus rentable au Maroc ?",
    a: "Aucune classe d'actifs n'est « la meilleure » dans l'absolu : le rendement va de pair avec le risque et l'horizon. Historiquement, les actions offrent le potentiel le plus élevé sur le long terme mais avec une forte volatilité, tandis que le monétaire et l'obligataire privilégient la stabilité. La bonne réponse est une allocation diversifiée, calibrée sur vos objectifs — c'est tout l'objet d'un bilan patrimonial.",
  },
  {
    q: "Les OPCVM sont-ils sûrs au Maroc ?",
    a: "Les OPCVM sont des véhicules réglementés, agréés et supervisés par l'AMMC (Autorité Marocaine du Marché des Capitaux), avec l'intervention d'un dépositaire indépendant. Ce cadre offre une forte protection structurelle et de la transparence. En revanche, « réglementé » ne signifie pas « sans risque » : la valeur des parts fluctue selon les marchés, en particulier pour les fonds actions. L'indicateur SRRI (de 1 à 7) mesure ce niveau de risque.",
  },
  {
    q: "Un MRE peut-il investir au Maroc depuis l'étranger ?",
    a: "Oui. Les Marocains résidant à l'étranger peuvent investir dans la plupart des véhicules marocains, souvent via un compte en dirhams convertibles qui facilite le rapatriement ultérieur des fonds. Les points d'attention portent sur le régime de change, la fiscalité de votre pays de résidence et la coordination entre les deux juridictions. Un accompagnement dédié permet d'éviter les frictions administratives.",
  },
  {
    q: "Comment est imposée l'épargne financière au Maroc ?",
    a: "La fiscalité dépend du véhicule et du profil de l'investisseur. Les revenus du travail suivent le barème progressif de l'IR, les profits immobiliers relèvent de la TPI, et les produits de placement (OPCVM, dividendes, intérêts) obéissent à des régimes spécifiques. La performance à retenir est toujours la performance nette d'impôt : une analyse personnalisée est indispensable avant tout arbitrage.",
  },
  {
    q: "Faut-il un conseiller pour investir au Maroc ?",
    a: "Ce n'est pas obligatoire, mais un conseil indépendant apporte une méthode : diagnostic de votre situation, définition d'une allocation cohérente, sélection rigoureuse des fonds, lecture de la fiscalité et suivi dans le temps. L'intérêt d'un cabinet comme Messidor Patrimoine est de vous éviter les erreurs coûteuses et d'aligner chaque décision sur vos seuls objectifs.",
  },
];

export default async function InvestirAuMarocPage() {
  const opcvmCount = await getFundsCount("OPCVM");
  const opcvmLabel = opcvmCount > 0 ? `plus de ${opcvmCount}` : "des centaines de";

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE.url}/investir-au-maroc#article`,
    headline: "Investir au Maroc en 2026 : le guide complet",
    description:
      "Guide de référence pour investir au Maroc : classes d'actifs, stratégie, fiscalité, MRE et erreurs à éviter.",
    inLanguage: "fr",
    url: absoluteUrl("/investir-au-maroc"),
    isPartOf: { "@id": `${SITE.url}/#website` },
    publisher: { "@id": `${SITE.url}/#organization` },
    author: { "@id": `${SITE.url}/#organization` },
    image: `${SITE.url}/images/heroes/finance-aerial.jpg`,
    about: [
      "Investissement au Maroc",
      "OPCVM",
      "OPCI",
      "Bourse de Casablanca",
      "Fiscalité de l'épargne",
      "Diversification",
    ],
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          article,
          faqPage,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Investir au Maroc", path: "/investir-au-maroc" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Le guide de référence"
        title="Investir au Maroc : le guide complet"
        image="/images/heroes/finance-aerial.jpg"
        intro="Classes d'actifs, stratégie, fiscalité, cas des MRE : un panorama complet et méthodique pour investir au Maroc en 2026, adossé aux données du marché et à la réglementation. Le point de départ de tout parcours patrimonial réussi."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "Investir au Maroc", href: "/investir-au-maroc" },
        ]}
      />

      {/* Chapô + Table des matières */}
      <section className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.15fr_0.85fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">Introduction</p>
            <h2 className="sr-only">Introduction</h2>
            <div className="mt-4 space-y-5 text-lg leading-relaxed text-navy-soft">
              <p>
                Investir au Maroc n'a jamais été aussi accessible. Entre les{" "}
                <Link href="/opcvm" className="text-gold-deep underline underline-offset-2">
                  OPCVM
                </Link>
                , les{" "}
                <Link href="/opci" className="text-gold-deep underline underline-offset-2">
                  OPCI
                </Link>{" "}
                immobiliers, la{" "}
                <Link
                  href="/blog/investir-bourse-casablanca-guide-debutant"
                  className="text-gold-deep underline underline-offset-2"
                >
                  bourse de Casablanca
                </Link>{" "}
                et une palette de simulateurs fiscaux, l'épargnant marocain — résident ou MRE —
                dispose aujourd'hui d'outils dignes d'une place financière mature.
              </p>
              <p>
                Ce guide de référence rassemble l'essentiel : pourquoi investir, quelles classes
                d'actifs choisir, comment bâtir une stratégie cohérente, ce que dit la fiscalité, et
                les pièges à éviter. Chaque section renvoie vers nos analyses détaillées, nos
                comparateurs et nos outils pour aller plus loin.
              </p>
            </div>
          </Reveal>

          {/* TOC */}
          <Reveal delay={0.1}>
            <nav
              aria-label="Sommaire"
              className="border border-slate/50 bg-cream-light p-6 md:p-8"
            >
              <p className="eyebrow text-gold-deep">Sur cette page</p>
              <ol className="mt-5 space-y-1 text-sm">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="group flex items-baseline gap-3 border-b border-slate/30 py-2 text-navy-soft transition-colors hover:text-gold-deep"
                    >
                      <span className="font-display text-xs tabular-nums text-gold-deep">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="transition-transform group-hover:translate-x-0.5">
                        {s.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        </div>
      </section>

      {/* 1. Pourquoi investir au Maroc */}
      <section id="pourquoi" className="scroll-mt-28 border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <Reveal>
              <p className="eyebrow text-gold-deep">01 — Le point de départ</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
                Pourquoi investir au Maroc
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
                <p>
                  La première raison est universelle :{" "}
                  <strong className="font-semibold text-navy">
                    l'argent qui dort perd de la valeur
                  </strong>
                  . Face à l'inflation, une épargne laissée sur un compte se déprécie année après
                  année. Investir, c'est d'abord protéger son pouvoir d'achat — puis le faire
                  croître grâce aux{" "}
                  <Link
                    href="/blog/interets-composes-faire-fructifier-epargne-maroc"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    intérêts composés
                  </Link>
                  .
                </p>
                <p>
                  Le Maroc offre un cadre de plus en plus structuré : un marché de capitaux
                  supervisé par l'{" "}
                  <Link href="/lexique/ammc" className="text-gold-deep underline underline-offset-2">
                    AMMC
                  </Link>
                  , une industrie de la gestion collective encadrée dont les données sont publiées
                  par l'{" "}
                  <Link href="/lexique/asfim" className="text-gold-deep underline underline-offset-2">
                    ASFIM
                  </Link>
                  , une bourse en modernisation et une gamme de véhicules réglementés accessibles au
                  grand public.
                </p>
                <ul className="space-y-3 border-t border-slate/40 pt-5">
                  {[
                    "Préserver son capital face à l'érosion monétaire",
                    "Se constituer un patrimoine et préparer sa retraite",
                    "Générer des revenus complémentaires réguliers",
                    "Diversifier au-delà du seul immobilier résidentiel",
                    "Transmettre dans un cadre fiscal maîtrisé",
                  ].map((r) => (
                    <li key={r} className="flex items-start gap-3 text-base">
                      <Check size={17} className="mt-1 shrink-0 text-gold-deep" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-base">
                  Pour un panorama des options selon votre situation, consultez notre analyse{" "}
                  <Link
                    href="/blog/ou-placer-son-argent-maroc-2026"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    « Où placer son argent au Maroc en 2026 »
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 2. Les grandes classes d'actifs */}
      <section id="classes-actifs" className="scroll-mt-28 shell py-16 md:py-24">
        <Reveal>
          <p className="eyebrow text-gold-deep">02 — La boîte à outils</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
            Les grandes classes d'actifs
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-soft">
            Chaque classe d'actifs répond à un couple rendement / risque et à un horizon de
            placement distinct. Les comprendre, c'est déjà savoir où placer chaque dirham selon son
            besoin.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ASSET_CLASSES.map((a, i) => {
            const Icon = a.icon;
            return (
              <Reveal key={a.name} delay={(i % 3) * 0.08}>
                <article className="flex h-full flex-col border border-slate/50 bg-cream p-8">
                  <span className="flex h-12 w-12 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
                    <Icon size={22} strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-6 font-display text-xl leading-tight text-navy">{a.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-soft">{a.role}</p>
                  <dl className="mt-5 space-y-1 border-t border-slate/40 pt-4 text-xs text-navy-mute">
                    <div className="flex justify-between gap-4">
                      <dt>Horizon conseillé</dt>
                      <dd className="text-navy">{a.horizon}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt>Niveau de risque</dt>
                      <dd className="text-navy">{a.risk}</dd>
                    </div>
                  </dl>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-base leading-relaxed text-navy-soft">
            Les sections suivantes détaillent les principales portes d'entrée. Pour approfondir la
            logique d'ensemble, lisez notre guide{" "}
            <Link
              href="/blog/diversification-allocation-actifs-maroc"
              className="text-gold-deep underline underline-offset-2"
            >
              « Diversification et allocation d'actifs au Maroc »
            </Link>{" "}
            ou explorez le{" "}
            <Link href="/lexique" className="text-gold-deep underline underline-offset-2">
              lexique
            </Link>{" "}
            pour chaque terme technique.
          </p>
        </Reveal>
      </section>

      {/* 3. Les OPCVM */}
      <section id="opcvm" className="scroll-mt-28 border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <Reveal>
              <p className="eyebrow text-gold-deep">03 — La porte d'entrée</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
                Les OPCVM : investir sans gérer soi-même
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
                <p>
                  Un{" "}
                  <Link href="/lexique/opcvm" className="text-gold-deep underline underline-offset-2">
                    OPCVM
                  </Link>{" "}
                  (Organisme de Placement Collectif en Valeurs Mobilières) mutualise l'épargne de
                  nombreux investisseurs pour la confier à un gérant professionnel. Vous détenez des
                  parts (via une{" "}
                  <Link href="/lexique/sicav" className="text-gold-deep underline underline-offset-2">
                    SICAV
                  </Link>{" "}
                  ou un{" "}
                  <Link href="/lexique/fcp" className="text-gold-deep underline underline-offset-2">
                    FCP
                  </Link>
                  ) dont la valeur — la{" "}
                  <Link href="/lexique/vl" className="text-gold-deep underline underline-offset-2">
                    valeur liquidative
                  </Link>{" "}
                  — évolue chaque jour.
                </p>
                <p>
                  Messidor Patrimoine suit {opcvmLabel} OPCVM actifs du marché marocain. On les
                  classe par grande famille :
                </p>
                <ul className="space-y-2 border-t border-slate/40 pt-5 text-base">
                  <li className="flex items-start gap-3">
                    <Check size={17} className="mt-1 shrink-0 text-gold-deep" />
                    <span>
                      <strong className="font-semibold text-navy">Actions</strong> — potentiel
                      élevé, horizon long.{" "}
                      <Link
                        href="/opcvm/categorie/actions"
                        className="text-gold-deep underline underline-offset-2"
                      >
                        Voir les OPCVM actions
                      </Link>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={17} className="mt-1 shrink-0 text-gold-deep" />
                    <span>
                      <strong className="font-semibold text-navy">Obligataire & monétaire</strong> —
                      stabilité et gestion de trésorerie.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check size={17} className="mt-1 shrink-0 text-gold-deep" />
                    <span>
                      <strong className="font-semibold text-navy">Diversifié</strong> — une
                      allocation clé en main dans un seul fonds.
                    </span>
                  </li>
                </ul>
                <p className="text-base">
                  Débutant ? Commencez par notre guide{" "}
                  <Link
                    href="/blog/comment-investir-opcvm-maroc-guide-debutant"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    « Comment investir en OPCVM au Maroc »
                  </Link>
                  , puis affinez avec le{" "}
                  <Link
                    href="/opcvm/comparateur"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    comparateur d'OPCVM
                  </Link>{" "}
                  et notre sélection des{" "}
                  <Link
                    href="/opcvm/meilleurs"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    meilleurs fonds
                  </Link>
                  . Attention enfin aux{" "}
                  <Link
                    href="/lexique/frais-de-gestion"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    frais de gestion
                  </Link>{" "}
                  : ils pèsent sur la performance nette dans la durée.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 4. OPCI */}
      <section id="opci" className="scroll-mt-28 shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">04 — La pierre-papier</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              L'immobilier via les OPCI
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
              <p>
                L'{" "}
                <Link href="/lexique/opci" className="text-gold-deep underline underline-offset-2">
                  OPCI
                </Link>{" "}
                (Organisme de Placement Collectif Immobilier) ouvre l'accès à l'immobilier
                professionnel — bureaux, commerces, logistique — sous forme de parts. C'est la
                « pierre-papier » : vous investissez dans la pierre, mais via un actif financier plus
                liquide et diversifié qu'un bien détenu en direct.
              </p>
              <p>
                Encadrés par la loi 70-14 et supervisés par l'AMMC, les OPCI distribuent l'essentiel
                de leurs revenus locatifs, ce qui en fait un outil de revenu régulier au sein d'une
                allocation. Pour tout comprendre, consultez notre{" "}
                <Link href="/opci" className="text-gold-deep underline underline-offset-2">
                  page dédiée aux OPCI
                </Link>{" "}
                et l'analyse comparative{" "}
                <Link
                  href="/blog/immobilier-maroc-2025-physique-cote-opci-comparatif"
                  className="text-gold-deep underline underline-offset-2"
                >
                  « Immobilier physique, coté ou OPCI »
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. Bourse de Casablanca */}
      <section id="bourse" className="scroll-mt-28 border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <Reveal>
              <p className="eyebrow text-gold-deep">05 — Les actions en direct</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
                La bourse de Casablanca
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
                <p>
                  Investir en direct sur la bourse de Casablanca, c'est acheter des actions
                  d'entreprises cotées et suivre leur trajectoire. L'indice de référence, le{" "}
                  <Link href="/lexique/masi" className="text-gold-deep underline underline-offset-2">
                    MASI
                  </Link>
                  , mesure la performance d'ensemble du marché et sert de{" "}
                  <Link
                    href="/lexique/benchmark"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    benchmark
                  </Link>{" "}
                  aux fonds actions.
                </p>
                <p>
                  Cette approche demande plus de temps, de connaissances et de tolérance à la
                  volatilité que l'investissement via un OPCVM. Beaucoup d'épargnants préfèrent
                  d'ailleurs s'exposer aux actions marocaines à travers un fonds diversifié plutôt
                  qu'en sélectionnant eux-mêmes des titres. Notre guide{" "}
                  <Link
                    href="/blog/investir-bourse-casablanca-guide-debutant"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    « Investir à la bourse de Casablanca »
                  </Link>{" "}
                  pose les bases, et notre analyse sur l'{" "}
                  <Link
                    href="/blog/etf-maroc-arrivee-2025"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    arrivée des ETF au Maroc
                  </Link>{" "}
                  éclaire une tendance de fond.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 6. Immobilier direct & or */}
      <section id="immobilier-or" className="scroll-mt-28 shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">06 — Les actifs réels</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              Immobilier direct & or
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
              <p>
                L'<strong className="font-semibold text-navy">immobilier en direct</strong> reste le
                placement préféré des Marocains : tangible, générateur de loyers, transmissible. Il
                exige toutefois un capital important, une gestion active et supporte une fiscalité
                spécifique à la revente — la{" "}
                <Link href="/lexique/tpi" className="text-gold-deep underline underline-offset-2">
                  taxe sur les profits immobiliers (TPI)
                </Link>
                . Notre dossier{" "}
                <Link
                  href="/blog/fiscalite-immobiliere-maroc-2025"
                  className="text-gold-deep underline underline-offset-2"
                >
                  « Fiscalité immobilière au Maroc »
                </Link>{" "}
                détaille les règles.
              </p>
              <p>
                L'<strong className="font-semibold text-navy">or</strong>, lui, joue un rôle de
                valeur refuge : il ne produit pas de revenu mais tend à protéger le patrimoine en
                période d'incertitude ou d'inflation. À dose mesurée, il diversifie une allocation.
                À lire :{" "}
                <Link
                  href="/blog/investir-or-maroc-guide"
                  className="text-gold-deep underline underline-offset-2"
                >
                  « Investir dans l'or au Maroc »
                </Link>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA médian */}
      <section className="relative overflow-hidden bg-navy-deep text-cream">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(120% 90% at 80% 0%, rgba(176,138,62,0.16) 0%, transparent 55%)",
          }}
        />
        <div className="shell relative z-10 py-16 text-center md:py-20">
          <Reveal>
            <p className="eyebrow text-gold-light">Un doute sur la marche à suivre ?</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight md:text-4xl">
              Un premier échange vaut mieux que dix articles
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-cream/75">
              Nos conseillers transforment ce panorama en une stratégie concrète, calibrée sur
              votre situation et vos objectifs.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/contact" variant="gold">
                Nous contacter
                <ArrowRight size={15} />
              </ButtonLink>
              <ButtonLink href={SITE.calendly} external variant="outline-light">
                Prendre rendez-vous
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. Définir sa stratégie */}
      <section id="strategie" className="scroll-mt-28 shell py-16 md:py-24">
        <Reveal>
          <p className="eyebrow text-gold-deep">07 — La méthode</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
            Définir sa stratégie : horizon, risque, objectifs
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-soft">
            Avant de choisir un produit, il faut choisir un cap. Trois questions structurent toute
            décision d'investissement.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-px overflow-hidden border border-slate/50 md:grid-cols-3">
          {[
            {
              icon: Compass,
              t: "L'horizon",
              b: "Dans combien de temps aurez-vous besoin de cet argent ? Court terme (< 2 ans) : privilégiez le monétaire. Long terme (5 ans +) : les actions deviennent pertinentes.",
            },
            {
              icon: ShieldCheck,
              t: "Le risque",
              b: "Quelle perte temporaire pouvez-vous supporter sans céder à la panique ? L'indicateur SRRI (1 à 7) traduit ce niveau de risque pour chaque fonds.",
            },
            {
              icon: TrendingUp,
              t: "Les objectifs",
              b: "Protéger, faire croître, générer un revenu, préparer la retraite ou transmettre : chaque but appelle une allocation différente.",
            },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.t} delay={i * 0.08}>
                <div className="h-full bg-cream p-8">
                  <span className="flex h-11 w-11 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
                    <Icon size={20} strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-5 font-display text-xl text-navy">{c.t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-soft">{c.b}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-10">
            <p className="eyebrow text-gold-deep">Le profil de risque en un tableau</p>
            <div className="mt-5 overflow-x-auto border border-slate/50">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-navy text-cream">
                    <th className="px-5 py-4 text-left font-semibold">
                      <Link
                        href="/lexique/srri"
                        className="text-gold-light underline underline-offset-2"
                      >
                        SRRI
                      </Link>
                    </th>
                    <th className="px-5 py-4 text-left font-semibold">Profil</th>
                    <th className="px-5 py-4 text-left font-semibold">Exemples de fonds</th>
                    <th className="px-5 py-4 text-left font-semibold">Perte potentielle</th>
                  </tr>
                </thead>
                <tbody>
                  {SRRI_ROWS.map((r, i) => (
                    <tr key={r.level} className={i % 2 ? "bg-cream-light" : "bg-cream"}>
                      <td className="border-b border-slate/40 px-5 py-4 font-display text-lg text-gold-deep">
                        {r.level}
                      </td>
                      <td className="border-b border-slate/40 px-5 py-4 font-medium text-navy">
                        {r.profil}
                      </td>
                      <td className="border-b border-slate/40 px-5 py-4 text-navy-soft">{r.ex}</td>
                      <td className="border-b border-slate/40 px-5 py-4 text-navy-mute">
                        {r.perte}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-navy-mute">
              Estimez votre situation d'ensemble avec notre{" "}
              <Link
                href="/simulateurs/bilan-patrimonial"
                className="text-gold-deep underline underline-offset-2"
              >
                simulateur de bilan patrimonial
              </Link>
              , ou explorez tous nos{" "}
              <Link href="/simulateurs" className="text-gold-deep underline underline-offset-2">
                simulateurs
              </Link>
              .
            </p>
          </div>
        </Reveal>
      </section>

      {/* 8. Diversification & allocation */}
      <section id="diversification" className="scroll-mt-28 border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-deep">08 — La règle d'or</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Diversification & allocation d'actifs
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-soft">
              « Ne pas mettre tous ses œufs dans le même panier » est la seule protection quasi
              gratuite de l'investisseur. Répartir son épargne entre classes d'actifs réduit le
              risque global sans sacrifier le rendement attendu. Voici, à titre purement indicatif,
              des exemples d'allocation par profil.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 overflow-x-auto border border-slate/50">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="bg-navy text-cream">
                    <th className="px-5 py-4 text-left font-semibold">Profil</th>
                    <th className="px-5 py-4 text-left font-semibold">Monétaire</th>
                    <th className="px-5 py-4 text-left font-semibold">Obligataire</th>
                    <th className="px-5 py-4 text-left font-semibold text-gold-light">Actions</th>
                    <th className="px-5 py-4 text-left font-semibold">Immobilier</th>
                  </tr>
                </thead>
                <tbody>
                  {ALLOCATION_ROWS.map((r, i) => (
                    <tr key={r.profil} className={i % 2 ? "bg-cream-light" : "bg-cream"}>
                      <td className="border-b border-slate/40 px-5 py-4 font-medium text-navy">
                        {r.profil}
                      </td>
                      <td className="border-b border-slate/40 px-5 py-4 text-navy-soft">
                        {r.monetaire}
                      </td>
                      <td className="border-b border-slate/40 px-5 py-4 text-navy-soft">
                        {r.obligataire}
                      </td>
                      <td className="border-b border-slate/40 px-5 py-4 font-medium text-navy">
                        {r.actions}
                      </td>
                      <td className="border-b border-slate/40 px-5 py-4 text-navy-soft">{r.immo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-navy-mute">
              Ces répartitions sont des illustrations pédagogiques, non des recommandations. Votre
              allocation réelle dépend de votre situation complète. Approfondissez avec notre guide{" "}
              <Link
                href="/blog/diversification-allocation-actifs-maroc"
                className="text-gold-deep underline underline-offset-2"
              >
                « Diversification et allocation d'actifs au Maroc »
              </Link>{" "}
              et notre méthode de{" "}
              <Link
                href="/blog/constituer-epargne-strategie-patrimoniale-maroc"
                className="text-gold-deep underline underline-offset-2"
              >
                constitution d'une épargne
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* 9. Fiscalité */}
      <section id="fiscalite" className="scroll-mt-28 shell py-16 md:py-24">
        <Reveal>
          <p className="eyebrow text-gold-deep">09 — La performance nette</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
            La fiscalité de l'épargne
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-soft">
            Ce qui compte n'est pas le rendement brut, mais ce qu'il vous reste après impôt. La
            fiscalité marocaine distingue plusieurs régimes selon la nature du revenu. Les éléments
            ci-dessous sont donnés à titre informatif et doivent être confirmés au regard de la Loi
            de Finances en vigueur.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">
              <Link href="/lexique/ir" className="underline underline-offset-2">
                Impôt sur le revenu (IR)
              </Link>{" "}
              — barème progressif
            </p>
            <div className="mt-5 overflow-x-auto border border-slate/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy text-cream">
                    <th className="px-4 py-3 text-left font-semibold">Tranche annuelle</th>
                    <th className="px-4 py-3 text-left font-semibold text-gold-light">Taux</th>
                    <th className="px-4 py-3 text-left font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {IR_ROWS.map((r, i) => (
                    <tr key={r.tranche} className={i % 2 ? "bg-cream-light" : "bg-cream"}>
                      <td className="border-b border-slate/40 px-4 py-3 text-navy-soft">
                        {r.tranche}
                      </td>
                      <td className="border-b border-slate/40 px-4 py-3 font-medium text-navy">
                        {r.taux}
                      </td>
                      <td className="border-b border-slate/40 px-4 py-3 text-navy-mute">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-navy-mute">
              Barème progressif indicatif. Calculez votre imposition avec le{" "}
              <Link
                href="/simulateurs/impot-revenu-maroc"
                className="text-gold-deep underline underline-offset-2"
              >
                simulateur d'IR
              </Link>{" "}
              et retrouvez le détail à jour dans notre article{" "}
              <Link
                href="/blog/impot-revenu-ir-maroc-bareme-calcul-2026"
                className="text-gold-deep underline underline-offset-2"
              >
                sur le barème de l'IR
              </Link>
              .
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
              <p>
                Pour les plus-values immobilières, la{" "}
                <Link href="/lexique/tpi" className="text-gold-deep underline underline-offset-2">
                  TPI
                </Link>{" "}
                (taxe sur les profits immobiliers) s'applique en principe au{" "}
                <strong className="font-semibold text-navy">taux de droit commun de 20 %</strong> du
                profit réalisé, avec un{" "}
                <strong className="font-semibold text-navy">
                  minimum de 3 % du prix de cession
                </strong>{" "}
                dû même en l'absence de gain. Des taux et régimes particuliers (par exemple un taux
                réduit de l'ordre de 15 % dans certains cas, ou des exonérations sous conditions)
                peuvent s'appliquer selon la nature du bien et la durée de détention.
              </p>
              <p>
                Les produits de placement financier (OPCVM, dividendes, intérêts) suivent quant à
                eux des régimes qui leur sont propres. Notre guide{" "}
                <Link
                  href="/blog/fiscalite-opcvm-maroc"
                  className="text-gold-deep underline underline-offset-2"
                >
                  « Fiscalité des OPCVM au Maroc »
                </Link>{" "}
                détaille le sujet, et le{" "}
                <Link
                  href="/simulateurs/plus-value-immobiliere-tpi"
                  className="text-gold-deep underline underline-offset-2"
                >
                  simulateur de TPI
                </Link>{" "}
                estime votre imposition à la revente.
              </p>
              <p className="border-l-2 border-gold pl-4 text-base italic text-navy-soft">
                La fiscalité évolue à chaque Loi de Finances et dépend de votre situation
                personnelle. Ces repères ne remplacent pas une analyse individualisée.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10. MRE */}
      <section id="mre" className="scroll-mt-28 border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <Reveal>
              <p className="eyebrow text-gold-deep">10 — Investir depuis l'étranger</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
                Le cas des MRE
              </h2>
              <span className="mt-6 inline-flex h-12 w-12 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
                <Globe2 size={22} strokeWidth={1.6} />
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
                <p>
                  Les Marocains résidant à l'étranger occupent une place singulière : attachés au
                  pays, souvent investisseurs immobiliers de longue date, mais confrontés à des
                  contraintes spécifiques de change et de double fiscalité.
                </p>
                <ul className="space-y-2 border-t border-slate/40 pt-5 text-base">
                  {[
                    "Le compte en dirhams convertibles facilite le rapatriement ultérieur des fonds",
                    "Le régime de change encadre les transferts entrants et sortants",
                    "La fiscalité de votre pays de résidence doit être coordonnée avec la fiscalité marocaine",
                    "Une gestion à distance avec un interlocuteur dédié évite les frictions",
                  ].map((r) => (
                    <li key={r} className="flex items-start gap-3">
                      <Check size={17} className="mt-1 shrink-0 text-gold-deep" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-base">
                  Retrouvez tout notre accompagnement sur la page{" "}
                  <Link href="/mre" className="text-gold-deep underline underline-offset-2">
                    dédiée aux MRE
                  </Link>
                  , ainsi que nos guides{" "}
                  <Link
                    href="/blog/investir-maroc-mre-guide-complet-2025"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    « Investir au Maroc en tant que MRE »
                  </Link>{" "}
                  et{" "}
                  <Link
                    href="/blog/rapatrier-epargne-maroc-mre-guide"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    « Rapatrier son épargne »
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 11. Erreurs à éviter */}
      <section id="erreurs" className="scroll-mt-28 shell py-16 md:py-24">
        <Reveal>
          <p className="eyebrow text-gold-deep">11 — Les pièges</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
            Les erreurs à éviter
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-soft">
            La performance se construit autant en évitant les erreurs qu'en trouvant les bonnes
            idées. Voici les plus fréquentes.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ERREURS.map((e, i) => (
            <Reveal key={e.title} delay={(i % 3) * 0.08}>
              <article className="flex h-full flex-col border border-slate/50 bg-cream p-8">
                <span className="flex h-11 w-11 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
                  <AlertTriangle size={20} strokeWidth={1.6} />
                </span>
                <h3 className="mt-5 font-display text-lg leading-tight text-navy">{e.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-soft">{e.body}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-base leading-relaxed text-navy-soft">
            Un exemple concret d'arbitrage mal posé : garder tout son argent sur un compte sur
            carnet. Notre comparatif{" "}
            <Link
              href="/blog/opcvm-vs-compte-sur-carnet-ou-placer-argent-maroc"
              className="text-gold-deep underline underline-offset-2"
            >
              « OPCVM vs compte sur carnet »
            </Link>{" "}
            chiffre la différence sur la durée.
          </p>
        </Reveal>
      </section>

      {/* 12. Comment se faire accompagner */}
      <section id="accompagnement" className="scroll-mt-28 border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <Reveal>
              <p className="eyebrow text-gold-deep">12 — Passer à l'action</p>
              <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
                Comment se faire accompagner
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
                <p>
                  Investir seul est possible. Investir bien, dans la durée, sans erreur coûteuse,
                  demande une méthode. C'est le rôle d'un cabinet indépendant comme Messidor
                  Patrimoine : partir de votre situation réelle, construire une allocation cohérente,
                  sélectionner les fonds, lire la fiscalité et suivre le tout dans le temps — sans
                  produit maison à placer, dans votre seul intérêt.
                </p>
                <ul className="space-y-2 border-t border-slate/40 pt-5 text-base">
                  {[
                    "Un bilan patrimonial complet pour cartographier vos actifs",
                    "Une allocation sur-mesure adossée à une sélection rigoureuse",
                    "Une lecture fine de la fiscalité pour maximiser la performance nette",
                    "Un suivi régulier et des arbitrages en fonction des marchés",
                  ].map((r) => (
                    <li key={r} className="flex items-start gap-3">
                      <Check size={17} className="mt-1 shrink-0 text-gold-deep" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-base">
                  Découvrez notre approche sur la page{" "}
                  <Link
                    href="/gestion-de-patrimoine"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    gestion de patrimoine
                  </Link>
                  , parcourez tous nos{" "}
                  <Link href="/guides" className="text-gold-deep underline underline-offset-2">
                    guides
                  </Link>{" "}
                  et articles du{" "}
                  <Link href="/blog" className="text-gold-deep underline underline-offset-2">
                    blog
                  </Link>
                  , ou préparez l'avenir avec notre guide{" "}
                  <Link
                    href="/blog/preparer-sa-retraite-maroc-guide"
                    className="text-gold-deep underline underline-offset-2"
                  >
                    « Préparer sa retraite au Maroc »
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">Questions fréquentes</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              Investir au Maroc : vos questions
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
                  <p className="mt-3 leading-relaxed text-navy-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-20 text-center md:py-28">
          <Reveal>
            <p className="eyebrow text-gold-deep">Passons à l'action</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-5xl">
              Prêt à investir au Maroc, avec méthode ?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-soft">
              Bénéficiez d'un premier échange avec l'un de nos experts. Nous transformerons ce guide
              en une stratégie concrète, calibrée sur vos objectifs.
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

          {/* Disclaimer */}
          <Reveal delay={0.1}>
            <p className="mx-auto mt-14 max-w-2xl border-t border-slate/40 pt-8 text-xs leading-relaxed text-navy-mute">
              Ce guide est fourni à titre purement informatif et pédagogique. Il ne constitue pas un
              conseil en investissement, une recommandation personnalisée ni une incitation à
              souscrire un produit financier. Les performances passées ne préjugent pas des
              performances futures, et tout investissement comporte un risque de perte en capital.
              Les données de marché s'appuient notamment sur les publications de l'ASFIM et le cadre
              réglementaire de l'AMMC ; les éléments fiscaux sont à confirmer au regard de la Loi de
              Finances en vigueur. Pour une analyse adaptée à votre situation,{" "}
              <Link href="/contact" className="text-gold-deep underline underline-offset-2">
                consultez l'un de nos conseillers
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
