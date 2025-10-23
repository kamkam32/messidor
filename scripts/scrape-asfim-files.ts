/**
 * Script pour scraper tous les fichiers hebdomadaires disponibles sur ASFIM
 */

import puppeteer from 'puppeteer';

async function scrapeAsfimFiles() {
  console.log('🚀 Scraping des fichiers disponibles sur ASFIM...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    console.log('📥 Chargement de la page...');
    await page.goto('https://www.asfim.ma/publications/tableaux-des-performances/', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('✅ Page chargée\n');

    // Attendre que les fichiers se chargent
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Cliquer sur le filtre "Hebdomadaire"
    console.log('🔍 Filtrage des fichiers hebdomadaires...');
    try {
      await page.click('button:has-text("Hebdomadaire"), a:has-text("Hebdomadaire"), [data-filter="hebdomadaire"]');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (e) {
      console.log('⚠️  Filtre hebdomadaire non trouvé, récupération de tous les fichiers');
    }

    // Récupérer tous les liens vers les fichiers Excel
    const files = await page.evaluate(() => {
      const links: Array<{ url: string; text: string }> = [];

      // Chercher tous les liens vers des fichiers .xlsx
      const allLinks = document.querySelectorAll('a[href*=".xlsx"], a[href*="tableau"], a[download]');

      allLinks.forEach((link) => {
        const href = (link as HTMLAnchorElement).href;
        const text = link.textContent?.trim() || '';

        // Filtrer pour garder uniquement les fichiers hebdomadaires
        if (href.includes('.xlsx') &&
            (text.toLowerCase().includes('hebdomadaire') || href.toLowerCase().includes('hebdomadaire'))) {
          links.push({ url: href, text });
        }
      });

      return links;
    });

    console.log(`\n📊 Fichiers trouvés: ${files.length}\n`);

    if (files.length === 0) {
      // Si aucun fichier trouvé, essayons de récupérer tous les liens
      console.log('🔍 Recherche de tous les liens sur la page...\n');

      const allLinks = await page.evaluate(() => {
        const links: Array<{ url: string; text: string }> = [];
        document.querySelectorAll('a').forEach((link) => {
          const href = (link as HTMLAnchorElement).href;
          const text = link.textContent?.trim() || '';
          if (href && text) {
            links.push({ url: href, text });
          }
        });
        return links;
      });

      console.log('Tous les liens trouvés:');
      allLinks
        .filter(l => l.url.includes('xlsx') || l.text.toLowerCase().includes('tableau'))
        .forEach((link, i) => {
          console.log(`${i + 1}. ${link.text}`);
          console.log(`   URL: ${link.url}\n`);
        });
    } else {
      // Afficher les fichiers trouvés
      files.forEach((file, i) => {
        console.log(`${i + 1}. ${file.text}`);
        console.log(`   URL: ${file.url}\n`);
      });

      // Extraire les dates des noms de fichiers
      const dates = files
        .map(f => {
          const match = f.url.match(/(\d{2})-(\d{2})-(\d{4})/);
          if (match) {
            return { url: f.url, date: `${match[3]}-${match[2]}-${match[1]}` };
          }
          return null;
        })
        .filter(Boolean);

      if (dates.length > 0) {
        console.log('\n📅 Dates extraites (format YYYY-MM-DD):');
        console.log('[');
        dates.forEach((d, i) => {
          console.log(`  '${d!.date}',${i < dates.length - 1 ? '' : ' // Dernière date'}`);
        });
        console.log(']\n');

        console.log(`✅ ${dates.length} fichiers hebdomadaires disponibles !`);
        console.log(`📅 Du ${dates[dates.length - 1]!.date} au ${dates[0]!.date}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await browser.close();
  }
}

scrapeAsfimFiles();
