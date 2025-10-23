/**
 * Script pour importer les fonds depuis le fichier HEBDOMADAIRE
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function importHebdoFunds() {
  try {
    console.log('🚀 Importing funds from WEEKLY file...\n');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const filePath = 'C:/Users/kamilalami/messidor-patrimoine/public/documents/Tableau des Performances Hebdomadaires au 17-10-2025.xlsx';
    const fileName = 'Tableau des Performances Hebdomadaires au 17-10-2025.xlsx';

    console.log(`📂 Reading: ${filePath}`);
    const buffer = readFileSync(filePath);

    console.log(`📊 Parsing...`);
    const result = await parseOPCVMExcel(buffer, fileName);

    console.log(`✅ Parsed ${result.funds.length} funds\n`);
    console.log('💾 Importing to database...\n');

    const stats = { total: result.funds.length, inserted: 0, updated: 0, errors: [] as string[] };

    for (const [index, excelFund] of result.funds.entries()) {
      try {
        let riskLevel: number | null = null;
        if (excelFund.sensitivity) {
          const match = excelFund.sensitivity.match(/[\d.]+/);
          if (match) {
            const value = parseFloat(match[0]);
            if (value >= 0 && value < 1) riskLevel = 1;
            else if (value >= 1 && value <= 7) riskLevel = Math.min(Math.ceil(value), 7);
            else riskLevel = 7;
          }
        }

        if (!riskLevel && excelFund.classification) {
          const classif = excelFund.classification.toLowerCase();
          if (classif.includes('monétaire') || classif.includes('monetaire')) riskLevel = 1;
          else if (classif.includes('court terme') || classif.includes('oct')) riskLevel = 2;
          else if (classif.includes('oblig') || classif.includes('omlt')) riskLevel = 3;
          else if (classif.includes('diversifié') || classif.includes('diversifie')) riskLevel = 5;
          else if (classif.includes('actions')) riskLevel = 7;
          else riskLevel = 4;
        }

        const fundData = {
          isin_code: excelFund.isinCode,
          morocco_code: excelFund.code,
          code: excelFund.code,
          name: excelFund.name,
          type: 'OPCVM' as const,
          category: excelFund.classification,
          classification: excelFund.classification,
          management_company: excelFund.managementCompany,
          legal_nature: excelFund.legalNature,
          benchmark_index: excelFund.benchmarkIndex,
          subscription_fee: excelFund.subscriptionFee,
          redemption_fee: excelFund.redemptionFee,
          management_fees: excelFund.managementFees,
          depositary: excelFund.depositary,
          distributor: excelFund.distributor,
          asset_value: excelFund.assetValue,
          nav: excelFund.nav,
          ytd_performance: excelFund.perfYtd,
          perf_1d: excelFund.perf1d,
          perf_1w: excelFund.perf1w,
          perf_1m: excelFund.perf1m,
          perf_3m: excelFund.perf3m,
          perf_6m: excelFund.perf6m,
          perf_1y: excelFund.perf1y,
          perf_2y: excelFund.perf2y,
          perf_3y: excelFund.perf3y,
          perf_5y: excelFund.perf5y,
          risk_level: riskLevel,
          is_active: true,
          updated_at: new Date().toISOString()
        };

        const { data: existing } = await supabase
          .from('funds')
          .select('id')
          .or(`isin_code.eq.${excelFund.isinCode},morocco_code.eq.${excelFund.code}`)
          .single();

        let error;
        if (existing) {
          const { error: updateError } = await supabase.from('funds').update(fundData).eq('id', existing.id);
          error = updateError;
          stats.updated++;
        } else {
          const { error: insertError } = await supabase.from('funds').insert(fundData);
          error = insertError;
          stats.inserted++;
        }

        if (error) {
          stats.errors.push(`${excelFund.name}: ${error.message}`);
        }

        if ((index + 1) % 50 === 0) {
          console.log(`   Processed ${index + 1}/${result.funds.length}...`);
        }
      } catch (error) {
        stats.errors.push(`${excelFund.name}: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    console.log('\n✅ Import completed!\n');
    console.log('📊 Statistics:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   Inserted: ${stats.inserted}`);
    console.log(`   Updated: ${stats.updated}`);
    console.log(`   Errors: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  First 10 errors:');
      stats.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
    }

    const { count } = await supabase.from('funds').select('*', { count: 'exact', head: true }).eq('type', 'OPCVM').eq('is_active', true);
    console.log(`\n✅ Total OPCVM in DB: ${count}`);

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

importHebdoFunds();
