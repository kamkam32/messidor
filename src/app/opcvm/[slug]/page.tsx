import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getFundBySlug, getFundHistory, getFunds, getAllFundSlugs } from "@/lib/funds";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";
import { formatPct, perfColorClass, formatMAD, formatNumber, riskLabel } from "@/lib/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { FundChart } from "@/components/opcvm/FundChart";
import { CompanyLogo } from "@/components/opcvm/CompanyLogo";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  // Prérend les 30 plus performants ; le reste est généré à la demande (ISR).
  const funds = await getFunds({ type: "OPCVM", limit: 30 });
  return funds.filter((f) => f.slug).map((f) => ({ slug: f.slug as string }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fund = await getFundBySlug(slug);
  if (!fund) return buildMetadata({ title: "Fonds introuvable", path: `/opcvm/${slug}` });
  const perf = fund.ytd_performance != null ? ` — Performance YTD ${formatPct(fund.ytd_performance)}` : "";
  return buildMetadata({
    title: `${fund.name} — OPCVM${fund.management_company ? ` ${fund.management_company}` : ""}`,
    description: `${fund.name} : performances, valeur liquidative, niveau de risque (${riskLabel(
      fund.risk_level
    )}) et frais${perf}. Fiche complète du fonds OPCVM marocain, mise à jour quotidienne.`,
    path: `/opcvm/${slug}`,
    type: "article",
  });
}

const PERF_ROWS: { label: string; key: keyof import("@/lib/funds").Fund }[] = [
  { label: "1 jour", key: "perf_1d" },
  { label: "1 semaine", key: "perf_1w" },
  { label: "1 mois", key: "perf_1m" },
  { label: "3 mois", key: "perf_3m" },
  { label: "6 mois", key: "perf_6m" },
  { label: "YTD", key: "ytd_performance" },
  { label: "1 an", key: "perf_1y" },
  { label: "3 ans", key: "perf_3y" },
  { label: "5 ans", key: "perf_5y" },
];

export default async function FundPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fund = await getFundBySlug(slug);
  if (!fund) notFound();

  const [history, related] = await Promise.all([
    getFundHistory(fund.id),
    getFunds({ type: "OPCVM", limit: 4 }),
  ]);

  const financialProduct = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "@id": absoluteUrl(`/opcvm/${slug}/#product`),
    name: fund.name,
    category: fund.classification ?? "OPCVM",
    url: absoluteUrl(`/opcvm/${slug}`),
    provider: fund.management_company
      ? { "@type": "Organization", name: fund.management_company }
      : { "@id": `${SITE.url}/#organization` },
    ...(fund.updated_at ? { dateModified: fund.updated_at } : {}),
    ...(fund.isin_code
      ? { identifier: { "@type": "PropertyValue", propertyID: "ISIN", value: fund.isin_code } }
      : {}),
    additionalProperty: [
      fund.ytd_performance != null && {
        "@type": "PropertyValue",
        name: "Performance YTD",
        value: fund.ytd_performance,
        unitText: "%",
      },
      fund.perf_1y != null && {
        "@type": "PropertyValue",
        name: "Performance 1 an",
        value: fund.perf_1y,
        unitText: "%",
      },
      fund.risk_level != null && {
        "@type": "PropertyValue",
        name: "Niveau de risque (SRRI)",
        value: fund.risk_level,
        maxValue: 7,
      },
      fund.management_fees != null && {
        "@type": "PropertyValue",
        name: "Frais de gestion",
        value: fund.management_fees,
        unitText: "%",
      },
    ].filter(Boolean),
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Quelle est la performance du fonds ${fund.name} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Au dernier relevé, ${fund.name} affiche une performance YTD de ${formatPct(
            fund.ytd_performance
          )} et de ${formatPct(fund.perf_1y)} sur un an. Les performances sont mises à jour quotidiennement à partir des données ASFIM.`,
        },
      },
      {
        "@type": "Question",
        name: `Quel est le niveau de risque de ${fund.name} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Le fonds ${fund.name} présente un niveau de risque de ${riskLabel(
            fund.risk_level
          )} sur une échelle de 1 à 7${fund.classification ? `, dans la classification ${fund.classification}` : ""}.`,
        },
      },
      {
        "@type": "Question",
        name: `Qui gère le fonds ${fund.name} ?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${fund.name} est géré par ${fund.management_company ?? "sa société de gestion"}. Pour investir ou obtenir un conseil, contactez Messidor Patrimoine.`,
        },
      },
    ],
  };

  return (
    <>
      <JsonLd
        data={[
          financialProduct,
          faq,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "OPCVM", path: "/opcvm" },
            { name: fund.name, path: `/opcvm/${slug}` },
          ]),
        ]}
      />

      {/* En-tête */}
      <section className="relative overflow-hidden bg-navy-deep text-cream">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(120% 90% at 80% 0%, rgba(176,138,62,0.16) 0%, transparent 55%)" }}
        />
        <div className="shell relative z-10 pb-14 pt-32 md:pt-40">
          <Link
            href="/opcvm"
            className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cream/60 transition-colors hover:text-cream"
          >
            <ArrowLeft size={14} /> Tous les fonds
          </Link>
          {fund.classification && <p className="eyebrow text-gold-light">{fund.classification}</p>}
          <div className="mt-4 flex items-center gap-4">
            <CompanyLogo company={fund.management_company} size={56} />
            <div>
              <h1 className="max-w-3xl font-display text-3xl leading-tight md:text-5xl">{fund.name}</h1>
              {fund.management_company && (
                <p className="mt-1 text-sm uppercase tracking-wide text-cream/60">{fund.management_company}</p>
              )}
            </div>
          </div>
          {fund.updated_at && (
            <p className="mt-4 text-xs text-cream/50">
              Données au{" "}
              {new Date(fund.updated_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              · Source : ASFIM
            </p>
          )}
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { l: "Performance YTD", v: formatPct(fund.ytd_performance), c: perfColorClass(fund.ytd_performance) },
              { l: "Sur 1 an", v: formatPct(fund.perf_1y), c: perfColorClass(fund.perf_1y) },
              { l: "Valeur liquidative", v: formatNumber(fund.nav), c: "text-cream" },
              { l: "Risque", v: riskLabel(fund.risk_level), c: "text-cream" },
            ].map((s) => (
              <div key={s.l}>
                <p className="eyebrow text-cream/60">{s.l}</p>
                <p className={`mt-1 font-display text-2xl md:text-3xl ${s.c}`}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corps */}
      <section className="shell grid gap-12 py-16 md:grid-cols-[1.6fr_1fr] md:py-20">
        <div>
          <Reveal>
            <p className="eyebrow text-gold-deep">Évolution de la valeur liquidative</p>
            <h2 className="mt-3 font-display text-2xl text-navy">Historique du fonds</h2>
            <div className="mt-6">
              <FundChart data={history} />
            </div>
          </Reveal>

          <Reveal className="mt-12">
            <p className="eyebrow text-gold-deep">Performances détaillées</p>
            <div className="mt-4 overflow-x-auto border border-slate/50">
              <table className="w-full text-sm">
                <tbody>
                  {PERF_ROWS.map((r, i) => (
                    <tr key={r.label} className={i % 2 ? "bg-cream-light" : "bg-cream"}>
                      <td className="border-b border-slate/40 px-4 py-3 text-navy-soft">{r.label}</td>
                      <td className={`border-b border-slate/40 px-4 py-3 text-right font-medium ${perfColorClass(fund[r.key] as number)}`}>
                        {formatPct(fund[r.key] as number)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

        {/* Aside : caractéristiques + CTA */}
        <aside className="space-y-8">
          <div className="border border-slate/50 bg-cream-light p-6">
            <p className="eyebrow text-gold-deep">Caractéristiques</p>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Type", fund.type],
                ["Classification", fund.classification],
                ["Nature", fund.legal_nature],
                ["Société de gestion", fund.management_company],
                ["Indice de référence", fund.benchmark_index],
                ["Code ISIN", fund.isin_code],
                ["VL", fund.nav != null ? formatMAD(fund.nav) : null],
                ["Frais de gestion", fund.management_fees != null ? formatPct(fund.management_fees, false) : null],
                ["Souscription min.", fund.minimum_investment != null ? formatMAD(fund.minimum_investment, 0) : null],
              ]
                .filter(([, v]) => v)
                .map(([l, v]) => (
                  <div key={l as string} className="flex justify-between gap-4 border-b border-slate/40 pb-2">
                    <dt className="text-navy-mute">{l}</dt>
                    <dd className="text-right font-medium text-navy">{v as string}</dd>
                  </div>
                ))}
            </dl>
          </div>

          <div className="border border-gold/40 bg-gold/8 p-6">
            <h3 className="font-display text-xl text-navy">Investir dans ce fonds ?</h3>
            <p className="mt-2 text-sm text-navy-soft">
              Nos conseillers vous aident à intégrer {fund.name} dans une allocation adaptée à votre profil.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <ButtonLink href="/contact" variant="dark" className="w-full">
                Être accompagné
              </ButtonLink>
              <ButtonLink href={SITE.calendly} external variant="outline" className="w-full">
                Prendre rendez-vous
              </ButtonLink>
            </div>
          </div>
        </aside>
      </section>

      {/* Fonds liés */}
      {related.length > 0 && (
        <section className="border-t border-slate/40 bg-cream-light">
          <div className="shell py-16">
            <p className="eyebrow text-gold-deep">À comparer aussi</p>
            <h2 className="mt-3 font-display text-2xl text-navy">Autres fonds performants</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related
                .filter((f) => f.id !== fund.id)
                .slice(0, 4)
                .map((f) => (
                  <Link
                    key={f.id}
                    href={f.slug ? `/opcvm/${f.slug}` : "#"}
                    className="group border border-slate/50 bg-cream p-5 transition-colors hover:bg-cream-light"
                  >
                    <h3 className="font-display text-base leading-tight text-navy group-hover:text-gold-deep">
                      {f.name}
                    </h3>
                    <p className={`mt-3 font-display text-2xl ${perfColorClass(f.ytd_performance)}`}>
                      {formatPct(f.ytd_performance)}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-navy-mute">YTD</p>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
