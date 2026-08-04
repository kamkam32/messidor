"use client";

import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-navy-deep text-cream">
      <div className="shell relative z-10 w-full py-28 text-center">
        <p className="eyebrow text-gold-light">Une erreur est survenue</p>
        <h1 className="mx-auto mt-5 max-w-2xl font-display text-4xl leading-tight md:text-5xl">
          Quelque chose s&apos;est mal passé
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-cream/70">
          Réessayez dans un instant. Si le problème persiste, contactez-nous.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button variant="gold" onClick={() => reset()}>
            Réessayer
          </Button>
          <ButtonLink href="/" variant="outline-light">
            Accueil
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
