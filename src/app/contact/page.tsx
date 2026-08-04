import type { Metadata } from "next";
import { buildMetadata, breadcrumbGraph } from "@/lib/seo";
import { SITE, absoluteUrl } from "@/lib/site";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContactForm } from "@/components/contact/ContactForm";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = buildMetadata({
  title: "Contact — Parlons de votre patrimoine",
  description:
    "Contactez Messidor Patrimoine pour un premier échange confidentiel : conseil patrimonial, sélection OPCVM & OPCI, optimisation fiscale au Maroc. Réponse sous 24h.",
  path: "/contact",
});

const breadcrumb = [
  { name: "Accueil", href: "/" },
  { name: "Contact", href: "/contact" },
];

export default function ContactPage() {
  const contactPageLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact — Messidor Patrimoine",
    url: absoluteUrl("/contact"),
    isPartOf: { "@id": `${SITE.url}/#website` },
    about: { "@id": `${SITE.url}/#organization` },
  };

  return (
    <>
      <PageHero
        eyebrow="Premier échange confidentiel"
        title="Parlons de votre patrimoine"
        intro="Une question, un projet d'investissement ou l'envie d'un regard indépendant sur votre allocation ? Écrivez-nous — nous vous recontactons sous 24h."
        breadcrumb={breadcrumb}
      />
      <JsonLd
        data={[
          contactPageLd,
          breadcrumbGraph([
            { name: "Accueil", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

      <section className="shell py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          {/* Colonne gauche : formulaire */}
          <div>
            <p className="eyebrow text-gold-deep">Écrivez-nous</p>
            <h2 className="mt-4 max-w-xl font-display text-3xl leading-tight tracking-[-0.01em] text-navy md:text-4xl">
              Un message, une réponse personnalisée
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-soft">
              Tous les champs marqués d&apos;un astérisque sont requis. Vos informations
              sont traitées de manière strictement confidentielle.
            </p>
            <div className="mt-10">
              <ContactForm />
            </div>
          </div>

          {/* Colonne droite : coordonnées */}
          <aside className="lg:pl-8">
            <div className="border border-slate bg-cream-light p-8">
              <p className="eyebrow text-gold-deep">Coordonnées</p>
              <h3 className="mt-4 font-display text-2xl leading-tight text-navy">
                Nous joindre directement
              </h3>

              <dl className="mt-8 flex flex-col gap-7 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-mute">
                    Email
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`mailto:${SITE.email}`}
                      className="text-navy transition-colors hover:text-gold-deep"
                    >
                      {SITE.email}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-mute">
                    WhatsApp
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`https://wa.me/${SITE.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy transition-colors hover:text-gold-deep"
                    >
                      Discuter sur WhatsApp
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-mute">
                    Téléphone
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
                      className="text-navy transition-colors hover:text-gold-deep"
                    >
                      {SITE.phone}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-mute">
                    Bureau
                  </dt>
                  <dd className="mt-2 text-navy-soft">{SITE.city}, Maroc</dd>
                </div>
              </dl>

              <div className="mt-8 border-t border-slate pt-8">
                <p className="text-sm leading-relaxed text-navy-soft">
                  Vous préférez un rendez-vous ? Réservez un créneau de 30 minutes,
                  sans engagement.
                </p>
                <ButtonLink
                  href={SITE.calendly}
                  external
                  variant="gold"
                  className="mt-5 w-full"
                >
                  Réserver un rendez-vous
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
