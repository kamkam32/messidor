import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function checkSlug() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const slug = 'ac-secur-rendement-3863'

  console.log(`\n🔍 Checking for slug: ${slug}\n`)

  const { data, error } = await supabase
    .from('funds')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('❌ Error:', error.message)

    // Try to find similar slugs
    const { data: similarSlugs } = await supabase
      .from('funds')
      .select('id, name, slug')
      .ilike('slug', `%ac-secur%`)
      .limit(5)

    if (similarSlugs && similarSlugs.length > 0) {
      console.log('\n📋 Similar slugs found:')
      similarSlugs.forEach(f => {
        console.log(`   - ${f.slug} (${f.name})`)
      })
    }
  } else {
    console.log('✅ Fund found!')
    console.log(`   ID: ${data.id}`)
    console.log(`   Name: ${data.name}`)
    console.log(`   Slug: ${data.slug}`)
  }
}

checkSlug()
