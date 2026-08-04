import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GLOSSARY, getTerm } from "@/lib/glossary";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) return buildMetadata({ title: "Terme introuvable", path: `/lexique/${slug}` });
  return buildMetadata({
    title: `${term.term} : définition — Lexique patrimoine | ${SITE.name}`,
    description: term.short,
    path: `/lexique/${slug}`,
    type: "article",
  });
}

export default async function LexiqueTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) notFound();

  const related = (term.related ?? [])
    .map((s) => getTerm(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const definedTerm = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${absoluteUrl(`/lexique/${term.slug}`)}#term`,
    name: term.term,
    description: term.short,
    url: absoluteUrl(`/lexique/${term.slug}`),
    inLanguage: "fr",
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      "@id": `${absoluteUrl("/lexique")}#termset`,
      name: "Lexique du patrimoine — Messidor Patrimoine",
      url: absoluteUrl("/lexique"),
    },
  };

  return (
    <>
      <PageHero
        eyebrow="Lexique du patrimoine"
        title={term.term}
        intro={term.short}
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "Lexique", href: "/lexique" },
          { name: term.term, href: `/lexique/${term.slug}` },
        ]}
      />
      <JsonLd
        data={[
          definedTerm,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Lexique", path: "/lexique" },
            { name: term.term, path: `/lexique/${term.slug}` },
          ]),
        ]}
      />

      <section className="shell py-16 md:py-20">
        <Reveal>
          <div className="prose-messidor max-w-2xl">
            {term.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </Reveal>
      </section>

      {related.length > 0 && (
        <section className="border-t border-slate/40 bg-cream-light">
          <div className="shell py-16">
            <p className="eyebrow text-gold-deep">À lire aussi</p>
            <h2 className="mt-3 font-display text-2xl text-navy md:text-3xl">Termes liés</h2>
            <div className="mt-8 grid gap-px border border-slate/50 bg-slate/50 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/lexique/${r.slug}`}
                  className="group flex h-full flex-col bg-cream-light p-6 transition-colors hover:bg-cream"
                >
                  <h3 className="font-display text-lg text-navy transition-colors group-hover:text-gold-deep">
                    {r.term}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-soft">{r.short}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="shell py-16 text-center">
        <div className="mx-auto h-px w-12 bg-gold" />
        <h2 className="mx-auto mt-8 max-w-2xl font-display text-2xl text-navy md:text-3xl">
          Une question sur {term.term} ou votre patrimoine ?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-navy-soft">
          Nos conseillers vous accompagnent dans vos décisions d&apos;investissement au Maroc.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/contact" variant="dark">
            Être conseillé
          </ButtonLink>
          <ButtonLink href={SITE.calendly} external variant="outline">
            Prendre rendez-vous
          </ButtonLink>
        </div>
        <p className="mt-10">
          <Link href="/lexique" className="eyebrow text-gold-deep hover:text-navy">
            ← Retour au lexique
          </Link>
        </p>
      </section>
    </>
  );
}
