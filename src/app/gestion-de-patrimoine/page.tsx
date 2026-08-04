import type { Metadata } from "next";
import Link from "next/link";
import {
  UserRound,
  ChartPie,
  Building2,
  Handshake,
  Globe2,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Gestion de patrimoine au Maroc — Conseil & investissement sur-mesure",
  description:
    "Cabinet de conseil en gestion de patrimoine au Maroc : conseil patrimonial, sélection OPCVM & OPCI, optimisation fiscale, club deals immobiliers et accompagnement des MRE. Une approche indépendante et transparente.",
  path: "/gestion-de-patrimoine",
});

const SERVICES = [
  {
    icon: UserRound,
    eyebrow: "Conseil patrimonial",
    title: "Un conseil indépendant, sans conflit d'intérêt",
    body: "Nous partons de votre situation réelle — patrimoine, objectifs, horizon et tolérance au risque — pour construire une stratégie claire et actionnable. Aucun produit maison à placer, seulement votre intérêt.",
    points: [
      "Bilan patrimonial complet et cartographie des actifs",
      "Allocation d'actifs sur-mesure et feuille de route",
      "Suivi régulier et arbitrages en fonction des marchés",
      "Reporting de performance transparent",
    ],
  },
  {
    icon: ChartPie,
    eyebrow: "Sélection OPCVM & OPCI",
    title: "Les meilleurs véhicules du marché marocain",
    body: "Nous suivons quotidiennement l'ensemble des fonds OPCVM et OPCI du Maroc pour sélectionner ceux qui correspondent à votre profil : actions, obligations, monétaire, diversifié ou immobilier.",
    points: [
      "Analyse comparative des performances et du risque",
      "Sélection rigoureuse par classe d'actifs",
      "Diversification sectorielle et géographique",
      "Rééquilibrage périodique du portefeuille",
    ],
  },
  {
    icon: ShieldCheck,
    eyebrow: "Optimisation fiscale",
    title: "Structurer pour préserver et transmettre",
    body: "La fiscalité est un levier majeur de performance nette. Nous optimisons la structure de détention de vos actifs et anticipons la transmission dans le cadre de la réglementation marocaine.",
    points: [
      "Optimisation de la fiscalité des revenus et plus-values",
      "Structuration de la détention des actifs",
      "Planification successorale et transmission",
      "Veille réglementaire (AMMC, ACAPS, Loi de Finances)",
    ],
  },
  {
    icon: Handshake,
    eyebrow: "Club deals & immobilier",
    title: "Accès à des opportunités privées exclusives",
    body: "Au-delà des marchés cotés, nous ouvrons l'accès à des opérations de co-investissement et à des actifs immobiliers premium, sélectionnés et audités par nos experts.",
    points: [
      "Co-investissement dans des projets à fort potentiel",
      "Due diligence approfondie de chaque opération",
      "Actifs immobiliers premium et rendement locatif",
      "Accompagnement juridique et fiscal complet",
    ],
  },
  {
    icon: Globe2,
    eyebrow: "Accompagnement MRE",
    title: "Investir au Maroc depuis l'étranger",
    body: "Marocains résidant à l'étranger : nous vous accompagnons à distance pour investir sereinement au Maroc, en tenant compte de votre fiscalité de résidence et des dispositifs de change.",
    points: [
      "Stratégie d'investissement adaptée à votre pays de résidence",
      "Gestion à distance et interlocuteur dédié",
      "Optimisation des transferts et du régime de change",
      "Coordination fiscale entre les deux juridictions",
    ],
  },
  {
    icon: Building2,
    eyebrow: "Gestion globale",
    title: "Une vision d'ensemble de votre patrimoine",
    body: "Financier, immobilier, professionnel : nous structurons l'ensemble de votre patrimoine dans une approche cohérente, pour le développer, le protéger et le transmettre.",
    points: [
      "Stratégie patrimoniale globale et cohérente",
      "Protection des actifs et prévoyance",
      "Coordination avec vos conseils (notaire, expert-comptable)",
      "Accès permanent à votre conseiller",
    ],
  },
];

const METHOD = [
  {
    step: "01",
    title: "Diagnostic",
    body: "Un premier échange approfondi pour comprendre votre situation, vos objectifs et votre tolérance au risque. Nous établissons un bilan patrimonial complet.",
  },
  {
    step: "02",
    title: "Stratégie",
    body: "Nous concevons une allocation d'actifs sur-mesure et une feuille de route claire, en sélectionnant les véhicules d'investissement les plus adaptés.",
  },
  {
    step: "03",
    title: "Pilotage",
    body: "Nous mettons en œuvre, suivons et ajustons votre stratégie dans le temps, avec un reporting transparent et des arbitrages en fonction des marchés.",
  },
];

const REASONS = [
  "Conseil indépendant et transparent, sans conflit d'intérêt",
  "Expertise approfondie du marché financier marocain",
  "Accès privilégié aux meilleures opportunités d'investissement",
  "Accompagnement personnalisé par des experts dédiés",
  "Reporting complet et suivi régulier de vos investissements",
  "Conformité avec la réglementation marocaine (AMMC, ACAPS)",
];

export default function GestionDePatrimoinePage() {
  const allPosts = getAllPosts();
  const relatedFiltered = allPosts.filter((p) => {
    const hay = `${p.slug} ${p.title} ${(p.keywords || []).join(" ")}`
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    return ["patrimoine", "epargne", "strategie", "allocation", "placer", "placement", "interets"].some(
      (m) => hay.includes(m)
    );
  });
  const relatedPosts = (relatedFiltered.length > 0 ? relatedFiltered : allPosts).slice(0, 3);

  const financialService = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${SITE.url}/gestion-de-patrimoine#service`,
    name: `${SITE.name} — Gestion de patrimoine`,
    url: absoluteUrl("/gestion-de-patrimoine"),
    description:
      "Cabinet de conseil en gestion de patrimoine au Maroc : conseil patrimonial, sélection OPCVM & OPCI, optimisation fiscale, club deals immobiliers et accompagnement des MRE.",
    areaServed: { "@type": "Country", name: "Maroc" },
    provider: { "@id": `${SITE.url}/#organization` },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services de gestion de patrimoine",
      itemListElement: SERVICES.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.eyebrow,
          description: s.body,
        },
      })),
    },
  };

  return (
    <>
      <JsonLd
        data={[
          financialService,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Gestion de patrimoine", path: "/gestion-de-patrimoine" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Conseil en gestion de patrimoine · Maroc"
        title="Développer, protéger et transmettre votre patrimoine"
        image="/images/heroes/finance-aerial.jpg"
        intro="Un accompagnement indépendant et sur-mesure : du conseil patrimonial à la sélection des meilleurs fonds, de l'optimisation fiscale aux opportunités privées. Au service de vos objectifs, sans conflit d'intérêt."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "Gestion de patrimoine", href: "/gestion-de-patrimoine" },
        ]}
      />

      {/* Intro éditoriale */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">Notre métier</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              Une offre complète, une seule priorité : votre intérêt
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg leading-relaxed text-navy-soft">
              Messidor Patrimoine met son expertise du marché financier marocain au service de vos
              objectifs. Nous concevons des stratégies patrimoniales personnalisées, adossées à une
              sélection rigoureuse de véhicules d'investissement et à une lecture fine de la
              fiscalité locale. Notre indépendance garantit un conseil objectif, transparent et
              aligné sur vos seuls intérêts.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Services — grille */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-deep">Nos expertises</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Six domaines d'accompagnement
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.eyebrow} delay={(i % 3) * 0.08}>
                  <article className="flex h-full flex-col border border-slate/50 bg-cream p-8 transition-colors hover:bg-cream-light">
                    <span className="flex h-12 w-12 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <p className="eyebrow mt-6 text-gold-deep">{s.eyebrow}</p>
                    <h3 className="mt-2 font-display text-xl leading-tight text-navy">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy-soft">{s.body}</p>
                    <ul className="mt-5 space-y-2 border-t border-slate/40 pt-5">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm text-navy-soft">
                          <Check size={15} className="mt-0.5 shrink-0 text-gold-deep" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Méthode en 3 étapes — fond navy */}
      <section className="relative overflow-hidden bg-navy-deep text-cream">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(120% 90% at 20% 0%, rgba(176,138,62,0.16) 0%, transparent 55%)",
          }}
        />
        <div className="shell relative z-10 py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-light">Notre méthode</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight md:text-4xl">
              Une démarche structurée en trois étapes
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden border border-cream/15 md:grid-cols-3">
            {METHOD.map((m, i) => (
              <Reveal key={m.step} delay={i * 0.1}>
                <div className="h-full bg-navy p-8 md:p-10">
                  <p className="font-display text-5xl text-gold-light">{m.step}</p>
                  <h3 className="mt-5 font-display text-2xl">{m.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream/70">{m.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi nous — cream */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            <p className="eyebrow text-gold-deep">Pourquoi Messidor Patrimoine</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              L'expertise locale, la rigueur d'une banque privée
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-navy-soft">
              Notre connaissance approfondie du marché marocain, combinée à une approche
              personnalisée et transparente, fait de nous le partenaire idéal pour développer et
              protéger votre patrimoine.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="space-y-4">
              {REASONS.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-3 border-b border-slate/40 pb-4 text-navy-soft"
                >
                  <Check size={18} className="mt-0.5 shrink-0 text-gold-deep" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* À lire aussi */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-20">
          <Reveal>
            <p className="eyebrow text-gold-deep">À lire aussi</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Nos guides pour structurer votre patrimoine
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {relatedPosts.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.08} className="h-full">
                <Link
                  href={`/blog/${p.slug}`}
                  className="group flex h-full flex-col border border-slate/50 bg-cream p-6 transition-colors hover:bg-cream-light"
                >
                  {p.category && <span className="eyebrow text-gold-deep">{p.category}</span>}
                  <h3 className="mt-3 font-display text-lg leading-tight text-navy transition-colors group-hover:text-gold-deep">
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-soft line-clamp-3">{p.excerpt}</p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-transform group-hover:translate-x-1">
                    Lire <ArrowRight size={13} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-colors hover:text-gold-deep"
            >
              Tous nos guides <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-20 text-center md:py-28">
          <Reveal>
            <p className="eyebrow text-gold-deep">Passons à l'action</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-5xl">
              Prêt à structurer votre patrimoine ?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-soft">
              Bénéficiez d'un premier échange avec l'un de nos experts. Ensemble, nous élaborerons une
              stratégie sur-mesure pour atteindre vos objectifs financiers.
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
