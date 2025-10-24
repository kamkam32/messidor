/**
 * Script pour télécharger les dates que vous avez trouvées
 */

import { createClient } from '@supabase/supabase-js';
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: '.env.local' });

// Dates que vous avez trouvées + générons plus de dates autour
const KNOWN_DATES = [
  '2023-12-01', '2023-12-08', '2023-12-15', '2023-12-22', '2023-12-29',
  // Ajoutons toute l'année 2024
  '2024-01-05', '2024-01-12', '2024-01-19', '2024-01-26',
  '2024-02-02', '2024-02-09', '2024-02-16', '2024-02-23',
  '2024-03-01', '2024-03-08', '2024-03-15', '2024-03-22', '2024-03-29',
  '2024-04-05', '2024-04-12', '2024-04-19', '2024-04-26',
  '2024-05-03', '2024-05-10', '2024-05-17', '2024-05-24', '2024-05-31',
  '2024-06-07', '2024-06-14', '2024-06-21', '2024-06-28',
  '2024-07-05', '2024-07-12', '2024-07-19', '2024-07-26',
  '2024-08-02', '2024-08-09', '2024-08-16', '2024-08-23', '2024-08-30',
  '2024-09-06', '2024-09-13', '2024-09-20', '2024-09-27',
  '2024-10-04', '2024-10-11', '2024-10-18', '2024-10-25',
  '2024-11-01', '2024-11-08', '2024-11-15', '2024-11-22', '2024-11-29',
  '2024-12-06', '2024-12-13', '2024-12-20', '2024-12-27',
  // 2025
  '2025-01-03', '2025-01-10', '2025-01-17', '2025-01-24', '2025-01-31',
  '2025-02-07', '2025-02-14', '2025-02-21', '2025-02-28',
  '2025-03-07', '2025-03-14', '2025-03-21', '2025-03-28',
  '2025-04-04', '2025-04-11', '2025-04-18', '2025-04-25',
  '2025-05-02', '2025-05-09', '2025-05-16', '2025-05-23', '2025-05-30',
  '2025-06-06', '2025-06-13', '2025-06-20', '2025-06-27',
  '2025-07-04', '2025-07-11', '2025-07-18', '2025-07-25',
  '2025-08-01', '2025-08-08', '2025-08-15', '2025-08-22', '2025-08-29',
  '2025-09-05', '2025-09-12', '2025-09-19', '2025-09-26',
  '2025-10-03', '2025-10-10', '2025-10-17',
];

async function downloadYourDates() {
  console.log('🚀 Téléchargement des fichiers historiques\n');

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

  const stats = {
    attempted: 0,
    downloaded: 0,
    inserted: 0,
    errors: [] as string[]
  };

  for (const dateStr of KNOWN_DATES) {
    try {
      stats.attempted++;
      const [year, month, day] = dateStr.split('-');
      const fileName = `Tableau-des-Performances-Hebdomadaires-au-${day}-${month}-${year}.xlsx`;
      const url = `https://asfim.ma/static/tableau-des-performances/${fileName}`;

      console.log(`[${stats.attempted}/${KNOWN_DATES.length}] ${dateStr}...`);

      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        validateStatus: (status) => status === 200
      });

      const buffer = Buffer.from(response.data);
      stats.downloaded++;
      console.log(`   ✅ Téléchargé (${(buffer.length / 1024).toFixed(0)} KB)`);

      // Archiver
      await supabase.storage.from('opcvm-archives').upload(`hebdo/${year}/${fileName}`, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

      // Parser
      const parsed = await parseOPCVMExcel(buffer, fileName);
      console.log(`   📊 ${parsed.funds.length} fonds`);

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

        if (!error) stats.inserted++;
      }

      console.log(`   ✅ Données insérées\n`);

    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log(`   ⚠️  404\n`);
      } else {
        console.error(`   ❌ Erreur: ${error}\n`);
        stats.errors.push(`${dateStr}: ${error}`);
      }
    }
  }

  console.log('\n🎉 TERMINÉ !\n');
  console.log(`📊 Statistiques:`);
  console.log(`   Dates testées: ${stats.attempted}`);
  console.log(`   Fichiers téléchargés: ${stats.downloaded}`);
  console.log(`   Enregistrements insérés: ${stats.inserted.toLocaleString('fr-FR')}`);
  console.log(`   Erreurs: ${stats.errors.length}\n`);

  const { count } = await supabase.from('fund_performance_history').select('*', { count: 'exact', head: true });
  console.log(`✅ Total dans fund_performance_history: ${count?.toLocaleString('fr-FR')}`);
}

downloadYourDates();
