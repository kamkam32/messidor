/**
 * Script de test pour parser un fichier Excel OPCVM local
 *
 * Usage: node --loader ts-node/esm scripts/test-excel-parser.ts
 */

import { readFileSync } from 'fs';
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser';

async function testParser() {
  try {
    console.log('🧪 Testing OPCVM Excel Parser...\n');

    // Lire le fichier Excel local
    const filePath = 'C:/Users/kamilalami/messidor-patrimoine/public/documents/Tableau des performances quotidiennes au 22-10-2025.xlsx';
    const fileName = 'Tableau des performances quotidiennes au 22-10-2025.xlsx';

    console.log(`📂 Reading file: ${filePath}`);
    const buffer = readFileSync(filePath);

    console.log(`📊 Parsing file...`);
    const result = await parseOPCVMExcel(buffer, fileName);

    console.log(`\n✅ Parse successful!`);
    console.log(`📅 Date: ${result.date}`);
    console.log(`📊 Total funds: ${result.funds.length}`);

    // Afficher les 5 premiers fonds
    console.log(`\n📋 First 5 funds:\n`);
    result.funds.slice(0, 5).forEach((fund, index) => {
      console.log(`${index + 1}. ${fund.name}`);
      console.log(`   Code: ${fund.code || 'N/A'}`);
      console.log(`   ISIN: ${fund.isinCode || 'N/A'}`);
      console.log(`   NAV: ${fund.nav || 'N/A'}`);
      console.log(`   Perf 1M: ${fund.perf1m || 'N/A'}%`);
      console.log(`   Perf YTD: ${fund.perfYtd || 'N/A'}%`);
      console.log(`   Perf 1Y: ${fund.perf1y || 'N/A'}%`);
      console.log('');
    });

    // Statistiques
    console.log(`\n📈 Statistics:`);
    console.log(`   Funds with NAV: ${result.funds.filter(f => f.nav !== undefined).length}`);
    console.log(`   Funds with code: ${result.funds.filter(f => f.code).length}`);
    console.log(`   Funds with ISIN: ${result.funds.filter(f => f.isinCode).length}`);
    console.log(`   Funds with Perf 1M: ${result.funds.filter(f => f.perf1m !== undefined).length}`);
    console.log(`   Funds with Perf YTD: ${result.funds.filter(f => f.perfYtd !== undefined).length}`);

    // Exporter en JSON pour inspection
    console.log(`\n💾 Full data exported to: test-opcvm-output.json`);
    const { writeFileSync } = await import('fs');
    writeFileSync(
      'test-opcvm-output.json',
      JSON.stringify(result, null, 2)
    );

    console.log(`\n✅ Test completed successfully!`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testParser();
