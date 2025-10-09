import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fonds OPCVM Maroc - Comparatif Performances et Frais',
  description: 'Comparez tous les OPCVM au Maroc : performances YTD, frais de gestion, niveaux de risque. Actions, obligations, monétaires, diversifiés. Trouvez le meilleur fonds pour votre profil.',
  keywords: ['opcvm maroc', 'fonds opcvm', 'meilleurs opcvm maroc', 'comparatif opcvm', 'performance opcvm', 'sicav maroc', 'fcp maroc', 'placement opcvm'],
  openGraph: {
    title: 'OPCVM Maroc - Comparatif Complet des Fonds - Messidor Patrimoine',
    description: 'Base de données complète des OPCVM marocains avec performances, frais, risques. Comparez et choisissez les meilleurs fonds.',
    url: 'https://VOTRE-DOMAINE.com/dashboard/opcvm',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPCVM Maroc - Comparatif des Fonds',
    description: 'Comparez les performances et frais de tous les OPCVM au Maroc.',
  },
  alternates: {
    canonical: 'https://VOTRE-DOMAINE.com/dashboard/opcvm',
  },
}

export default function OPCVMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
