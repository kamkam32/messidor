import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Simulateur d\'Investissement et Fiscalité Maroc 2025 - Calcul Précis avec IR',
  description: 'Simulateur d\'investissement gratuit avec calcul fiscal précis selon la Loi de Finances 2025. Plus-values boursières 15%, dividendes 12,5%, immobilier. Calculez vos gains nets après impôts au Maroc.',
  keywords: [
    'simulateur investissement maroc',
    'fiscalité maroc 2025',
    'calculateur rendement opcvm',
    'impôt sur le revenu maroc',
    'plus-values boursières maroc',
    'simulation placement maroc',
    'IR maroc 2025',
    'barème impôt maroc',
    'calculer investissement',
    'fiscalité dividendes maroc',
    'taxation actions maroc',
    'immobilier locatif maroc',
    'loi de finances 2025',
    'rendement net après impôts',
    'simulateur fiscal maroc',
  ],
  openGraph: {
    title: 'Simulateur d\'Investissement & Fiscalité Maroc 2025 - Messidor Patrimoine',
    description: 'Calculez le rendement réel de vos investissements avec simulation fiscale complète. Barème IR 2025, plus-values, dividendes. Graphiques détaillés et projections annuelles.',
    url: 'https://messidor-patrimoine.com/dashboard/simulateur',
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Messidor Patrimoine',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulateur Investissement & Fiscalité Maroc 2025',
    description: 'Calculez vos gains nets après impôts selon la Loi de Finances 2025. Actions, immobilier, OPCVM - simulation fiscale complète.',
  },
  alternates: {
    canonical: 'https://messidor-patrimoine.com/dashboard/simulateur',
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
  authors: [{ name: 'Messidor Patrimoine' }],
  category: 'Finance',
  other: {
    'article:published_time': '2025-01-01',
    'article:modified_time': new Date().toISOString(),
    'article:section': 'Outils Financiers',
    'article:tag': 'Fiscalité Maroc, Investissement, Simulation',
  },
}

export default function SimulateurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
