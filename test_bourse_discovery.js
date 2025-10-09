// Script de découverte des APIs de la Bourse de Casablanca
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Liste des indices connus de la Bourse de Casablanca
const indices = [
  'MASI',      // Moroccan All Shares Index
  'MADEX',     // Moroccan Most Active Shares Index
  'MASI.20',   // MASI 20
  'MSI20',     // MSI 20
  'FTSE',      // FTSE CSE Morocco 15
];

async function testIndiceQuote(indexCode) {
  try {
    console.log(`\n🔍 Test de l'indice: ${indexCode}`);

    const response = await axios.get(
      `https://www.casablanca-bourse.com/api/proxy/fr/api/bourse/dashboard/index_cotation/${indexCode}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, httpsAgent, timeout: 5000 }
    );

    console.log(`✅ ${indexCode} - Trouvé !`);
    console.log(`   Valeur: ${response.data.data?.field_index_value}`);
    return true;
  } catch (error) {
    console.log(`❌ ${indexCode} - Non disponible`);
    return false;
  }
}

async function testIndiceIntraday(indexCode) {
  try {
    const params = new URLSearchParams({
      'fields[index_watch]': 'drupal_internal__id,transactTime,indexValue',
      'filter[index][condition][path]': 'indexCode.field_code',
      'filter[index][condition][operator]': '=',
      'filter[index][condition][value]': indexCode,
      'page[limit]': '10',
    });

    const response = await axios.get(
      `https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_watch?${params}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, httpsAgent, timeout: 5000 }
    );

    const count = response.data.data?.length || 0;
    if (count > 0) {
      console.log(`✅ ${indexCode} - Données intraday disponibles (${count} points)`);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function testHistoricalData(indexCode, daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  const dateStr = date.toISOString().split('T')[0];

  try {
    const params = new URLSearchParams({
      'fields[index_watch]': 'drupal_internal__id,transactTime,indexValue',
      'filter[seance][condition][path]': 'transactTime',
      'filter[seance][condition][operator]': 'STARTS_WITH',
      'filter[seance][condition][value]': dateStr,
      'filter[index][condition][path]': 'indexCode.field_code',
      'filter[index][condition][operator]': '=',
      'filter[index][condition][value]': indexCode,
      'page[limit]': '10',
    });

    const response = await axios.get(
      `https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_watch?${params}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' }, httpsAgent, timeout: 5000 }
    );

    const count = response.data.data?.length || 0;
    return { date: dateStr, available: count > 0, count };
  } catch (error) {
    return { date: dateStr, available: false, count: 0 };
  }
}

async function discoverIndices() {
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 DÉCOUVERTE DES INDICES DISPONIBLES');
  console.log('═══════════════════════════════════════════════════\n');

  // Test des codes d'indices connus
  for (const index of indices) {
    await testIndiceIntraday(index);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📅 TEST DE DONNÉES HISTORIQUES (MASI)');
  console.log('═══════════════════════════════════════════════════\n');

  // Test des données historiques
  const periods = [0, 1, 7, 30, 90, 365];

  for (const days of periods) {
    const result = await testHistoricalData('MASI', days);
    const label = days === 0 ? 'Aujourd\'hui' :
                  days === 1 ? 'Hier' :
                  `Il y a ${days} jours`;

    if (result.available) {
      console.log(`✅ ${label} (${result.date}) - ${result.count} points disponibles`);
    } else {
      console.log(`❌ ${label} (${result.date}) - Pas de données`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('🔍 RECHERCHE D\'AUTRES ENDPOINTS');
  console.log('═══════════════════════════════════════════════════\n');

  // Test d'autres endpoints potentiels
  const endpoints = [
    '/api/proxy/fr/api/bourse/dashboard/indices',
    '/api/proxy/fr/api/bourse_data/index_daily',
    '/api/proxy/fr/api/bourse_data/index_history',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(
        `https://www.casablanca-bourse.com${endpoint}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, httpsAgent, timeout: 5000 }
      );
      console.log(`✅ ${endpoint} - Disponible !`);
    } catch (error) {
      console.log(`❌ ${endpoint} - Non disponible`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✨ DÉCOUVERTE TERMINÉE');
  console.log('═══════════════════════════════════════════════════');
}

discoverIndices().catch(console.error);
