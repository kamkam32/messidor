# 📊 Configuration du Cron Job Bourse

Ce document explique comment configurer le système de collecte automatique des données de la Bourse de Casablanca.

## 🎯 Objectif

Scraper automatiquement les données de la bourse **chaque jour à 18h** (lundi-vendredi) et les sauvegarder dans Supabase pour construire un historique long terme.

---

## 🔧 Configuration

### 1. Variables d'Environnement

Ajoutez ces variables à votre projet Vercel :

```bash
# Déjà configurées (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NOUVELLE variable à ajouter pour le cron job
CRON_SECRET=your-random-secret-token-here
```

#### Génération du CRON_SECRET

Pour générer un token sécurisé, utilisez :

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OU en ligne de commande
openssl rand -hex 32

# OU sur macOS/Linux
uuidgen
```

**Important** : Ce token doit être gardé secret. Il authentifie les requêtes du cron job.

---

### 2. Migration Supabase

Appliquez la migration pour créer la table `bourse_history` :

```bash
# Localement (si vous utilisez Supabase CLI)
supabase migration up

# OU manuellement via le dashboard Supabase
# Exécutez le contenu de: supabase/migrations/004_bourse_history.sql
```

La table créée :
- `id` : UUID unique
- `date` : Date de trading
- `scrape_timestamp` : Quand les données ont été récupérées
- `data_type` : Type de données (`quote`, `intraday`, `composition`)
- `index_code` : Code de l'indice (`MASI`, `MADEX`, etc.)
- `data` : Données JSON
- `created_at` / `updated_at` : Timestamps

**Indexes créés pour performance** :
- Sur `date` (DESC)
- Sur `index_code`
- Sur `data_type`
- Sur `scrape_timestamp`
- GIN index sur le champ `data` (JSONB)

---

### 3. Déploiement Vercel

Le fichier `vercel.json` configure le cron job :

```json
{
  "crons": [
    {
      "path": "/api/cron/save-bourse",
      "schedule": "0 18 * * 1-5"
    }
  ]
}
```

**Schedule expliqué** : `0 18 * * 1-5`
- `0` : Minute 0
- `18` : Heure 18h (6 PM)
- `*` : Tous les jours du mois
- `*` : Tous les mois
- `1-5` : Lundi à Vendredi uniquement

**Fuseau horaire** : UTC par défaut
- Pour avoir 18h heure de Paris (UTC+1/+2), ajustez si nécessaire
- Pendant l'été (UTC+2) : `0 16 * * 1-5` = 18h Paris
- Pendant l'hiver (UTC+1) : `0 17 * * 1-5` = 18h Paris

---

### 4. Configuration dans Vercel Dashboard

1. **Ajoutez les variables d'environnement** :
   - Allez dans Settings > Environment Variables
   - Ajoutez `CRON_SECRET` avec votre token généré
   - Vérifiez que `SUPABASE_SERVICE_ROLE_KEY` est présente

2. **Déployez** :
   ```bash
   git add .
   git commit -m "Add bourse cron job"
   git push
   ```

3. **Vérifiez le cron dans Vercel** :
   - Allez dans Settings > Cron Jobs
   - Vous devriez voir `/api/cron/save-bourse` listé
   - Status: Active

---

## 🚀 Utilisation

### Test Manuel

Pour tester le cron job manuellement sans attendre 18h :

```bash
curl -X GET https://your-app.vercel.app/api/cron/save-bourse \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Réponse attendue :
```json
{
  "success": true,
  "date": "2025-10-09",
  "saved": {
    "quote": true,
    "intraday": true,
    "composition": true
  },
  "errors": [],
  "timestamp": "2025-10-09T18:00:00.000Z"
}
```

### Vérifier les Logs

Dans Vercel Dashboard :
1. Allez dans Deployments
2. Cliquez sur le dernier déploiement
3. Allez dans Functions
4. Cliquez sur `/api/cron/save-bourse`
5. Consultez les logs

Vous verrez :
```
✅ Cron job authentifié - Début de la collecte des données
📊 Récupération de la cotation MASI...
✅ Quote sauvegardé
📈 Récupération des données intraday MASI...
✅ Intraday sauvegardé (523 points)
📋 Récupération de la composition MASI...
✅ Composition sauvegardée (78 valeurs)
```

---

## 📊 Données Collectées

Chaque jour, 3 types de données sont sauvegardées :

### 1. Quote (Cotation)
```json
{
  "data_type": "quote",
  "index_code": "MASI",
  "data": {
    "indexValue": "14256.38",
    "indexVariation": "-42.15",
    "variationPercent": "-0.29",
    "openingValue": "14298.53",
    "highValue": "14305.20",
    "lowValue": "14245.67",
    "closingValue": "14256.38",
    "volume": "1234567890",
    "lastUpdate": "2025-10-09T15:30:00"
  }
}
```

### 2. Intraday (Tick par tick)
```json
{
  "data_type": "intraday",
  "index_code": "MASI",
  "data": {
    "count": 523,
    "points": [
      {
        "transactTime": "2025-10-09T09:00:00",
        "indexValue": "14298.53"
      },
      ...
    ]
  }
}
```

### 3. Composition (Valeurs de l'indice)
```json
{
  "data_type": "composition",
  "index_code": "MASI",
  "data": {
    "count": 78,
    "stocks": [
      {
        "instrument": "ATTIJARIWAFA BANK",
        "lastPrice": "542.00",
        "variationPercent": "+0.37",
        "volume": "123456"
      },
      ...
    ]
  }
}
```

---

## 🔍 Requêtes SQL Utiles

### Récupérer les données d'une date
```sql
SELECT *
FROM bourse_history
WHERE date = '2025-10-09'
  AND index_code = 'MASI';
```

### Récupérer l'historique des cotations
```sql
SELECT
  date,
  (data->'closingValue')::text as closing_value,
  (data->'variationPercent')::text as variation
FROM bourse_history
WHERE data_type = 'quote'
  AND index_code = 'MASI'
ORDER BY date DESC
LIMIT 30;
```

### Statistiques de collecte
```sql
SELECT
  date,
  COUNT(*) as records_count,
  COUNT(CASE WHEN data_type = 'quote' THEN 1 END) as has_quote,
  COUNT(CASE WHEN data_type = 'intraday' THEN 1 END) as has_intraday,
  COUNT(CASE WHEN data_type = 'composition' THEN 1 END) as has_composition
FROM bourse_history
WHERE index_code = 'MASI'
GROUP BY date
ORDER BY date DESC;
```

### Vérifier les données intraday
```sql
SELECT
  date,
  (data->'count')::int as point_count,
  scrape_timestamp
FROM bourse_history
WHERE data_type = 'intraday'
  AND index_code = 'MASI'
ORDER BY date DESC
LIMIT 10;
```

---

## ⚠️ Limitations et Notes

### Limitations Vercel Free Tier
- **100 exécutions/jour** : Largement suffisant (1 exécution/jour)
- **60s timeout** : Suffisant (scraping prend ~10-30s)
- **Durée d'exécution** : Comptée dans les 100 GB-heures gratuits

### Jours Fériés
Le cron s'exécute lundi-vendredi, mais :
- Les jours fériés marocains n'auront pas de données
- Le scraper retournera des erreurs ou données vides
- Considéré comme normal (pas d'alerte nécessaire)

### Duplicate Prevention
La table a une contrainte `UNIQUE(date, data_type, index_code)` :
- Les exécutions multiples le même jour ne créent pas de doublons
- Utilise `UPSERT` pour mettre à jour si nécessaire

### Monitoring
Vérifier régulièrement :
1. Les logs Vercel pour erreurs
2. La table Supabase pour données manquantes
3. Le status du cron job dans Vercel

---

## 🔮 Évolutions Futures

### Multi-Indices
Modifier le cron pour collecter plusieurs indices :
```typescript
const INDICES = ['MASI', 'MADEX', 'MSI20', 'FTSE', 'MASI ESG'];

for (const indexCode of INDICES) {
  const data = await getIndexData(indexCode);
  await saveToSupabase(indexCode, data);
}
```

### Notifications
Ajouter des alertes en cas d'échec :
- Email via Resend
- Webhook vers Slack/Discord
- Notifications push

### Retry Logic
Implémenter des tentatives en cas d'échec :
```typescript
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    await scrapeAndSave();
    break;
  } catch (error) {
    if (i === maxRetries - 1) throw error;
    await sleep(5000 * (i + 1)); // Exponential backoff
  }
}
```

---

## 🆘 Troubleshooting

### Le cron ne s'exécute pas
- ✅ Vérifiez que `vercel.json` est bien déployé
- ✅ Vérifiez dans Vercel Dashboard > Settings > Cron Jobs
- ✅ Le cron peut prendre quelques minutes après le déploiement pour être actif

### Erreur 401 Unauthorized
- ✅ Vérifiez que `CRON_SECRET` est configuré dans Vercel
- ✅ Vercel ajoute automatiquement le header `Authorization: Bearer <CRON_SECRET>`
- ✅ Pas besoin de le gérer manuellement

### Erreur de connexion Supabase
- ✅ Vérifiez `SUPABASE_SERVICE_ROLE_KEY` (pas l'anon key!)
- ✅ Vérifiez que les Row Level Security policies autorisent `service_role`

### Timeout (>60s)
- ✅ Optimisez le scraping (parallélisation, pagination)
- ✅ Considérez de sauvegarder seulement quote + intraday (skip composition si trop long)
- ✅ Upgrader vers Vercel Pro si nécessaire (300s timeout)

---

## 📚 Ressources

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru/)
- [Supabase Service Role](https://supabase.com/docs/guides/api/api-keys)

---

**Date de création** : 09/10/2025
**Auteur** : Claude Code
**Version** : 1.0
