import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function migrateAddSlugColumn() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  console.log('🔄 Ajout de la colonne slug à la table funds...\n')

  try {
    // Vérifier si la colonne existe déjà
    const { data: columns, error: checkError } = await supabase
      .from('funds')
      .select('slug')
      .limit(1)

    if (!checkError) {
      console.log('✅ La colonne slug existe déjà!')
      return
    }

    console.log('La colonne slug n\'existe pas encore.')
    console.log('\n📋 IMPORTANT: Veuillez exécuter ce SQL dans Supabase Dashboard > SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/bjiwkxqjovdnheotagtr/sql/new\n')
    console.log('---START SQL---')
    console.log(`
-- Ajouter une colonne slug pour les URLs SEO-friendly
ALTER TABLE funds
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Créer un index unique sur le slug pour des recherches rapides
CREATE UNIQUE INDEX IF NOT EXISTS funds_slug_idx ON funds(slug);

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN funds.slug IS 'URL-friendly slug généré depuis le nom et le code du fonds pour le SEO';
`)
    console.log('---END SQL---\n')
    console.log('Une fois exécuté, lancez: npx tsx scripts/add-fund-slugs.ts')

  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
  }
}

migrateAddSlugColumn()
