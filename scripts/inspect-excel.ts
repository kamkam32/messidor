/**
 * Script pour inspecter la structure d'un fichier Excel OPCVM
 */

import { readFileSync, writeFileSync } from 'fs';
import * as XLSX from 'xlsx';

async function inspectExcel() {
  try {
    console.log('🔍 Inspecting OPCVM Excel file...\n');

    const filePath = 'C:/Users/kamilalami/messidor-patrimoine/public/documents/Tableau des performances quotidiennes au 22-10-2025.xlsx';

    console.log(`📂 Reading: ${filePath}\n`);
    const buffer = readFileSync(filePath);

    const workbook = XLSX.read(buffer, { type: 'buffer' });

    console.log(`📊 Workbook info:`);
    console.log(`   Sheets: ${workbook.SheetNames.join(', ')}\n`);

    // Inspecter la première feuille
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    console.log(`📄 Analyzing sheet: "${sheetName}"\n`);

    // Convertir en array
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: null
    }) as unknown[][];

    console.log(`📏 Total rows: ${data.length}\n`);

    // Afficher les 30 premières lignes
    console.log(`📋 First 30 rows:\n`);
    data.slice(0, 30).forEach((row, index) => {
      const rowData = row as (string | number | null)[];
      const displayRow = rowData.slice(0, 10); // Première 10 colonnes
      console.log(`Row ${index}: [${displayRow.map(c =>
        c === null ? 'NULL' :
        typeof c === 'string' && c.length > 30 ? c.substring(0, 30) + '...' :
        c
      ).join(' | ')}]`);
    });

    // Exporter les premières lignes en JSON
    const output = {
      sheetNames: workbook.SheetNames,
      totalRows: data.length,
      first30Rows: data.slice(0, 30)
    };

    writeFileSync('excel-inspection.json', JSON.stringify(output, null, 2));
    console.log(`\n💾 Full inspection saved to: excel-inspection.json`);

  } catch (error) {
    console.error('❌ Inspection failed:', error);
    process.exit(1);
  }
}

inspectExcel();
