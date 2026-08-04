import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OPCVM Maroc 2025 : Comparateur de Fonds, Performances & Frais | Tous les OPCVM Marocains',
  description: 'Base de données complète de tous les OPCVM au Maroc (SICAV et FCP). Comparez 286 fonds : performances YTD/1an/3ans/5ans, valeurs liquidatives, actifs nets, frais de gestion, risques. OPCVM actions, obligations, monétaires, diversifiés - Wafa Gestion, Attijariwafa, CDG Capital, BMCE Capital, et toutes les sociétés de gestion marocaines. Données quotidiennes actualisées.',
  keywords: [
    // Mots-clés génériques OPCVM
    'opcvm maroc', 'opcvm maroc 2025', 'fonds opcvm maroc', 'sicav maroc', 'fcp maroc',
    'meilleurs opcvm maroc', 'comparatif opcvm maroc', 'comparateur opcvm',

    // Performance et data
    'performance opcvm maroc', 'rendement opcvm maroc', 'valeur liquidative opcvm',
    'vl opcvm maroc', 'classement opcvm maroc', 'top opcvm maroc',

    // Types de fonds
    'opcvm actions maroc', 'opcvm obligations maroc', 'opcvm monétaire maroc',
    'opcvm diversifié maroc', 'opcvm contractuel maroc', 'omlt maroc', 'oct maroc',

    // Sociétés de gestion
    'wafa gestion opcvm', 'attijariwafa opcvm', 'cdg capital opcvm', 'bmce capital opcvm',
    'cih capital opcvm', 'rma asset management', 'upline capital', 'atlas capital maroc',

    // Investissement
    'investir opcvm maroc', 'placement opcvm maroc', 'épargne opcvm',
    'portefeuille opcvm', 'choisir opcvm maroc', 'acheter opcvm maroc',

    // Termes techniques
    'frais de gestion opcvm', 'risque opcvm', 'actif net opcvm',
    'performance ytd opcvm', 'historique opcvm maroc',

    // SEO local
    'opcvm casablanca', 'opcvm rabat', 'gestion patrimoine maroc opcvm',
    'ammc opcvm', 'asfim opcvm', 'bourse casablanca opcvm'
  ],
  openGraph: {
    title: 'Tous les OPCVM du Maroc : Comparateur Complet 2025 | Messidor Patrimoine',
    description: '286 fonds OPCVM marocains comparés : performances actualisées quotidiennement, valeurs liquidatives, frais, risques. SICAV et FCP de toutes les sociétés de gestion au Maroc.',
    url: 'https://www.messidor-patrimoine.com/dashboard/opcvm',
    type: 'website',
    images: [{
      url: '/images/opcvm-og.jpg',
      width: 1200,
      height: 630,
      alt: 'Comparateur OPCVM Maroc - Messidor Patrimoine'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPCVM Maroc : Comparateur de tous les Fonds 2025',
    description: '286 OPCVM marocains comparés : performances, VL, frais. Données quotidiennes actualisées.',
  },
  alternates: {
    canonical: 'https://www.messidor-patrimoine.com/dashboard/opcvm',
  },
}

export default function OPCVMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
