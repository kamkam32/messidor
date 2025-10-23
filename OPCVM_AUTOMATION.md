# 🤖 Automatisation OPCVM - Documentation Complète

## 📋 Vue d'ensemble

Système d'automatisation complet pour télécharger, parser et stocker les performances quotidiennes des fonds OPCVM depuis ASFIM.

### ✨ Fonctionnalités

- ✅ **Téléchargement automatique** quotidien depuis ASFIM
- ✅ **Parsing intelligent** des fichiers Excel (quotidiens et hebdomadaires)
- ✅ **Archivage** des fichiers dans Supabase Storage
- ✅ **Historisation** complète des performances dans PostgreSQL
- ✅ **API REST** pour récupérer les données historiques
- ✅ **Backfill** rétroactif sur n'importe quelle période

---

## 🗄️ Architecture

### Tables Supabase

#### `fund_performance_history`
Stocke l'historique quotidien des performances de chaque fonds.

```sql
- fund_id (UUID, FK vers funds)
- date (DATE)
- nav (DECIMAL) - Valeur Liquidative
- asset_value (DECIMAL) - Actif Net
- perf_1d, perf_1w, perf_1m, perf_3m, perf_6m (DECIMAL)
- perf_ytd, perf_1y, perf_2y, perf_3y, perf_5y (DECIMAL)
- source_file (TEXT)
- created_at, updated_at (TIMESTAMPTZ)
```

**Index** : `(fund_id, date)` unique, index sur date DESC

**Vue** : `latest_fund_performance` - Dernière performance de chaque fonds

#### `opcvm-archives` (Storage Bucket)
Bucket Supabase Storage pour archiver les fichiers Excel d'origine.

Structure : `{year}/{filename}.xlsx`

---

## 🔄 Cron Jobs

### Synchronisation Quotidienne

**Endpoint** : `/api/cron/sync-opcvm-performance`
**Schedule** : Tous les jours à 19h00 (`0 19 * * *`)
**Authentification** : `Authorization: Bearer {CRON_SECRET}`

#### Processus

1. Télécharge le fichier Excel du jour depuis ASFIM
2. Archive le fichier dans Supabase Storage
3. Parse le fichier Excel
4. Matche les fonds avec la base de données (par ISIN, code ou nom)
5. Insère/update dans `fund_performance_history`
6. Met à jour la table `funds` avec les dernières valeurs

#### Réponse

```json
{
  "success": true,
  "date": "2025-10-22",
  "fileName": "Tableau des performances quotidiennes au 22-10-2025.xlsx",
  "totalFunds": 286,
  "matched": 278,
  "inserted": 278,
  "updated": 278,
  "notMatched": ["Fonds XYZ"],
  "errors": [],
  "timestamp": "2025-10-22T19:05:32.000Z"
}
```

---

## 🔧 APIs

### 1. Récupérer l'historique d'un fonds

**GET** `/api/funds/[id]/performance-history`

#### Query Parameters

- `from` (optional): Date de début (YYYY-MM-DD) - défaut : 30 jours avant
- `to` (optional): Date de fin (YYYY-MM-DD) - défaut : aujourd'hui
- `metric` (optional): Métrique spécifique (`nav`, `perf_1m`, `perf_ytd`, etc.)

#### Exemples

```bash
# Derniers 30 jours (toutes les métriques)
GET /api/funds/123e4567-e89b-12d3-a456-426614174000/performance-history

# Période personnalisée
GET /api/funds/123e4567-e89b-12d3-a456-426614174000/performance-history?from=2024-01-01&to=2024-12-31

# Métrique spécifique
GET /api/funds/123e4567-e89b-12d3-a456-426614174000/performance-history?metric=perf_ytd&from=2024-01-01
```

#### Réponse

```json
{
  "fundId": "123e4567-e89b-12d3-a456-426614174000",
  "period": {
    "from": "2024-10-01",
    "to": "2025-10-22"
  },
  "dataPoints": 252,
  "data": [
    {
      "date": "2024-10-01",
      "nav": 121543.23,
      "asset_value": 158234234.45,
      "perf_1d": 0.02,
      "perf_ytd": 1.25,
      ...
    }
  ]
}
```

### 2. Récupérer l'historique de plusieurs fonds

**GET** `/api/funds/performance-history`

#### Query Parameters

- `ids` (**requis**): IDs des fonds séparés par des virgules
- `from`, `to`, `metric`: Mêmes que ci-dessus

#### Exemple

```bash
GET /api/funds/performance-history?ids=uuid1,uuid2,uuid3&metric=perf_ytd&from=2024-01-01&to=2024-12-31
```

#### Réponse

```json
{
  "period": { "from": "2024-01-01", "to": "2024-12-31" },
  "metric": "perf_ytd",
  "funds": [
    {
      "fundId": "uuid1",
      "fundName": "BMCI COSMOS",
      "fundCode": "3005",
      "dataPoints": 252,
      "data": [
        { "date": "2024-01-01", "value": 15.23 },
        { "date": "2024-01-02", "value": 15.45 }
      ]
    }
  ]
}
```

### 3. Backfill Historique (Admin)

**POST** `/api/admin/backfill-opcvm-history`
**Authentification** : `Authorization: Bearer {CRON_SECRET}`

#### Body

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "type": "quotidien"  // ou "hebdomadaire"
}
```

#### Processus

1. Télécharge tous les fichiers Excel de la période depuis ASFIM
2. Archive chaque fichier dans Storage
3. Parse et insère les données dans `fund_performance_history`
4. Met à jour la table `funds` avec les dernières valeurs

#### Exemple

```bash
curl -X POST https://votre-domaine.com/api/admin/backfill-opcvm-history \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "type": "quotidien"
  }'
```

#### Réponse

```json
{
  "success": true,
  "period": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "type": "quotidien"
  },
  "filesDownloaded": 252,
  "filesProcessed": 252,
  "totalFundsProcessed": 71832,
  "totalInserted": 68450,
  "totalUpdated": 286,
  "fileDetails": [
    {
      "fileName": "Tableau des performances quotidiennes au 01-01-2024.xlsx",
      "date": "2024-01-01",
      "fundsProcessed": 285,
      "matched": 278,
      "notMatched": ["Fonds XYZ"]
    }
  ],
  "errors": []
}
```

---

## 🚀 Déploiement

### 1. Appliquer les migrations Supabase

```bash
# Dans le Supabase Dashboard > SQL Editor, exécuter dans l'ordre :

1. supabase/migrations/005_fund_performance_history.sql
2. supabase/migrations/006_storage_setup.sql
```

### 2. Variables d'environnement

Ajouter dans `.env.local` (et Vercel) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CRON_SECRET=your_random_secret_token
```

### 3. Déployer sur Vercel

```bash
git add .
git commit -m "feat: add OPCVM automation system"
git push
```

Le cron job sera automatiquement activé via `vercel.json`.

---

## 📊 Utilisation - Exemples de Graphiques

### Graphique de Performance YTD

```typescript
import { useEffect, useState } from 'react';

export function PerformanceChart({ fundId }: { fundId: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`/api/funds/${fundId}/performance-history?metric=perf_ytd&from=2024-01-01`)
      .then(res => res.json())
      .then(result => setData(result.data));
  }, [fundId]);

  return (
    <LineChart data={data}>
      <Line dataKey="value" />
      <XAxis dataKey="date" />
      <YAxis />
    </LineChart>
  );
}
```

### Comparaison de Plusieurs Fonds

```typescript
export function ComparisonChart({ fundIds }: { fundIds: string[] }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const ids = fundIds.join(',');
    fetch(`/api/funds/performance-history?ids=${ids}&metric=perf_ytd&from=2024-01-01`)
      .then(res => res.json())
      .then(result => setData(result.funds));
  }, [fundIds]);

  return (
    <LineChart>
      {data.map(fund => (
        <Line
          key={fund.fundId}
          data={fund.data}
          dataKey="value"
          name={fund.fundName}
        />
      ))}
    </LineChart>
  );
}
```

---

## 🛠️ Maintenance

### Vérifier les Logs du Cron

Dans Vercel Dashboard :
1. Aller dans "Deployments"
2. Cliquer sur le dernier déploiement
3. Onglet "Functions" > Chercher `sync-opcvm-performance`

### Relancer Manuellement le Cron

```bash
curl -X GET https://votre-domaine.com/api/cron/sync-opcvm-performance \
  -H "Authorization: Bearer your_cron_secret"
```

### Backfill les 12 Derniers Mois

```bash
curl -X POST https://votre-domaine.com/api/admin/backfill-opcvm-history \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "type": "quotidien"
  }'
```

### Ajouter un Nouveau Fonds

Si un fonds apparaît dans les fichiers Excel mais n'est pas dans votre DB :

1. Le cron va le logger dans `notMatched`
2. Ajouter manuellement le fonds dans la table `funds`
3. Au prochain cron, il sera automatiquement matché et historisé

---

## 📝 Format des Fichiers ASFIM

### URL Pattern

**Quotidien** :
```
https://asfim.ma/static/tableau-des-performances/Tableau%20des%20performances%20quotidiennes%20au%20DD-MM-YYYY.xlsx
```

**Hebdomadaire** :
```
https://asfim.ma/static/tableau-des-performances/Tableau%20des%20Performances%20Hebdomadaires%20au%20DD-MM-YYYY.xlsx
```

### Structure Excel

- **Ligne 1** : Titre
- **Ligne 2** : En-têtes (CODE ISIN, Code Maroclear, OPCVM, VL, AN, YTD, etc.)
- **Lignes suivantes** : Données des fonds

### Colonnes Parsées

| Colonne Excel | Champ DB | Type |
|---------------|----------|------|
| CODE ISIN | isin_code | string |
| Code Maroclear | morocco_code | string |
| OPCVM | name | string |
| VL | nav | decimal |
| AN | asset_value | decimal |
| YTD | perf_ytd | decimal |
| 1 jour | perf_1d | decimal |
| 1 semaine | perf_1w | decimal |
| 1 mois | perf_1m | decimal |
| 3 mois | perf_3m | decimal |
| 6 mois | perf_6m | decimal |
| 1 an | perf_1y | decimal |
| 2 ans | perf_2y | decimal |
| 3 ans | perf_3y | decimal |
| 5 ans | perf_5y | decimal |

---

## 🐛 Troubleshooting

### Le cron ne s'exécute pas

1. Vérifier que `CRON_SECRET` est défini dans Vercel
2. Vérifier les logs dans Vercel Dashboard
3. Vérifier que `vercel.json` a bien le cron configuré

### Fichiers Excel non trouvés

ASFIM peut publier les fichiers avec un délai. Le cron essaie :
1. Le fichier du jour
2. Le fichier d'hier

Si toujours aucun fichier, il retourne une erreur 404.

### Fonds non matchés

Le système essaie de matcher dans cet ordre :
1. Par code ISIN
2. Par code Maroclear
3. Par nom (fuzzy match)

Si un fonds n'est pas matché, vérifier :
- Que le fonds existe dans la table `funds`
- Que le code ISIN ou nom correspond exactement

### Performances nulles

Certains fonds peuvent avoir des performances NULL dans les fichiers ASFIM (nouveaux fonds, fonds inactifs, etc.). C'est normal.

---

## 📈 Métriques de Production

- **286 fonds** OPCVM trackés
- **Cron quotidien** à 19h (après publication ASFIM)
- **~278 fonds matchés** par jour (~97% de succès)
- **252 jours ouvrés** par an
- **~70,000 enregistrements** par an dans `fund_performance_history`

---

## 🔐 Sécurité

- ✅ Authentification par token secret (`CRON_SECRET`)
- ✅ RLS activé sur toutes les tables
- ✅ Service role key pour bypass RLS (cron uniquement)
- ✅ Bucket Storage privé (lecture publique, écriture authentifiée)
- ✅ Validation des paramètres d'entrée
- ✅ Rate limiting via Vercel

---

## 📚 Ressources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [ASFIM Publications](https://www.asfim.ma/publications/tableaux-des-performances/)

---

**Développé pour Messidor Patrimoine** 🏦
