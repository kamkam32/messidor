// Exploration complète de l'API Bourse de Casablanca
const puppeteer = require('puppeteer');
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const headers = { 'User-Agent': 'Mozilla/5.0' };

// Fonction helper pour tester un endpoint
async function testEndpoint(name, url, params = null) {
  try {
    const fullUrl = params ? `${url}?${params}` : url;
    const response = await axios.get(fullUrl, { headers, httpsAgent, timeout: 10000 });
    const dataCount = response.data.data?.length || 0;
    console.log(`✅ ${name}`);
    if (dataCount > 0) {
      console.log(`   📊 ${dataCount} résultats`);
      return { success: true, data: response.data, count: dataCount };
    }
    return { success: true, data: response.data, count: 0 };
  } catch (error) {
    console.log(`❌ ${name} - ${error.response?.status || error.message}`);
    return { success: false, error: error.message };
  }
}

async function exploreWithPuppeteer() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🌐 EXPLORATION VIA PUPPETEER (structure du site)');
  console.log('═══════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox']
  });

  const page = await browser.newPage();

  // Intercepter les appels API
  const apiCalls = new Set();
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      apiCalls.add(url);
    }
  });

  // Explorer différentes pages
  const pagesToExplore = [
    { name: 'Indices', url: 'https://www.casablanca-bourse.com/fr/live-market/indices' },
    { name: 'Marché Actions', url: 'https://www.casablanca-bourse.com/fr/live-market/equity' },
    { name: 'MASI', url: 'https://www.casablanca-bourse.com/fr/live-market/indices/MASI' },
    { name: 'MSI20', url: 'https://www.casablanca-bourse.com/fr/live-market/indices/MSI20' },
  ];

  for (const pageInfo of pagesToExplore) {
    try {
      console.log(`\n🔍 Exploration: ${pageInfo.name}`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Extraire la structure
      const structure = await page.evaluate(() => {
        const data = {
          title: document.querySelector('h1, h2')?.textContent?.trim(),
          tables: document.querySelectorAll('table').length,
          links: []
        };

        // Chercher des liens vers d'autres indices/actions
        document.querySelectorAll('a[href*="indices"], a[href*="equity"]').forEach(link => {
          const href = link.href;
          const text = link.textContent.trim();
          if (text && href && !data.links.includes(href)) {
            data.links.push({ text, href });
          }
        });

        return data;
      });

      console.log(`   Titre: ${structure.title}`);
      console.log(`   Tableaux trouvés: ${structure.tables}`);
      if (structure.links.length > 0) {
        console.log(`   Liens découverts: ${structure.links.length}`);
        structure.links.slice(0, 5).forEach(link => {
          console.log(`      - ${link.text}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
  }

  await browser.close();

  console.log('\n📡 APIs appelées automatiquement par le site:');
  const uniqueApis = Array.from(apiCalls).filter(url =>
    url.includes('/api/proxy/') || url.includes('/api/bourse')
  );
  uniqueApis.forEach(url => {
    const shortUrl = url.replace('https://www.casablanca-bourse.com', '');
    console.log(`   - ${shortUrl.substring(0, 100)}...`);
  });
}

async function exploreAPIEndpoints() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🔍 EXPLORATION SYSTÉMATIQUE DES ENDPOINTS');
  console.log('═══════════════════════════════════════════════════\n');

  const baseEndpoints = [
    // Indices
    '/api/proxy/fr/api/bourse/dashboard/indices',
    '/api/proxy/fr/api/bourse_data/index',
    '/api/proxy/fr/api/bourse_data/index_watch',
    '/api/proxy/fr/api/bourse_data/index_history',
    '/api/proxy/fr/api/bourse_data/index_daily',
    '/api/proxy/fr/api/node/bourse_indice',

    // Actions
    '/api/proxy/fr/api/bourse/dashboard/equity',
    '/api/proxy/fr/api/bourse/dashboard/ticker',
    '/api/proxy/fr/api/bourse_data/equity',
    '/api/proxy/fr/api/bourse_data/stock',
    '/api/proxy/fr/api/bourse_data/share',
    '/api/proxy/fr/api/node/bourse_instrument',

    // Dashboard
    '/api/proxy/fr/api/bourse/dashboard/market_summary',
    '/api/proxy/fr/api/bourse/dashboard/top_movers',
    '/api/proxy/fr/api/bourse/dashboard/volume',

    // Historique
    '/api/proxy/fr/api/bourse_data/historical',
    '/api/proxy/fr/api/bourse_data/daily',
    '/api/proxy/fr/api/bourse_data/ohlc',
  ];

  for (const endpoint of baseEndpoints) {
    await testEndpoint(
      endpoint.split('/').pop(),
      `https://www.casablanca-bourse.com${endpoint}`
    );
  }
}

async function exploreIndiceDetails() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 EXPLORATION DES INDICES DÉTAILLÉS');
  console.log('═══════════════════════════════════════════════════\n');

  const indiceCodes = [
    'MASI', 'MADEX', 'MSI20', 'MASI.20', 'FTSE',
    'MASI ESG', 'CFG 25', 'MASI MID AND SMALL CAP'
  ];

  for (const code of indiceCodes) {
    console.log(`\n🔍 Indice: ${code}`);

    // Test cotation
    const params = new URLSearchParams({
      'filter[index][condition][path]': 'indexCode.field_code',
      'filter[index][condition][operator]': '=',
      'filter[index][condition][value]': code,
      'page[limit]': '5',
    });

    await testEndpoint(
      `  Données temps réel`,
      'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_watch',
      params
    );
  }
}

async function exploreDataFormats() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📋 EXPLORATION DES FORMATS DE DONNÉES');
  console.log('═══════════════════════════════════════════════════\n');

  // Test avec différents champs
  const fieldTests = [
    'drupal_internal__id,transactTime,indexValue',
    'transactDate,indexValue,indexVariation',
    'all',
    'field_code,field_name,field_value',
  ];

  for (const fields of fieldTests) {
    const params = new URLSearchParams({
      'fields[index_watch]': fields,
      'filter[index][condition][path]': 'indexCode.field_code',
      'filter[index][condition][value]': 'MASI',
      'page[limit]': '2',
    });

    const result = await testEndpoint(
      `  Format: ${fields.substring(0, 30)}...`,
      'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_watch',
      params
    );

    if (result.success && result.data.data?.[0]) {
      console.log('     Attributs disponibles:', Object.keys(result.data.data[0].attributes || {}));
    }
  }
}

async function exploreHistoricalDepth() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📅 TEST DE PROFONDEUR HISTORIQUE');
  console.log('═══════════════════════════════════════════════════\n');

  const daysToTest = [0, 1, 2, 3, 5, 7, 10, 15, 30, 60, 90, 180, 365];

  for (const days of daysToTest) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const dateStr = date.toISOString().split('T')[0];

    const params = new URLSearchParams({
      'filter[seance][condition][path]': 'transactTime',
      'filter[seance][condition][operator]': 'STARTS_WITH',
      'filter[seance][condition][value]': dateStr,
      'filter[index][condition][path]': 'indexCode.field_code',
      'filter[index][condition][value]': 'MASI',
      'page[limit]': '5',
    });

    const result = await testEndpoint(
      `  ${dateStr} (J-${days})`,
      'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_watch',
      params
    );

    if (!result.success || result.count === 0) {
      console.log(`     ⚠️ Limite historique atteinte après ${days} jours`);
      break;
    }
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║   🔬 EXPLORATION COMPLÈTE - BOURSE DE CASABLANCA  ║');
  console.log('╚═══════════════════════════════════════════════════╝');

  try {
    await exploreWithPuppeteer();
    await exploreAPIEndpoints();
    await exploreIndiceDetails();
    await exploreDataFormats();
    await exploreHistoricalDepth();

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ EXPLORATION TERMINÉE');
    console.log('═══════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exploration:', error);
  }
}

main();
