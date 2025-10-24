import { createClient } from '@supabase/supabase-js'
import { parseOPCVMExcel } from '../lib/services/opcvm-excel-parser'
import * as dotenv from 'dotenv'
import axios from 'axios'

dotenv.config({ path: '.env.local' })

async function checkAndImport22Oct() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  console.log('🔍 Vérification des données du 22/10/2025...\n')

  // 1. Vérifier combien de fonds ont des données au 22/10
  const { data: existing, count: existingCount } = await supabase
    .from('fund_performance_history')
    .select('*', { count: 'exact', head: true })
    .eq('date', '2025-10-22')

  console.log(`📊 Actuellement: ${existingCount} fonds ont des données au 22/10/2025\n`)

  // 2. Télécharger le fichier du 22/10
  console.log('📥 Téléchargement du fichier du 22/10/2025...')
  const url = 'https://asfim.ma/static/tableau-des-performances/Tableau%20des%20performances%20quotidiennes%20au%2022-10-2025.xlsx'

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    })

    const buffer = Buffer.from(response.data)
    console.log(`✅ Fichier téléchargé (${(buffer.length / 1024).toFixed(0)} KB)\n`)

    // 3. Parser le fichier
    console.log('📊 Parsing du fichier Excel...')
    const fileName = 'Tableau des performances quotidiennes au 22-10-2025.xlsx'
    const parsed = await parseOPCVMExcel(buffer, fileName)

    console.log(`✅ ${parsed.funds.length} fonds trouvés dans le fichier`)
    console.log(`📅 Date: ${parsed.date}\n`)

    // 4. Récupérer tous les fonds de la base
    const { data: dbFunds } = await supabase
      .from('funds')
      .select('id, code, name, isin_code')

    console.log(`💾 ${dbFunds?.length} fonds dans la base de données\n`)

    // 5. Insérer les données
    console.log('💾 Insertion des données...\n')
    let inserted = 0
    let updated = 0
    let notFound = 0

    for (const excelFund of parsed.funds) {
      // Trouver le fonds dans la DB
      let dbFund = dbFunds?.find(f => excelFund.isinCode && f.isin_code === excelFund.isinCode)
      if (!dbFund && excelFund.code) {
        dbFund = dbFunds?.find(f => f.code === excelFund.code)
      }
      if (!dbFund) {
        const normalizedExcelName = excelFund.name.toLowerCase().replace(/\s+/g, ' ').trim()
        dbFund = dbFunds?.find(f => f.name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedExcelName)
      }

      if (!dbFund) {
        notFound++
        continue
      }

      const { error } = await supabase
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
          onConflict: 'fund_id,date',
          ignoreDuplicates: false
        })

      if (!error) {
        if (existingCount && existingCount > 0) {
          updated++
        } else {
          inserted++
        }
      }
    }

    console.log('\n✅ TERMINÉ!\n')
    console.log('📊 Résumé:')
    console.log(`   - Nouveaux enregistrements: ${inserted}`)
    console.log(`   - Enregistrements mis à jour: ${updated}`)
    console.log(`   - Fonds non trouvés: ${notFound}`)
    console.log(`   - Total traité: ${inserted + updated}/${parsed.funds.length}`)

    // 6. Vérifier à nouveau combien on a maintenant
    const { count: finalCount } = await supabase
      .from('fund_performance_history')
      .select('*', { count: 'exact', head: true })
      .eq('date', '2025-10-22')

    console.log(`\n💾 Total dans la base au 22/10/2025: ${finalCount} fonds\n`)

  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

checkAndImport22Oct()
