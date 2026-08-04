import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getFunds, getClassifications, slugify } from "@/lib/funds";
import { getCategoryContent } from "@/lib/opcvm-categories";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { FundCard } from "@/components/opcvm/FundCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const cats = await getClassifications();
  return cats.filter((c) => c.count >= 2).map((c) => ({ slug: slugify(c.name) }));
}

async function resolve(slug: string) {
  const [funds, cats] = await Promise.all([getFunds({ type: "OPCVM" }), getClassifications()]);
  const cat = cats.find((c) => slugify(c.name) === slug);
  const matched = funds
    .filter((f) => f.classification && slugify(f.classification) === slug)
    .sort((a, b) => (b.ytd_performance ?? -Infinity) - (a.ytd_performance ?? -Infinity));
  return { cat, matched, label: cat?.name };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { matched, label } = await resolve(slug);
  const content = getCategoryContent(slug, label);
  if (matched.length === 0) return buildMetadata({ title: "Catégorie introuvable", path: `/opcvm/categorie/${slug}` });
  return buildMetadata({
    title: `${content.label} au Maroc 2026 — Performances & comparatif`,
    description: `Comparez les ${matched.length} ${content.label.toLowerCase()} du Maroc : performances YTD, 1 an, 3 ans, risque et frais. ${content.intro.slice(0, 90)}…`,
    path: `/opcvm/categorie/${slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { matched, label } = await resolve(slug);
  if (matched.length === 0) notFound();
  const content = getCategoryContent(slug, label);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${content.label} Maroc`,
    numberOfItems: matched.length,
    itemListElement: matched.slice(0, 15).map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: f.slug ? absoluteUrl(`/opcvm/${f.slug}`) : undefined,
      name: f.name,
    })),
  };
  const faqLd =
    content.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: content.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      <PageHero
        eyebrow={`${matched.length} fonds · Mise à jour quotidienne`}
        title={`${content.label} au Maroc`}
        intro={content.intro}
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "OPCVM", href: "/opcvm" },
          { name: content.label, href: `/opcvm/categorie/${slug}` },
        ]}
      />
      <JsonLd
        data={[
          itemList,
          ...(faqLd ? [faqLd] : []),
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "OPCVM", path: "/opcvm" },
            { name: content.label, path: `/opcvm/categorie/${slug}` },
          ]),
        ]}
      />

      <section className="shell py-16 md:py-20">
        <Reveal>
          <div className="max-w-2xl border-l-2 border-gold pl-5">
            <p className="text-navy-soft">{content.risk}</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matched.slice(0, 24).map((f, i) => (
            <FundCard key={f.id} fund={f} rank={i + 1} />
          ))}
        </div>

        {matched.length > 24 && (
          <div className="mt-10 text-center">
            <ButtonLink href="/opcvm" variant="outline">
              Voir tous les OPCVM
            </ButtonLink>
          </div>
        )}
      </section>

      {content.faq.length > 0 && (
        <section className="border-t border-slate/40 bg-cream-light">
          <div className="shell py-16">
            <p className="eyebrow text-gold-deep">Questions fréquentes</p>
            <h2 className="mt-3 font-display text-2xl text-navy md:text-3xl">
              {content.label} — ce qu&apos;il faut savoir
            </h2>
            <div className="mt-8 max-w-3xl divide-y divide-slate/50 border-y border-slate/50">
              {content.faq.map((f) => (
                <details key={f.q} className="group py-5">
                  <summary className="cursor-pointer list-none font-display text-lg text-navy">
                    {f.q}
                  </summary>
                  <p className="mt-3 text-navy-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="shell py-16 text-center">
        <div className="mx-auto h-px w-12 bg-gold" />
        <h2 className="mx-auto mt-8 max-w-2xl font-display text-2xl text-navy md:text-3xl">
          Besoin d&apos;aide pour choisir un {content.label.toLowerCase().replace("opcvm ", "OPCVM ")} ?
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/contact" variant="dark">
            Être conseillé
          </ButtonLink>
          <ButtonLink href={SITE.calendly} external variant="outline">
            Prendre rendez-vous
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
