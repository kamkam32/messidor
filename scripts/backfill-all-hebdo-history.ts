/**
 * Script pour télécharger TOUS les fichiers hebdomadaires depuis décembre 2022
 * Cela donnera un maximum de points pour les graphiques !
 */

import { createClient } from '@supabase/supabase-js';
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

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
 * Générer tous les jeudis entre deux dates
 */
function getAllThursdays(startDate: Date, endDate: Date): Date[] {
  const thursdays: Date[] = [];
  const current = new Date(startDate);

  // Trouver le premier jeudi
  while (current.getDay() !== 4) {
    current.setDate(current.getDate() + 1);
    if (current > endDate) return thursdays;
  }

  // Ajouter tous les jeudis
  while (current <= endDate) {
    thursdays.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return thursdays;
}

/**
 * Télécharger un fichier hebdomadaire depuis ASFIM
 */
async function downloadHebdoFile(date: Date): Promise<{ buffer: Buffer; fileName: string; date: string } | null> {
  const formattedDate = formatDate(date);
  const fileName = `Tableau des Performances Hebdomadaires au ${formattedDate}.xlsx`;
  const url = `https://asfim.ma/static/tableau-des-performances/${encodeURIComponent(fileName)}`;

  try {
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
      return null;
    }
    throw error;
  }
}

async function backfillAllHebdo() {
  try {
    console.log('🚀 Backfill COMPLET des fichiers HEBDOMADAIRES (2022 → 2025)\n');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Récupérer tous les fonds de la DB
    const { data: dbFunds, error: fundsError } = await supabase
      .from('funds')
      .select('id, code, name, isin_code');

    if (fundsError) {
      throw new Error(`Failed to fetch funds: ${fundsError.message}`);
    }

    console.log(`📚 ${dbFunds.length} fonds dans la base\n`);

    // Période complète : 02/12/2022 → aujourd'hui
    const startDate = new Date('2022-12-02');
    const endDate = new Date();

    const thursdays = getAllThursdays(startDate, endDate);
    console.log(`📅 Période: ${startDate.toLocaleDateString('fr-FR')} → ${endDate.toLocaleDateString('fr-FR')}`);
    console.log(`📊 ${thursdays.length} jeudis à télécharger\n`);

    const stats = {
      filesDownloaded: 0,
      files404: 0,
      totalInserted: 0,
      errors: [] as string[],
      downloadedDates: [] as string[]
    };

    // Télécharger chaque jeudi
    for (const [index, thursday] of thursdays.entries()) {
      try {
        const progress = `[${index + 1}/${thursdays.length}]`;
        const dateStr = thursday.toLocaleDateString('fr-FR');

        // Afficher la progression toutes les 10 itérations
        if (index % 10 === 0 || index === thursdays.length - 1) {
          console.log(`\n📈 Progression: ${progress} - ${dateStr}`);
        }

        const file = await downloadHebdoFile(thursday);

        if (!file) {
          stats.files404++;
          if (index % 10 === 0) {
            console.log(`   ⚠️  404`);
          }
          continue;
        }

        stats.filesDownloaded++;
        stats.downloadedDates.push(dateStr);

        if (index % 10 === 0 || index === thursdays.length - 1) {
          console.log(`   ✅ Téléchargé`);
        }

        // Archiver dans Supabase Storage
        const storagePath = `hebdo/${thursday.getFullYear()}/${file.fileName}`;
        await supabase.storage
          .from('opcvm-archives')
          .upload(storagePath, file.buffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            upsert: true
          });

        // Parser le fichier
        const parsedData = await parseOPCVMExcel(file.buffer, file.fileName);

        if (index % 10 === 0 || index === thursdays.length - 1) {
          console.log(`   📊 ${parsedData.funds.length} fonds`);
        }

        let matched = 0;

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

          if (!dbFund) continue;

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

          if (!perfError) {
            stats.totalInserted++;
          }
        }

        if (index % 10 === 0 || index === thursdays.length - 1) {
          console.log(`   ✅ ${matched} fonds insérés`);
        }

      } catch (error) {
        stats.errors.push(
          `${thursday.toLocaleDateString('fr-FR')}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        console.error(`   ❌ Error:`, error);
      }
    }

    console.log('\n\n🎉 BACKFILL COMPLET TERMINÉ !\n');
    console.log('═══════════════════════════════════════════\n');
    console.log('📊 STATISTIQUES FINALES:\n');
    console.log(`   Jeudis analysés: ${thursdays.length}`);
    console.log(`   ✅ Fichiers téléchargés: ${stats.filesDownloaded}`);
    console.log(`   ⚠️  Fichiers non disponibles (404): ${stats.files404}`);
    console.log(`   💾 Enregistrements insérés: ${stats.totalInserted.toLocaleString('fr-FR')}`);
    console.log(`   ❌ Erreurs: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Erreurs rencontrées:');
      stats.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
      if (stats.errors.length > 10) {
        console.log(`   ... et ${stats.errors.length - 10} autres`);
      }
    }

    // Vérifier le résultat final
    const { count } = await supabase
      .from('fund_performance_history')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✅ Total dans fund_performance_history: ${count?.toLocaleString('fr-FR')}`);

    // Statistiques détaillées par fonds
    const { data: fundsWithHistory } = await supabase
      .from('fund_performance_history')
      .select('fund_id, date')
      .order('fund_id')
      .order('date');

    if (fundsWithHistory) {
      const fundCounts = new Map<string, number>();
      fundsWithHistory.forEach(h => {
        fundCounts.set(h.fund_id, (fundCounts.get(h.fund_id) || 0) + 1);
      });

      const countsArray = Array.from(fundCounts.values());
      const maxPoints = Math.max(...countsArray);
      const avgPoints = countsArray.reduce((a, b) => a + b, 0) / countsArray.length;

      console.log(`\n📈 STATISTIQUES DES GRAPHIQUES:`);
      console.log(`   Fonds avec historique: ${fundCounts.size}`);
      console.log(`   Maximum de points: ${maxPoints}`);
      console.log(`   Moyenne de points: ${avgPoints.toFixed(1)}`);
      console.log(`   Fonds avec 2+ points: ${countsArray.filter(c => c >= 2).length} ✅`);
      console.log(`   Fonds avec 10+ points: ${countsArray.filter(c => c >= 10).length} 🎯`);
      console.log(`   Fonds avec 50+ points: ${countsArray.filter(c => c >= 50).length} 🚀`);
      console.log(`   Fonds avec 100+ points: ${countsArray.filter(c => c >= 100).length} 💎`);
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('🎊 TOUS LES GRAPHIQUES SONT PRÊTS ! 🎊');
    console.log('═══════════════════════════════════════════\n');

    // Afficher quelques dates téléchargées
    if (stats.downloadedDates.length > 0) {
      console.log(`\n📅 Période couverte:`);
      console.log(`   Première date: ${stats.downloadedDates[0]}`);
      console.log(`   Dernière date: ${stats.downloadedDates[stats.downloadedDates.length - 1]}`);
      console.log(`   ${stats.downloadedDates.length} semaines de données !`);
    }

  } catch (error) {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  }
}

backfillAllHebdo();
