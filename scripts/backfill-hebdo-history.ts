/**
 * Script pour backfiller l'historique depuis les fichiers HEBDOMADAIRES
 * Les fichiers hebdo contiennent PLUS de fonds que les quotidiens
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

/**
 * Génère toutes les dates de jeudi entre start et end
 */
function getThursdays(startDate: Date, endDate: Date): Date[] {
  const thursdays: Date[] = [];
  const current = new Date(startDate);

  // Trouver le premier jeudi
  while (current.getDay() !== 4) {
    current.setDate(current.getDate() + 1);
  }

  // Ajouter tous les jeudis jusqu'à endDate
  while (current <= endDate) {
    thursdays.push(new Date(current));
    current.setDate(current.getDate() + 7); // +7 jours = jeudi suivant
  }

  return thursdays;
}

/**
 * Formater la date au format DD-MM-YYYY
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Télécharger un fichier hebdomadaire depuis ASFIM
 */
async function downloadHebdoFile(date: Date): Promise<{ buffer: Buffer; fileName: string; date: string } | null> {
  const formattedDate = formatDate(date);
  const fileName = `Tableau des Performances Hebdomadaires au ${formattedDate}.xlsx`;
  const url = `https://asfim.ma/static/tableau-des-performances/${encodeURIComponent(fileName)}`;

  try {
    console.log(`   Téléchargement: ${fileName}...`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    return {
      buffer: Buffer.from(response.data),
      fileName,
      date: date.toISOString().split('T')[0]
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.log(`   ⚠️  404 - Fichier non disponible: ${fileName}`);
      return null;
    }
    throw error;
  }
}

async function backfillHebdo() {
  try {
    console.log('🚀 Backfill HEBDOMADAIRE\n');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Définir la période (depuis janvier 2024 jusqu'à aujourd'hui)
    const startDate = new Date('2024-01-01');
    const endDate = new Date();

    console.log(`📅 Période: ${startDate.toLocaleDateString('fr-FR')} → ${endDate.toLocaleDateString('fr-FR')}\n`);

    // Récupérer tous les fonds de la DB
    const { data: dbFunds, error: fundsError } = await supabase
      .from('funds')
      .select('id, code, name, isin_code');

    if (fundsError) {
      throw new Error(`Failed to fetch funds: ${fundsError.message}`);
    }

    console.log(`📚 ${dbFunds.length} fonds dans la base\n`);

    // Générer toutes les dates de jeudi
    const thursdays = getThursdays(startDate, endDate);
    console.log(`📊 ${thursdays.length} jeudis à télécharger\n`);

    const stats = {
      filesDownloaded: 0,
      filesSkipped: 0,
      filesProcessed: 0,
      totalFundsProcessed: 0,
      totalInserted: 0,
      totalUpdated: 0,
      errors: [] as string[]
    };

    // Télécharger et traiter chaque fichier
    for (const [index, thursday] of thursdays.entries()) {
      try {
        console.log(`\n[${index + 1}/${thursdays.length}] ${thursday.toLocaleDateString('fr-FR')}`);

        const file = await downloadHebdoFile(thursday);

        if (!file) {
          stats.filesSkipped++;
          continue;
        }

        stats.filesDownloaded++;

        // Archiver dans Supabase Storage
        const storagePath = `hebdo/${thursday.getFullYear()}/${file.fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('opcvm-archives')
          .upload(storagePath, file.buffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            upsert: true
          });

        if (uploadError) {
          console.error(`   ❌ Storage error: ${uploadError.message}`);
        } else {
          console.log(`   💾 Archivé: ${storagePath}`);
        }

        // Parser le fichier
        const parsedData = await parseOPCVMExcel(file.buffer, file.fileName);
        console.log(`   ✅ Parsé: ${parsedData.funds.length} fonds`);

        let matched = 0;
        let notMatched = 0;

        // Insérer chaque fonds dans fund_performance_history
        for (const excelFund of parsedData.funds) {
          // Matcher le fonds
          let dbFund = dbFunds.find(f =>
            excelFund.isinCode && f.isin_code === excelFund.isinCode
          );

          if (!dbFund && excelFund.code) {
            dbFund = dbFunds.find(f => f.code === excelFund.code);
          }

          if (!dbFund) {
            const normalizedExcelName = excelFund.name.toLowerCase().replace(/\s+/g, ' ').trim();
            dbFund = dbFunds.find(f =>
              f.name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedExcelName
            );
          }

          if (!dbFund) {
            notMatched++;
            continue;
          }

          matched++;

          // Insérer dans fund_performance_history
          const { error: perfError } = await supabase
            .from('fund_performance_history')
            .upsert({
              fund_id: dbFund.id,
              date: parsedData.date,
              nav: excelFund.nav,
              asset_value: excelFund.assetValue,
              perf_1d: excelFund.perf1d,
              perf_1w: excelFund.perf1w,
              perf_1m: excelFund.perf1m,
              perf_3m: excelFund.perf3m,
              perf_6m: excelFund.perf6m,
              perf_ytd: excelFund.perfYtd,
              perf_1y: excelFund.perf1y,
              perf_2y: excelFund.perf2y,
              perf_3y: excelFund.perf3y,
              perf_5y: excelFund.perf5y,
              source_file: file.fileName,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'fund_id,date'
            });

          if (perfError) {
            stats.errors.push(`${file.fileName} - ${dbFund.name}: ${perfError.message}`);
          } else {
            stats.totalInserted++;
          }
        }

        stats.filesProcessed++;
        stats.totalFundsProcessed += parsedData.funds.length;

        console.log(`   ✅ Matched: ${matched}, Not matched: ${notMatched}`);

      } catch (error) {
        stats.errors.push(
          `${thursday.toLocaleDateString('fr-FR')}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        console.error(`   ❌ Error:`, error);
      }
    }

    // Mettre à jour la table funds avec les dernières valeurs
    console.log('\n🔄 Mise à jour de la table funds...');
    const { data: latestPerf } = await supabase
      .from('latest_fund_performance')
      .select('*');

    if (latestPerf) {
      for (const perf of latestPerf) {
        await supabase
          .from('funds')
          .update({
            nav: perf.nav,
            asset_value: perf.asset_value,
            perf_1d: perf.perf_1d,
            perf_1w: perf.perf_1w,
            perf_1m: perf.perf_1m,
            perf_3m: perf.perf_3m,
            perf_6m: perf.perf_6m,
            ytd_performance: perf.perf_ytd,
            perf_1y: perf.perf_1y,
            perf_2y: perf.perf_2y,
            perf_3y: perf.perf_3y,
            perf_5y: perf.perf_5y,
            updated_at: new Date().toISOString()
          })
          .eq('id', perf.fund_id);

        stats.totalUpdated++;
      }
    }

    console.log('\n✅ BACKFILL TERMINÉ !');
    console.log('\n📊 Statistiques:');
    console.log(`   Jeudis traités: ${thursdays.length}`);
    console.log(`   Fichiers téléchargés: ${stats.filesDownloaded}`);
    console.log(`   Fichiers ignorés (404): ${stats.filesSkipped}`);
    console.log(`   Fichiers traités: ${stats.filesProcessed}`);
    console.log(`   Total fonds processés: ${stats.totalFundsProcessed}`);
    console.log(`   Enregistrements insérés: ${stats.totalInserted}`);
    console.log(`   Fonds mis à jour: ${stats.totalUpdated}`);
    console.log(`   Erreurs: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Premières 10 erreurs:');
      stats.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    }

    // Vérifier le résultat
    const { count } = await supabase
      .from('fund_performance_history')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✅ Total enregistrements dans fund_performance_history: ${count}`);

  } catch (error) {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  }
}

backfillHebdo();
