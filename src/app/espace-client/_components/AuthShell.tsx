import Link from "next/link";
import type { ReactNode } from "react";

/** Cadre commun aux pages d'authentification (connexion / inscription / reset). */
export function AuthShell({
  eyebrow,
  title,
  intro,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-deep px-6 py-24 text-cream">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(120% 90% at 80% 0%, rgba(176,138,62,0.16) 0%, transparent 55%)",
        }}
      />
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="eyebrow text-gold-light transition-colors hover:text-gold"
        >
          Messidor Patrimoine
        </Link>

        <div className="mt-8 border border-cream/15 bg-cream p-8 text-navy sm:p-10">
          <p className="eyebrow text-gold-deep">{eyebrow}</p>
          <h1 className="mt-4 font-display text-3xl leading-tight tracking-[-0.01em] text-navy">
            {title}
          </h1>
          {intro && (
            <p className="mt-3 text-sm leading-relaxed text-navy-soft">{intro}</p>
          )}
          <div className="mt-8">{children}</div>
          {footer && (
            <div className="mt-8 border-t border-slate pt-6 text-sm text-navy-soft">
              {footer}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export const authInputClass =
  "w-full border border-slate bg-cream px-3 py-3 text-sm text-navy outline-none transition-colors focus:border-gold";
