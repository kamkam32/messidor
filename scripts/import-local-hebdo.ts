/**
 * Script pour importer un fichier hebdomadaire LOCAL
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function importLocalHebdo() {
  try {
    console.log('🚀 Import fichier HEBDOMADAIRE local\n');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Fichier local
    const filePath = 'C:/Users/kamilalami/messidor-patrimoine/public/documents/Tableau des Performances Hebdomadaires au 17-10-2025.xlsx';
    const fileName = 'Tableau des Performances Hebdomadaires au 17-10-2025.xlsx';

    console.log(`📂 Lecture: ${filePath}`);
    const buffer = readFileSync(filePath);

    console.log(`📊 Parsing...`);
    const parsed = await parseOPCVMExcel(buffer, fileName);
    console.log(`✅ ${parsed.funds.length} fonds parsés\n`);

    // Récupérer tous les fonds de la DB
    const { data: dbFunds } = await supabase
      .from('funds')
      .select('id, code, name, isin_code');

    console.log(`📚 ${dbFunds?.length} fonds dans la base\n`);

    // Archiver
    const storagePath = `hebdo/2025/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('opcvm-archives')
      .upload(storagePath, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

    if (uploadError) {
      console.error(`❌ Storage error: ${uploadError.message}`);
    } else {
      console.log(`💾 Archivé: ${storagePath}\n`);
    }

    // Insérer chaque fonds
    let matched = 0;
    let notMatched: string[] = [];
    let inserted = 0;

    for (const excelFund of parsed.funds) {
      // Matcher
      let dbFund = dbFunds?.find(f =>
        excelFund.isinCode && f.isin_code === excelFund.isinCode
      );

      if (!dbFund && excelFund.code) {
        dbFund = dbFunds?.find(f => f.code === excelFund.code);
      }

      if (!dbFund) {
        const normalizedExcelName = excelFund.name.toLowerCase().replace(/\s+/g, ' ').trim();
        dbFund = dbFunds?.find(f =>
          f.name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedExcelName
        );
      }

      if (!dbFund) {
        notMatched.push(excelFund.name);
        continue;
      }

      matched++;

      // Insérer dans fund_performance_history
      const { error: perfError } = await supabase
        .from('fund_performance_history')
        .upsert({
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
        }, {
          onConflict: 'fund_id,date'
        });

      if (!perfError) {
        inserted++;
      }
    }

    console.log(`\n✅ Import terminé !`);
    console.log(`   Matched: ${matched}`);
    console.log(`   Not matched: ${notMatched.length}`);
    console.log(`   Inserted: ${inserted}\n`);

    if (notMatched.length > 0) {
      console.log(`⚠️  Fonds non matchés (premiers 20):`);
      notMatched.slice(0, 20).forEach(name => console.log(`   - ${name}`));
    }

    // Stats finales
    const { count } = await supabase
      .from('fund_performance_history')
      .select('*', { count: 'exact', head: true });

    console.log(`\n✅ Total dans fund_performance_history: ${count}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

importLocalHebdo();
