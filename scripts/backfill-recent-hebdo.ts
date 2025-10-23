/**
 * Script pour télécharger les fichiers hebdomadaires RÉCENTS depuis ASFIM
 * Commence par aujourd'hui et remonte jeudi par jeudi jusqu'à trouver des 404
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
 * Trouver le jeudi précédent (ou aujourd'hui si c'est jeudi)
 */
function getPreviousThursday(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay();

  if (dayOfWeek === 4) {
    // C'est jeudi, garder cette date
    return result;
  } else if (dayOfWeek > 4) {
    // Vendredi, samedi ou dimanche : retourner au jeudi précédent
    result.setDate(result.getDate() - (dayOfWeek - 4));
  } else {
    // Lundi, mardi, mercredi : retourner au jeudi de la semaine dernière
    result.setDate(result.getDate() - (dayOfWeek + 3));
  }

  return result;
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
      console.log(`   ⚠️  404 - Fichier non disponible`);
      return null;
    }
    throw error;
  }
}

async function backfillRecentHebdo() {
  try {
    console.log('🚀 Backfill fichiers HEBDOMADAIRES récents\n');

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

    const stats = {
      filesDownloaded: 0,
      filesSkipped: 0,
      totalInserted: 0,
      errors: [] as string[]
    };

    // Commencer par le jeudi le plus récent
    let currentThursday = getPreviousThursday(new Date());
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 3; // Arrêter après 3 échecs consécutifs

    console.log(`📅 Recherche des fichiers disponibles depuis ${currentThursday.toLocaleDateString('fr-FR')}\n`);

    while (consecutiveFailures < maxConsecutiveFailures) {
      try {
        console.log(`\n🗓️  ${currentThursday.toLocaleDateString('fr-FR')}`);

        const file = await downloadHebdoFile(currentThursday);

        if (!file) {
          consecutiveFailures++;
          console.log(`   ⚠️  ${consecutiveFailures}/${maxConsecutiveFailures} échecs consécutifs`);

          // Passer au jeudi précédent
          currentThursday.setDate(currentThursday.getDate() - 7);
          continue;
        }

        // Fichier trouvé ! Réinitialiser le compteur d'échecs
        consecutiveFailures = 0;
        stats.filesDownloaded++;

        // Archiver dans Supabase Storage
        const storagePath = `hebdo/${currentThursday.getFullYear()}/${file.fileName}`;
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

        console.log(`   ✅ Matched: ${matched}, Not matched: ${notMatched}`);

      } catch (error) {
        stats.errors.push(
          `${currentThursday.toLocaleDateString('fr-FR')}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        console.error(`   ❌ Error:`, error);
        consecutiveFailures++;
      }

      // Passer au jeudi précédent
      currentThursday.setDate(currentThursday.getDate() - 7);
    }

    console.log('\n✅ BACKFILL TERMINÉ !');
    console.log('\n📊 Statistiques:');
    console.log(`   Fichiers téléchargés: ${stats.filesDownloaded}`);
    console.log(`   Fichiers ignorés (404): ${stats.filesSkipped}`);
    console.log(`   Enregistrements insérés: ${stats.totalInserted}`);
    console.log(`   Erreurs: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Premières 10 erreurs:');
      stats.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    }

    // Vérifier le résultat final
    const { count } = await supabase
      .from('fund_performance_history')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✅ Total enregistrements dans fund_performance_history: ${count}`);

    // Combien de fonds ont au moins 2 points ?
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

      const fundsWithMultiplePoints = Array.from(fundCounts.values()).filter(count => count >= 2).length;
      const fundsWithOnePoint = Array.from(fundCounts.values()).filter(count => count === 1).length;

      console.log(`\n📈 Fonds avec graphiques possibles:`);
      console.log(`   Fonds avec 2+ points: ${fundsWithMultiplePoints} ✅`);
      console.log(`   Fonds avec 1 seul point: ${fundsWithOnePoint} ⚠️`);
    }

  } catch (error) {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  }
}

backfillRecentHebdo();
