import type { Metadata } from "next";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "L'équipe — Conseillers en gestion de patrimoine",
  description:
    "Rencontrez l'équipe de Messidor Patrimoine : des associés expérimentés du marché financier marocain, à vos côtés pour construire et préserver votre patrimoine.",
  path: "/equipe",
});

const TEAM = [
  {
    name: "Tarik Belghazi",
    role: "Associé",
    photo: "/images/tarik.jpg",
    bio: "Associé de Messidor Patrimoine, Tarik accompagne les clients dans la définition et le pilotage de leur stratégie patrimoniale, avec une connaissance fine des marchés financiers et de la fiscalité marocaine.",
  },
  {
    name: "Kamil Alami",
    role: "Associé",
    photo: "/images/kamil-portrait.png",
    bio: "Associé de Messidor Patrimoine, Kamil conseille particuliers et MRE sur la sélection de fonds OPCVM/OPCI et l'optimisation de leur allocation, avec une approche sur-mesure et pédagogique.",
  },
];

export default function EquipePage() {
  const personGraph = {
    "@context": "https://schema.org",
    "@graph": TEAM.map((m) => ({
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
      worksFor: { "@id": `${SITE.url}/#organization` },
      image: absoluteUrl(m.photo),
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="Notre équipe"
        title="Des experts à vos côtés"
        intro="Messidor Patrimoine, c'est avant tout des femmes et des hommes qui connaissent le marché financier marocain et s'engagent sur la durée auprès de leurs clients."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "Équipe", href: "/equipe" },
        ]}
      />
      <JsonLd
        data={[
          personGraph,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Équipe", path: "/equipe" },
          ]),
        ]}
      />

      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={(i % 2) * 0.08}>
              <div className="flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden border border-slate/50 bg-cream-light">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.photo}
                    alt={`${m.name}, ${m.role} de Messidor Patrimoine`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h2 className="mt-6 font-display text-2xl text-navy">{m.name}</h2>
                <p className="mt-1 eyebrow text-gold-deep">{m.role}</p>
                <p className="mt-4 max-w-md leading-relaxed text-navy-soft">{m.bio}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-navy text-cream">
        <div className="shell py-16 text-center md:py-20">
          <div className="mx-auto h-px w-12 bg-gold" />
          <h2 className="mx-auto mt-8 max-w-2xl font-display text-2xl leading-tight md:text-4xl">
            Discutons de votre projet patrimonial
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-cream/70">
            Le premier échange est gratuit et sans engagement.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <ButtonLink href="/contact" variant="gold">
              Nous contacter
            </ButtonLink>
            <ButtonLink href={SITE.calendly} external variant="outline-light">
              Prendre rendez-vous
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
