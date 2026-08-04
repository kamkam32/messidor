import Link from "next/link";
import { Reveal } from "@/components/site/Reveal";

/** Hero compact pour les pages internes (fond navy, eyebrow + titre + intro). */
export function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  image,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  breadcrumb?: { name: string; href: string }[];
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-deep text-cream">
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-navy-deep/75" />
        </>
      )}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(120% 90% at 80% 0%, rgba(176,138,62,0.16) 0%, transparent 55%)",
        }}
      />
      <div className="shell relative z-10 pb-16 pt-32 md:pb-20 md:pt-40">
        {breadcrumb && (
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-cream/50">
            {breadcrumb.map((b, i) => (
              <span key={b.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                <Link href={b.href} className="transition-colors hover:text-cream">
                  {b.name}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <Reveal>
          {eyebrow && <p className="eyebrow text-gold-light">{eyebrow}</p>}
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.06] tracking-[-0.015em] md:text-6xl">
            {title}
          </h1>
        </Reveal>
        {intro && (
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/75">{intro}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
