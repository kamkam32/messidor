// Test du endpoint index_history
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

async function testIndexHistory() {
  console.log('🔍 Exploration de l\'API index_history\n');

  // Test 1: Sans paramètres
  try {
    console.log('Test 1: Appel sans paramètres...');
    const response = await axios.get(
      'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_history',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, httpsAgent, timeout: 10000 }
    );
    console.log('✅ Réponse reçue');
    console.log(`   Nombre de résultats: ${response.data.data?.length || 0}`);
    if (response.data.data?.length > 0) {
      console.log('   Premier élément:', JSON.stringify(response.data.data[0], null, 2));
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  // Test 2: Avec filtres MASI
  try {
    console.log('\nTest 2: Filtre sur MASI...');
    const params = new URLSearchParams({
      'filter[index][condition][path]': 'indexCode.field_code',
      'filter[index][condition][operator]': '=',
      'filter[index][condition][value]': 'MASI',
      'page[limit]': '100',
      'sort': '-transactDate',
    });

    const response = await axios.get(
      `https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_history?${params}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, httpsAgent, timeout: 10000 }
    );
    console.log('✅ Réponse reçue');
    console.log(`   Nombre de résultats: ${response.data.data?.length || 0}`);

    if (response.data.data?.length > 0) {
      const first = response.data.data[0];
      console.log('   Premier élément:');
      console.log('   - ID:', first.id);
      console.log('   - Attributes:', JSON.stringify(first.attributes, null, 2));

      // Afficher les 5 dernières dates disponibles
      console.log('\n   📅 Dernières dates disponibles:');
      response.data.data.slice(0, 5).forEach(item => {
        console.log(`      - ${item.attributes.transactDate}: ${item.attributes.indexValue}`);
      });
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }

  // Test 3: Avec plage de dates
  try {
    console.log('\nTest 3: Plage de dates (dernier mois)...');
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const params = new URLSearchParams({
      'fields[index_history]': 'transactDate,indexValue,indexVariation',
      'filter[index][condition][path]': 'indexCode.field_code',
      'filter[index][condition][operator]': '=',
      'filter[index][condition][value]': 'MASI',
      'filter[date_start][condition][path]': 'transactDate',
      'filter[date_start][condition][operator]': '>=',
      'filter[date_start][condition][value]': lastMonth.toISOString().split('T')[0],
      'filter[date_end][condition][path]': 'transactDate',
      'filter[date_end][condition][operator]': '<=',
      'filter[date_end][condition][value]': today.toISOString().split('T')[0],
      'page[limit]': '100',
      'sort': '-transactDate',
    });

    const response = await axios.get(
      `https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_history?${params}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, httpsAgent, timeout: 10000 }
    );
    console.log('✅ Réponse reçue');
    console.log(`   Nombre de résultats: ${response.data.data?.length || 0}`);

    if (response.data.data?.length > 0) {
      console.log(`\n   📊 Historique du dernier mois (${response.data.data.length} jours):`);
      response.data.data.slice(0, 10).forEach(item => {
        const variation = item.attributes.indexVariation || 0;
        const sign = variation >= 0 ? '+' : '';
        console.log(`      ${item.attributes.transactDate}: ${item.attributes.indexValue} (${sign}${variation}%)`);
      });
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

testIndexHistory().catch(console.error);
