import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bourse de Casablanca en Temps Réel - Cours MASI, MADEX',
  description: 'Suivez en temps réel les indices de la Bourse de Casablanca : MASI, MADEX, MSI20. Cours, variations, composition, historique et analyses des actions marocaines.',
  keywords: ['bourse casablanca', 'masi temps réel', 'madex', 'cours actions maroc', 'indices boursiers maroc', 'cotation casablanca', 'bourse maroc live'],
  openGraph: {
    title: 'Bourse de Casablanca en Direct - MASI, MADEX - Messidor Patrimoine',
    description: 'Suivez en temps réel les indices et actions de la Bourse de Casablanca. Données actualisées, graphiques et analyses.',
    url: 'https://VOTRE-DOMAINE.com/dashboard/bourse',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bourse de Casablanca en Temps Réel',
    description: 'Suivez les indices MASI, MADEX et toutes les actions marocaines en direct.',
  },
  alternates: {
    canonical: 'https://VOTRE-DOMAINE.com/dashboard/bourse',
  },
}

export default function BourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
