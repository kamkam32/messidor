import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Top 10 Fonds OPCVM au Maroc 2025 | Performance & Comparateur',
  description: 'Découvrez les 10 meilleurs fonds OPCVM du Maroc avec leurs performances actualisées quotidiennement. Accédez à plus de 400 fonds, comparateur avancé et alertes personnalisées.',
  keywords: [
    'opcvm maroc',
    'meilleurs opcvm maroc',
    'top opcvm maroc 2025',
    'fonds opcvm performance',
    'comparateur opcvm maroc',
    'investissement opcvm maroc',
    'opcvm actions maroc',
    'opcvm obligataires maroc',
    'placement opcvm maroc',
    'rendement opcvm maroc'
  ],
  openGraph: {
    title: 'Top 10 Fonds OPCVM au Maroc 2025 | Messidor Patrimoine',
    description: 'Les 10 meilleurs fonds OPCVM du Maroc. Performances actualisées quotidiennement. Comparateur avancé disponible.',
    type: 'website',
    url: 'https://www.messidor-patrimoine.com/opcvm',
    images: [
      {
        url: '/images/OPCVM.jpg',
        width: 1200,
        height: 630,
        alt: 'Top 10 OPCVM Maroc',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top 10 Fonds OPCVM au Maroc 2025',
    description: 'Les 10 meilleurs fonds OPCVM du Maroc. Performances actualisées quotidiennement.',
    images: ['/images/OPCVM.jpg'],
  },
  alternates: {
    canonical: 'https://www.messidor-patrimoine.com/opcvm',
  },
}

export default function OPCVMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
