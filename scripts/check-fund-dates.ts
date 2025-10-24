import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkFundDates() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Trouver tous les fonds ATTIJARI
  const { data: funds } = await supabase
    .from('funds')
    .select('id, name')
    .ilike('name', '%ATTIJARI%CORP%')

  if (!funds || funds.length === 0) {
    console.log('Aucun fonds ATTIJARI CORP trouvé')
    return
  }

  console.log(`${funds.length} fonds trouvés:\n`)
  funds.forEach((f, i) => console.log(`${i + 1}. ${f.name}`))

  const fund = funds[0]
  console.log(`\n\n=== Analyse du fonds: ${fund.name} (${fund.id}) ===\n`)

  // Récupérer les 20 dernières dates
  const { data: history } = await supabase
    .from('fund_performance_history')
    .select('date, nav')
    .eq('fund_id', fund.id)
    .order('date', { ascending: false })
    .limit(20)

  console.log('Les 20 dernières dates disponibles:\n')
  history?.forEach((h, i) => {
    console.log(`${i + 1}. ${h.date} - VL: ${h.nav}`)
  })
}

checkFundDates()
