/**
 * Script COMPLET pour télécharger TOUTES les dates possibles
 * Génère tous les jeudis depuis 2022 et tente de les télécharger
 */

import { createClient } from '@supabase/supabase-js';
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

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
 * Formater la date au format DD-MM-YYYY
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

async function downloadAllPossibleDates() {
  console.log('🚀 TÉLÉCHARGEMENT MASSIF DE TOUTES LES DATES POSSIBLES\n');
  console.log('⏰ Ce processus peut prendre 30-60 minutes\n');
  console.log('💤 Vous pouvez aller dormir tranquille !\n');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables');
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: dbFunds } = await supabase.from('funds').select('id, code, name, isin_code');
  console.log(`📚 ${dbFunds?.length} fonds dans la base\n`);

  // Générer TOUS les jeudis depuis janvier 2022
  const startDate = new Date('2022-01-01');
  const endDate = new Date();
  const allThursdays = getAllThursdays(startDate, endDate);

  console.log(`📅 ${allThursdays.length} jeudis à tester depuis ${startDate.toLocaleDateString('fr-FR')}\n`);
  console.log('═══════════════════════════════════════════════════\n');

  const stats = {
    attempted: 0,
    downloaded: 0,
    skipped: 0,
    inserted: 0,
    errors: [] as string[],
    downloadedDates: [] as string[]
  };

  const startTime = Date.now();

  for (const thursday of allThursdays) {
    try {
      stats.attempted++;
      const formattedDate = formatDate(thursday);
      const fileName = `Tableau-des-Performances-Hebdomadaires-au-${formattedDate}.xlsx`;
      const url = `https://asfim.ma/static/tableau-des-performances/${fileName}`;

      // Afficher progression toutes les 10 dates
      if (stats.attempted % 10 === 0) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const rate = stats.attempted / elapsed;
        const remaining = Math.floor((allThursdays.length - stats.attempted) / rate);
        console.log(`\n📈 Progression: ${stats.attempted}/${allThursdays.length} (${Math.floor(stats.attempted / allThursdays.length * 100)}%)`);
        console.log(`   Téléchargés: ${stats.downloaded} | Ignorés: ${stats.skipped}`);
        console.log(`   Temps écoulé: ${Math.floor(elapsed / 60)}min | Restant: ~${Math.floor(remaining / 60)}min\n`);
      }

      console.log(`[${stats.attempted}/${allThursdays.length}] ${formattedDate}...`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        validateStatus: (status) => status === 200
      });

      const buffer = Buffer.from(response.data);
      stats.downloaded++;
      stats.downloadedDates.push(formattedDate);
      console.log(`   ✅ Téléchargé (${(buffer.length / 1024).toFixed(0)} KB)`);

      // Archiver
      const year = thursday.getFullYear();
      await supabase.storage.from('opcvm-archives').upload(`hebdo/${year}/${fileName}`, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

      // Parser
      const parsed = await parseOPCVMExcel(buffer, fileName);
      console.log(`   📊 ${parsed.funds.length} fonds`);

      let inserted = 0;
      // Insérer
      for (const excelFund of parsed.funds) {
        let dbFund = dbFunds?.find(f => excelFund.isinCode && f.isin_code === excelFund.isinCode);
        if (!dbFund && excelFund.code) {
          dbFund = dbFunds?.find(f => f.code === excelFund.code);
        }
        if (!dbFund) {
          const normalizedExcelName = excelFund.name.toLowerCase().replace(/\s+/g, ' ').trim();
          dbFund = dbFunds?.find(f => f.name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedExcelName);
        }
        if (!dbFund) continue;

        const { error } = await supabase.from('fund_performance_history').upsert({
          fund_id: dbFund.id,
          date: parsed.date,
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
          source_file: fileName,
          updated_at: new Date().toISOString()
        }, { onConflict: 'fund_id,date' });

        if (!error) {
          inserted++;
          stats.inserted++;
        }
      }

      console.log(`   ✅ ${inserted} enregistrements insérés\n`);

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        stats.skipped++;
        console.log(`   ⚠️  404 (fichier non disponible)\n`);
      } else {
        console.error(`   ❌ Erreur: ${error}\n`);
        stats.errors.push(`${thursday.toLocaleDateString('fr-FR')}: ${error}`);
      }
    }
  }

  const totalTime = Math.floor((Date.now() - startTime) / 1000);

  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════');
  console.log('🎉🎉🎉 TÉLÉCHARGEMENT MASSIF TERMINÉ ! 🎉🎉🎉');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('📊 STATISTIQUES FINALES:\n');
  console.log(`   Dates testées: ${stats.attempted}`);
  console.log(`   ✅ Fichiers téléchargés: ${stats.downloaded}`);
  console.log(`   ⚠️  Fichiers non disponibles: ${stats.skipped}`);
  console.log(`   💾 Enregistrements insérés: ${stats.inserted.toLocaleString('fr-FR')}`);
  console.log(`   ❌ Erreurs: ${stats.errors.length}`);
  console.log(`   ⏱️  Durée totale: ${Math.floor(totalTime / 60)}min ${totalTime % 60}s\n`);

  if (stats.downloadedDates.length > 0) {
    console.log('📅 PÉRIODE COUVERTE:\n');
    console.log(`   Première date: ${stats.downloadedDates[0]}`);
    console.log(`   Dernière date: ${stats.downloadedDates[stats.downloadedDates.length - 1]}`);
    console.log(`   Nombre de semaines: ${stats.downloadedDates.length}\n`);
  }

  // Stats finales de la base
  const { count: totalCount } = await supabase
    .from('fund_performance_history')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ Total dans fund_performance_history: ${totalCount?.toLocaleString('fr-FR')} enregistrements\n`);

  // Statistiques par fonds
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

    console.log('📈 STATISTIQUES DES GRAPHIQUES:\n');
    console.log(`   Fonds avec historique: ${fundCounts.size}`);
    console.log(`   Maximum de points par fonds: ${maxPoints}`);
    console.log(`   Moyenne de points: ${avgPoints.toFixed(1)}`);
    console.log(`   Fonds avec 2+ points: ${countsArray.filter(c => c >= 2).length} ✅`);
    console.log(`   Fonds avec 10+ points: ${countsArray.filter(c => c >= 10).length} 🎯`);
    console.log(`   Fonds avec 50+ points: ${countsArray.filter(c => c >= 50).length} 🚀`);
    console.log(`   Fonds avec 80+ points: ${countsArray.filter(c => c >= 80).length} 💎`);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('🌟 VOS GRAPHIQUES SONT MAINTENANT SUPER RICHES ! 🌟');
  console.log('═══════════════════════════════════════════════════\n');

  console.log('🎊 Bon réveil ! Vos données historiques sont prêtes ! 🎊\n');
}

downloadAllPossibleDates().catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});
