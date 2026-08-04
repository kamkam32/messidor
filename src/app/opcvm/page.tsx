import type { Metadata } from "next";
import { getFunds, getFundsCount } from "@/lib/funds";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { OpcvmExplorer } from "@/components/opcvm/OpcvmExplorer";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "OPCVM Maroc 2025 — Comparateur & performances des fonds",
  description:
    "Comparez tous les fonds OPCVM du Maroc : performances YTD, 1 an et 3 ans, niveau de risque et société de gestion. Données actualisées quotidiennement.",
  path: "/opcvm",
});

export default async function OpcvmPage() {
  const [funds, count] = await Promise.all([getFunds({ type: "OPCVM" }), getFundsCount("OPCVM")]);

  const top = funds.slice(0, 10);
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Top OPCVM Maroc",
    numberOfItems: top.length,
    itemListElement: top.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: f.slug ? absoluteUrl(`/opcvm/${f.slug}`) : undefined,
      name: f.name,
    })),
  };

  return (
    <>
      <PageHero
        eyebrow={`${count}+ fonds suivis · Mise à jour quotidienne`}
        title="La base OPCVM du Maroc"
        intro="Recherchez, filtrez et comparez les fonds OPCVM marocains. Performances, risque et société de gestion — pour bâtir une allocation éclairée."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "OPCVM", href: "/opcvm" },
        ]}
      />
      <JsonLd data={[itemList, breadcrumbGraph([
        { name: "Accueil", path: "/" },
        { name: "OPCVM", path: "/opcvm" },
      ])]} />

      <section className="shell py-16 md:py-20">
        <OpcvmExplorer funds={funds} />
      </section>
    </>
  );
}
