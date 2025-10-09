// Script pour analyser les appels API de la Bourse de Casablanca
const puppeteer = require('puppeteer');

(async () => {
  console.log('Lancement du navigateur...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  const page = await browser.newPage();

  // Intercepter les requêtes réseau
  const apiCalls = [];

  page.on('response', async (response) => {
    const url = response.url();
    const status = response.status();
    const type = response.request().resourceType();

    // Capturer les appels API (JSON, XHR, Fetch)
    if (
      type === 'xhr' ||
      type === 'fetch' ||
      url.includes('api') ||
      url.includes('json') ||
      url.includes('data')
    ) {
      try {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('json')) {
          const data = await response.json();
          apiCalls.push({
            url,
            status,
            type,
            method: response.request().method(),
            contentType,
            dataPreview: JSON.stringify(data).substring(0, 200) + '...'
          });
        }
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
  });

  console.log('Navigation vers la page MASI...');
  await page.goto('https://www.casablanca-bourse.com/fr/live-market/indices/MASI', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  console.log('\n=== ANALYSE DE LA PAGE ===\n');

  // Extraire les données visibles
  const pageData = await page.evaluate(() => {
    const data = {
      title: document.querySelector('h2')?.textContent,
      tables: []
    };

    // Trouver tous les tableaux
    const tables = document.querySelectorAll('table');
    tables.forEach((table, index) => {
      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      const rows = Array.from(table.querySelectorAll('tbody tr')).slice(0, 3).map(tr => {
        return Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
      });

      data.tables.push({
        index,
        headers,
        sampleRows: rows
      });
    });

    return data;
  });

  console.log('Titre de la page:', pageData.title);
  console.log('\n=== TABLEAUX TROUVÉS ===\n');
  pageData.tables.forEach(table => {
    console.log(`\nTableau ${table.index + 1}:`);
    console.log('En-têtes:', table.headers.join(' | '));
    console.log('Exemples de données:', table.sampleRows.length, 'lignes trouvées');
  });

  console.log('\n=== APPELS API DÉTECTÉS ===\n');
  if (apiCalls.length > 0) {
    apiCalls.forEach((call, index) => {
      console.log(`\n${index + 1}. ${call.method} ${call.url}`);
      console.log(`   Status: ${call.status}`);
      console.log(`   Type: ${call.type}`);
      console.log(`   Content-Type: ${call.contentType}`);
      console.log(`   Aperçu: ${call.dataPreview}`);
    });
  } else {
    console.log('Aucun appel API JSON détecté - Les données sont probablement en SSR (Server-Side Rendering)');
  }

  console.log('\n=== ATTRIBUTS DATA SPÉCIAUX ===\n');
  const dataAttributes = await page.evaluate(() => {
    const elements = document.querySelectorAll('[data-df-id], [data-df-template]');
    return Array.from(elements).map(el => ({
      tag: el.tagName,
      'data-df-id': el.getAttribute('data-df-id'),
      'data-df-template': el.getAttribute('data-df-template')
    }));
  });

  dataAttributes.forEach(attr => {
    console.log(`${attr.tag}: data-df-id="${attr['data-df-id']}"`);
  });

  await browser.close();
  console.log('\n=== ANALYSE TERMINÉE ===');
})();
