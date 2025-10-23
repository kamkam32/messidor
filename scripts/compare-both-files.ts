/**
 * Script pour comparer les fichiers quotidien vs hebdomadaire
 */

import { readFileSync } from 'fs';
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser';

async function compareFiles() {
  try {
    console.log('📊 Comparaison des fichiers ASFIM\n');

    // Parser le fichier quotidien
    const quotidienPath = 'C:/Users/kamilalami/messidor-patrimoine/public/documents/Tableau des performances quotidiennes au 22-10-2025.xlsx';
    const quotidienBuffer = readFileSync(quotidienPath);
    const quotidienData = await parseOPCVMExcel(quotidienBuffer, 'Tableau des performances quotidiennes au 22-10-2025.xlsx');

    console.log('📅 FICHIER QUOTIDIEN (22-10-2025):');
    console.log(`   Fonds parsés: ${quotidienData.funds.length}`);
    console.log(`   Date: ${quotidienData.date}\n`);

    // Parser le fichier hebdomadaire
    const hebdoPath = 'C:/Users/kamilalami/messidor-patrimoine/public/documents/Tableau des Performances Hebdomadaires au 17-10-2025.xlsx';
    const hebdoBuffer = readFileSync(hebdoPath);
    const hebdoData = await parseOPCVMExcel(hebdoBuffer, 'Tableau des Performances Hebdomadaires au 17-10-2025.xlsx');

    console.log('📅 FICHIER HEBDOMADAIRE (17-10-2025):');
    console.log(`   Fonds parsés: ${hebdoData.funds.length}`);
    console.log(`   Date: ${hebdoData.date}\n`);

    // Trouver les fonds qui sont dans hebdo mais pas dans quotidien
    const quotidienCodes = new Set(quotidienData.funds.map(f => f.code).filter(Boolean));
    const hebdoCodes = new Set(hebdoData.funds.map(f => f.code).filter(Boolean));

    const onlyInHebdo = hebdoData.funds.filter(f => f.code && !quotidienCodes.has(f.code));
    const onlyInQuotidien = quotidienData.funds.filter(f => f.code && !hebdoCodes.has(f.code));

    console.log('🔍 DIFFÉRENCES:\n');
    console.log(`   Fonds uniquement dans QUOTIDIEN: ${onlyInQuotidien.length}`);
    console.log(`   Fonds uniquement dans HEBDOMADAIRE: ${onlyInHebdo.length}\n`);

    if (onlyInHebdo.length > 0) {
      console.log(`📋 Fonds uniquement dans l'HEBDOMADAIRE (premiers 20):\n`);
      onlyInHebdo.slice(0, 20).forEach((fund, i) => {
        console.log(`   ${i + 1}. ${fund.name} (${fund.code})`);
      });
      if (onlyInHebdo.length > 20) {
        console.log(`   ... et ${onlyInHebdo.length - 20} autres`);
      }
    }

    if (onlyInQuotidien.length > 0) {
      console.log(`\n📋 Fonds uniquement dans le QUOTIDIEN (premiers 20):\n`);
      onlyInQuotidien.slice(0, 20).forEach((fund, i) => {
        console.log(`   ${i + 1}. ${fund.name} (${fund.code})`);
      });
      if (onlyInQuotidien.length > 20) {
        console.log(`   ... et ${onlyInQuotidien.length - 20} autres`);
      }
    }

    // Statistiques
    console.log('\n📈 RECOMMANDATION:');
    if (hebdoData.funds.length > quotidienData.funds.length) {
      console.log(`   ⚠️  Le fichier HEBDOMADAIRE contient ${hebdoData.funds.length - quotidienData.funds.length} fonds de plus !`);
      console.log(`   💡 Il faut importer les deux fichiers pour avoir tous les fonds.`);
    } else if (quotidienData.funds.length > hebdoData.funds.length) {
      console.log(`   ✅ Le fichier QUOTIDIEN contient ${quotidienData.funds.length - hebdoData.funds.length} fonds de plus.`);
      console.log(`   💡 Le fichier quotidien suffit pour avoir tous les fonds.`);
    } else {
      console.log(`   ✅ Les deux fichiers contiennent le même nombre de fonds.`);
    }

  } catch (error) {
    console.error('❌ Comparison failed:', error);
    process.exit(1);
  }
}

compareFiles();
