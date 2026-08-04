import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MRE_COUNTRIES } from "@/lib/locations";
import { getAllPosts } from "@/lib/blog";
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
  const allPosts = getAllPosts();
  const relatedFiltered = allPosts.filter((p) => {
    const hay = `${p.slug} ${p.title} ${(p.keywords || []).join(" ")}`
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
    return ["mre", "devise", "rapatri", "etranger", "convertible", "change"].some((m) => hay.includes(m));
  });
  const relatedPosts = (relatedFiltered.length > 0 ? relatedFiltered : allPosts).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow="Marocains du monde (MRE)"
        title="Investir au Maroc, où que vous soyez"
        image="/images/heroes/littoral-casablanca.jpg"
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

      {/* À lire aussi */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-16 md:py-20">
          <Reveal>
            <p className="eyebrow text-gold-deep">À lire aussi</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Nos guides pour les MRE
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
