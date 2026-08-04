import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services de Gestion de Patrimoine au Maroc | Messidor Patrimoine',
  description: 'Conseil en investissement financier, construction de portefeuilles sur mesure (OPCVM, OPCI), opportunités immobilières et club deals au Maroc. Expert en gestion patrimoniale à Casablanca.',
  keywords: [
    'gestion de patrimoine Maroc',
    'conseil en investissement financier',
    'OPCVM Maroc',
    'OPCI Maroc',
    'portefeuille sur mesure',
    'investissement immobilier Maroc',
    'club deal Maroc',
    'Bourse de Casablanca',
    'conseiller financier Maroc',
    'gestion de fortune Maroc',
    'wealth management Maroc',
    'family office Maroc',
    'investissement Casablanca',
    'AMMC',
    'fonds d\'investissement Maroc',
  ],
  openGraph: {
    title: 'Services de Gestion de Patrimoine au Maroc | Messidor Patrimoine',
    description: 'Conseil en investissement financier, construction de portefeuilles sur mesure (OPCVM, OPCI), opportunités immobilières et club deals au Maroc. Expert en gestion patrimoniale à Casablanca.',
    type: 'website',
    locale: 'fr_MA',
    siteName: 'Messidor Patrimoine',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services de Gestion de Patrimoine au Maroc | Messidor Patrimoine',
    description: 'Conseil en investissement financier, construction de portefeuilles sur mesure (OPCVM, OPCI), opportunités immobilières et club deals au Maroc.',
  },
  alternates: {
    canonical: 'https://messidor-patrimoine.com/services',
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
}

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
