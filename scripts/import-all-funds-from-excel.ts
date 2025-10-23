/**
 * Script pour importer TOUS les fonds depuis le fichier Excel ASFIM dans Supabase
 *
 * Usage: npx tsx scripts/import-all-funds-from-excel.ts
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

async function importAllFunds() {
  try {
    console.log('🚀 Starting fund import from Excel...\n');

    // Vérifier les variables d'environnement
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    // Créer le client Supabase avec service_role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('✅ Connected to Supabase\n');

    // Lire le fichier Excel local
    const filePath = 'C:/Users/kamilalami/messidor-patrimoine/public/documents/Tableau des performances quotidiennes au 22-10-2025.xlsx';
    const fileName = 'Tableau des performances quotidiennes au 22-10-2025.xlsx';

    console.log(`📂 Reading file: ${filePath}`);
    const buffer = readFileSync(filePath);

    console.log(`📊 Parsing Excel file...`);
    const result = await parseOPCVMExcel(buffer, fileName);

    console.log(`✅ Parsed ${result.funds.length} funds from Excel\n`);

    // Statistiques
    const stats = {
      total: result.funds.length,
      inserted: 0,
      updated: 0,
      errors: [] as string[],
      skipped: 0
    };

    console.log('💾 Importing funds to database...\n');

    for (const [index, excelFund] of result.funds.entries()) {
      try {
        // Déterminer le niveau de risque basé sur la sensibilité (1-7)
        let riskLevel: number | null = null;
        if (excelFund.sensitivity) {
          const match = excelFund.sensitivity.match(/[\d.]+/);
          if (match) {
            const value = parseFloat(match[0]);
            // Normaliser entre 1 et 7
            if (value >= 0 && value < 1) {
              riskLevel = 1;
            } else if (value >= 1 && value <= 7) {
              riskLevel = Math.min(Math.ceil(value), 7);
            } else {
              riskLevel = 7; // Max
            }
          }
        }

        // Si pas de sensibilité, deviner selon la classification
        if (!riskLevel && excelFund.classification) {
          const classif = excelFund.classification.toLowerCase();
          if (classif.includes('monétaire') || classif.includes('monetaire')) {
            riskLevel = 1;
          } else if (classif.includes('court terme') || classif.includes('oct')) {
            riskLevel = 2;
          } else if (classif.includes('oblig') || classif.includes('omlt')) {
            riskLevel = 3;
          } else if (classif.includes('diversifié') || classif.includes('diversifie')) {
            riskLevel = 5;
          } else if (classif.includes('actions')) {
            riskLevel = 7;
          } else {
            riskLevel = 4; // Défaut
          }
        }

        // Préparer les données pour insertion
        const fundData = {
          // Identifiants
          isin_code: excelFund.isinCode,
          morocco_code: excelFund.code,
          code: excelFund.code, // Utiliser le code Maroclear comme code principal
          name: excelFund.name,

          // Type et catégorie
          type: 'OPCVM' as const,
          category: excelFund.classification,
          classification: excelFund.classification,

          // Informations générales
          management_company: excelFund.managementCompany,
          legal_nature: excelFund.legalNature,
          benchmark_index: excelFund.benchmarkIndex,

          // Frais
          subscription_fee: excelFund.subscriptionFee,
          redemption_fee: excelFund.redemptionFee,
          management_fees: excelFund.managementFees,

          // Infrastructure
          depositary: excelFund.depositary,
          distributor: excelFund.distributor,

          // Valeurs
          asset_value: excelFund.assetValue,
          nav: excelFund.nav,

          // Performances
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

          // Autres
          risk_level: riskLevel,
          is_active: true,
          updated_at: new Date().toISOString()
        };

        // Vérifier si le fonds existe déjà (par ISIN ou Morocco code)
        const { data: existing } = await supabase
          .from('funds')
          .select('id')
          .or(`isin_code.eq.${excelFund.isinCode},morocco_code.eq.${excelFund.code}`)
          .single();

        let error;
        if (existing) {
          // Update
          const { error: updateError } = await supabase
            .from('funds')
            .update(fundData)
            .eq('id', existing.id);
          error = updateError;
          stats.updated++;
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('funds')
            .insert(fundData);
          error = insertError;
        }

        if (error) {
          stats.errors.push(`${excelFund.name}: ${error.message}`);
          console.error(`❌ Error with ${excelFund.name}:`, error.message);
        } else {
          stats.inserted++;
          if ((index + 1) % 50 === 0) {
            console.log(`   Processed ${index + 1}/${result.funds.length} funds...`);
          }
        }

      } catch (error) {
        stats.errors.push(`${excelFund.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error(`❌ Error processing ${excelFund.name}:`, error);
      }
    }

    console.log('\n✅ Import completed!\n');
    console.log('📊 Statistics:');
    console.log(`   Total funds in Excel: ${stats.total}`);
    console.log(`   Successfully imported: ${stats.inserted}`);
    console.log(`   Errors: ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      stats.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
      if (stats.errors.length > 10) {
        console.log(`   ... and ${stats.errors.length - 10} more errors`);
      }
    }

    // Vérifier le nombre total de fonds dans la DB
    const { count, error: countError } = await supabase
      .from('funds')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'OPCVM')
      .eq('is_active', true);

    if (!countError) {
      console.log(`\n✅ Total active OPCVM funds in database: ${count}`);
    }

    console.log('\n🎉 Import process finished!');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

importAllFunds();
