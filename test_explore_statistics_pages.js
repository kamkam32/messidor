// Explorer les pages statistiques découvertes
const puppeteer = require('puppeteer');

async function exploreStatisticsPages() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║      📊 EXPLORATION DES PAGES STATISTIQUES       ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox']
  });

  const page = await browser.newPage();

  // Intercepter les API calls
  const apiCalls = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/')) {
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {
          const data = await response.json();
          apiCalls.push({
            url,
            status: response.status(),
            dataCount: data?.data?.length || 0
          });
        }
      } catch (e) {}
    }
  });

  // Page 1: Éditions statistiques
  try {
    console.log('🔍 Page: Éditions statistiques\n');

    apiCalls.length = 0;
    await page.goto('https://www.casablanca-bourse.com/fr/editions-statistiques', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const pageData = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim(),
        description: document.querySelector('meta[name="description"]')?.content,
        downloadLinks: Array.from(document.querySelectorAll('a[href*=".pdf"], a[href*=".xlsx"], a[href*=".xls"], a[download]')).map(a => ({
          text: a.textContent.trim(),
          href: a.href,
          extension: a.href.split('.').pop()?.toLowerCase()
        })).slice(0, 10),
        tableCount: document.querySelectorAll('table').length,
        hasDateFilters: !!document.querySelector('select[name*="year"], select[name*="month"], input[type="date"]'),
      };
    });

    console.log(`   Titre: ${pageData.title}`);
    console.log(`   H1: ${pageData.h1}`);
    console.log(`   Tableaux: ${pageData.tableCount}`);
    console.log(`   Filtres de date: ${pageData.hasDateFilters ? '✅' : '❌'}`);

    if (pageData.downloadLinks.length > 0) {
      console.log(`\n   📥 Fichiers téléchargeables trouvés: ${pageData.downloadLinks.length}`);
      pageData.downloadLinks.forEach(link => {
        console.log(`      • ${link.text} (${link.extension})`);
      });
    }

    if (apiCalls.length > 0) {
      console.log(`\n   📡 APIs appelées:`);
      apiCalls.forEach(call => {
        console.log(`      - ${call.url.substring(50, 120)}...`);
      });
    }

    // Prendre un screenshot
    await page.screenshot({ path: 'editions-statistiques.png', fullPage: true });
    console.log(`\n   📸 Screenshot sauvegardé: editions-statistiques.png`);

  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  // Page 2: Produits Data
  try {
    console.log('\n\n🔍 Page: Produits Data\n');

    apiCalls.length = 0;
    await page.goto('https://www.casablanca-bourse.com/fr/produits', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const pageData = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.textContent?.trim(),
        description: document.querySelector('meta[name="description"]')?.content,
        products: Array.from(document.querySelectorAll('[class*="product"], [class*="card"]')).map(card => ({
          title: card.querySelector('h2, h3, h4')?.textContent?.trim(),
          description: card.querySelector('p')?.textContent?.trim()?.substring(0, 100),
          links: Array.from(card.querySelectorAll('a')).map(a => a.href)
        })).slice(0, 5),
        allLinks: Array.from(document.querySelectorAll('a')).map(a => ({
          text: a.textContent.trim(),
          href: a.href
        })).filter(l => l.text && l.href && !l.href.includes('#')).slice(0, 20)
      };
    });

    console.log(`   Titre: ${pageData.title}`);
    console.log(`   H1: ${pageData.h1}`);

    if (pageData.products.length > 0) {
      console.log(`\n   📦 Produits trouvés:`);
      pageData.products.forEach(product => {
        if (product.title) {
          console.log(`\n      ${product.title}`);
          if (product.description) {
            console.log(`      ${product.description}...`);
          }
          if (product.links.length > 0) {
            product.links.forEach(link => {
              console.log(`         → ${link}`);
            });
          }
        }
      });
    }

    console.log(`\n   🔗 Liens disponibles sur la page:`);
    pageData.allLinks.filter(l =>
      l.text.toLowerCase().includes('data') ||
      l.text.toLowerCase().includes('historique') ||
      l.text.toLowerCase().includes('télécharger') ||
      l.text.toLowerCase().includes('download')
    ).forEach(link => {
      console.log(`      • ${link.text} → ${link.href}`);
    });

    if (apiCalls.length > 0) {
      console.log(`\n   📡 APIs appelées:`);
      apiCalls.forEach(call => {
        console.log(`      - ${call.url.substring(50, 120)}...`);
      });
    }

    // Prendre un screenshot
    await page.screenshot({ path: 'produits-data.png', fullPage: true });
    console.log(`\n   📸 Screenshot sauvegardé: produits-data.png`);

  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  await browser.close();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ EXPLORATION TERMINÉE');
  console.log('═══════════════════════════════════════════════════');
  console.log('\n💡 Conclusion:');
  console.log('   Les données historiques longues ne semblent pas');
  console.log('   disponibles via API. Elles sont probablement dans');
  console.log('   des fichiers Excel/PDF téléchargeables.');
}

exploreStatisticsPages().catch(console.error);
