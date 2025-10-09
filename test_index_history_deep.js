// Exploration approfondie de l'endpoint index_history
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const headers = { 'User-Agent': 'Mozilla/5.0' };

async function testHistoryEndpoint(description, params) {
  try {
    const url = `https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_history${params ? '?' + params : ''}`;
    console.log(`\n🔍 ${description}`);
    console.log(`   URL: ${url.substring(0, 120)}...`);

    const response = await axios.get(url, { headers, httpsAgent, timeout: 15000 });

    const count = response.data.data?.length || 0;
    console.log(`   ✅ Succès - ${count} résultats`);

    if (count > 0) {
      const first = response.data.data[0];
      console.log(`   📊 Premier résultat:`);
      console.log(`      ID: ${first.id}`);
      console.log(`      Type: ${first.type}`);
      console.log(`      Attributs:`, JSON.stringify(first.attributes, null, 2));

      // Si plusieurs résultats, montrer la plage
      if (count > 1) {
        const last = response.data.data[count - 1];
        console.log(`\n   📅 Plage de dates:`);
        console.log(`      Début: ${first.attributes.transactDate || 'N/A'}`);
        console.log(`      Fin: ${last.attributes.transactDate || 'N/A'}`);
      }

      // Montrer tous les champs disponibles
      const allKeys = new Set();
      response.data.data.slice(0, 5).forEach(item => {
        Object.keys(item.attributes || {}).forEach(key => allKeys.add(key));
      });
      console.log(`\n   🔑 Champs disponibles: ${Array.from(allKeys).join(', ')}`);
    }

    return { success: true, data: response.data, count };
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log(`   Détails:`, JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message };
  }
}

async function deepDive() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║     🔬 EXPLORATION PROFONDE - INDEX_HISTORY      ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  // Test 1: Sans paramètres (voir structure de base)
  await testHistoryEndpoint('Test 1: Sans paramètres', '');

  // Test 2: Avec page limit seulement
  await testHistoryEndpoint('Test 2: Limite de 50', 'page[limit]=50');

  // Test 3: Avec tri
  await testHistoryEndpoint('Test 3: Tri par date DESC', 'sort=-transactDate&page[limit]=20');

  // Test 4: Filtrer par code index via relationships
  const params4 = new URLSearchParams({
    'filter[indexCode.field_code]': 'MASI',
    'page[limit]': '30',
    'sort': '-transactDate'
  });
  await testHistoryEndpoint('Test 4: Filtre via relationship', params4.toString());

  // Test 5: Filtrer avec include
  const params5 = new URLSearchParams({
    'include': 'indexCode',
    'page[limit]': '20',
    'sort': '-transactDate'
  });
  await testHistoryEndpoint('Test 5: Include indexCode', params5.toString());

  // Test 6: Champs spécifiques
  const params6 = new URLSearchParams({
    'fields[index_history]': 'transactDate,indexValue,indexVariation,openingValue,closingValue',
    'page[limit]': '20',
    'sort': '-transactDate'
  });
  await testHistoryEndpoint('Test 6: Champs spécifiques', params6.toString());

  // Test 7: Plage de dates récentes
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const params7 = new URLSearchParams({
    'filter[date_gte][condition][path]': 'transactDate',
    'filter[date_gte][condition][operator]': '>=',
    'filter[date_gte][condition][value]': lastWeek.toISOString().split('T')[0],
    'page[limit]': '50',
    'sort': '-transactDate'
  });
  await testHistoryEndpoint('Test 7: Dernière semaine', params7.toString());

  // Test 8: Tester différents formats de dates
  const dates = [
    '2025-10-08',
    '2025-10-01',
    '2025-09-01',
    '2025-01-01',
    '2024-01-01',
  ];

  for (const date of dates) {
    const params = new URLSearchParams({
      'filter[date][condition][path]': 'transactDate',
      'filter[date][condition][operator]': '=',
      'filter[date][condition][value]': date,
      'page[limit]': '10'
    });
    await testHistoryEndpoint(`Test Date: ${date}`, params.toString());
  }

  // Test 9: Tester avec ID d'index
  const indexIds = ['512335', '512343']; // MASI, MSI20
  for (const id of indexIds) {
    const params = new URLSearchParams({
      'filter[index_id][condition][path]': 'indexCode.id',
      'filter[index_id][condition][operator]': '=',
      'filter[index_id][condition][value]': id,
      'page[limit]': '20',
      'sort': '-transactDate'
    });
    await testHistoryEndpoint(`Test Index ID: ${id}`, params.toString());
  }

  // Test 10: Essayer avec drupal_internal__target_id
  const params10 = new URLSearchParams({
    'filter[index][condition][path]': 'indexCode.meta.drupal_internal__target_id',
    'filter[index][condition][operator]': '=',
    'filter[index][condition][value]': '512335',
    'page[limit]': '50',
    'sort': '-transactDate'
  });
  await testHistoryEndpoint('Test 10: Via drupal_internal__target_id', params10.toString());

  // Test 11: Pagination pour voir combien de données au total
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 TEST DE PAGINATION (comptage total)');
  console.log('═══════════════════════════════════════════════════');

  let offset = 0;
  let totalCount = 0;
  const limit = 100;

  for (let i = 0; i < 5; i++) { // Max 5 pages pour le test
    const params = new URLSearchParams({
      'page[offset]': offset.toString(),
      'page[limit]': limit.toString(),
      'sort': '-transactDate'
    });

    const result = await testHistoryEndpoint(`Page ${i + 1} (offset ${offset})`, params.toString());

    if (!result.success || result.count === 0) {
      console.log(`\n   ⚠️ Fin de pagination à la page ${i + 1}`);
      break;
    }

    totalCount += result.count;

    if (result.count < limit) {
      console.log(`\n   ✅ Dernière page atteinte`);
      break;
    }

    offset += limit;
  }

  console.log(`\n   📈 Total de données disponibles: ~${totalCount}+ entrées`);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ EXPLORATION TERMINÉE');
  console.log('═══════════════════════════════════════════════════');
}

deepDive().catch(console.error);
