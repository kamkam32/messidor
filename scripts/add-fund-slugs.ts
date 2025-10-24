import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { generateFundSlug } from '../lib/utils/slug'

dotenv.config({ path: '.env.local' })

async function addFundSlugs() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  console.log('🔄 Génération des slugs pour tous les fonds...\n')

  // Récupérer tous les fonds
  const { data: funds, error: fetchError } = await supabase
    .from('funds')
    .select('id, name, code')

  if (fetchError) {
    console.error('❌ Erreur de récupération:', fetchError)
    return
  }

  if (!funds || funds.length === 0) {
    console.log('❌ Aucun fonds trouvé')
    return
  }

  console.log(`📊 ${funds.length} fonds trouvés\n`)

  // Vérifier les doublons potentiels
  const slugs = new Map<string, string[]>()

  funds.forEach(fund => {
    const slug = generateFundSlug(fund.name, fund.code)
    if (!slugs.has(slug)) {
      slugs.set(slug, [])
    }
    slugs.get(slug)!.push(fund.name)
  })

  // Afficher les doublons
  const duplicates = Array.from(slugs.entries()).filter(([_, names]) => names.length > 1)
  if (duplicates.length > 0) {
    console.log('⚠️  Slugs en double détectés:\n')
    duplicates.forEach(([slug, names]) => {
      console.log(`   ${slug}:`)
      names.forEach(name => console.log(`      - ${name}`))
    })
    console.log('')
  }

  // Mettre à jour chaque fonds avec son slug
  let updated = 0
  let errors = 0

  for (const fund of funds) {
    const slug = generateFundSlug(fund.name, fund.code)

    const { error } = await supabase
      .from('funds')
      .update({ slug })
      .eq('id', fund.id)

    if (error) {
      console.error(`❌ Erreur pour ${fund.name}:`, error.message)
      errors++
    } else {
      updated++
      if (updated % 50 === 0) {
        console.log(`   ✓ ${updated}/${funds.length} fonds mis à jour...`)
      }
    }
  }

  console.log('\n✅ TERMINÉ!')
  console.log(`   - Fonds mis à jour: ${updated}`)
  console.log(`   - Erreurs: ${errors}`)

  // Afficher quelques exemples
  console.log('\n📝 Exemples de slugs générés:')
  funds.slice(0, 10).forEach(fund => {
    const slug = generateFundSlug(fund.name, fund.code)
    console.log(`   ${fund.name}`)
    console.log(`   → ${slug}\n`)
  })
}

addFundSlugs()
