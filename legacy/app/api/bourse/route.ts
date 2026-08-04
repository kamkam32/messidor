import { NextResponse } from 'next/server';
import { getAllBourseData, getMASIQuote, getMASIIntraday, getMASIComposition } from '@/lib/casablanca-bourse-scraper';
import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/bourse
 * Récupère les données de la Bourse de Casablanca
 *
 * Query params:
 * - type: 'all' | 'quote' | 'intraday' | 'composition' (default: 'all')
 * - date: YYYY-MM-DD (pour intraday, default: aujourd'hui)
 * - noCache: 'true' pour forcer le rafraîchissement
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const date = searchParams.get('date');
    const noCache = searchParams.get('noCache') === 'true';

    let data;
    let cacheKey: string;
    let cacheTTL: number;
    let fromCache = false;

    // Déterminer la clé de cache et le TTL
    switch (type) {
      case 'quote':
        cacheKey = CACHE_KEYS.BOURSE_QUOTE;
        cacheTTL = CACHE_TTL.QUOTE;
        break;
      case 'intraday':
        cacheKey = `${CACHE_KEYS.BOURSE_INTRADAY}:${date || 'today'}`;
        cacheTTL = CACHE_TTL.INTRADAY;
        break;
      case 'composition':
        cacheKey = CACHE_KEYS.BOURSE_COMPOSITION;
        cacheTTL = CACHE_TTL.COMPOSITION;
        break;
      default:
        cacheKey = CACHE_KEYS.BOURSE_ALL;
        cacheTTL = CACHE_TTL.ALL;
    }

    // Vérifier le cache si pas de noCache
    if (!noCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        fromCache = true;
        data = cachedData;
      }
    }

    // Si pas de données en cache, récupérer depuis l'API
    if (!data) {
      switch (type) {
        case 'quote':
          data = await getMASIQuote();
          break;

        case 'intraday':
          data = await getMASIIntraday(date || undefined);
          break;

        case 'composition':
          data = await getMASIComposition();
          break;

        case 'all':
        default:
          data = await getAllBourseData();
          break;
      }

      // Mettre en cache
      cache.set(cacheKey, data, cacheTTL);
    }

    return NextResponse.json({
      success: true,
      data,
      fromCache,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error in bourse API:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Une erreur est survenue',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
