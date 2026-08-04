import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.messidor-patrimoine.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/*.json$',
          '/dashboard/settings',
          '/dashboard/profile',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/dashboard/opcvm',
          '/dashboard/opcvm/*',
          '/dashboard/bourse',
          '/dashboard/simulateur',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/dashboard/settings',
          '/dashboard/profile',
          '/login',
          '/signup',
        ],
        crawlDelay: 0,
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/dashboard/opcvm',
          '/dashboard/opcvm/*',
          '/dashboard/bourse',
          '/dashboard/simulateur',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/dashboard/settings',
          '/dashboard/profile',
          '/login',
          '/signup',
        ],
        crawlDelay: 0,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
