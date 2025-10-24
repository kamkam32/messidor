import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function getClassifications() {
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
    .select('classification')
    .eq('type', 'OPCVM')
    .eq('is_active', true)

  const classifications = [...new Set(data?.map(f => f.classification).filter(Boolean))].sort()

  console.log('\n📊 Classifications disponibles:\n')
  classifications.forEach(c => console.log(`   - ${c}`))
  console.log(`\n   Total: ${classifications.length} classifications\n`)
}

getClassifications()
