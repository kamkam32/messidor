import https from 'https';
import axios from 'axios';

// Configuration pour ignorer les erreurs SSL
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

// Configuration des indices disponibles
export const INDICES = {
  MASI: { code: 'MASI', id: '512335', name: 'MASI' },
  MSI20: { code: 'MSI20', id: '512343', name: 'MSI 20' },
  ESGI: { code: 'ESGI', id: null, name: 'MASI ESG' },
  MASIMS: { code: 'MASIMS', id: null, name: 'MASI Mid & Small Cap' },
  // Indices sans données intraday disponibles (pour référence)
  // MADEX: { code: 'MADEX', id: null, name: 'MADEX' },
  // FTSE: { code: 'FTSE CSE Morocco 15 Index', id: null, name: 'FTSE Morocco 15' },
} as const;

export type IndexCode = keyof typeof INDICES;

export interface IndexQuote {
  indexValue: string;
  previousValue: string;
  variation: string;
  variationPercent: string;
  high: string;
  low: string;
  ytdVariation: string;
  marketCap: string;
  timestamp: string;
}

export interface StockComposition {
  instrument: string;
  code?: string;
  price: string;
  previousPrice: string;
  variation: string;
  variationPercent: string;
  volume: string;
  quantity: string;
}

export interface IntradayData {
  transactTime: string;
  indexValue: string;
}

// Interface pour les données brutes de composition (avant transformation)
interface RawCompositionItem {
  instrument: string;
  price: string;
  previousPrice: string;
  variation: string;
  volume: string;
  quantity: string;
}

/**
 * Récupère la cotation de l'indice MASI
 */
export async function getMASIQuote(): Promise<IndexQuote> {
  try {
    const response = await axios.get(
      'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse/dashboard/index_cotation/512335',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        httpsAgent,
      }
    );

    const data = response.data;

    return {
      indexValue: data.data.field_index_value || '0',
      previousValue: data.data.field_previous_value || '0',
      variation: data.data.field_variation || '0',
      variationPercent: data.data.field_variation_percent || '0',
      high: data.data.field_index_high_value || '0',
      low: data.data.field_index_low_value || '0',
      ytdVariation: data.data.field_ytd_variation || '0',
      marketCap: data.data.field_market_capitalisation || '0',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching MASI quote:', error);
    throw error;
  }
}

/**
 * Récupère les données du ticker (valeurs en temps réel)
 */
export async function getTicker(): Promise<any> {
  try {
    const response = await axios.get(
      'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse/dashboard/ticker?marche=59&class[0]=25',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        httpsAgent,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching ticker:', error);
    throw error;
  }
}

/**
 * Récupère les données intraday pour n'importe quel indice
 */
export async function getIndexIntraday(indexCode: string, date?: string): Promise<IntradayData[]> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Récupérer toutes les données disponibles avec pagination
    const allData: IntradayData[] = [];
    let offset = 0;
    const limit = 500;
    let hasMore = true;

    while (hasMore && offset < 2000) { // Limite de sécurité à 2000 points
      const params = new URLSearchParams({
        'fields[index_watch]': 'drupal_internal__id,transactTime,indexValue',
        'filter[seance][condition][path]': 'transactTime',
        'filter[seance][condition][operator]': 'STARTS_WITH',
        'filter[seance][condition][value]': targetDate,
        'filter[index][condition][path]': 'indexCode.field_code',
        'filter[index][condition][operator]': '=',
        'filter[index][condition][value]': indexCode,
        'page[offset]': offset.toString(),
        'page[limit]': limit.toString(),
      });

      const response = await axios.get(
        `https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_watch?${params}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/vnd.api+json',
          },
          httpsAgent,
        }
      );

      const data = response.data;
      const items = data.data || [];

      if (items.length === 0) {
        hasMore = false;
        break;
      }

      const mappedItems = items.map((item: any) => ({
        transactTime: item.attributes.transactTime,
        indexValue: item.attributes.indexValue,
      }));

      allData.push(...mappedItems);

      // Si on a reçu moins que la limite, c'est la dernière page
      if (items.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    console.log(`✅ Récupéré ${allData.length} points intraday pour ${indexCode} - ${targetDate}`);

    // Trier par ordre chronologique
    allData.sort((a, b) => new Date(a.transactTime).getTime() - new Date(b.transactTime).getTime());

    return allData;
  } catch (error) {
    console.error(`Error fetching ${indexCode} intraday:`, error);
    throw error;
  }
}

/**
 * Récupère les données intraday de l'indice MASI (rétrocompatibilité)
 */
export async function getMASIIntraday(date?: string): Promise<IntradayData[]> {
  return getIndexIntraday('MASI', date);
}

/**
 * Récupère la composition complète de l'indice MASI via Puppeteer
 * Utilise chromium serverless pour compatibilité Vercel
 */
export async function getMASIComposition(): Promise<StockComposition[]> {
  try {
    // Déterminer si on est en environnement serverless (Vercel) ou local
    const isProduction = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

    let browser;

    if (isProduction) {
      // Environnement serverless : utiliser chromium
      const chromium = require('@sparticuz/chromium');
      const puppeteer = require('puppeteer-core');

      browser = await puppeteer.launch({
        args: [...chromium.args, '--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      // Environnement local : utiliser puppeteer classique
      const puppeteer = require('puppeteer');

      browser = await puppeteer.launch({
        headless: true,
        args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox']
      });
    }

    const page = await browser.newPage();

    await page.goto('https://www.casablanca-bourse.com/fr/live-market/indices/MASI', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Attendre que le tableau de composition soit chargé
    await page.waitForSelector('table', { timeout: 10000 });

    const composition = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');

      // Le deuxième tableau contient la composition
      if (tables.length < 2) return [];

      const compositionTable = tables[1];
      const rows = compositionTable.querySelectorAll('tbody tr');

      return Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return null;

        return {
          instrument: cells[0]?.textContent?.trim() || '',
          price: cells[1]?.textContent?.trim() || '0',
          previousPrice: cells[2]?.textContent?.trim() || '0',
          variation: cells[3]?.textContent?.trim() || '0',
          volume: cells[4]?.textContent?.trim() || '-',
          quantity: cells[5]?.textContent?.trim() || '-',
        };
      }).filter(Boolean);
    });

    await browser.close();

    return composition.map((item: RawCompositionItem) => {
      const variationMatch = item.variation.match(/([-+]?\d+[.,]\d+)\s*%/);
      const variationPercent = variationMatch ? variationMatch[1].replace(',', '.') : '0';

      return {
        instrument: item.instrument,
        price: item.price.replace(/\s/g, '').replace(',', '.'),
        previousPrice: item.previousPrice.replace(/\s/g, '').replace(',', '.'),
        variation: item.variation,
        variationPercent,
        volume: item.volume,
        quantity: item.quantity,
      };
    });
  } catch (error) {
    console.error('Error fetching MASI composition:', error);
    throw error;
  }
}

/**
 * Récupère toutes les données de la Bourse de Casablanca
 */
export async function getAllBourseData() {
  try {
    const [quote, intraday, composition] = await Promise.allSettled([
      getMASIQuote(),
      getMASIIntraday(),
      getMASIComposition(),
    ]);

    return {
      quote: quote.status === 'fulfilled' ? quote.value : null,
      intraday: intraday.status === 'fulfilled' ? intraday.value : [],
      composition: composition.status === 'fulfilled' ? composition.value : [],
      timestamp: new Date().toISOString(),
      errors: [
        quote.status === 'rejected' ? `Quote error: ${quote.reason}` : null,
        intraday.status === 'rejected' ? `Intraday error: ${intraday.reason}` : null,
        composition.status === 'rejected' ? `Composition error: ${composition.reason}` : null,
      ].filter(Boolean),
    };
  } catch (error) {
    console.error('Error fetching all bourse data:', error);
    throw error;
  }
}
