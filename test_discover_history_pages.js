// Découvrir les vraies pages d'historique du site
const puppeteer = require('puppeteer');

async function discoverHistoryPages() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║   🕵️ DÉCOUVERTE DES PAGES D\'HISTORIQUE DU SITE   ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox']
  });

  const page = await browser.newPage();

  // Intercepter TOUS les appels réseau
  const apiCalls = [];
  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();

    // Capturer tous les appels API
    if (url.includes('/api/')) {
      try {
        const contentType = response.headers()['content-type'];
        let data = null;

        if (contentType && contentType.includes('json')) {
          data = await response.json();
        }

        apiCalls.push({
          url,
          status,
          method: response.request().method(),
          contentType,
          dataCount: data?.data?.length || 0,
          hasData: !!(data?.data && data.data.length > 0)
        });
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
  });

  // Tester différentes URLs potentielles
  const urlsToTest = [
    // Pages d'indices
    'https://www.casablanca-bourse.com/fr/live-market/indices/MASI',
    'https://www.casablanca-bourse.com/fr/live-market/indices',

    // Pages de graphiques (potentiellement historique)
    'https://www.casablanca-bourse.com/fr/live-market/chart',
    'https://www.casablanca-bourse.com/fr/live-market/indices/MASI/chart',
    'https://www.casablanca-bourse.com/fr/live-market/indices/MASI/historical',
    'https://www.casablanca-bourse.com/fr/live-market/indices/MASI/history',

    // Statistiques
    'https://www.casablanca-bourse.com/fr/statistics',
    'https://www.casablanca-bourse.com/fr/statistics/indices',

    // Rapports
    'https://www.casablanca-bourse.com/fr/market-data',
    'https://www.casablanca-bourse.com/fr/reports',
  ];

  for (const url of urlsToTest) {
    try {
      console.log(`\n🔍 Test: ${url}`);

      // Clear previous API calls
      apiCalls.length = 0;

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 20000
      });

      const pageTitle = await page.title();
      console.log(`   Titre: ${pageTitle}`);

      // Analyser la structure
      const structure = await page.evaluate(() => {
        return {
          hasDatePicker: !!document.querySelector('input[type="date"], .date-picker, [class*="date"]'),
          hasPeriodSelector: !!document.querySelector('select[name*="period"], button[data-period]'),
          hasHistoricalData: !!document.querySelector('[class*="historical"], [class*="history"]'),
          linksWithHistory: Array.from(document.querySelectorAll('a')).filter(a =>
            a.href.includes('history') ||
            a.href.includes('historical') ||
            a.href.includes('chart')
          ).map(a => a.href).slice(0, 5)
        };
      });

      console.log(`   Date picker: ${structure.hasDatePicker ? '✅' : '❌'}`);
      console.log(`   Sélecteur de période: ${structure.hasPeriodSelector ? '✅' : '❌'}`);
      console.log(`   Données historiques: ${structure.hasHistoricalData ? '✅' : '❌'}`);

      if (structure.linksWithHistory.length > 0) {
        console.log(`   Liens découverts:`);
        structure.linksWithHistory.forEach(link => {
          console.log(`      - ${link}`);
        });
      }

      // Analyser les APIs appelées
      const uniqueApis = [...new Set(apiCalls.map(call => call.url))];
      if (uniqueApis.length > 0) {
        console.log(`   📡 APIs appelées (${uniqueApis.length}):`);

        // Grouper par type
        const historyApis = uniqueApis.filter(u => u.includes('history'));
        const watchApis = uniqueApis.filter(u => u.includes('watch'));
        const otherApis = uniqueApis.filter(u => !u.includes('history') && !u.includes('watch'));

        if (historyApis.length > 0) {
          console.log(`\n   🎯 APIs HISTORY trouvées:`);
          historyApis.forEach(url => {
            const call = apiCalls.find(c => c.url === url);
            console.log(`      ✨ ${url.substring(50)}`);
            console.log(`         Status: ${call.status}, Données: ${call.dataCount}`);
          });
        }

        if (watchApis.length > 0) {
          console.log(`\n   📊 APIs WATCH:`);
          watchApis.slice(0, 2).forEach(url => {
            console.log(`      - ${url.substring(50, 120)}...`);
          });
        }

        if (otherApis.length > 0 && otherApis.length < 10) {
          console.log(`\n   🔍 Autres APIs:`);
          otherApis.forEach(url => {
            console.log(`      - ${url.substring(50, 120)}...`);
          });
        }
      }

    } catch (error) {
      console.log(`   ❌ Page non accessible: ${error.message}`);
    }
  }

  // Essayer de trouver des liens dans le menu
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🔍 EXPLORATION DU MENU DE NAVIGATION');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    await page.goto('https://www.casablanca-bourse.com/fr', {
      waitUntil: 'networkidle2',
      timeout: 20000
    });

    const menuLinks = await page.evaluate(() => {
      const links = [];
      document.querySelectorAll('nav a, header a, [role="navigation"] a').forEach(link => {
        const text = link.textContent.trim();
        const href = link.href;
        if (text && href && !href.includes('#')) {
          links.push({ text, href });
        }
      });
      return links;
    });

    console.log(`Liens trouvés: ${menuLinks.length}`);

    const relevantLinks = menuLinks.filter(link =>
      link.text.toLowerCase().includes('data') ||
      link.text.toLowerCase().includes('statistics') ||
      link.text.toLowerCase().includes('statistique') ||
      link.text.toLowerCase().includes('rapport') ||
      link.text.toLowerCase().includes('report') ||
      link.text.toLowerCase().includes('historical') ||
      link.text.toLowerCase().includes('historique')
    );

    if (relevantLinks.length > 0) {
      console.log('\nLiens pertinents:');
      relevantLinks.forEach(link => {
        console.log(`   📌 ${link.text} → ${link.href}`);
      });
    }

  } catch (error) {
    console.log(`Erreur lors de l'exploration du menu: ${error.message}`);
  }

  await browser.close();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ DÉCOUVERTE TERMINÉE');
  console.log('═══════════════════════════════════════════════════');
}

discoverHistoryPages().catch(console.error);
