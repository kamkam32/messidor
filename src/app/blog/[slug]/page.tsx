import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug, getPostSlugs, getAllPosts } from "@/lib/blog";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return buildMetadata({ title: "Article introuvable", path: `/blog/${slug}` });
  return buildMetadata({
    title: post.title,
    description: post.excerpt || post.title,
    path: `/blog/${slug}`,
    type: "article",
    images: post.image ? [post.image] : undefined,
  });
}

function formatDate(d: string): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = getAllPosts()
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date || undefined,
    dateModified: post.date || undefined,
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/images/logomessidor.jpg` },
    },
    inLanguage: "fr",
    mainEntityOfPage: absoluteUrl(`/blog/${slug}`),
    ...(post.image ? { image: post.image } : {}),
  };

  return (
    <>
      <JsonLd
        data={[
          articleLd,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${slug}` },
          ]),
        ]}
      />

      {/* En-tête article */}
      <section className="relative overflow-hidden bg-navy-deep text-cream">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{ background: "radial-gradient(120% 90% at 80% 0%, rgba(176,138,62,0.16) 0%, transparent 55%)" }}
        />
        <div className="shell relative z-10 pb-14 pt-32 md:pt-40">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cream/60 transition-colors hover:text-cream"
          >
            <ArrowLeft size={14} /> Tous les articles
          </Link>
          {post.category && <p className="eyebrow text-gold-light">{post.category}</p>}
          <h1 className="mt-4 max-w-3xl font-display text-3xl leading-tight md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-sm text-cream/60">
            {post.author} · {formatDate(post.date)}
          </p>
        </div>
      </section>

      {/* Corps */}
      <section className="shell grid gap-12 py-16 md:grid-cols-[1fr_260px] md:py-20">
        <article className="prose-messidor max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="mt-12 border border-gold/40 bg-gold/8 p-8 not-prose">
            <p className="eyebrow text-gold-deep">Passer à l&apos;action</p>
            <h3 className="mt-3 font-display text-2xl text-navy">Un projet patrimonial en tête ?</h3>
            <p className="mt-2 text-navy-soft">
              Nos conseillers vous accompagnent gratuitement pour un premier échange, sans engagement.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/contact" variant="dark">
                Nous contacter
              </ButtonLink>
              <ButtonLink href={SITE.calendly} external variant="outline">
                Prendre rendez-vous
              </ButtonLink>
            </div>
          </div>
        </article>

        {/* TOC */}
        {post.headings.length > 0 && (
          <aside className="hidden md:block">
            <div className="sticky top-28">
              <p className="eyebrow text-navy-mute">Sommaire</p>
              <nav className="mt-4 space-y-2 border-l border-slate/50 pl-4 text-sm">
                {post.headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className="block text-navy-soft transition-colors hover:text-gold-deep"
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </section>

      {/* Articles liés */}
      {related.length > 0 && (
        <section className="border-t border-slate/40 bg-cream-light">
          <div className="shell py-16">
            <p className="eyebrow text-gold-deep">À lire aussi</p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group border border-slate/50 bg-cream p-6 transition-colors hover:bg-cream-light"
                >
                  {p.category && <span className="eyebrow text-gold-deep">{p.category}</span>}
                  <h3 className="mt-3 font-display text-lg leading-tight text-navy group-hover:text-gold-deep">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
