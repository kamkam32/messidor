import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Search,
  KeyRound,
  Building2,
  Handshake,
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
  title:
    "Immobilier d'exception au Maroc — Acquisition, vente & recherche sur-mesure",
  description:
    "Service de family office dédié à l'immobilier de prestige au Maroc : acquisition, cession et recherche off-market de biens d'exception — villas, riads, penthouses, terrains, immeubles de rapport. Un accompagnement confidentiel, indépendant et sur-mesure.",
  path: "/immobilier",
});

const SERVICES = [
  {
    icon: Search,
    eyebrow: "Acquisition",
    title: "Trouver et sécuriser le bien idéal",
    body: "Nous cartographions le marché — visible comme confidentiel — pour identifier les biens correspondant précisément à votre cahier des charges, puis menons la négociation et les vérifications préalables en votre nom.",
    points: [
      "Sourcing ciblé selon vos critères précis",
      "Négociation menée dans votre seul intérêt",
      "Due diligence : titre, urbanisme, conformité",
      "Coordination notaire, expert et architecte",
    ],
  },
  {
    icon: KeyRound,
    eyebrow: "Cession / Vente",
    title: "Valoriser et céder avec discrétion",
    body: "Pour les biens d'exception, la confidentialité prime souvent sur la diffusion massive. Nous valorisons votre actif, orchestrons une mise en marché maîtrisée et sélectionnons des acquéreurs qualifiés et solvables.",
    points: [
      "Estimation et stratégie de valorisation",
      "Mise en marché discrète, hors vitrine si souhaité",
      "Qualification et présélection des acquéreurs",
      "Pilotage jusqu'à la signature",
    ],
  },
  {
    icon: Home,
    eyebrow: "Recherche sur-mesure · Off-market",
    title: "Accéder aux biens rares non diffusés",
    body: "Une part des plus belles opportunités ne paraît jamais en ligne. Grâce à notre réseau de propriétaires, notaires et confrères, nous ouvrons l'accès à des biens off-market introuvables par les canaux classiques.",
    points: [
      "Mandat de recherche exclusif et confidentiel",
      "Réseau propriétaires, notaires et apporteurs",
      "Opportunités off-market sélectionnées",
      "Veille active tant que le bien n'est pas trouvé",
    ],
  },
  {
    icon: Building2,
    eyebrow: "Accompagnement & gestion",
    title: "Structurer, sécuriser et faire fructifier",
    body: "Au-delà de la transaction, nous coordonnons les dimensions juridique et fiscale de votre acquisition et, si vous le souhaitez, la gestion locative ou la mise en valeur de votre actif dans le temps.",
    points: [
      "Structuration de détention et lecture fiscale",
      "Coordination notaire, avocat et architecte",
      "Gestion locative et mise en valeur du bien",
      "Vision patrimoniale d'ensemble de l'actif",
    ],
  },
];

const PROPERTY_TYPES = [
  {
    title: "Villas d'exception",
    body: "Villas contemporaines et propriétés de standing, avec piscine, jardin et prestations haut de gamme.",
  },
  {
    title: "Riads de charme",
    body: "Riads authentiques et restaurés au cœur des médinas de Marrakech, Fès ou Essaouira.",
  },
  {
    title: "Penthouses & appartements",
    body: "Appartements de prestige et penthouses avec vue, dans les quartiers les plus recherchés.",
  },
  {
    title: "Terrains & fonciers",
    body: "Terrains constructibles et fonciers rares, en zone résidentielle premium ou balnéaire.",
  },
  {
    title: "Immeubles de rapport",
    body: "Immeubles et actifs de rendement pour bâtir ou consolider un patrimoine locatif.",
  },
  {
    title: "Résidences balnéaires",
    body: "Biens en front de mer et résidences de villégiature sur le littoral marocain.",
  },
];

const METHOD = [
  {
    step: "01",
    title: "Écoute & cahier des charges",
    body: "Un premier échange confidentiel pour cerner votre projet, vos critères, votre budget et l'usage attendu du bien — patrimonial, résidentiel ou locatif.",
  },
  {
    step: "02",
    title: "Recherche & sélection",
    body: "Nous activons notre réseau et le marché off-market pour ne vous présenter qu'une sélection resserrée de biens réellement pertinents.",
  },
  {
    step: "03",
    title: "Négociation & sécurisation",
    body: "Nous négocions dans votre intérêt et menons les vérifications préalables : titre de propriété, urbanisme, conformité et structuration.",
  },
  {
    step: "04",
    title: "Accompagnement à la signature",
    body: "Nous coordonnons notaire et conseils jusqu'à la signature, puis restons à vos côtés pour la gestion ou la valorisation de l'actif.",
  },
];

const REASONS = [
  "Indépendance totale : nous défendons votre seul intérêt, sans stock de biens à écouler",
  "Discrétion absolue à chaque étape, de la recherche à la signature",
  "Réseau de propriétaires, notaires et confrères donnant accès à l'off-market",
  "Vision patrimoniale globale : l'immobilier intégré à votre stratégie d'ensemble",
  "Coordination des expertises juridiques, fiscales et techniques",
  "Un interlocuteur dédié, disponible et engagé sur la durée",
];

const FAQ = [
  {
    q: "Quels types de biens accompagnez-vous ?",
    a: "Nous nous concentrons sur l'immobilier d'exception au Maroc : villas de standing, riads de charme, penthouses et appartements de prestige, terrains et fonciers rares, immeubles de rapport et résidences balnéaires. Chaque mission est étudiée au cas par cas, en fonction de la nature du bien et de votre projet patrimonial.",
  },
  {
    q: "Comment fonctionnent vos honoraires ?",
    a: "Nos honoraires dépendent de la nature et de la complexité de la mission — acquisition, cession ou recherche sur-mesure. Ils sont définis en toute transparence lors de notre premier échange, avant tout engagement. Nous privilégions une relation claire, sans surprise, alignée sur votre intérêt.",
  },
  {
    q: "Qu'est-ce qu'un bien « off-market » ?",
    a: "Un bien off-market est une propriété proposée à la vente sans diffusion publique, par discrétion ou par choix du propriétaire. Une part significative des biens d'exception se transmet ainsi, de gré à gré. Notre réseau de propriétaires, notaires et confrères nous permet d'accéder à ces opportunités confidentielles et de vous les présenter en exclusivité.",
  },
  {
    q: "Puis-je acheter à distance en tant que MRE ?",
    a: "Oui. Nous accompagnons régulièrement des Marocains résidant à l'étranger dans l'acquisition d'un bien au Maroc, à distance et en toute sérénité : visites déléguées, vérifications préalables, coordination du notaire et lecture des dispositifs de change. Découvrez notre accompagnement dédié aux MRE pour en savoir plus.",
  },
  {
    q: "En quoi votre approche diffère-t-elle d'une agence classique ?",
    a: "Nous agissons comme un family office de l'immobilier : indépendants, confidentiels et centrés sur votre seul intérêt, sans stock de biens à vendre. Notre mission ne se limite pas à la transaction — nous intégrons chaque acquisition ou cession dans une vision patrimoniale globale, en lien avec votre stratégie financière, fiscale et successorale.",
  },
];

export default function ImmobilierPage() {
  const allPosts = getAllPosts();
  const relatedFiltered = allPosts.filter((p) => {
    const hay = `${p.slug} ${p.title} ${(p.keywords || []).join(" ")}`
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    return ["immobilier", "villa", "riad", "mre", "achat", "acheter"].some((m) =>
      hay.includes(m)
    );
  });
  const relatedPosts = (relatedFiltered.length > 0 ? relatedFiltered : allPosts).slice(0, 3);

  const realEstateAgent = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE.url}/immobilier#service`,
    name: SITE.name,
    url: absoluteUrl("/immobilier"),
    description:
      "Service de family office dédié à l'immobilier d'exception au Maroc : acquisition, cession et recherche off-market de biens de prestige. Accompagnement confidentiel, indépendant et sur-mesure.",
    areaServed: { "@type": "Country", name: "Maroc" },
    provider: { "@id": `${SITE.url}/#organization` },
    serviceType: [
      "Acquisition immobilière",
      "Cession immobilière",
      "Recherche sur-mesure off-market",
      "Conseil en immobilier de prestige",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services immobiliers d'exception",
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
          realEstateAgent,
          faqPage,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Immobilier", path: "/immobilier" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Conseil immobilier · Biens d'exception"
        title="L'immobilier d'exception, accompagné de bout en bout"
        image="/images/heroes/immobilier-prestige.jpg"
        intro="Acquisition, cession et recherche sur-mesure de biens rares au Maroc. Messidor Patrimoine met la rigueur d'un family office au service de vos projets immobiliers les plus exigeants — dans la discrétion la plus absolue."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "Immobilier", href: "/immobilier" },
        ]}
      />

      {/* Intro / positionnement */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">Notre approche</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              Un accompagnement de family office pour vos actifs immobiliers
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
              <p>
                Acquérir ou céder un bien d'exception ne relève pas d'une simple transaction. C'est
                une décision patrimoniale, souvent confidentielle, qui engage sur le long terme. Nous
                l'abordons comme un <strong className="font-semibold text-navy">family office</strong> :
                indépendants, discrets et entièrement dédiés à votre intérêt.
              </p>
              <p>
                Villa, riad, penthouse, terrain ou immeuble de rapport — nous mettons à votre service
                un réseau, une méthode et un accès privilégié aux biens rares, y compris ceux qui ne
                sont jamais diffusés. Chaque mission est menée sur-mesure, dans la plus grande
                confidentialité.
              </p>
              <p>
                Pour l'immobilier sous forme financière — la « pierre-papier » —, découvrez notre offre{" "}
                <Link
                  href="/opci"
                  className="text-gold-deep underline underline-offset-2 transition-colors hover:text-navy"
                >
                  OPCI
                </Link>
                , complémentaire à l'acquisition en direct.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Nos services */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-deep">Nos services</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Acquérir, céder, rechercher — accompagné
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.eyebrow} delay={(i % 2) * 0.08}>
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

      {/* Types de biens */}
      <section className="shell py-16 md:py-24">
        <Reveal>
          <p className="eyebrow text-gold-deep">Biens d'exception</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
            Les actifs que nous accompagnons
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-soft">
            Des propriétés rares, choisies pour leur emplacement, leur caractère et leur potentiel
            patrimonial.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-px overflow-hidden border border-slate/50 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_TYPES.map((t, i) => (
            <Reveal key={t.title} delay={(i % 3) * 0.08}>
              <div className="h-full bg-cream p-8 transition-colors hover:bg-cream-light">
                <h3 className="font-display text-xl leading-tight text-navy">{t.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-soft">{t.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bande visuelle — cadre de vie */}
      <section className="relative overflow-hidden bg-navy-deep text-cream">
        <div className="relative aspect-[3/2] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
          <Image
            src="/images/heroes/interieur-luxe.jpg"
            alt="Intérieur d'un bien d'exception au Maroc"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-navy-deep/65" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(120% 90% at 15% 100%, rgba(176,138,62,0.20) 0%, transparent 55%)",
            }}
          />
          <div className="absolute inset-0 flex items-center">
            <div className="shell w-full">
              <Reveal>
                <p className="eyebrow text-gold-light">Un cadre de vie, un patrimoine</p>
                <h2 className="mt-4 max-w-2xl font-display text-3xl leading-[1.1] tracking-[-0.01em] md:text-5xl">
                  Bien plus qu'une adresse : un art de vivre et un actif d'exception
                </h2>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Notre méthode */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-deep">Notre méthode</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Une démarche rigoureuse en quatre temps
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-px overflow-hidden border border-slate/50 md:grid-cols-2 lg:grid-cols-4">
            {METHOD.map((m, i) => (
              <Reveal key={m.step} delay={(i % 4) * 0.08}>
                <div className="h-full bg-cream p-8">
                  <p className="font-display text-5xl text-gold-deep">{m.step}</p>
                  <h3 className="mt-5 font-display text-xl leading-tight text-navy">{m.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-soft">{m.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi Messidor */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            <span className="flex h-12 w-12 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
              <ShieldCheck size={22} strokeWidth={1.6} />
            </span>
            <p className="eyebrow mt-6 text-gold-deep">Pourquoi Messidor Patrimoine</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              L'indépendance et la discrétion d'un family office
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-navy-soft">
              Nous inscrivons chaque opération immobilière dans une vision patrimoniale d'ensemble —
              en cohérence avec votre{" "}
              <Link
                href="/gestion-de-patrimoine"
                className="text-gold-deep underline underline-offset-2 transition-colors hover:text-navy"
              >
                stratégie de gestion de patrimoine
              </Link>
              , vos projets d'
              <Link
                href="/investir-au-maroc"
                className="text-gold-deep underline underline-offset-2 transition-colors hover:text-navy"
              >
                investissement au Maroc
              </Link>{" "}
              et l'alternative financière des{" "}
              <Link
                href="/opci"
                className="text-gold-deep underline underline-offset-2 transition-colors hover:text-navy"
              >
                OPCI
              </Link>
              .
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

      {/* MRE — achat à distance */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <Reveal>
              <span className="flex h-12 w-12 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
                <Handshake size={22} strokeWidth={1.6} />
              </span>
              <p className="eyebrow mt-6 text-gold-deep">MRE · Achat à distance</p>
              <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
                Acquérir au Maroc depuis l'étranger, en toute sérénité
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-soft">
                Marocains résidant à l'étranger : nous gérons pour vous les visites, les
                vérifications préalables, la coordination du notaire et la lecture des dispositifs de
                change — pour un achat à distance sécurisé et sans friction.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="md:text-right">
                <ButtonLink href="/mre" variant="outline">
                  Notre accompagnement MRE
                  <ArrowRight size={15} />
                </ButtonLink>
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
              L'immobilier d'exception, sans zone d'ombre
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

      {/* À lire aussi */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-slate/40 bg-cream-light">
          <div className="shell py-16 md:py-20">
            <Reveal>
              <p className="eyebrow text-gold-deep">À lire aussi</p>
              <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
                Nos guides sur l'immobilier au Maroc
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
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-soft line-clamp-3">
                        {p.excerpt}
                      </p>
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
      )}

      {/* CTA final */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-20 text-center md:py-28">
          <Reveal>
            <p className="eyebrow text-gold-deep">Un premier échange confidentiel</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-5xl">
              Confiez-nous votre projet immobilier d'exception
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-soft">
              Acquisition, cession ou recherche sur-mesure : parlons de votre projet en toute
              discrétion. Un premier échange, sans engagement, pour définir ensemble la meilleure
              stratégie.
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
