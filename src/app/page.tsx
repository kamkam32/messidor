import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LineChart, Landmark, ShieldCheck, Coins } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";
import { buildMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { getFundsCount } from "@/lib/funds";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Gestion de patrimoine au Maroc — OPCVM, OPCI & fiscalité",
  description:
    "Messidor Patrimoine accompagne particuliers et MRE dans la construction et la préservation de leur patrimoine : sélection OPCVM/OPCI, simulateurs fiscaux 2025 et stratégie sur-mesure du marché marocain.",
  path: "/",
});

const SERVICES = [
  {
    icon: LineChart,
    title: "Sélection OPCVM",
    text: "Une base de 600+ fonds analysés, filtrés et comparés pour bâtir une allocation performante et adaptée à votre profil de risque.",
    href: "/opcvm",
  },
  {
    icon: Landmark,
    title: "OPCI & immobilier",
    text: "Accéder à l'immobilier de rendement marocain via les OPCI, sans les contraintes de la détention en direct.",
    href: "/opci",
  },
  {
    icon: Coins,
    title: "Optimisation fiscale",
    text: "IR, plus-values immobilières (TPI), succession : nos simulateurs 2025 et notre conseil pour réduire la facture en toute légalité.",
    href: "/simulateurs",
  },
  {
    icon: ShieldCheck,
    title: "Stratégie sur-mesure",
    text: "Un bilan patrimonial complet et une feuille de route claire pour investir, protéger vos proches et transmettre.",
    href: "/gestion-de-patrimoine",
  },
];

const STEPS = [
  { n: "01", title: "Bilan", text: "Nous cartographions votre patrimoine, vos objectifs et votre horizon." },
  { n: "02", title: "Stratégie", text: "Nous concevons une allocation claire, chiffrée et fiscalement optimisée." },
  { n: "03", title: "Suivi", text: "Nous pilotons dans la durée et ajustons au fil des marchés et de votre vie." },
];

const FOUNDERS = [
  {
    name: "Tarik Belghazi",
    role: "Associé",
    photo: "/images/tarik.jpg",
    text: "Une connaissance fine des marchés financiers et de la fiscalité marocaine, au service de votre stratégie.",
  },
  {
    name: "Kamil Alami",
    role: "Associé",
    photo: "/images/kamil.jpg",
    text: "Un accompagnement sur-mesure et pédagogique des particuliers et des MRE dans leurs investissements.",
  },
];

export default async function HomePage() {
  const fundsCount = await getFundsCount();

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-navy-deep text-cream">
        <video
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source
            src="https://bjiwkxqjovdnheotagtr.supabase.co/storage/v1/object/public/video/2314024-uhd_3840_2160_24fps(3)(1).mp4"
            type="video/mp4"
          />
        </video>
        {/* Voiles de lisibilité (le texte reste net sur la vidéo) */}
        <div aria-hidden className="absolute inset-0 bg-navy-deep/70" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 70% 10%, rgba(176,138,62,0.16) 0%, transparent 55%), linear-gradient(180deg, rgba(9,19,32,0.55) 0%, rgba(9,19,32,0.35) 45%, rgba(9,19,32,0.85) 100%)",
          }}
        />
        <div className="shell relative z-10 w-full py-32">
          <Reveal>
            <p className="eyebrow text-gold-light">Cabinet de gestion de patrimoine · Maroc</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl font-display text-[2.8rem] leading-[1.04] tracking-[-0.015em] sm:text-6xl md:text-[5rem]">
              Bâtissez un patrimoine
              <br />
              <span className="italic text-gold-light">d&apos;exception.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-cream/75">
              Messidor Patrimoine vous accompagne dans la construction et la
              préservation de votre richesse, avec une expertise sur-mesure du
              marché financier marocain.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/gestion-de-patrimoine" variant="gold">
                Découvrir nos solutions <ArrowRight size={15} />
              </ButtonLink>
              <ButtonLink href={SITE.calendly} external variant="outline-light">
                Prendre rendez-vous
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PREUVE / CHIFFRES */}
      <section className="border-b border-slate/40 bg-cream-light">
        <div className="shell grid grid-cols-2 gap-8 py-14 md:grid-cols-4">
          {[
            { k: `${fundsCount}+`, v: "Fonds OPCVM suivis" },
            { k: "Quotidien", v: "Perfs mises à jour" },
            { k: "2025", v: "Simulateurs fiscaux" },
            { k: "Sur-mesure", v: "Accompagnement dédié" },
          ].map((s, i) => (
            <Reveal key={s.v} delay={(i % 4) * 0.06}>
              <p className="font-display text-3xl text-navy md:text-4xl">{s.k}</p>
              <p className="mt-2 text-sm text-navy-mute">{s.v}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="shell py-20 md:py-28">
        <Reveal>
          <p className="eyebrow text-gold-deep">Notre expertise</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight tracking-[-0.01em] text-navy md:text-5xl">
            Quatre leviers pour faire fructifier votre patrimoine
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden border border-slate/50 bg-slate/50 md:grid-cols-2">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 2) * 0.08} className="h-full">
              <Link
                href={s.href}
                className="group flex h-full flex-col bg-cream p-8 transition-colors hover:bg-cream-light md:p-10"
              >
                <s.icon size={26} className="text-gold-deep" strokeWidth={1.5} />
                <h3 className="mt-6 font-display text-2xl text-navy">{s.title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-navy-soft">{s.text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-transform group-hover:translate-x-1">
                  En savoir plus <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* APPROCHE */}
      <section className="bg-navy text-cream">
        <div className="shell py-20 md:py-28">
          <Reveal>
            <p className="eyebrow text-gold-light">Notre méthode</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-cream md:text-5xl">
              Une démarche claire, en trois temps
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={(i % 3) * 0.08}>
                <div className="h-px w-12 bg-gold" />
                <p className="mt-6 font-display text-5xl text-gold-light/80">{s.n}</p>
                <h3 className="mt-4 font-display text-2xl">{s.title}</h3>
                <p className="mt-3 text-cream/70">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FONDATEURS */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-20 md:py-28">
          <Reveal>
            <p className="eyebrow text-gold-deep">Le cabinet</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight tracking-[-0.01em] text-navy md:text-5xl">
              Des associés engagés à vos côtés
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy-soft">
              Messidor Patrimoine, ce sont des professionnels qui connaissent le marché
              financier marocain et s&apos;engagent dans la durée auprès de leurs clients.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name} delay={(i % 2) * 0.08}>
                <div className="flex items-start gap-6">
                  <div className="relative h-28 w-24 shrink-0 overflow-hidden border border-slate/50 bg-cream sm:h-32 sm:w-28">
                    <Image
                      src={f.photo}
                      alt={`${f.name}, ${f.role} de Messidor Patrimoine`}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-navy">{f.name}</h3>
                    <p className="mt-1 eyebrow text-gold-deep">{f.role}</p>
                    <p className="mt-3 text-[15px] leading-relaxed text-navy-soft">{f.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <Link
              href="/equipe"
              className="mt-12 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-transform hover:translate-x-1"
            >
              Rencontrer l&apos;équipe <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="shell py-24 text-center md:py-32">
        <Reveal>
          <div className="mx-auto h-px w-12 bg-gold" />
          <h2 className="mx-auto mt-8 max-w-3xl font-display text-3xl leading-[1.2] tracking-[-0.01em] text-navy md:text-[2.6rem]">
            Parlons de votre projet patrimonial. Le premier échange est gratuit et
            sans engagement.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/contact" variant="dark">
              Nous contacter <ArrowRight size={15} />
            </ButtonLink>
            <ButtonLink href={SITE.calendly} external variant="outline">
              Réserver un créneau
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
