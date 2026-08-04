import type { Metadata } from "next";
import { getFunds } from "@/lib/funds";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { Comparateur } from "@/components/opcvm/Comparateur";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Comparateur OPCVM Maroc — Comparez les fonds côte à côte",
  description:
    "Comparez jusqu'à 4 fonds OPCVM marocains côte à côte : performances YTD, 1 an et 3 ans, niveau de risque, valeur liquidative et frais. Outil gratuit, données actualisées quotidiennement.",
  path: "/opcvm/comparateur",
});

export default async function ComparateurPage() {
  const funds = await getFunds({ type: "OPCVM" });

  return (
    <>
      <JsonLd
        data={breadcrumbGraph([
          { name: "Accueil", path: "/" },
          { name: "OPCVM", path: "/opcvm" },
          { name: "Comparateur", path: "/opcvm/comparateur" },
        ])}
      />

      <PageHero
        eyebrow="Outil · Comparaison de fonds"
        title="Comparateur OPCVM"
        intro="Confrontez jusqu'à quatre fonds OPCVM marocains côte à côte : performances, risque, valeur liquidative et frais. Prenez vos décisions d'allocation en toute clarté."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "OPCVM", href: "/opcvm" },
          { name: "Comparateur", href: "/opcvm/comparateur" },
        ]}
      />

      <section className="shell py-16 md:py-20">
        <Comparateur funds={funds} />
      </section>
    </>
  );
}
