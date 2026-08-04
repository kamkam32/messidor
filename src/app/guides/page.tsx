import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookText, HelpCircle, Calculator } from "lucide-react";
import { getAllPosts, type BlogPost } from "@/lib/blog";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Guides & ressources patrimoine — OPCVM, fiscalité & MRE au Maroc",
  description:
    "Tous nos guides pour investir au Maroc, classés par thème : OPCVM & bourse, immobilier & OPCI, épargne, fiscalité, MRE et transmission. Plus lexique, FAQ et simulateurs.",
  path: "/guides",
});

function formatDate(d: string): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

/** Normalise une chaîne (minuscules, sans accents) pour le matching des clusters. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

interface Cluster {
  id: string;
  title: string;
  intro: string;
  match: string[];
}

/** Clusters en ORDRE DE PRIORITÉ pour l'affectation (un article rejoint le premier cluster qui matche). */
const CLUSTERS: Cluster[] = [
  {
    id: "fiscalite",
    title: "Fiscalité",
    intro: "Impôts, revenus fonciers, plus-values : comprendre et optimiser la fiscalité de vos placements au Maroc.",
    match: ["fiscalit", "impot", "taxe", "loi de finances"],
  },
  {
    id: "mre",
    title: "MRE & international",
    intro: "Investir au Maroc depuis l'étranger : comptes en devises, contrôle des changes et rapatriement d'épargne.",
    match: ["mre", "devise", "rapatri", "convertible", "etranger", "dotation", "office des change"],
  },
  {
    id: "opcvm",
    title: "OPCVM & bourse",
    intro: "Fonds OPCVM, ETF et Bourse de Casablanca : fonctionnement, sélection et performances des marchés cotés.",
    match: ["opcvm", "bourse", "etf", "tracker", "masi", "fonds indiciel"],
  },
  {
    id: "immobilier",
    title: "Immobilier & OPCI",
    intro: "Pierre-papier, OPCI et immobilier direct : les différentes façons d'investir dans la pierre au Maroc.",
    match: ["opci", "immobilier"],
  },
  {
    id: "retraite",
    title: "Retraite & transmission",
    intro: "Héritage, succession et donation : anticiper la transmission et protéger vos proches selon vos volontés.",
    match: ["heritage", "succession", "transmission", "retraite", "donation", "testament"],
  },
  {
    id: "epargne",
    title: "Épargne & placements",
    intro: "Où placer son argent, intérêts composés, or : bâtir et faire fructifier son épargne dans la durée.",
    match: ["epargne", "placer", "placement", "interets", "carnet", "investir-or", "fructifier"],
  },
  {
    id: "patrimoine",
    title: "Gestion de patrimoine",
    intro: "Stratégie patrimoniale, bilan et allocation d'actifs : une vision d'ensemble pour structurer votre patrimoine.",
    match: ["patrimoine", "strategie", "allocation", "bilan patrimonial", "gestion patrimoine"],
  },
];

/** Ordre d'AFFICHAGE (curaté), différent de l'ordre de priorité d'affectation. */
const DISPLAY_ORDER = [
  "patrimoine",
  "opcvm",
  "immobilier",
  "epargne",
  "fiscalite",
  "mre",
  "retraite",
  "autres",
] as const;

const RESOURCES = [
  {
    href: "/lexique",
    icon: BookText,
    label: "Lexique",
    desc: "Les termes clés du patrimoine expliqués simplement.",
  },
  {
    href: "/faq",
    icon: HelpCircle,
    label: "FAQ",
    desc: "Les réponses aux questions les plus fréquentes.",
  },
  {
    href: "/simulateurs",
    icon: Calculator,
    label: "Simulateurs",
    desc: "Estimez rendement, fiscalité et intérêts composés.",
  },
];

function assignClusters(posts: BlogPost[]): Record<string, BlogPost[]> {
  const groups: Record<string, BlogPost[]> = {};
  for (const post of posts) {
    const hay = norm(`${post.slug} ${post.title} ${(post.keywords || []).join(" ")}`);
    const cluster = CLUSTERS.find((c) => c.match.some((m) => hay.includes(m)));
    const id = cluster ? cluster.id : "autres";
    (groups[id] ||= []).push(post);
  }
  return groups;
}

function ArticleCard({ post, delay }: { post: BlogPost; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="group flex h-full flex-col border border-slate/50 bg-cream transition-colors hover:bg-cream-light"
      >
        <div className="flex flex-1 flex-col p-6">
          {post.category && <span className="eyebrow text-gold-deep">{post.category}</span>}
          <h3 className="mt-3 font-display text-xl leading-tight text-navy transition-colors group-hover:text-gold-deep">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-soft line-clamp-4">{post.excerpt}</p>
          )}
          <div className="mt-5 flex items-center justify-between border-t border-slate/40 pt-4">
            <span className="text-xs text-navy-mute">{formatDate(post.date)}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-transform group-hover:translate-x-1">
              Lire <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function GuidesHub() {
  const posts = getAllPosts();
  const groups = assignClusters(posts);

  const clusterById = (id: string): Cluster | undefined => CLUSTERS.find((c) => c.id === id);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Guides & ressources patrimoine — Messidor Patrimoine",
    numberOfItems: posts.length,
    itemListElement: posts.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/blog/${p.slug}`),
      name: p.title,
    })),
  };

  return (
    <>
      <PageHero
        eyebrow="Guides & ressources"
        title="Guides & ressources patrimoine"
        image="/images/heroes/editorial-navy.jpg"
        intro="Tous nos guides pour investir au Maroc, organisés par thème. OPCVM, immobilier, fiscalité, MRE, transmission — et nos outils pour aller plus loin."
        breadcrumb={[
          { name: "Accueil", href: "/" },
          { name: "Guides", href: "/guides" },
        ]}
      />
      <JsonLd
        data={[
          itemList,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Guides", path: "/guides" },
          ]),
        ]}
      />

      {/* Ressources — lexique, FAQ, simulateurs */}
      <section className="border-b border-slate/40 bg-cream-light">
        <div className="shell py-12 md:py-14">
          <p className="eyebrow text-gold-deep">Nos ressources</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((r, i) => {
              const Icon = r.icon;
              return (
                <Reveal key={r.href} delay={(i % 3) * 0.06}>
                  <Link
                    href={r.href}
                    className="group flex h-full items-start gap-4 border border-slate/50 bg-cream p-6 transition-colors hover:bg-cream-light"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-gold/40 bg-gold/8 text-gold-deep">
                      <Icon size={20} strokeWidth={1.6} />
                    </span>
                    <span>
                      <span className="font-display text-lg text-navy group-hover:text-gold-deep">
                        {r.label}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-navy-soft">{r.desc}</span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clusters thématiques */}
      <div className="shell py-16 md:py-20">
        {DISPLAY_ORDER.map((id) => {
          const items = groups[id];
          if (!items || items.length === 0) return null;
          const cluster = clusterById(id);
          const title = cluster ? cluster.title : "Autres guides";
          const intro = cluster
            ? cluster.intro
            : "D'autres analyses et guides pour approfondir votre stratégie patrimoniale.";
          return (
            <section key={id} className="mb-16 last:mb-0 md:mb-20">
              <Reveal>
                <div className="flex items-baseline gap-4">
                  <h2 className="font-display text-2xl leading-tight text-navy md:text-3xl">{title}</h2>
                  <span className="text-xs text-navy-mute">
                    {items.length} guide{items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-navy-soft">{intro}</p>
                <div className="mt-6 h-px w-full bg-slate/40" />
              </Reveal>
              <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {items.map((p, i) => (
                  <ArticleCard key={p.slug} post={p} delay={(i % 3) * 0.07} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Renvoi vers le blog complet */}
      <section className="border-t border-slate/40 bg-navy text-cream">
        <div className="shell py-16 text-center md:py-20">
          <Reveal>
            <div className="mx-auto h-px w-12 bg-gold" />
            <h2 className="mx-auto mt-8 max-w-2xl font-display text-2xl leading-tight md:text-4xl">
              Explorer tous nos articles
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-cream/75">
              Retrouvez l'intégralité de nos analyses et guides, classés par date de publication.
            </p>
            <div className="mt-9">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 border border-cream/40 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-cream transition-colors hover:bg-cream/10"
              >
                Voir le blog <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
