import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMASIQuote } from '@/lib/casablanca-bourse-scraper';

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

    // Récupérer les données intraday
    let intradayQuery = supabase
      .from('bourse_history')
      .select('*')
      .eq('data_type', 'intraday')
      .order('date', { ascending: false })
      .order('scrape_timestamp', { ascending: false });

    if (date) {
      intradayQuery = intradayQuery.eq('date', date);
    }

    const { data, error } = await intradayQuery;

    // Récupérer aussi les quotes officiels
    let quoteQuery = supabase
      .from('bourse_history')
      .select('*')
      .eq('data_type', 'quote')
      .order('date', { ascending: false })
      .order('scrape_timestamp', { ascending: false });

    if (date) {
      quoteQuery = quoteQuery.eq('date', date);
    }

    const { data: quotesData, error: quotesError } = await quoteQuery;

    if (error) {
      console.error('Error fetching summary from Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Grouper par indice et ne garder que la dernière entrée pour chaque
    const latestByIndex: Record<string, any> = {};
    const quotesByIndex: Record<string, any> = {};

    if (data) {
      for (const record of data) {
        const indexCode = record.index_code;
        if (!latestByIndex[indexCode]) {
          latestByIndex[indexCode] = record;
        }
      }
    }

    // Grouper les quotes par indice
    if (quotesData) {
      for (const record of quotesData) {
        const indexCode = record.index_code;
        if (!quotesByIndex[indexCode]) {
          quotesByIndex[indexCode] = record;
        }
      }
    }

    // Transformer en array
    const summary = await Promise.all(Object.values(latestByIndex).map(async (record: any) => {
      const points = record.data?.points || [];
      const count = record.data?.count || 0;
      const indexCode = record.index_code;

      // Vérifier si on a un quote officiel pour cet indice
      let quote = quotesByIndex[indexCode]?.data;

      // Si pas de quote en DB et c'est le MASI, récupérer en direct
      if (!quote && indexCode === 'MASI') {
        try {
          console.log('📡 Fetching live MASI quote...');
          const liveQuote = await getMASIQuote();
          quote = liveQuote;
        } catch (error) {
          console.error('Error fetching live MASI quote:', error);
        }
      }

      // Calculer des statistiques
      let openValue = null;
      let closeValue = null;
      let highValue = null;
      let lowValue = null;
      let variation = null;
      let variationPercent = null;

      // Si on a un quote officiel, l'utiliser en priorité
      if (quote) {
        closeValue = quote.indexValue ? parseFloat(quote.indexValue) : null;
        highValue = quote.high ? parseFloat(quote.high) : null;
        lowValue = quote.low ? parseFloat(quote.low) : null;
        variation = quote.variation ? parseFloat(quote.variation) : null;
        variationPercent = quote.variationPercent ? parseFloat(quote.variationPercent) : null;

        // Pour l'ouverture, calculer depuis les données intraday si disponibles
        if (points.length > 0) {
          const validPoints = points.filter((p: any) => {
            const val = parseFloat(p.indexValue || '0');
            return val > 0;
          });
          if (validPoints.length > 0) {
            openValue = parseFloat(validPoints[0].indexValue);
          }
        }
      } else if (points.length > 0) {
        // Fallback: calculer depuis les points intraday
        const validPoints = points.filter((p: any) => {
          const val = parseFloat(p.indexValue || '0');
          return val > 0;
        });

        if (validPoints.length > 0) {
          openValue = parseFloat(validPoints[0].indexValue);
          closeValue = parseFloat(validPoints[validPoints.length - 1].indexValue);

          const values = validPoints.map((p: any) => parseFloat(p.indexValue));
          highValue = Math.max(...values);
          lowValue = Math.min(...values);

          variation = closeValue - openValue;
          variationPercent = (variation / openValue) * 100;
        }
      }

      return {
        index: indexCode,
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
    }));

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
