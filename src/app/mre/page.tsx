import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MRE_COUNTRIES } from "@/lib/locations";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Investir au Maroc depuis l'étranger — Guide MRE",
  description:
    "Vous êtes Marocain résidant à l'étranger (MRE) ? Messidor Patrimoine vous accompagne à distance : OPCVM, OPCI, rapatriement d'épargne, fiscalité et contrôle des changes.",
  path: "/mre",
});

export default function MreIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Marocains du monde (MRE)"
        title="Investir au Maroc, où que vous soyez"
        intro="Depuis l'Europe, l'Amérique du Nord ou le Golfe, construisez et pilotez votre patrimoine marocain avec un accompagnement 100% à distance."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "MRE", href: "/mre" },
        ]}
      />
      <JsonLd data={breadcrumbGraph([{ name: "Accueil", path: "/" }, { name: "MRE", path: "/mre" }])} />

      <section className="shell py-16 md:py-20">
        <p className="eyebrow text-gold-deep">Choisissez votre pays de résidence</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MRE_COUNTRIES.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 0.06}>
              <Link
                href={`/mre/${c.slug}`}
                className="group flex items-center justify-between border border-slate/50 bg-cream p-6 transition-colors hover:bg-cream-light"
              >
                <span className="font-display text-xl text-navy group-hover:text-gold-deep">{c.name}</span>
                <ArrowRight size={18} className="text-navy-mute transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-navy text-cream">
        <div className="shell py-16 text-center md:py-20">
          <div className="mx-auto h-px w-12 bg-gold" />
          <h2 className="mx-auto mt-8 max-w-2xl font-display text-2xl leading-tight md:text-4xl">
            Un conseiller dédié, où que vous soyez
          </h2>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <ButtonLink href={SITE.calendly} external variant="gold">
              Prendre rendez-vous
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline-light">
              Nous écrire
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
