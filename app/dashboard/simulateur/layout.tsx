import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Simulateur d\'Investissement - Calculez vos rendements',
  description: 'Simulateur d\'investissement gratuit pour estimer le rendement potentiel de vos placements OPCVM, OPCI et portefeuilles au Maroc. Calculez vos gains sur 1, 5, 10 ans ou plus.',
  keywords: ['simulateur investissement maroc', 'calculateur rendement opcvm', 'simulation placement maroc', 'calculer investissement', 'rendement opcvm maroc'],
  openGraph: {
    title: 'Simulateur d\'Investissement Maroc - Messidor Patrimoine',
    description: 'Estimez le rendement potentiel de vos investissements avec notre simulateur gratuit. OPCVM, OPCI, actions - planifiez votre avenir financier.',
    url: 'https://VOTRE-DOMAINE.com/dashboard/simulateur',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulateur d\'Investissement Maroc',
    description: 'Estimez le rendement potentiel de vos investissements avec notre simulateur gratuit.',
  },
  alternates: {
    canonical: 'https://VOTRE-DOMAINE.com/dashboard/simulateur',
  },
}

export default function SimulateurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
