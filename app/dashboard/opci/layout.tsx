import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fonds OPCI Maroc - Investissement Immobilier',
  description: 'Investissez dans l\'immobilier via les OPCI (Organismes de Placement Collectif Immobilier) au Maroc. Performances, rendements et diversification immobilière.',
  keywords: ['opci maroc', 'investissement immobilier maroc', 'fonds immobilier maroc', 'opci performance', 'placement immobilier'],
  openGraph: {
    title: 'OPCI Maroc - Investissement Immobilier Collectif - Messidor Patrimoine',
    description: 'Accédez aux opportunités immobilières via les OPCI au Maroc. Diversification et rendement.',
    url: 'https://VOTRE-DOMAINE.com/dashboard/opci',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPCI Maroc - Investissement Immobilier',
    description: 'Investissez dans l\'immobilier via les OPCI au Maroc.',
  },
  alternates: {
    canonical: 'https://VOTRE-DOMAINE.com/dashboard/opci',
  },
}

export default function OPCILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
