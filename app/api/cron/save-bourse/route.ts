import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMASIQuote, getMASIIntraday, getMASIComposition } from '@/lib/casablanca-bourse-scraper';

// Configuration
const CRON_SECRET = process.env.CRON_SECRET;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface SaveBourseResult {
  success: boolean;
  date: string;
  saved: {
    quote: boolean;
    intraday: boolean;
    composition: boolean;
  };
  errors: string[];
  timestamp: string;
}

/**
 * API Route: Cron job pour sauvegarder les données de la bourse quotidiennement
 *
 * Sécurité: Vérifie le token CRON_SECRET
 * Fréquence: Une fois par jour à 18h (configuré dans vercel.json)
 *
 * Sauvegarde 3 types de données:
 * 1. Quote (cotation de clôture)
 * 2. Intraday (données tick par tick de la journée)
 * 3. Composition (composition de l'indice)
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // 1. Vérifier le token de sécurité
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!CRON_SECRET || token !== CRON_SECRET) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Cron job authentifié - Début de la collecte des données');

    // 2. Préparer la date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const result: SaveBourseResult = {
      success: true,
      date: dateStr,
      saved: {
        quote: false,
        intraday: false,
        composition: false,
      },
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // 3. Récupérer et sauvegarder les données de cotation (Quote)
    try {
      console.log('📊 Récupération de la cotation MASI...');
      const quote = await getMASIQuote();

      const { error: quoteError } = await supabase
        .from('bourse_history')
        .upsert(
          {
            date: dateStr,
            scrape_timestamp: new Date().toISOString(),
            data_type: 'quote',
            index_code: 'MASI',
            data: quote,
          },
          {
            onConflict: 'date,data_type,index_code',
          }
        );

      if (quoteError) {
        console.error('❌ Erreur sauvegarde quote:', quoteError);
        result.errors.push(`Quote: ${quoteError.message}`);
      } else {
        console.log('✅ Quote sauvegardé');
        result.saved.quote = true;
      }
    } catch (error: any) {
      console.error('❌ Erreur récupération quote:', error);
      result.errors.push(`Quote fetch: ${error.message}`);
    }

    // 4. Récupérer et sauvegarder les données intraday
    try {
      console.log('📈 Récupération des données intraday MASI...');
      const intraday = await getMASIIntraday(dateStr);

      if (intraday.length > 0) {
        const { error: intradayError } = await supabase
          .from('bourse_history')
          .upsert(
            {
              date: dateStr,
              scrape_timestamp: new Date().toISOString(),
              data_type: 'intraday',
              index_code: 'MASI',
              data: { points: intraday, count: intraday.length },
            },
            {
              onConflict: 'date,data_type,index_code',
            }
          );

        if (intradayError) {
          console.error('❌ Erreur sauvegarde intraday:', intradayError);
          result.errors.push(`Intraday: ${intradayError.message}`);
        } else {
          console.log(`✅ Intraday sauvegardé (${intraday.length} points)`);
          result.saved.intraday = true;
        }
      } else {
        console.log('⚠️ Aucune donnée intraday disponible');
        result.errors.push('Intraday: No data available');
      }
    } catch (error: any) {
      console.error('❌ Erreur récupération intraday:', error);
      result.errors.push(`Intraday fetch: ${error.message}`);
    }

    // 5. Récupérer et sauvegarder la composition de l'indice
    try {
      console.log('📋 Récupération de la composition MASI...');
      const composition = await getMASIComposition();

      if (composition.length > 0) {
        const { error: compositionError } = await supabase
          .from('bourse_history')
          .upsert(
            {
              date: dateStr,
              scrape_timestamp: new Date().toISOString(),
              data_type: 'composition',
              index_code: 'MASI',
              data: { stocks: composition, count: composition.length },
            },
            {
              onConflict: 'date,data_type,index_code',
            }
          );

        if (compositionError) {
          console.error('❌ Erreur sauvegarde composition:', compositionError);
          result.errors.push(`Composition: ${compositionError.message}`);
        } else {
          console.log(`✅ Composition sauvegardée (${composition.length} valeurs)`);
          result.saved.composition = true;
        }
      } else {
        console.log('⚠️ Aucune donnée de composition disponible');
        result.errors.push('Composition: No data available');
      }
    } catch (error: any) {
      console.error('❌ Erreur récupération composition:', error);
      result.errors.push(`Composition fetch: ${error.message}`);
    }

    // 6. Déterminer le succès global
    const savedCount = Object.values(result.saved).filter(Boolean).length;
    result.success = savedCount > 0; // Au moins une donnée sauvegardée = succès

    const duration = Date.now() - startTime;
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 RÉSUMÉ DU CRON JOB`);
    console.log(`${'='.repeat(50)}`);
    console.log(`Date: ${dateStr}`);
    console.log(`Durée: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Quote: ${result.saved.quote ? '✅' : '❌'}`);
    console.log(`Intraday: ${result.saved.intraday ? '✅' : '❌'}`);
    console.log(`Composition: ${result.saved.composition ? '✅' : '❌'}`);
    console.log(`Erreurs: ${result.errors.length}`);
    if (result.errors.length > 0) {
      console.log(`\n⚠️ Erreurs rencontrées:`);
      result.errors.forEach(err => console.log(`   - ${err}`));
    }
    console.log(`${'='.repeat(50)}\n`);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });

  } catch (error: any) {
    console.error('❌ Erreur critique dans le cron job:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Également supporter POST pour les tests manuels
export async function POST(request: Request) {
  return GET(request);
}
