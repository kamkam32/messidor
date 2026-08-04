import Link from "next/link";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Investir",
    links: [
      { label: "Base OPCVM", href: "/opcvm" },
      { label: "Meilleurs OPCVM 2026", href: "/opcvm/meilleurs" },
      { label: "Comparateur de fonds", href: "/opcvm/comparateur" },
      { label: "OPCI au Maroc", href: "/opci" },
      { label: "Gestion de patrimoine", href: "/gestion-de-patrimoine" },
    ],
  },
  {
    title: "Outils",
    links: [
      { label: "Simulateur IR 2025", href: "/simulateurs/impot-revenu-maroc" },
      { label: "Plus-value immobilière (TPI)", href: "/simulateurs/plus-value-immobiliere-tpi" },
      { label: "Épargne OPCVM", href: "/simulateurs/epargne-opcvm" },
      { label: "Tous les simulateurs", href: "/simulateurs" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog & guides", href: "/blog" },
      { label: "Lexique patrimoine", href: "/lexique" },
      { label: "Investir MRE", href: "/mre" },
      { label: "L'équipe", href: "/equipe" },
      { label: "Contact", href: "/contact" },
      { label: "Espace client", href: "/espace-client" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-navy-deep text-cream">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl tracking-[0.22em] uppercase">Messidor</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
              Cabinet de conseil en gestion de patrimoine au Maroc. Stratégie
              d&apos;investissement sur-mesure, OPCVM, OPCI et fiscalité.
            </p>
            <a
              href={SITE.calendly}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex bg-gold px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy transition-colors hover:bg-gold-light"
            >
              Prendre rendez-vous
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow text-gold-light">{col.title}</p>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-cream/70 transition-colors hover:text-cream"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/15 pt-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {SITE.legalName}. Tous droits réservés.</p>
          <p className="font-display italic text-cream/60">
            Bâtir, préserver et transmettre votre patrimoine.
          </p>
        </div>
      </div>
    </footer>
  );
}
