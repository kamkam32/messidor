# 🧪 Scripts de Test OPCVM

## Scripts Disponibles

### 1. `test-excel-parser.ts`
Teste le parsing d'un fichier Excel local.

```bash
npx tsx scripts/test-excel-parser.ts
```

**Résultat** :
- Parse le fichier `public/documents/Tableau des performances quotidiennes au 22-10-2025.xlsx`
- Affiche les 5 premiers fonds parsés
- Génère `test-opcvm-output.json` avec tous les fonds

### 2. `test-opcvm-download.ts`
Teste le téléchargement depuis ASFIM.

```bash
npx tsx scripts/test-opcvm-download.ts
```

**Résultat** :
- Télécharge le fichier du 22-10-2025 depuis ASFIM
- Sauvegarde localement dans `downloaded-Tableau des performances quotidiennes au 22-10-2025.xlsx`

### 3. `inspect-excel.ts`
Inspecte la structure brute d'un fichier Excel.

```bash
npx tsx scripts/inspect-excel.ts
```

**Résultat** :
- Affiche les 30 premières lignes du fichier
- Génère `excel-inspection.json` avec tous les détails

### 4. `test-vl-mapping.ts`
Teste le mapping des colonnes.

```bash
npx tsx scripts/test-vl-mapping.ts
```

**Résultat** :
- Affiche les index des colonnes importantes (VL, AN, performances)

---

## Tests End-to-End

### Test Complet du Système (après déploiement)

```bash
# 1. Tester le cron manuellement
curl -X GET http://localhost:3000/api/cron/sync-opcvm-performance \
  -H "Authorization: Bearer your_cron_secret"

# 2. Récupérer l'historique d'un fonds
curl "http://localhost:3000/api/funds/{fund-id}/performance-history?from=2024-01-01"

# 3. Comparer plusieurs fonds
curl "http://localhost:3000/api/funds/performance-history?ids=uuid1,uuid2&metric=perf_ytd"

# 4. Lancer un backfill
curl -X POST http://localhost:3000/api/admin/backfill-opcvm-history \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2024-10-01", "endDate": "2024-10-22", "type": "quotidien"}'
```

---

## Dépendances Requises

- `tsx` (déjà installé via npx)
- `xlsx` (installé)
- Node.js 20+

---

## Notes

Tous les scripts peuvent être exécutés sans configuration supplémentaire, même sans base de données connectée (pour les tests de parsing uniquement).
