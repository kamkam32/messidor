import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-navy-deep text-cream">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(120% 90% at 80% 0%, rgba(176,138,62,0.16) 0%, transparent 55%)" }}
      />
      <div className="shell relative z-10 w-full py-28 text-center">
        <p className="eyebrow text-gold-light">Erreur 404</p>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight md:text-6xl">
          Cette page est introuvable
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-cream/70">
          Le lien est peut-être obsolète. Revenez à l&apos;accueil ou explorez notre base OPCVM.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/" variant="gold">
            Retour à l&apos;accueil
          </ButtonLink>
          <ButtonLink href="/opcvm" variant="outline-light">
            Explorer les OPCVM
          </ButtonLink>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.16em] text-cream/50">
          <Link href="/simulateurs" className="hover:text-cream">Simulateurs</Link>
          <Link href="/blog" className="hover:text-cream">Blog</Link>
          <Link href="/contact" className="hover:text-cream">Contact</Link>
        </div>
      </div>
    </section>
  );
}
