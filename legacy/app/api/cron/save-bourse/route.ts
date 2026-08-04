import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getIndexIntraday, getMASIComposition, getMASIQuote, INDICES } from '@/lib/casablanca-bourse-scraper';

interface IndexResult {
  index: string;
  intradaySaved: boolean;
  compositionSaved: boolean;
  quoteSaved: boolean;
  errors: string[];
}

interface SaveBourseResult {
  success: boolean;
  date: string;
  indices: IndexResult[];
  totalErrors: number;
  timestamp: string;
}

/**
 * API Route: Cron job pour sauvegarder les données de la bourse toutes les 10 minutes
 *
 * Sécurité: Vérifie le token CRON_SECRET
 * Fréquence: Toutes les 10 minutes (configuré dans vercel.json)
 *
 * Collecte les données intraday pour plusieurs indices:
 * - MASI, MSI20, ESGI (MASI ESG), MASIMS (MASI Mid & Small Cap)
 * - Composition uniquement pour MASI (via Puppeteer, plus lourd)
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // 1. Vérifier le token de sécurité
    const CRON_SECRET = process.env.CRON_SECRET;
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

    // 2. Créer le client Supabase avec service role key (bypasses RLS)
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      console.error('❌ Missing Supabase credentials');
      return NextResponse.json(
        { success: false, error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 3. Préparer la date
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const results: IndexResult[] = [];

    // 4. Indices à collecter (intraday) - seulement ceux avec des données disponibles
    const indicesToCollect = ['MASI', 'MSI20', 'ESGI', 'MASIMS'];

    console.log(`\n📊 Collecte de ${indicesToCollect.length} indices pour ${dateStr}\n`);

    // 5. Boucle sur chaque indice
    for (const indexCode of indicesToCollect) {
      const indexResult: IndexResult = {
        index: indexCode,
        intradaySaved: false,
        compositionSaved: false,
        quoteSaved: false,
        errors: [],
      };

      console.log(`\n🔍 ${indexCode}:`);

      // 5.1 Récupérer et sauvegarder les données intraday
      try {
        console.log(`   📈 Récupération intraday...`);
        const intraday = await getIndexIntraday(indexCode, dateStr);

        if (intraday.length > 0) {
          const { error: intradayError } = await supabase
            .from('bourse_history')
            .upsert(
              {
                date: dateStr,
                scrape_timestamp: new Date().toISOString(),
                data_type: 'intraday',
                index_code: indexCode,
                data: { points: intraday, count: intraday.length },
              },
              {
                onConflict: 'date,data_type,index_code',
              }
            );

          if (intradayError) {
            console.log(`   ❌ Erreur sauvegarde: ${intradayError.message}`);
            indexResult.errors.push(`Intraday: ${intradayError.message}`);
          } else {
            console.log(`   ✅ Intraday sauvegardé (${intraday.length} points)`);
            indexResult.intradaySaved = true;
          }
        } else {
          console.log(`   ⚠️ Aucune donnée intraday disponible`);
          indexResult.errors.push('Intraday: No data available');
        }
      } catch (error: any) {
        console.log(`   ❌ Erreur récupération: ${error.message}`);
        indexResult.errors.push(`Intraday fetch: ${error.message}`);
      }

      // 5.2 Récupérer et sauvegarder la cotation officielle (quote) pour MASI
      if (indexCode === 'MASI') {
        try {
          console.log(`   📊 Récupération cotation officielle...`);
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
            console.log(`   ❌ Erreur sauvegarde quote: ${quoteError.message}`);
            indexResult.errors.push(`Quote: ${quoteError.message}`);
          } else {
            console.log(`   ✅ Cotation officielle sauvegardée`);
            indexResult.quoteSaved = true;
          }
        } catch (error: any) {
          console.log(`   ❌ Erreur récupération quote: ${error.message}`);
          indexResult.errors.push(`Quote fetch: ${error.message}`);
        }
      }

      results.push(indexResult);
    }

    // 6. Récupérer la composition uniquement pour MASI (plus lourd)
    console.log(`\n📋 MASI - Composition:`);
    const masiResult = results.find(r => r.index === 'MASI');
    if (masiResult) {
      try {
        console.log(`   🔍 Récupération composition...`);
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
            console.log(`   ❌ Erreur sauvegarde: ${compositionError.message}`);
            masiResult.errors.push(`Composition: ${compositionError.message}`);
          } else {
            console.log(`   ✅ Composition sauvegardée (${composition.length} valeurs)`);
            masiResult.compositionSaved = true;
          }
        } else {
          console.log(`   ⚠️ Aucune donnée de composition disponible`);
          masiResult.errors.push('Composition: No data available');
        }
      } catch (error: any) {
        console.log(`   ❌ Erreur récupération: ${error.message}`);
        masiResult.errors.push(`Composition fetch: ${error.message}`);
      }
    }

    // 7. Calculer le résumé
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const successfulSaves = results.filter(r => r.intradaySaved || r.compositionSaved).length;

    const result: SaveBourseResult = {
      success: successfulSaves > 0,
      date: dateStr,
      indices: results,
      totalErrors,
      timestamp: new Date().toISOString(),
    };

    // 8. Afficher le résumé
    const duration = Date.now() - startTime;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 RÉSUMÉ DU CRON JOB`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Date: ${dateStr}`);
    console.log(`Durée: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Indices collectés: ${successfulSaves}/${indicesToCollect.length}`);
    console.log(`Erreurs totales: ${totalErrors}`);
    console.log(`\nDétails par indice:`);
    results.forEach(r => {
      const status = r.intradaySaved ? '✅' : '❌';
      console.log(`  ${status} ${r.index} - Intraday: ${r.intradaySaved}, Quote: ${r.quoteSaved || 'N/A'}, Composition: ${r.compositionSaved || 'N/A'}`);
      if (r.errors.length > 0) {
        r.errors.forEach(err => console.log(`      ⚠️ ${err}`));
      }
    });
    console.log(`${'='.repeat(60)}\n`);

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
