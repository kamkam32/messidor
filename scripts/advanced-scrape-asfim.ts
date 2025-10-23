/**
 * Script avancé pour scraper TOUS les fichiers historiques d'ASFIM
 * Intercepte les requêtes réseau et analyse la structure
 */

import puppeteer from 'puppeteer';

async function advancedScrapeAsfim() {
  console.log('🚀 Scraping AVANCÉ des fichiers ASFIM...\n');

  const browser = await puppeteer.launch({
    headless: false, // Mode visible pour debug
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Intercepter toutes les requêtes réseau
    const networkRequests: string[] = [];

    page.on('request', request => {
      const url = request.url();
      if (url.includes('asfim') || url.includes('tableau') || url.includes('performance')) {
        networkRequests.push(url);
      }
    });

    page.on('response', async response => {
      const url = response.url();
      if (url.includes('api') || url.includes('json') || url.includes('tableau')) {
        console.log(`📡 API détectée: ${url}`);
        try {
          const contentType = response.headers()['content-type'];
          if (contentType?.includes('json')) {
            const data = await response.json();
            console.log('   Données JSON:', JSON.stringify(data).substring(0, 200), '...\n');
          }
        } catch (e) {
          // Ignore les erreurs de parsing
        }
      }
    });

    console.log('📥 Chargement de la page...');
    await page.goto('https://www.asfim.ma/publications/tableaux-des-performances/', {
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    console.log('✅ Page chargée, analyse en cours...\n');

    // Attendre un peu pour que tout se charge
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Essayer de cliquer sur "Hebdomadaire"
    try {
      console.log('🔍 Tentative de clic sur "Hebdomadaire"...');
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const hebdoButton = buttons.find(b => b.textContent?.includes('Hebdomadaire'));
        if (hebdoButton) {
          (hebdoButton as HTMLElement).click();
        }
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Filtre appliqué\n');
    } catch (e) {
      console.log('⚠️  Filtre non trouvé\n');
    }

    // Essayer de charger plus de fichiers (scroll ou pagination)
    console.log('📜 Tentative de scroll pour charger plus de fichiers...');
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Chercher des boutons "Charger plus" ou "Suivant"
    try {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a'));
        const loadMoreButton = buttons.find(b =>
          b.textContent?.toLowerCase().includes('plus') ||
          b.textContent?.toLowerCase().includes('suivant') ||
          b.textContent?.toLowerCase().includes('more') ||
          b.textContent?.toLowerCase().includes('next')
        );
        if (loadMoreButton) {
          (loadMoreButton as HTMLElement).click();
        }
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Bouton "Charger plus" cliqué\n');
    } catch (e) {
      console.log('⚠️  Pas de bouton "Charger plus"\n');
    }

    // Récupérer TOUS les liens
    const allLinks = await page.evaluate(() => {
      const links: Array<{ url: string; text: string }> = [];

      // Chercher tous les éléments qui pourraient contenir des liens de fichiers
      document.querySelectorAll('a, [href], [data-url], [data-file]').forEach((el) => {
        const link = el as HTMLAnchorElement;
        const href = link.href || link.getAttribute('data-url') || link.getAttribute('data-file') || '';
        const text = link.textContent?.trim() || link.getAttribute('title') || '';

        if (href && (href.includes('.xlsx') || href.includes('tableau') || href.includes('performance'))) {
          links.push({ url: href, text });
        }
      });

      return links;
    });

    console.log(`\n📊 Total de liens trouvés: ${allLinks.length}\n`);

    // Filtrer pour les fichiers hebdomadaires
    const hebdoFiles = allLinks.filter(l =>
      l.url.toLowerCase().includes('hebdomadaire') ||
      l.text.toLowerCase().includes('hebdomadaire')
    );

    console.log(`✅ Fichiers HEBDOMADAIRES trouvés: ${hebdoFiles.length}\n`);

    hebdoFiles.forEach((file, i) => {
      console.log(`${i + 1}. ${file.text || 'Sans titre'}`);
      console.log(`   URL: ${file.url}\n`);
    });

    // Extraire les dates
    const dates = hebdoFiles
      .map(f => {
        const match = f.url.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (match) {
          return { url: f.url, date: `${match[3]}-${match[2]}-${match[1]}` };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a!.date.localeCompare(b!.date));

    if (dates.length > 0) {
      console.log('\n📅 DATES DISPONIBLES (format YYYY-MM-DD):\n');
      console.log('const HEBDO_DATES = [');
      dates.forEach((d) => {
        console.log(`  '${d!.date}',`);
      });
      console.log('];\n');

      console.log(`✅ ${dates.length} fichiers hebdomadaires trouvés !`);
      console.log(`📅 Période: ${dates[0]!.date} → ${dates[dates.length - 1]!.date}\n`);
    }

    // Afficher les requêtes réseau interceptées
    console.log('\n📡 REQUÊTES RÉSEAU INTERCEPTÉES:\n');
    const uniqueRequests = [...new Set(networkRequests)];
    uniqueRequests.forEach(url => {
      if (url.includes('api') || url.includes('json')) {
        console.log(`   ${url}`);
      }
    });

    console.log('\n⏸️  Navigateur ouvert pour inspection manuelle...');
    console.log('   Appuyez sur Ctrl+C pour fermer\n');

    // Garder le navigateur ouvert pour inspection
    await new Promise(() => {}); // Attend indéfiniment

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await browser.close();
  }
}

advancedScrapeAsfim();
