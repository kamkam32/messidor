import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkGoldFunds() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  console.log('🔍 Recherche des fonds investissant dans l\'or...\n')

  // Chercher "gold" ou "or" dans le nom
  const { data: goldFunds, error } = await supabase
    .from('funds')
    .select('name, isin_code, classification, management_company, ytd_performance, asset_value')
    .or('name.ilike.%gold%,name.ilike.%or %,name.ilike.% or%')
    .eq('type', 'OPCVM')
    .eq('is_active', true)
    .order('ytd_performance', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('❌ Erreur:', error)
    return
  }

  console.log(`✅ ${goldFunds.length} fonds trouvés avec "gold" ou "or" dans le nom\n`)

  goldFunds.forEach((fund, index) => {
    console.log(`${index + 1}. ${fund.name}`)
    console.log(`   Classification: ${fund.classification || 'N/A'}`)
    console.log(`   Société: ${fund.management_company || 'N/A'}`)
    console.log(`   Performance YTD: ${fund.ytd_performance ? fund.ytd_performance.toFixed(2) + '%' : 'N/A'}`)
    console.log(`   Actif: ${fund.asset_value ? (fund.asset_value / 1000000).toFixed(2) + ' M MAD' : 'N/A'}`)
    console.log('')
  })
}

checkGoldFunds()
