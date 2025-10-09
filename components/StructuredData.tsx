import Script from 'next/script'

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "Messidor Patrimoine",
    "alternateName": "Messidor",
    "description": "Cabinet de gestion de patrimoine marocain spécialisé dans les actifs financiers : OPCVM, OPCI, actions Bourse de Casablanca et portefeuilles personnalisés.",
    "url": "https://VOTRE-DOMAINE.com", // Remplacez par votre vrai domaine
    "logo": "https://VOTRE-DOMAINE.com/images/logo.png", // Remplacez par votre vrai domaine
    "image": "https://VOTRE-DOMAINE.com/images/og-image.jpg", // Remplacez par votre vrai domaine
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MA",
      "addressLocality": "Casablanca"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "addressCountry": "MA"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Maroc"
    },
    "priceRange": "$$",
    "sameAs": [
      "https://www.linkedin.com/company/messidor-patrimoine"
    ],
    "founder": [
      {
        "@type": "Person",
        "name": "Tarik Belghazi",
        "jobTitle": "Fondateur & CEO",
        "alumniOf": "KEDGE Business School"
      },
      {
        "@type": "Person",
        "name": "Kamil Alami",
        "jobTitle": "Chief Product Officer",
        "alumniOf": "ESCP Business School"
      }
    ],
    "serviceType": [
      "Gestion de patrimoine",
      "Conseil en investissement",
      "OPCVM",
      "OPCI",
      "Bourse de Casablanca",
      "Family Office"
    ],
    "knowsAbout": [
      "Gestion de patrimoine",
      "Investissement financier",
      "OPCVM",
      "OPCI",
      "Marché boursier marocain",
      "Planification financière"
    ]
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Messidor Patrimoine",
    "url": "https://VOTRE-DOMAINE.com", // Remplacez par votre vrai domaine
    "description": "Cabinet de gestion de patrimoine marocain - OPCVM, OPCI, Bourse de Casablanca",
    "inLanguage": "fr-MA",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://VOTRE-DOMAINE.com/dashboard/opcvm?search={search_term_string}" // Remplacez par votre vrai domaine
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://VOTRE-DOMAINE.com${item.url}` // Remplacez par votre vrai domaine
    }))
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
