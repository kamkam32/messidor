import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Landmark,
  ChartPie,
  ShieldCheck,
  ArrowLeftRight,
  Video,
  ArrowRight,
} from "lucide-react";
import { MRE_COUNTRIES, getCountry } from "@/lib/locations";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 86400;

export function generateStaticParams() {
  return MRE_COUNTRIES.map((c) => ({ pays: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pays: string }>;
}): Promise<Metadata> {
  const { pays } = await params;
  const country = getCountry(pays);
  if (!country) return buildMetadata({ title: "Pays introuvable", path: `/mre/${pays}` });
  return buildMetadata({
    title: `Investir au Maroc ${country.fromLabel} — Guide MRE`,
    description: `Guide des ${country.demonym} pour investir au Maroc : rapatriement d'épargne, OPCVM & OPCI accessibles aux MRE, fiscalité, contrôle des changes et accompagnement entièrement à distance avec Messidor Patrimoine.`,
    path: `/mre/${country.slug}`,
  });
}

const PILLARS = [
  {
    icon: Landmark,
    eyebrow: "Rapatriement d'épargne",
    title: "Faire fructifier votre épargne au Maroc",
    body: "Beaucoup de MRE conservent une épargne dormante ou faiblement rémunérée à l'étranger. Nous vous aidons à en rapatrier une partie et à l'investir dans des véhicules marocains adaptés à vos objectifs et à votre horizon.",
  },
  {
    icon: ChartPie,
    eyebrow: "OPCVM & OPCI",
    title: "Des véhicules réglementés accessibles aux MRE",
    body: "Les OPCVM et OPCI marocains, supervisés par l'AMMC, sont accessibles aux non-résidents. Nous sélectionnons les fonds pertinents selon votre profil : actions, obligations, monétaire, diversifié ou immobilier.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Fiscalité & convention",
    title: "Éviter la double imposition",
    body: "Votre fiscalité dépend de votre pays de résidence et des conventions fiscales signées avec le Maroc. Nous coordonnons votre stratégie entre les deux juridictions pour préserver votre performance nette.",
  },
  {
    icon: ArrowLeftRight,
    eyebrow: "Contrôle des changes",
    title: "Le régime de convertibilité MRE",
    body: "Le Maroc offre aux MRE un régime de change spécifique, notamment la possibilité de comptes en devises ou convertibles facilitant les transferts et, sous conditions, le rapatriement des produits de cession. Nous vous guidons dans ces démarches.",
  },
];

export default async function PaysPage({ params }: { params: Promise<{ pays: string }> }) {
  const { pays } = await params;
  const country = getCountry(pays);
  if (!country) notFound();

  const path = `/mre/${country.slug}`;

  const FAQ = [
    {
      q: `Un MRE résidant ${country.fromLabel} peut-il investir dans des OPCVM au Maroc ?`,
      a: `Oui. Les OPCVM et OPCI marocains, réglementés par l'AMMC, sont accessibles aux Marocains résidant à l'étranger. La souscription passe généralement par un compte adapté au statut de non-résident. Nous vous accompagnons dans l'ouverture des comptes et la sélection des fonds, entièrement à distance.`,
    },
    {
      q: `Comment rapatrier mon épargne ${country.fromLabel} vers le Maroc ?`,
      a: `Le rapatriement s'effectue par virement vers un compte bancaire marocain adapté à votre statut. Le Maroc prévoit pour les MRE un régime de change facilitant ces transferts et, sous conditions, le retransfert des produits de vos investissements. Nous vous orientons vers les bons interlocuteurs bancaires et les démarches à suivre.`,
    },
    {
      q: `Serai-je imposé deux fois, au Maroc et ${country.fromLabel} ?`,
      a: `Les conventions fiscales conclues entre le Maroc et de nombreux pays visent précisément à éviter la double imposition. L'imposition finale dépend de la nature des revenus et de votre résidence fiscale. Nous coordonnons votre stratégie avec votre situation locale et vous invitons à valider les points précis avec un conseil fiscal de votre pays.`,
    },
    {
      q: `Puis-je être accompagné entièrement à distance ?`,
      a: `Oui. L'ensemble de la relation peut se tenir à distance : visioconférence, téléphone, WhatsApp et signature électronique. Vous disposez d'un interlocuteur dédié et d'un reporting régulier, où que vous résidiez.`,
    },
    {
      q: `Quel montant faut-il pour commencer ?`,
      a: `Le ticket d'entrée dépend des véhicules retenus et de vos objectifs. Certains fonds sont accessibles avec des montants modestes, d'autres visent des patrimoines plus établis. Nous définissons ensemble une allocation cohérente avec votre capacité d'épargne.`,
    },
  ];

  const service = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "@id": `${SITE.url}${path}#service`,
    name: `${SITE.name} — Investir au Maroc ${country.fromLabel}`,
    url: absoluteUrl(path),
    description: `Accompagnement des ${country.demonym} pour investir au Maroc : OPCVM & OPCI, rapatriement d'épargne, fiscalité et contrôle des changes, à distance.`,
    areaServed: { "@type": "Country", name: country.name },
    provider: { "@id": `${SITE.url}/#organization` },
    knowsAbout: ["Épargne MRE", "OPCVM", "OPCI", "Fiscalité marocaine", "Investissement Maroc", "Contrôle des changes"],
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
          service,
          faqPage,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "MRE", path: "/mre" },
            { name: country.name, path },
          ]),
        ]}
      />

      <PageHero
        eyebrow={`Marocains du monde · ${country.name}`}
        title={`Investir au Maroc ${country.fromLabel}`}
        intro={`Vous êtes parmi les ${country.demonym} et souhaitez faire fructifier votre épargne au Maroc ? Nous vous accompagnons à distance : rapatriement d'épargne, OPCVM & OPCI, fiscalité et régime de change.`}
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "MRE", href: "/mre" },
          { name: country.name, href: path },
        ]}
      />

      {/* Intro diaspora */}
      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal>
            <p className="eyebrow text-gold-deep">Votre situation</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-navy md:text-4xl">
              Un pont patrimonial entre {country.name} et le Maroc
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="space-y-5 text-lg leading-relaxed text-navy-soft">
              <p>{country.intro}</p>
              <p>
                Messidor Patrimoine accompagne les{" "}
                <strong className="font-semibold text-navy">{country.demonym}</strong> qui veulent
                investir au Maroc sans renoncer à la rigueur et à la transparence attendues d'un
                conseil indépendant. Toute la relation se tient à distance, avec un interlocuteur
                dédié.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Piliers MRE */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-deep">Notre accompagnement MRE</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Quatre leviers pour investir sereinement
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.eyebrow} delay={(i % 2) * 0.08}>
                  <article className="flex h-full flex-col border border-slate/50 bg-cream p-8">
                    <span className="flex h-12 w-12 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <p className="eyebrow mt-6 text-gold-deep">{p.eyebrow}</p>
                    <h3 className="mt-2 font-display text-xl leading-tight text-navy">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-navy-soft">{p.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-8 text-sm text-navy-mute">
              La fiscalité et le régime de change évoluent et dépendent de votre situation
              personnelle. Les éléments ci-dessus sont donnés à titre indicatif : nous validons chaque
              point lors d'un échange dédié.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Accompagnement à distance — navy */}
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
                <Video size={22} strokeWidth={1.6} />
              </span>
              <p className="eyebrow mt-6 text-gold-light">100 % à distance</p>
              <h2 className="mt-4 max-w-xl font-display text-3xl leading-tight md:text-4xl">
                Parlons de votre projet, où que vous soyez
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-cream/75">
                Décalage horaire, distance, agenda chargé : nous nous adaptons. Réservez un créneau ou
                écrivez-nous sur WhatsApp pour un premier échange sans engagement.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="flex flex-col gap-4 border border-cream/15 bg-navy p-8">
                <ButtonLink
                  href={`https://wa.me/${SITE.whatsapp}`}
                  external
                  variant="gold"
                  className="w-full"
                >
                  Écrire sur WhatsApp
                  <ArrowRight size={15} />
                </ButtonLink>
                <ButtonLink href={SITE.calendly} external variant="outline-light" className="w-full">
                  Réserver une visioconférence
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
              Investir au Maroc {country.fromLabel}
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
              Faites travailler votre épargne au Maroc
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-soft">
              Un premier échange sans engagement pour comprendre votre situation de MRE et tracer une
              stratégie d'investissement adaptée à votre pays de résidence.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href={SITE.calendly} external variant="dark">
                Prendre rendez-vous
                <ArrowRight size={15} />
              </ButtonLink>
              <ButtonLink href={`https://wa.me/${SITE.whatsapp}`} external variant="outline">
                WhatsApp
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
