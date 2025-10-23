/**
 * Script de test pour télécharger un fichier Excel depuis ASFIM
 */

import { downloadOPCVMFile } from '../lib/services/opcvm-excel-parser';

async function testDownload() {
  try {
    console.log('🧪 Testing OPCVM File Download from ASFIM...\n');

    // Tester avec le 22-10-2025 (on sait que ce fichier existe)
    const testDate = new Date('2025-10-22');

    console.log(`📥 Attempting to download file for ${testDate.toISOString().split('T')[0]}...`);

    const result = await downloadOPCVMFile(testDate, 'quotidien');

    if (result) {
      console.log(`\n✅ Download successful!`);
      console.log(`   File name: ${result.fileName}`);
      console.log(`   Date: ${result.date}`);
      console.log(`   Buffer size: ${result.buffer.length} bytes (${(result.buffer.length / 1024).toFixed(2)} KB)`);

      // Sauvegarder le fichier localement pour vérification
      const { writeFileSync } = await import('fs');
      const savePath = `downloaded-${result.fileName}`;
      writeFileSync(savePath, result.buffer);
      console.log(`\n💾 File saved to: ${savePath}`);

      console.log(`\n✅ Test completed successfully!`);
    } else {
      console.log(`\n❌ Download failed - file not found`);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testDownload();
