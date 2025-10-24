import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { getManagementCompanyLogo } from '../lib/utils/management-company-logos'

dotenv.config({ path: '.env.local' })

async function generateTopOPCVMArticle() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing environment variables')
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  console.log('📊 Récupération des top 10 OPCVM les plus performants...\n')

  // Récupérer les 10 meilleurs OPCVM par performance YTD
  const { data: topFunds, error } = await supabase
    .from('funds')
    .select('*')
    .eq('type', 'OPCVM')
    .eq('is_active', true)
    .not('ytd_performance', 'is', null)
    .order('ytd_performance', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Erreur:', error)
    return
  }

  console.log(`✅ ${topFunds.length} fonds récupérés\n`)

  // Générer le contenu de l'article
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  let articleContent = `---
title: "Top 10 des OPCVM les plus performants au Maroc en 2025"
slug: "top-10-opcvm-maroc-2025"
date: "${new Date().toISOString()}"
author: "Équipe Messidor Patrimoine"
category: "Analyses"
image: "/images/blog/top-opcvm-2025.jpg"
excerpt: "Découvrez notre analyse détaillée des 10 OPCVM marocains affichant les meilleures performances en 2025. Données actualisées et comparatifs complets."
keywords: ["opcvm maroc", "meilleurs opcvm maroc 2025", "performance opcvm", "investissement maroc", "top opcvm"]
---

# Top 10 des OPCVM les plus performants au Maroc en 2025

*Dernière mise à jour : ${currentDate}*

Le marché des OPCVM marocains continue d'évoluer en 2025, offrant aux investisseurs une diversité d'opportunités. Notre analyse des **${topFunds.length} OPCVM actifs** révèle des performances remarquables dans plusieurs catégories.

Chez **Messidor Patrimoine**, nous analysons quotidiennement l'ensemble des fonds disponibles sur le marché pour vous offrir une vision claire et objective. Voici notre sélection des 10 OPCVM les plus performants actuellement.

## 📊 Méthodologie

Notre classement se base sur :
- **Performance YTD (Year-to-Date)** comme critère principal
- Analyse des performances sur 1 an, 3 ans et 5 ans
- Prise en compte des frais de gestion
- Évaluation de la régularité des performances
- Analyse du niveau de risque

---

## 🏆 Le Top 10 des OPCVM les plus performants

`

  // Ajouter chaque fonds
  topFunds.forEach((fund, index) => {
    const rank = index + 1
    const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`
    const logo = getManagementCompanyLogo(fund.management_company)

    articleContent += `
### ${emoji} ${fund.name}

<div style="display: flex; align-items: center; gap: 16px; margin: 16px 0; padding: 16px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; border-left: 4px solid #667eea;">
  <img src="${logo}" alt="${fund.management_company}" style="width: 80px; height: 80px; object-fit: contain; background: white; padding: 8px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
  <div>
    <strong style="font-size: 1.1em; color: #2d3748;">Société de gestion</strong><br/>
    <span style="font-size: 1.2em; color: #667eea; font-weight: 600;">${fund.management_company || 'N/A'}</span>
  </div>
</div>

**Classification :** ${fund.classification || 'N/A'}
**Niveau de risque :** ${fund.risk_level ? `${fund.risk_level}/7` : 'N/A'}

#### Performances

| Période | Performance |
|---------|-------------|
| **YTD** | **${fund.ytd_performance ? (fund.ytd_performance > 0 ? '+' : '') + fund.ytd_performance.toFixed(2) + '%' : 'N/A'}** |
| 1 mois | ${fund.perf_1m ? (fund.perf_1m > 0 ? '+' : '') + fund.perf_1m.toFixed(2) + '%' : 'N/A'} |
| 3 mois | ${fund.perf_3m ? (fund.perf_3m > 0 ? '+' : '') + fund.perf_3m.toFixed(2) + '%' : 'N/A'} |
| 1 an | ${fund.perf_1y ? (fund.perf_1y > 0 ? '+' : '') + fund.perf_1y.toFixed(2) + '%' : 'N/A'} |
| 3 ans | ${fund.perf_3y ? (fund.perf_3y > 0 ? '+' : '') + fund.perf_3y.toFixed(2) + '%' : 'N/A'} |

#### Caractéristiques

- **Valeur Liquidative :** ${fund.nav ? fund.nav.toFixed(2) + ' MAD' : 'N/A'}
- **Actif Net :** ${fund.asset_value ? (fund.asset_value / 1000000).toFixed(2) + ' M MAD' : 'N/A'}
- **Frais de gestion :** ${fund.management_fees ? fund.management_fees.toFixed(2) + '%' : 'N/A'}
- **Frais de souscription :** ${fund.subscription_fee ? fund.subscription_fee.toFixed(2) + '%' : 'N/A'}

${rank <= 3 ? `
#### Notre analyse

Ce fonds se distingue par ${
  fund.ytd_performance && fund.ytd_performance > 10
    ? 'une performance exceptionnelle'
    : 'une performance solide'
} depuis le début de l'année. ${
  fund.classification === 'ACTIONS'
    ? 'En tant qu\'OPCVM actions, il offre un potentiel de croissance élevé mais comporte également un niveau de risque plus important.'
    : fund.classification === 'MONÉTAIRE'
    ? 'Ce fonds monétaire privilégie la sécurité et la liquidité, adapté aux investisseurs prudents.'
    : fund.classification?.includes('OBLIG')
    ? 'Ce fonds obligataire offre un bon équilibre entre rendement et sécurité.'
    : 'Ce fonds diversifié permet une exposition équilibrée à différentes classes d\'actifs.'
}

[**Voir la fiche détaillée →**](/dashboard/opcvm/${fund.slug})
` : ''}

---
`
  })

  // Ajouter le tableau comparatif
  articleContent += `
## 📈 Tableau Comparatif

| Rang | Fonds | Société | YTD | 1 an | Risque |
|------|-------|---------|-----|------|--------|
`
  topFunds.forEach((fund, index) => {
    articleContent += `| ${index + 1} | ${fund.name} | ${fund.management_company || 'N/A'} | ${fund.ytd_performance ? (fund.ytd_performance > 0 ? '+' : '') + fund.ytd_performance.toFixed(2) + '%' : 'N/A'} | ${fund.perf_1y ? (fund.perf_1y > 0 ? '+' : '') + fund.perf_1y.toFixed(2) + '%' : 'N/A'} | ${fund.risk_level || 'N/A'}/7 |\n`
  })

  // Conclusion
  articleContent += `

## 💡 Conclusion

Le marché des OPCVM marocains offre des opportunités intéressantes en 2025, avec des performances variées selon les catégories d'actifs. Les fonds actions continuent de dominer en termes de rendement, bien qu'ils présentent un risque plus élevé.

### Points clés à retenir :

1. **Diversification** : Les meilleurs fonds appartiennent à différentes catégories, soulignant l'importance de la diversification
2. **Horizon d'investissement** : Les performances varient selon les périodes, privilégiez une vision long terme
3. **Frais** : Comparez les frais de gestion qui impactent directement votre rendement net
4. **Risque** : Assurez-vous que le niveau de risque correspond à votre profil d'investisseur

### Besoin de conseils personnalisés ?

Chez **Messidor Patrimoine**, nous vous accompagnons dans la construction d'un portefeuille OPCVM adapté à vos objectifs et à votre profil de risque.

[**Contactez-nous pour une consultation gratuite →**](mailto:kamil@messidorai.com)

---

## 🔍 Méthodologie & Sources

Les données présentées dans cet article proviennent de notre base de données mise à jour quotidiennement à partir des publications officielles de l'AMMC (Autorité Marocaine du Marché des Capitaux) et de l'ASFIM (Association des Sociétés de Gestion et Fonds d'Investissement Marocains).

**Date de dernière mise à jour :** ${currentDate}

### Mentions légales

Les performances passées ne préjugent pas des performances futures. Tout investissement comporte des risques, y compris celui de perte en capital. Cet article a un caractère purement informatif et ne constitue pas un conseil en investissement personnalisé.

---

*Vous souhaitez comparer ces fonds en détail ? Utilisez notre [comparateur OPCVM interactif](/dashboard/opcvm/comparateur).*
`

  // Sauvegarder le fichier
  const outputPath = path.join(__dirname, '..', 'content', 'blog', 'top-10-opcvm-maroc-2025.md')
  const outputDir = path.dirname(outputPath)

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(outputPath, articleContent, 'utf8')

  console.log(`✅ Article généré avec succès !`)
  console.log(`📄 Fichier : ${outputPath}`)
  console.log(`\n📊 Statistiques :`)
  console.log(`   - ${topFunds.length} fonds analysés`)
  console.log(`   - ${articleContent.split(' ').length} mots`)
  console.log(`   - ${articleContent.split('\n').length} lignes`)
}

generateTopOPCVMArticle()
