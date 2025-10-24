import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function getManagementCompanies() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data } = await supabase
    .from('funds')
    .select('management_company')
    .eq('type', 'OPCVM')
    .eq('is_active', true)

  const companies = [...new Set(data?.map(f => f.management_company).filter(Boolean))].sort()

  console.log('\n🏢 Sociétés de gestion disponibles:\n')
  companies.forEach(c => console.log(`   - ${c}`))
  console.log(`\n   Total: ${companies.length} sociétés\n`)
}

getManagementCompanies()
