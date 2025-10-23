const headers = ['code isin', 'code maroclear', 'opcvm', 'société de gestion', 'nature juridique', 'classification', 'sensibilité', 'indice bentchmark', 'périodicité vl', 'souscripteurs', 'affectation des résultats', 'commission de souscription', ' commission de rachat', 'frais de gestion', 'dépositaire', 'réseau placeur', 'an', 'vl', 'ytd', '1 jour', '1 semaine', '1 mois', '3 mois', '6 mois', '1 an', '2 ans', '3 ans', '5 ans'];

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h && h.includes(name.toLowerCase()));
    if (index !== -1) return index;
  }
  return -1;
}

console.log('Testing column mapping:');
console.log('VL index:', findColumnIndex(headers, ['vl', 'valeur liquidative', 'nav']));
console.log('AN index:', findColumnIndex(headers, ['an', 'actif net', 'actif', 'assets']));
console.log('YTD index:', findColumnIndex(headers, ['ytd', 'perf ytd', 'annee']));
console.log('1 jour index:', findColumnIndex(headers, ['1 jour', '1j', 'perf 1j']));
console.log('1 mois index:', findColumnIndex(headers, ['1 mois', '1m', 'perf 1m']));
