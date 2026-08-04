import "server-only";
import * as XLSX from "xlsx";

export interface OPCVMPerformanceData {
  isinCode?: string;
  code?: string;
  name: string;
  managementCompany?: string;
  legalNature?: string;
  classification?: string;
  sensitivity?: string;
  benchmarkIndex?: string;
  vlFrequency?: string;
  subscribers?: string;
  resultsAllocation?: string;
  subscriptionFee?: number;
  redemptionFee?: number;
  managementFees?: number;
  depositary?: string;
  distributor?: string;
  assetValue?: number;
  nav?: number;
  perfYtd?: number;
  perf1d?: number;
  perf1w?: number;
  perf1m?: number;
  perf3m?: number;
  perf6m?: number;
  perf1y?: number;
  perf2y?: number;
  perf3y?: number;
  perf5y?: number;
}

export interface ParsedOPCVMData {
  date: string;
  funds: OPCVMPerformanceData[];
}

/** Parse un fichier Excel ASFIM des performances. */
export async function parseOPCVMExcel(
  fileBuffer: Buffer,
  fileName: string
): Promise<ParsedOPCVMData> {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: null,
  }) as unknown[][];

  const date = extractDateFromFileName(fileName);

  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i] as string[];
    if (
      row &&
      row.some(
        (cell) =>
          cell &&
          (cell.toString().toLowerCase().includes("code isin") ||
            cell.toString().toLowerCase().includes("opcvm") ||
            cell.toString().toLowerCase().includes("code maroclear") ||
            cell.toString().toLowerCase().includes("libellé") ||
            cell.toString().toLowerCase().includes("dénomination") ||
            cell.toString().toLowerCase() === "vl")
      )
    ) {
      headerRowIndex = i;
      break;
    }
  }
  if (headerRowIndex === -1) throw new Error("Header row not found in Excel file");

  const headers = (data[headerRowIndex] as string[]).map((h) =>
    h ? h.toString().trim().toLowerCase() : ""
  );

  const m = {
    isin: findColumnIndex(headers, ["code isin", "isin"]),
    code: findColumnIndex(headers, ["code maroclear", "code opcvm", "code"]),
    name: findColumnIndex(headers, ["opcvm", "libellé", "dénomination", "nom"]),
    managementCompany: findColumnIndex(headers, ["société de gestion", "societe de gestion", "gestionnaire"]),
    legalNature: findColumnIndex(headers, ["nature juridique", "nature"]),
    classification: findColumnIndex(headers, ["classification", "categorie", "catégorie"]),
    sensitivity: findColumnIndex(headers, ["sensibilité", "sensibilite"]),
    benchmarkIndex: findColumnIndex(headers, ["indice bentchmark", "indice benchmark", "benchmark"]),
    vlFrequency: findColumnIndex(headers, ["périodicité vl", "periodicite vl", "frequence vl"]),
    subscribers: findColumnIndex(headers, ["souscripteurs", "souscripteur"]),
    resultsAllocation: findColumnIndex(headers, ["affectation des résultats", "affectation des resultats", "affectation"]),
    subscriptionFee: findColumnIndex(headers, ["commission de souscription", "frais souscription", "frais de souscription"]),
    redemptionFee: findColumnIndex(headers, ["commission de rachat", "frais rachat", "frais de rachat"]),
    managementFees: findColumnIndex(headers, ["frais de gestion", "frais gestion"]),
    depositary: findColumnIndex(headers, ["dépositaire", "depositaire"]),
    distributor: findColumnIndex(headers, ["réseau placeur", "reseau placeur", "placeur", "distributeur"]),
    assetValue: findColumnIndex(headers, ["an", "actif net", "actif", "assets"]),
    nav: findColumnIndex(headers, ["vl", "valeur liquidative", "nav"]),
    perfYtd: findColumnIndex(headers, ["ytd", "perf ytd", "annee"]),
    perf1d: findColumnIndex(headers, ["1 jour", "1j", "perf 1j"]),
    perf1w: findColumnIndex(headers, ["1 semaine", "1s", "perf 1s"]),
    perf1m: findColumnIndex(headers, ["1 mois", "1m", "perf 1m"]),
    perf3m: findColumnIndex(headers, ["3 mois", "3m", "perf 3m"]),
    perf6m: findColumnIndex(headers, ["6 mois", "6m", "perf 6m"]),
    perf1y: findColumnIndex(headers, ["1 an", "1a", "1an", "perf 1a"]),
    perf2y: findColumnIndex(headers, ["2 ans", "2a", "2ans", "perf 2a"]),
    perf3y: findColumnIndex(headers, ["3 ans", "3a", "3ans", "perf 3a"]),
    perf5y: findColumnIndex(headers, ["5 ans", "5a", "5ans", "perf 5a"]),
  };

  const funds: OPCVMPerformanceData[] = [];
  for (let i = headerRowIndex + 1; i < data.length; i++) {
    const row = data[i] as (string | number | null)[];
    if (!row || row.length === 0) continue;
    const nameValue = row[m.name];
    if (!nameValue) continue;
    const name = nameValue.toString().trim();
    if (!name || name.length < 2) continue;

    funds.push({
      isinCode: safeGetString(row, m.isin),
      code: safeGetString(row, m.code),
      name,
      managementCompany: safeGetString(row, m.managementCompany),
      legalNature: safeGetString(row, m.legalNature),
      classification: safeGetString(row, m.classification),
      sensitivity: safeGetString(row, m.sensitivity),
      benchmarkIndex: safeGetString(row, m.benchmarkIndex),
      vlFrequency: safeGetString(row, m.vlFrequency),
      subscribers: safeGetString(row, m.subscribers),
      resultsAllocation: safeGetString(row, m.resultsAllocation),
      subscriptionFee: safeParsePercentage(row[m.subscriptionFee]),
      redemptionFee: safeParsePercentage(row[m.redemptionFee]),
      managementFees: safeParsePercentage(row[m.managementFees]),
      depositary: safeGetString(row, m.depositary),
      distributor: safeGetString(row, m.distributor),
      assetValue: safeParseNumber(row[m.assetValue]),
      nav: safeParseNumber(row[m.nav]),
      perfYtd: safeParsePercentage(row[m.perfYtd]),
      perf1d: safeParsePercentage(row[m.perf1d]),
      perf1w: safeParsePercentage(row[m.perf1w]),
      perf1m: safeParsePercentage(row[m.perf1m]),
      perf3m: safeParsePercentage(row[m.perf3m]),
      perf6m: safeParsePercentage(row[m.perf6m]),
      perf1y: safeParsePercentage(row[m.perf1y]),
      perf2y: safeParsePercentage(row[m.perf2y]),
      perf3y: safeParsePercentage(row[m.perf3y]),
      perf5y: safeParsePercentage(row[m.perf5y]),
    });
  }

  return { date, funds };
}

function extractDateFromFileName(fileName: string): string {
  const match = fileName.match(/(\d{2})-(\d{2})-(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().split("T")[0];
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex((h) => h && h.toLowerCase() === name.toLowerCase());
    if (index !== -1) return index;
  }
  for (const name of possibleNames) {
    const index = headers.findIndex((h) => h && h.toLowerCase().includes(name.toLowerCase()));
    if (index !== -1) return index;
  }
  return -1;
}

function safeGetString(row: (string | number | null)[], index: number): string | undefined {
  if (index === -1 || !row[index]) return undefined;
  return row[index]!.toString().trim() || undefined;
}

function safeParseNumber(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  const str = value.toString().trim();
  if (!str) return undefined;
  const commaCount = (str.match(/,/g) || []).length;
  const dotCount = (str.match(/\./g) || []).length;
  let cleaned = str.replace(/\s/g, "");
  if (commaCount > 1 || (commaCount === 1 && dotCount === 1 && str.lastIndexOf(",") < str.lastIndexOf("."))) {
    cleaned = cleaned.replace(/,/g, "");
  } else if (commaCount === 1 && dotCount === 0) {
    cleaned = cleaned.replace(",", ".");
  }
  cleaned = cleaned.replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

function safeParsePercentage(value: string | number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  const cleaned = value
    .toString()
    .replace("%", "")
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

export async function downloadOPCVMFile(
  date: Date,
  type: "quotidien" | "hebdomadaire" = "quotidien"
): Promise<{ buffer: Buffer; fileName: string; date: string } | null> {
  try {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const fileName =
      type === "quotidien"
        ? `Tableau des performances quotidiennes au ${dd}-${mm}-${yyyy}.xlsx`
        : `Tableau des Performances Hebdomadaires au ${dd}-${mm}-${yyyy}.xlsx`;
    const url = `https://asfim.ma/static/tableau-des-performances/${encodeURIComponent(fileName)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, fileName, date: `${yyyy}-${mm}-${dd}` };
  } catch {
    return null;
  }
}

/**
 * Récupère le fichier quotidien le plus récent disponible, en remontant
 * jusqu'à `maxDaysBack` jours (résilient aux week-ends / jours fériés / gaps ASFIM).
 */
export async function downloadTodayOPCVMFile(
  maxDaysBack = 10
): Promise<{ buffer: Buffer; fileName: string; date: string } | null> {
  const base = new Date();
  for (let i = 0; i <= maxDaysBack; i++) {
    const date = new Date(base);
    date.setDate(date.getDate() - i);
    const result = await downloadOPCVMFile(date, "quotidien");
    if (result) return result;
  }
  return null;
}
