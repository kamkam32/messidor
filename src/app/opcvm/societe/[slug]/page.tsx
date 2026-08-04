import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  getFunds,
  getManagementCompanies,
  slugify,
  type Fund,
} from "@/lib/funds";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { formatPct, perfColorClass } from "@/lib/format";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { FundCard } from "@/components/opcvm/FundCard";

export const revalidate = 3600;
export const dynamicParams = true;

/** Retrouve une société de gestion à partir de son slug. */
async function resolveCompany(slug: string): Promise<{ name: string; count: number } | null> {
  const companies = await getManagementCompanies();
  return companies.find((c) => slugify(c.name) === slug) ?? null;
}

export async function generateStaticParams() {
  const companies = await getManagementCompanies();
  return companies
    .filter((c) => c.count >= 2)
    .map((c) => ({ slug: slugify(c.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await resolveCompany(slug);
  if (!company) {
    return buildMetadata({ title: "Société de gestion introuvable", path: `/opcvm/societe/${slug}` });
  }
  return buildMetadata({
    title: `OPCVM ${company.name} — ${company.count} fonds, performances & risque`,
    description: `Découvrez les ${company.count} fonds OPCVM gérés par ${company.name} au Maroc : performances YTD, 1 an et 3 ans, niveau de risque et valeur liquidative. Données actualisées quotidiennement.`,
    path: `/opcvm/societe/${slug}`,
  });
}

export default async function SocietePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await resolveCompany(slug);
  if (!company) notFound();

  const all = await getFunds({ type: "OPCVM" });
  const funds = all.filter(
    (f) => f.management_company && slugify(f.management_company) === slug
  );
  if (funds.length === 0) notFound();

  const best = funds.reduce<Fund | null>((acc, f) => {
    if (f.ytd_performance == null) return acc;
    if (!acc || (acc.ytd_performance ?? -Infinity) < f.ytd_performance) return f;
    return acc;
  }, null);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `OPCVM ${company.name}`,
    numberOfItems: funds.length,
    itemListElement: funds.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: f.slug ? absoluteUrl(`/opcvm/${f.slug}`) : undefined,
      name: f.name,
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          itemList,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "OPCVM", path: "/opcvm" },
            { name: company.name, path: `/opcvm/societe/${slug}` },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Société de gestion"
        title={company.name}
        intro={`${company.count} fonds OPCVM suivis. Comparez les performances, le niveau de risque et la valeur liquidative de l'ensemble des fonds gérés par ${company.name}.`}
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "OPCVM", href: "/opcvm" },
          { name: company.name, href: `/opcvm/societe/${slug}` },
        ]}
      />

      {/* Intro + retour */}
      <section className="shell pt-12 md:pt-16">
        <Link
          href="/opcvm"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-navy-mute transition-colors hover:text-navy"
        >
          <ArrowLeft size={14} /> Tous les OPCVM
        </Link>
        <Reveal className="mt-8 max-w-2xl">
          <p className="text-lg leading-relaxed text-navy-soft">
            {company.name} figure parmi les sociétés de gestion actives sur le marché des OPCVM au
            Maroc. Retrouvez ci-dessous l'intégralité de ses fonds suivis par Messidor Patrimoine,
            {best && best.ytd_performance != null ? (
              <>
                {" "}avec en tête <strong className="font-semibold text-navy">{best.name}</strong> à{" "}
                <span className={`font-semibold ${perfColorClass(best.ytd_performance)}`}>
                  {formatPct(best.ytd_performance)}
                </span>{" "}
                de performance YTD.
              </>
            ) : (
              " classés par performance."
            )}
          </p>
        </Reveal>
      </section>

      {/* Grille de fonds */}
      <section className="shell py-12 md:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {funds.map((f, i) => (
            <Reveal key={f.id} delay={(i % 3) * 0.06}>
              <FundCard fund={f} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate/40 bg-cream-light">
        <div className="shell py-20 text-center md:py-24">
          <Reveal>
            <p className="eyebrow text-gold-deep">Besoin de conseil ?</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl leading-tight text-navy md:text-4xl">
              Quel fonds {company.name} pour votre allocation ?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-soft">
              Nos conseillers vous aident à sélectionner les fonds les mieux adaptés à votre profil
              et à les intégrer dans une stratégie patrimoniale cohérente.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <ButtonLink href="/contact" variant="dark">
                Être accompagné
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
