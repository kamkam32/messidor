import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * API Route: Récupérer un résumé des dernières données pour tous les indices
 *
 * Retourne les dernières données intraday pour chaque indice disponible
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Date spécifique (YYYY-MM-DD) ou null pour aujourd'hui

    // Créer le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Si une date est spécifiée, récupérer uniquement cette date
    // Sinon, récupérer la date la plus récente pour chaque indice
    let query = supabase
      .from('bourse_history')
      .select('*')
      .eq('data_type', 'intraday')
      .order('date', { ascending: false })
      .order('scrape_timestamp', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching summary from Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Grouper par indice et ne garder que la dernière entrée pour chaque
    const latestByIndex: Record<string, any> = {};

    if (data) {
      for (const record of data) {
        const indexCode = record.index_code;
        if (!latestByIndex[indexCode]) {
          latestByIndex[indexCode] = record;
        }
      }
    }

    // Transformer en array
    const summary = Object.values(latestByIndex).map((record: any) => {
      const points = record.data?.points || [];
      const count = record.data?.count || 0;

      // Calculer des statistiques si on a des points
      let openValue = null;
      let closeValue = null;
      let highValue = null;
      let lowValue = null;
      let variation = null;
      let variationPercent = null;

      if (points.length > 0) {
        // Filter out points with null or zero indexValue
        const validPoints = points.filter((p: any) => {
          const val = parseFloat(p.indexValue || '0');
          return val > 0;
        });

        if (validPoints.length > 0) {
          // Use first and last valid points
          openValue = parseFloat(validPoints[0].indexValue);
          closeValue = parseFloat(validPoints[validPoints.length - 1].indexValue);

          // Calculate from valid values only
          const values = validPoints.map((p: any) => parseFloat(p.indexValue));
          highValue = Math.max(...values);
          lowValue = Math.min(...values);

          // Calculate variation
          variation = closeValue - openValue;
          variationPercent = (variation / openValue) * 100;
        }
      }

      return {
        index: record.index_code,
        date: record.date,
        dataCount: count,
        openValue,
        closeValue,
        highValue,
        lowValue,
        variation,
        variationPercent,
        scrapeTimestamp: record.scrape_timestamp,
      };
    });

    return NextResponse.json({
      success: true,
      data: summary,
      count: summary.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in bourse summary API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
