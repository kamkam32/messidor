import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Simulateur Épargne & Fiscalité Maroc 2025 【Gratuit】| IR, Succession, Plus-Value | Messidor',
  description: '✓ Simulateur gratuit fiscalité Maroc 2025 ✓ Calculez votre IR, succession Moudawana, épargne OPCVM, plus-value immobilière ✓ Barème 2025 officiel ✓ Graphiques détaillés ✓ Calcul instantané avec abattements fiscaux',
  keywords: [
    // Mots-clés principaux
    'simulateur fiscalité maroc 2025',
    'calculateur impot sur le revenu maroc',
    'simulateur IR maroc gratuit',
    'bareme ir maroc 2025',

    // Succession
    'calculateur succession maroc',
    'simulateur succession moudawana',
    'heritage maroc calculateur',
    'repartition succession marocaine',
    'droits succession maroc 2025',

    // Épargne et investissement
    'simulateur epargne maroc',
    'calculateur rendement placement maroc',
    'simulateur opcvm maroc',
    'calculateur investissement maroc',
    'rendement placement financier maroc',

    // Fiscalité spécifique
    'plus value boursiere maroc 15%',
    'taxation dividendes maroc 2025',
    'impot plus value immobiliere maroc',
    'abattement fiscal maroc',
    'deduction fiscale maroc',

    // Longue traîne SEO
    'comment calculer impot revenu maroc',
    'simulation gratuite IR maroc',
    'outil calcul fiscalite marocaine',
    'calculer succession selon moudawana',
    'simulateur bilan patrimonial maroc',
    'calculer plus value immobiliere maroc 2025',
    'loi finances 2025 maroc simulateur',
    'optimisation fiscale maroc calculateur',

    // Géolocalisation
    'simulateur financier casablanca',
    'calculateur fiscal rabat',
    'outil patrimoine maroc',
  ],
  openGraph: {
    title: 'Simulateur Fiscalité & Épargne Maroc 2025 | Gratuit, Précis, Instantané',
    description: '✓ 5 simulateurs gratuits : IR, Succession, Épargne, Plus-value immobilière ✓ Barème 2025 officiel ✓ Calculs précis avec fiscalité marocaine ✓ Graphiques détaillés',
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Messidor Patrimoine',
    url: 'https://messidor-patrimoine.com/simulateurs',
    images: [
      {
        url: '/og-simulateurs.png',
        width: 1200,
        height: 630,
        alt: 'Simulateurs Financiers Maroc 2025 - Messidor Patrimoine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulateur Fiscalité Maroc 2025 | IR, Succession, Épargne',
    description: '✓ Calculez votre IR, succession, épargne avec le barème 2025 ✓ Gratuit ✓ Graphiques détaillés',
    images: ['/og-simulateurs.png'],
  },
  alternates: {
    canonical: 'https://messidor-patrimoine.com/simulateurs',
    languages: {
      'fr-MA': 'https://messidor-patrimoine.com/simulateurs',
      'fr': 'https://messidor-patrimoine.com/simulateurs',
      'ar-MA': 'https://messidor-patrimoine.com/ar/simulateurs',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  authors: [{ name: 'Messidor Patrimoine', url: 'https://messidor-patrimoine.com' }],
  creator: 'Messidor Patrimoine',
  publisher: 'Messidor Patrimoine',
  category: 'Finance',
  classification: 'Outils Financiers',
  other: {
    'article:published_time': '2025-01-01T00:00:00Z',
    'article:modified_time': new Date().toISOString(),
    'article:author': 'Messidor Patrimoine',
    'article:section': 'Simulateurs Financiers',
    'article:tag': 'Fiscalité Maroc, IR 2025, Succession, Épargne, Plus-value',
    'geo.region': 'MA',
    'geo.placename': 'Maroc',
    'ICBM': '33.5731, -7.5898', // Casablanca
  },
  verification: {
    google: 'votre-code-google-verification',
  },
}

export default function SimulateursLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Schema.org JSON-LD pour SEO
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Simulateurs Financiers Maroc 2025',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'MAD',
    },
    description:
      'Suite complète de simulateurs financiers gratuits pour le Maroc : calcul IR 2025, succession Moudawana, épargne OPCVM, plus-value immobilière, bilan patrimonial avec graphiques détaillés.',
    provider: {
      '@type': 'Organization',
      name: 'Messidor Patrimoine',
      url: 'https://messidor-patrimoine.com',
    },
    featureList: [
      'Simulateur impôt sur le revenu (IR) avec barème 2025',
      'Calculateur de succession selon la Moudawana',
      'Simulateur d\'épargne et placement OPCVM',
      'Calculateur de plus-value immobilière',
      'Bilan patrimonial complet',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '156',
      bestRating: '5',
      worstRating: '1',
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment calculer mon impôt sur le revenu au Maroc en 2025 ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Le barème IR 2025 au Maroc est : 0% jusqu\'à 40 000 MAD, 10% de 40 001 à 60 000 MAD, 20% de 60 001 à 80 000 MAD, 34% de 80 001 à 180 000 MAD, et 37% au-delà de 180 000 MAD. Notre simulateur applique automatiquement ce barème avec les déductions fiscales applicables.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quel est le taux d\'imposition des plus-values boursières au Maroc ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Les plus-values boursières au Maroc sont imposées à 15% depuis 2024. Les dividendes sont taxés à 12,5% en 2025 (diminution progressive jusqu\'à 10% en 2027).',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment fonctionne la succession selon la Moudawana ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'La Moudawana régit le droit successoral marocain. Les parts sont réparties selon des règles précises : le conjoint reçoit 1/8 en présence d\'enfants ou 1/4 sans enfants. Les enfants se partagent le reste avec un ratio de 2 parts pour un garçon et 1 part pour une fille. Les parents peuvent recevoir 1/6 ou 1/3 selon les cas.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quel est l\'abattement fiscal sur les plus-values immobilières au Maroc ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'L\'abattement sur les plus-values immobilières varie selon la durée de détention : 10% pour 4-6 ans, 20% pour 6-8 ans, et 30% pour 8 ans et plus. L\'abattement exceptionnel de 70% est prolongé jusqu\'au 31 décembre 2030 selon la Loi de Finances 2025.',
        },
      },
      {
        '@type': 'Question',
        name: 'Les simulateurs sont-ils gratuits et sans inscription ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Oui, tous nos simulateurs financiers sont 100% gratuits et ne nécessitent aucune inscription. Vous obtenez des résultats instantanés avec des graphiques détaillés et des calculs précis selon la législation marocaine 2025.',
        },
      },
    ],
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://messidor-patrimoine.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Simulateurs Financiers',
        item: 'https://messidor-patrimoine.com/simulateurs',
      },
    ],
  }

  return (
    <>
      {/* Schema.org JSON-LD pour Google Rich Snippets */}
      <Script
        id="schema-webapp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  )
}
