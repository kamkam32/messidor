import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

async function runMigration() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  console.log('🔄 Exécution de la migration: add_fund_slug.sql\n')

  // Lire le fichier SQL
  const sqlPath = path.join(__dirname, '..', 'supabase', 'migrations', 'add_fund_slug.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('📝 SQL à exécuter:')
  console.log(sql)
  console.log('\n⚙️  Exécution...\n')

  try {
    // Exécuter la migration via RPC
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Si exec_sql n'existe pas, on tente directement
      console.log('⚠️  exec_sql RPC non disponible, exécution manuelle requise\n')
      console.log('📋 Veuillez copier le SQL ci-dessus et l\'exécuter dans:')
      console.log('   Supabase Dashboard > SQL Editor')
      console.log('   https://supabase.com/dashboard/project/bjiwkxqjovdnheotagtr/sql\n')
      return
    }

    console.log('✅ Migration exécutée avec succès!')
  } catch (error) {
    console.error('❌ Erreur:', error)
    console.log('\n📋 Veuillez exécuter manuellement le SQL dans Supabase Dashboard')
  }
}

runMigration()
