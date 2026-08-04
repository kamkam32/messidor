import * as XLSX from 'xlsx';

export interface OPCVMPerformanceData {
  // Identifiants
  isinCode?: string;
  code?: string; // Code Maroclear
  name: string; // OPCVM

  // Informations générales
  managementCompany?: string; // Société de Gestion
  legalNature?: string; // Nature juridique (SICAV, FCP)
  classification?: string; // Classification (Actions, OMLT, etc.)
  sensitivity?: string; // Sensibilité
  benchmarkIndex?: string; // Indice Benchmark
  vlFrequency?: string; // Périodicité VL
  subscribers?: string; // Souscripteurs (FGP, FNPP)
  resultsAllocation?: string; // Affectation des résultats

  // Frais
  subscriptionFee?: number; // Commission de souscription
  redemptionFee?: number; // Commission de rachat
  managementFees?: number; // Frais de gestion

  // Infrastructure
  depositary?: string; // Dépositaire
  distributor?: string; // Réseau placeur

  // Valeurs
  assetValue?: number; // AN (Actif Net)
  nav?: number; // VL (Valeur Liquidative)

  // Performances
  perfYtd?: number; // YTD
  perf1d?: number; // 1 jour
  perf1w?: number; // 1 semaine
  perf1m?: number; // 1 mois
  perf3m?: number; // 3 mois
  perf6m?: number; // 6 mois
  perf1y?: number; // 1 an
  perf2y?: number; // 2 ans
  perf3y?: number; // 3 ans
  perf5y?: number; // 5 ans
}

export interface ParsedOPCVMData {
  date: string; // YYYY-MM-DD format
  funds: OPCVMPerformanceData[];
}

/**
 * Parse un fichier Excel ASFIM des performances quotidiennes
 * Format attendu : "Tableau des performances quotidiennes au DD-MM-YYYY.xlsx"
 */
export async function parseOPCVMExcel(
  fileBuffer: Buffer,
  fileName: string
): Promise<ParsedOPCVMData> {
  try {
    // Lire le workbook
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Prendre la première feuille
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convertir en JSON (array of arrays)
    const data = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
      defval: null
    }) as unknown[][];

    // Extraire la date du nom du fichier
    const date = extractDateFromFileName(fileName);

    // Trouver la ligne d'en-tête (contient "CODE ISIN" ou "OPCVM" ou "VL")
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i] as string[];
      if (row && row.some(cell =>
        cell && (
          cell.toString().toLowerCase().includes('code isin') ||
          cell.toString().toLowerCase().includes('opcvm') ||
          cell.toString().toLowerCase().includes('code maroclear') ||
          cell.toString().toLowerCase().includes('libellé') ||
          cell.toString().toLowerCase().includes('dénomination') ||
          cell.toString().toLowerCase() === 'vl'
        )
      )) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error('Header row not found in Excel file');
    }

    const headers = (data[headerRowIndex] as string[]).map(h =>
      h ? h.toString().trim().toLowerCase() : ''
    );

    // Mapper les colonnes (format ASFIM) - TOUTES les colonnes
    const columnMapping = {
      // Identifiants
      isin: findColumnIndex(headers, ['code isin', 'isin']),
      code: findColumnIndex(headers, ['code maroclear', 'code opcvm', 'code']),
      name: findColumnIndex(headers, ['opcvm', 'libellé', 'dénomination', 'nom']),

      // Informations générales
      managementCompany: findColumnIndex(headers, ['société de gestion', 'societe de gestion', 'gestionnaire']),
      legalNature: findColumnIndex(headers, ['nature juridique', 'nature']),
      classification: findColumnIndex(headers, ['classification', 'categorie', 'catégorie']),
      sensitivity: findColumnIndex(headers, ['sensibilité', 'sensibilite']),
      benchmarkIndex: findColumnIndex(headers, ['indice bentchmark', 'indice benchmark', 'benchmark']),
      vlFrequency: findColumnIndex(headers, ['périodicité vl', 'periodicite vl', 'frequence vl']),
      subscribers: findColumnIndex(headers, ['souscripteurs', 'souscripteur']),
      resultsAllocation: findColumnIndex(headers, ['affectation des résultats', 'affectation des resultats', 'affectation']),

      // Frais
      subscriptionFee: findColumnIndex(headers, ['commission de souscription', 'frais souscription', 'frais de souscription']),
      redemptionFee: findColumnIndex(headers, ['commission de rachat', 'frais rachat', 'frais de rachat']),
      managementFees: findColumnIndex(headers, ['frais de gestion', 'frais gestion']),

      // Infrastructure
      depositary: findColumnIndex(headers, ['dépositaire', 'depositaire']),
      distributor: findColumnIndex(headers, ['réseau placeur', 'reseau placeur', 'placeur', 'distributeur']),

      // Valeurs
      assetValue: findColumnIndex(headers, ['an', 'actif net', 'actif', 'assets']),
      nav: findColumnIndex(headers, ['vl', 'valeur liquidative', 'nav']),

      // Performances
      perfYtd: findColumnIndex(headers, ['ytd', 'perf ytd', 'annee']),
      perf1d: findColumnIndex(headers, ['1 jour', '1j', 'perf 1j']),
      perf1w: findColumnIndex(headers, ['1 semaine', '1s', 'perf 1s']),
      perf1m: findColumnIndex(headers, ['1 mois', '1m', 'perf 1m']),
      perf3m: findColumnIndex(headers, ['3 mois', '3m', 'perf 3m']),
      perf6m: findColumnIndex(headers, ['6 mois', '6m', 'perf 6m']),
      perf1y: findColumnIndex(headers, ['1 an', '1a', '1an', 'perf 1a']),
      perf2y: findColumnIndex(headers, ['2 ans', '2a', '2ans', 'perf 2a']),
      perf3y: findColumnIndex(headers, ['3 ans', '3a', '3ans', 'perf 3a']),
      perf5y: findColumnIndex(headers, ['5 ans', '5a', '5ans', 'perf 5a']),
    };

    // Parser les données
    const funds: OPCVMPerformanceData[] = [];

    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i] as (string | number | null)[];

      // Vérifier que la ligne contient des données
      if (!row || row.length === 0) continue;

      const nameValue = row[columnMapping.name];
      if (!nameValue) continue;

      const name = nameValue.toString().trim();
      if (!name || name.length < 2) continue;

      const fund: OPCVMPerformanceData = {
        // Identifiants
        isinCode: safeGetString(row, columnMapping.isin),
        code: safeGetString(row, columnMapping.code),
        name,

        // Informations générales
        managementCompany: safeGetString(row, columnMapping.managementCompany),
        legalNature: safeGetString(row, columnMapping.legalNature),
        classification: safeGetString(row, columnMapping.classification),
        sensitivity: safeGetString(row, columnMapping.sensitivity),
        benchmarkIndex: safeGetString(row, columnMapping.benchmarkIndex),
        vlFrequency: safeGetString(row, columnMapping.vlFrequency),
        subscribers: safeGetString(row, columnMapping.subscribers),
        resultsAllocation: safeGetString(row, columnMapping.resultsAllocation),

        // Frais
        subscriptionFee: safeParsePercentage(row[columnMapping.subscriptionFee]),
        redemptionFee: safeParsePercentage(row[columnMapping.redemptionFee]),
        managementFees: safeParsePercentage(row[columnMapping.managementFees]),

        // Infrastructure
        depositary: safeGetString(row, columnMapping.depositary),
        distributor: safeGetString(row, columnMapping.distributor),

        // Valeurs
        assetValue: safeParseNumber(row[columnMapping.assetValue]),
        nav: safeParseNumber(row[columnMapping.nav]),

        // Performances
        perfYtd: safeParsePercentage(row[columnMapping.perfYtd]),
        perf1d: safeParsePercentage(row[columnMapping.perf1d]),
        perf1w: safeParsePercentage(row[columnMapping.perf1w]),
        perf1m: safeParsePercentage(row[columnMapping.perf1m]),
        perf3m: safeParsePercentage(row[columnMapping.perf3m]),
        perf6m: safeParsePercentage(row[columnMapping.perf6m]),
        perf1y: safeParsePercentage(row[columnMapping.perf1y]),
        perf2y: safeParsePercentage(row[columnMapping.perf2y]),
        perf3y: safeParsePercentage(row[columnMapping.perf3y]),
        perf5y: safeParsePercentage(row[columnMapping.perf5y]),
      };

      funds.push(fund);
    }

    return {
      date,
      funds
    };
  } catch (error) {
    console.error('Error parsing OPCVM Excel:', error);
    throw new Error(`Failed to parse OPCVM Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extraire la date du nom de fichier
 * Format: "Tableau des performances quotidiennes au DD-MM-YYYY.xlsx"
 */
function extractDateFromFileName(fileName: string): string {
  // Pattern: DD-MM-YYYY
  const match = fileName.match(/(\d{2})-(\d{2})-(\d{4})/);

  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  // Si pas trouvé, utiliser la date du jour
  console.warn(`Could not extract date from filename: ${fileName}, using today's date`);
  return new Date().toISOString().split('T')[0];
}

/**
 * Trouver l'index d'une colonne par ses noms possibles
 * Essaie d'abord une correspondance exacte, puis une correspondance partielle
 */
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  // Essayer d'abord une correspondance exacte
  for (const name of possibleNames) {
    const index = headers.findIndex(h =>
      h && h.toLowerCase() === name.toLowerCase()
    );
    if (index !== -1) return index;
  }

  // Sinon, correspondance partielle
  for (const name of possibleNames) {
    const index = headers.findIndex(h =>
      h && h.toLowerCase().includes(name.toLowerCase())
    );
    if (index !== -1) return index;
  }

  return -1;
}

/**
 * Obtenir une valeur string de manière sécurisée
 */
function safeGetString(row: (string | number | null)[], index: number): string | undefined {
  if (index === -1 || !row[index]) return undefined;
  return row[index]!.toString().trim() || undefined;
}

/**
 * Parser un nombre de manière sécurisée
 * Supporte les formats: "121,918.39" ou "159 591 178,39" ou "159,591,178.39"
 */
function safeParseNumber(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;

  if (typeof value === 'number') return value;

  const str = value.toString().trim();
  if (!str) return undefined;

  // Compter les virgules et les points
  const commaCount = (str.match(/,/g) || []).length;
  const dotCount = (str.match(/\./g) || []).length;

  let cleaned = str.replace(/\s/g, ''); // Enlever les espaces

  // Si plusieurs virgules, ce sont des séparateurs de milliers (format US inversé)
  if (commaCount > 1 || (commaCount === 1 && dotCount === 1 && str.lastIndexOf(',') < str.lastIndexOf('.'))) {
    // Format: "159,591,178.39" -> virgules = milliers, point = décimal
    cleaned = cleaned.replace(/,/g, '');
  }
  // Si une seule virgule et pas de point, c'est le séparateur décimal
  else if (commaCount === 1 && dotCount === 0) {
    // Format: "121918,39" -> virgule = décimal
    cleaned = cleaned.replace(',', '.');
  }
  // Si un seul point, c'est le séparateur décimal
  // Format: "121918.39" -> OK

  // Enlever tous les caractères non numériques sauf le point et le moins
  cleaned = cleaned.replace(/[^\d.-]/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Parser un pourcentage (peut être "5,23%" ou "5.23" ou "5,23")
 */
function safeParsePercentage(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;

  if (typeof value === 'number') return value;

  // Enlever le symbole % si présent
  const cleaned = value.toString()
    .replace('%', '')
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Télécharger le fichier Excel ASFIM pour une date donnée
 * URL format: https://asfim.ma/static/tableau-des-performances/Tableau%20des%20performances%20quotidiennes%20au%2022-10-2025.xlsx
 */
export async function downloadOPCVMFile(
  date: Date,
  type: 'quotidien' | 'hebdomadaire' = 'quotidien'
): Promise<{ buffer: Buffer; fileName: string; date: string } | null> {
  try {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    // Format du nom de fichier selon le type
    const fileName = type === 'quotidien'
      ? `Tableau des performances quotidiennes au ${dd}-${mm}-${yyyy}.xlsx`
      : `Tableau des Performances Hebdomadaires au ${dd}-${mm}-${yyyy}.xlsx`;

    // URL ASFIM
    const url = `https://asfim.ma/static/tableau-des-performances/${encodeURIComponent(fileName)}`;

    console.log(`Attempting to download: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      console.log(`File not found at ${url} (${response.status})`);
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const dateStr = `${yyyy}-${mm}-${dd}`;

    console.log(`✅ Successfully downloaded ${fileName}`);

    return { buffer, fileName, date: dateStr };
  } catch (error) {
    console.error(`Error downloading OPCVM file for ${date.toISOString()}:`, error);
    return null;
  }
}

/**
 * Télécharger le fichier Excel ASFIM du jour
 */
export async function downloadTodayOPCVMFile(): Promise<{ buffer: Buffer; fileName: string } | null> {
  try {
    // Essayer aujourd'hui et hier (au cas où le fichier n'est pas encore publié)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const datesToTry = [today, yesterday];

    for (const date of datesToTry) {
      const result = await downloadOPCVMFile(date, 'quotidien');
      if (result) {
        return { buffer: result.buffer, fileName: result.fileName };
      }
    }

    console.warn('Could not download OPCVM file from ASFIM for today or yesterday');
    return null;
  } catch (error) {
    console.error('Error downloading today\'s OPCVM file:', error);
    return null;
  }
}

/**
 * Télécharger plusieurs fichiers OPCVM sur une période donnée
 * Utile pour backfill historique
 */
export async function downloadOPCVMFilesForPeriod(
  startDate: Date,
  endDate: Date,
  type: 'quotidien' | 'hebdomadaire' = 'quotidien'
): Promise<Array<{ buffer: Buffer; fileName: string; date: string }>> {
  const files: Array<{ buffer: Buffer; fileName: string; date: string }> = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const result = await downloadOPCVMFile(new Date(currentDate), type);

    if (result) {
      files.push(result);
      console.log(`✅ Downloaded ${result.fileName}`);
    } else {
      console.log(`⏭️  No file for ${currentDate.toISOString().split('T')[0]}`);
    }

    // Passer au jour suivant (ou semaine suivante pour hebdomadaire)
    if (type === 'quotidien') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Pause pour éviter de surcharger le serveur ASFIM
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return files;
}
