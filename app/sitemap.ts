import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-static'
export const revalidate = 3600 // Revalider toutes les heures

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.messidor-patrimoine.com'
  const currentDate = new Date()

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/opcvm`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/dashboard/opcvm`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard/opcvm/comparateur`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/dashboard/bourse`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dashboard/opci`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard/simulateur`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  try {
    // Client Supabase direct (sans cookies) pour le build statique
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: funds } = await supabase
      .from('funds')
      .select('slug, updated_at')
      .eq('type', 'OPCVM')
      .eq('is_active', true)

    // Créer une entrée pour chaque fonds OPCVM
    const fundPages: MetadataRoute.Sitemap = (funds || []).map(fund => ({
      url: `${baseUrl}/dashboard/opcvm/${fund.slug}`,
      lastModified: fund.updated_at ? new Date(fund.updated_at) : currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))

    return [...staticPages, ...fundPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
