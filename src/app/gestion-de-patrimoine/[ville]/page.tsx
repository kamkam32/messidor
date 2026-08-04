import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  UserRound,
  ChartPie,
  ShieldCheck,
  Building2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { CITIES, getCity } from "@/lib/locations";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 86400;

export function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ville: string }>;
}): Promise<Metadata> {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) return buildMetadata({ title: "Ville introuvable", path: `/gestion-de-patrimoine/${ville}` });
  return buildMetadata({
    title: `Gestion de patrimoine à ${city.name} — Conseil OPCVM & fiscalité`,
    description: `Conseil en gestion de patrimoine à ${city.name} : accompagnement indépendant, sélection OPCVM & OPCI, optimisation fiscale et prise de rendez-vous avec un expert Messidor Patrimoine.`,
    path: `/gestion-de-patrimoine/${city.slug}`,
  });
}

const SERVICES = [
  {
    icon: UserRound,
    eyebrow: "Conseil patrimonial",
    title: "Un bilan complet, un cap clair",
    body: "Nous partons de votre situation réelle — patrimoine, objectifs, horizon et tolérance au risque — pour bâtir une stratégie actionnable et suivie dans le temps.",
  },
  {
    icon: ChartPie,
    eyebrow: "OPCVM & OPCI",
    title: "Les meilleurs véhicules du marché marocain",
    body: "Nous suivons les fonds OPCVM et OPCI cotés au Maroc pour sélectionner ceux qui correspondent à votre profil : actions, obligations, monétaire, diversifié ou immobilier.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Fiscalité",
    title: "Préserver la performance nette",
    body: "Nous structurons la détention de vos actifs et anticipons la transmission dans le cadre de la réglementation marocaine, pour préserver le rendement après impôt.",
  },
  {
    icon: Building2,
    eyebrow: "Vision globale",
    title: "Financier, immobilier, professionnel",
    body: "Nous coordonnons l'ensemble de votre patrimoine dans une approche cohérente, pour le développer, le protéger et le transmettre sereinement.",
  },
];

export default async function VillePage({ params }: { params: Promise<{ ville: string }> }) {
  const { ville } = await params;
  const city = getCity(ville);
  if (!city) notFound();

  const path = `/gestion-de-patrimoine/${city.slug}`;

  const FAQ = [
    {
      q: `Comment se déroule un accompagnement patrimonial à ${city.name} ?`,
      a: `Tout commence par un premier échange, en présentiel à ${city.name} ou à distance, pour comprendre votre situation et vos objectifs. Nous établissons ensuite un bilan patrimonial complet, puis une allocation sur-mesure que nous mettons en œuvre et suivons dans le temps, avec un reporting transparent.`,
    },
    {
      q: `Faut-il résider à ${city.name} pour être accompagné ?`,
      a: `Non. Nous accompagnons aussi bien les résidents de ${city.name} que les Marocains résidant à l'étranger qui souhaitent investir dans la région. L'essentiel de la relation peut se tenir à distance, par visioconférence, téléphone ou WhatsApp.`,
    },
    {
      q: `Quels investissements proposez-vous à ${city.name} ?`,
      a: `Notre cœur de métier est la sélection d'OPCVM et d'OPCI du marché marocain, complétée selon votre profil par des solutions immobilières et des opérations privées. L'allocation est toujours définie sur-mesure, en fonction de vos objectifs et de votre tolérance au risque.`,
    },
    {
      q: `Le premier rendez-vous est-il payant ?`,
      a: `Le premier échange est sans engagement. Il nous permet de comprendre votre situation et de vérifier que nous sommes le bon interlocuteur pour vos objectifs avant toute collaboration.`,
    },
  ];

  const financialService = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${SITE.url}${path}#service`,
    name: `${SITE.name} — Gestion de patrimoine à ${city.name}`,
    url: absoluteUrl(path),
    description: `Conseil en gestion de patrimoine à ${city.name} : accompagnement indépendant, sélection OPCVM & OPCI et optimisation fiscale.`,
    areaServed: { "@type": "City", name: city.name },
    provider: { "@id": `${SITE.url}/#organization` },
    knowsAbout: ["Gestion de patrimoine", "OPCVM", "OPCI", "Fiscalité marocaine", "Investissement Maroc"],
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
          financialService,
          faqPage,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Gestion de patrimoine", path: "/gestion-de-patrimoine" },
            { name: city.name, path },
          ]),
        ]}
      />

      <PageHero
        eyebrow={`Gestion de patrimoine · ${city.name}`}
        title={`Gestion de patrimoine à ${city.name}`}
        image="/images/heroes/finance-aerial.jpg"
        intro={`Un conseil patrimonial indépendant et sur-mesure pour les particuliers et entrepreneurs de ${city.name} : sélection OPCVM & OPCI, optimisation fiscale et stratégie d'investissement alignée sur vos seuls intérêts.`}
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "Gestion de patrimoine", href: "/gestion-de-patrimoine" },
          { name: city.name, href: path },
        ]}
      />

      {/* Intro locale */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">Votre conseiller à {city.name}</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              Un accompagnement patrimonial ancré dans votre région
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
              <p>{city.intro}</p>
              <p>
                Messidor Patrimoine met son expertise du marché financier marocain au service des
                habitants de <strong className="font-semibold text-navy">{city.name}</strong>. Notre
                indépendance garantit un conseil objectif, sans produit maison à placer : seuls vos
                objectifs guident nos recommandations.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-deep">Nos expertises</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Ce que nous faisons pour vous à {city.name}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.eyebrow} delay={(i % 2) * 0.08}>
                  <article className="flex h-full flex-col border border-slate/50 bg-cream p-8">
                    <span className="flex h-12 w-12 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <p className="eyebrow mt-6 text-gold-deep">{s.eyebrow}</p>
                    <h3 className="mt-2 font-display text-xl leading-tight text-navy">{s.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy-soft">{s.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-8 text-sm text-navy-mute">
              Découvrez le détail de notre approche sur la page{" "}
              <a
                href="/gestion-de-patrimoine"
                className="text-gold-deep underline underline-offset-2"
              >
                gestion de patrimoine
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* Prise de RDV local */}
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
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <Reveal>
              <span className="flex h-12 w-12 items-center justify-center border border-gold-light/40 bg-gold-light/10 text-gold-light">
                <MapPin size={22} strokeWidth={1.6} />
              </span>
              <p className="eyebrow mt-6 text-gold-light">Prendre rendez-vous</p>
              <h2 className="mt-4 max-w-xl font-display text-3xl leading-tight md:text-4xl">
                Échangeons sur votre patrimoine à {city.name}
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream/75">
                Un premier rendez-vous sans engagement, en visioconférence ou par téléphone, pour
                comprendre votre situation et tracer une première feuille de route.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-col gap-4 border border-cream/15 bg-navy p-8">
                <ButtonLink href={SITE.calendly} external variant="gold" className="w-full">
                  Prendre rendez-vous
                  <ArrowRight size={15} />
                </ButtonLink>
                <ButtonLink
                  href={`https://wa.me/${SITE.whatsapp}`}
                  external
                  variant="outline-light"
                  className="w-full"
                >
                  Échanger sur WhatsApp
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline-light" className="w-full">
                  Formulaire de contact
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
              La gestion de patrimoine à {city.name}
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
              Structurer votre patrimoine à {city.name}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-soft">
              Bénéficiez d'un premier échange avec l'un de nos experts. Ensemble, nous élaborerons une
              stratégie sur-mesure adaptée à vos objectifs.
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
