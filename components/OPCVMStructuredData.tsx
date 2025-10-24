'use client'

import type { Fund } from '@/lib/types/fund.types'

interface OPCVMStructuredDataProps {
  funds?: Fund[]
}

/**
 * Génère les données structurées JSON-LD pour la page OPCVM
 * Aide Google à comprendre le contenu et afficher des rich snippets
 */
export function OPCVMStructuredData({ funds }: OPCVMStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.messidor-patrimoine.com'

  // Schema pour la liste d'items (ItemList) - tous les OPCVM
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Liste complète des OPCVM au Maroc',
    'description': 'Base de données de tous les fonds OPCVM marocains avec performances, valeurs liquidatives et frais',
    'numberOfItems': funds?.length || 286,
    'itemListElement': funds?.slice(0, 100).map((fund, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'FinancialProduct',
        '@id': `${baseUrl}/dashboard/opcvm/${fund.id}`,
        'name': fund.name,
        'description': `OPCVM ${fund.classification} - ${fund.management_company}`,
        'category': fund.classification,
        'provider': {
          '@type': 'Organization',
          'name': fund.management_company
        },
        'offers': fund.nav ? {
          '@type': 'Offer',
          'price': fund.nav,
          'priceCurrency': 'MAD',
          'priceValidUntil': new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        } : undefined
      }
    })) || []
  }

  // Schema pour la page web
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${baseUrl}/dashboard/opcvm`,
    'url': `${baseUrl}/dashboard/opcvm`,
    'name': 'OPCVM Maroc 2025 : Comparateur de Fonds, Performances & Frais',
    'description': 'Base de données complète de tous les OPCVM au Maroc. Comparez 286 fonds : performances YTD/1an/3ans/5ans, valeurs liquidatives, actifs nets, frais de gestion.',
    'inLanguage': 'fr-MA',
    'isPartOf': {
      '@type': 'WebSite',
      '@id': baseUrl,
      'name': 'Messidor Patrimoine',
      'url': baseUrl
    },
    'about': {
      '@type': 'Thing',
      'name': 'OPCVM Maroc',
      'description': 'Organismes de Placement Collectif en Valeurs Mobilières au Maroc'
    },
    'keywords': 'opcvm maroc, sicav maroc, fcp maroc, performance opcvm, valeur liquidative, comparateur opcvm, meilleurs opcvm maroc',
    'dateModified': new Date().toISOString(),
    'breadcrumb': {
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Accueil',
          'item': baseUrl
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'OPCVM Maroc',
          'item': `${baseUrl}/dashboard/opcvm`
        }
      ]
    }
  }

  // Schema pour le dataset (Dataset)
  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    'name': 'Base de données des OPCVM Marocains',
    'description': 'Données quotidiennes actualisées de tous les fonds OPCVM au Maroc : valeurs liquidatives, performances historiques, actifs sous gestion, frais de gestion et niveaux de risque',
    'url': `${baseUrl}/dashboard/opcvm`,
    'keywords': ['OPCVM', 'SICAV', 'FCP', 'Maroc', 'valeur liquidative', 'performance', 'fonds d\'investissement'],
    'creator': {
      '@type': 'Organization',
      'name': 'Messidor Patrimoine',
      'url': baseUrl
    },
    'distribution': {
      '@type': 'DataDownload',
      'contentUrl': `${baseUrl}/dashboard/opcvm`,
      'encodingFormat': 'text/html'
    },
    'temporalCoverage': '2025',
    'spatialCoverage': {
      '@type': 'Place',
      'name': 'Maroc'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
    </>
  )
}
