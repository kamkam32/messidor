import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Blog & guides — Patrimoine, OPCVM & fiscalité au Maroc",
  description:
    "Analyses et guides pratiques sur la gestion de patrimoine au Maroc : OPCVM, OPCI, fiscalité, succession, investissement pour les MRE.",
  path: "/blog",
});

function formatDate(d: string): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <PageHero
        eyebrow="Blog & guides"
        title="Comprendre pour mieux investir"
        intro="Nos analyses et guides pratiques sur l'épargne, les OPCVM, la fiscalité et le patrimoine au Maroc."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "Blog", href: "/blog" },
        ]}
      />
      <JsonLd data={breadcrumbGraph([{ name: "Accueil", path: "/" }, { name: "Blog", path: "/blog" }])} />

      <section className="shell py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.07} className="h-full">
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col border border-slate/50 bg-cream transition-colors hover:bg-cream-light"
              >
                <div className="flex flex-1 flex-col p-6">
                  {p.category && <span className="eyebrow text-gold-deep">{p.category}</span>}
                  <h2 className="mt-3 font-display text-xl leading-tight text-navy transition-colors group-hover:text-gold-deep">
                    {p.title}
                  </h2>
                  {p.excerpt && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-soft line-clamp-4">{p.excerpt}</p>
                  )}
                  <div className="mt-5 flex items-center justify-between border-t border-slate/40 pt-4">
                    <span className="text-xs text-navy-mute">{formatDate(p.date)}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-transform group-hover:translate-x-1">
                      Lire <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
