# 📈 Graphiques Historiques - Guide Complet

## ✅ Ce qui a été fait

### 1. **Page de détails avec graphique**
**Fichier** : `app/dashboard/opcvm/[id]/page.tsx`

**Fonctionnalités** :
- ✅ Graphique interactif (recharts) de l'évolution de la VL ou des performances
- ✅ Sélection de période : 1M, 3M, 6M, 1A, 3A
- ✅ Sélection de métrique : VL (Valeur Liquidative) ou Performance YTD
- ✅ Stats principales : VL, Perf YTD, Perf 1 an, Actif Net
- ✅ Onglets : Informations, Performances, Frais
- ✅ Responsive mobile/desktop

### 2. **Bouton "Voir les détails"**
Sur chaque carte de fonds → Redirige vers `/dashboard/opcvm/[id]`

---

## 🔄 Comment remplir l'historique (Backfill)

### Option 1 : Via l'API (Automatique)

**Backfill des 10 derniers mois** :
```bash
curl -X POST http://localhost:3000/api/admin/backfill-opcvm-history \
  -H "Authorization: Bearer votre_cron_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2025-10-22",
    "type": "quotidien"
  }'
```

**Ce que ça fait** :
1. Télécharge tous les fichiers Excel quotidiens depuis ASFIM (01/01/2024 → 22/10/2025)
2. Parse chaque fichier (~294 fichiers)
3. Insère dans `fund_performance_history` (~180,000 enregistrements)
4. Archive les fichiers dans Supabase Storage

**Durée estimée** : 30-60 minutes

### Option 2 : Via script local (Plus rapide)

Si vous avez déjà téléchargé des fichiers Excel historiques localement :

```bash
# Créer un script qui boucle sur vos fichiers locaux
npx tsx scripts/import-all-funds-from-excel.ts
```

---

## 📊 Utilisation des Graphiques

### 1. Navigation

Depuis la liste des fonds → Cliquer sur **"Voir les détails"** sur n'importe quel fonds

URL : `http://localhost:3000/dashboard/opcvm/{fund-id}`

### 2. Graphique Interactif

**Boutons de période** :
- **1M** : 30 derniers jours
- **3M** : 90 derniers jours
- **6M** : 180 derniers jours
- **1Y** : 365 derniers jours
- **3Y** : 3 dernières années

**Boutons de métrique** :
- **VL** : Affiche l'évolution de la Valeur Liquidative (en MAD)
- **Perf YTD** : Affiche la performance depuis le début de l'année (en %)

**Tooltip interactif** :
- Survolez le graphique pour voir les valeurs exactes à chaque date

---

## 🎨 Exemples de Graphiques Possibles

### 1. Évolution de la VL
```
Axe X : Dates (Jan → Oct)
Axe Y : VL en MAD (ex: 1189.40 → 1250.00)
Ligne : Évolution quotidienne de la valeur
```

### 2. Performance YTD
```
Axe X : Dates
Axe Y : Performance en % (ex: +3.98% → +5.23%)
Ligne : Évolution de la performance depuis début d'année
```

### 3. Comparaison multi-fonds (Phase 2)
```
Ligne 1 : BMCI COSMOS
Ligne 2 : CDG IZDIHAR
Ligne 3 : MAROC VALEURS
→ Comparer les performances de 2-5 fonds sur la même période
```

---

## 🗄️ Structure des Données

### Table `fund_performance_history`

```sql
CREATE TABLE fund_performance_history (
  id UUID PRIMARY KEY,
  fund_id UUID REFERENCES funds(id),
  date DATE NOT NULL,

  -- Valeurs
  nav DECIMAL(15, 2),           -- Valeur Liquidative
  asset_value DECIMAL(20, 2),   -- Actif Net

  -- Performances
  perf_1d DECIMAL(10, 4),        -- 1 jour
  perf_1w DECIMAL(10, 4),        -- 1 semaine
  perf_1m DECIMAL(10, 4),        -- 1 mois
  perf_3m DECIMAL(10, 4),        -- 3 mois
  perf_6m DECIMAL(10, 4),        -- 6 mois
  perf_ytd DECIMAL(10, 4),       -- YTD
  perf_1y DECIMAL(10, 4),        -- 1 an
  perf_2y DECIMAL(10, 4),        -- 2 ans
  perf_3y DECIMAL(10, 4),        -- 3 ans
  perf_5y DECIMAL(10, 4),        -- 5 ans

  source_file TEXT,              -- Nom du fichier Excel source
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,

  UNIQUE(fund_id, date)
);
```

### Exemple de requête

**Récupérer l'historique de la VL sur 1 an** :
```sql
SELECT date, nav, perf_ytd
FROM fund_performance_history
WHERE fund_id = 'uuid-du-fonds'
  AND date >= NOW() - INTERVAL '1 year'
ORDER BY date ASC;
```

**Calculer le rendement cumulé** :
```sql
SELECT
  date,
  nav,
  (nav - FIRST_VALUE(nav) OVER (ORDER BY date)) / FIRST_VALUE(nav) OVER (ORDER BY date) * 100 AS rendement_cumule
FROM fund_performance_history
WHERE fund_id = 'uuid-du-fonds'
  AND date >= '2024-01-01'
ORDER BY date ASC;
```

---

## 🚀 Améliorations Futures

### Phase 2 : Comparaison Multi-Fonds

Ajouter une page `/dashboard/opcvm/compare` :
- Sélectionner 2-5 fonds
- Graphique multi-lignes
- Tableau comparatif des performances
- Export PDF

**Route API** : `/api/funds/performance-history?ids=uuid1,uuid2,uuid3`

### Phase 3 : Indicateurs Avancés

Calculer et afficher :
- **Volatilité** : Écart-type des rendements quotidiens
- **Ratio de Sharpe** : (Rendement - Taux sans risque) / Volatilité
- **Drawdown maximum** : Plus grosse perte depuis le pic
- **Alpha / Beta** : Performance vs indice de référence

### Phase 4 : Alertes et Notifications

Permettre aux utilisateurs de définir des alertes :
- "M'alerter si BMCI COSMOS dépasse +15% YTD"
- "M'alerter si mon portefeuille baisse de -5%"
- "M'alerter chaque semaine avec un résumé"

---

## 🧪 Test

### 1. Vérifier qu'un fonds a de l'historique

```sql
-- Dans Supabase SQL Editor
SELECT COUNT(*) as nb_points, MIN(date), MAX(date)
FROM fund_performance_history
WHERE fund_id = (SELECT id FROM funds WHERE name = 'BMCI COSMOS' LIMIT 1);
```

Si `nb_points = 0` → Pas d'historique → Le graphique affichera "Aucun historique disponible"

### 2. Tester la page

1. Aller sur http://localhost:3000/dashboard/opcvm
2. Cliquer sur "Voir les détails" d'un fonds
3. La page de détails s'ouvre
4. Si historique dispo → Graphique s'affiche
5. Si pas d'historique → Message "Aucun historique disponible"

### 3. Tester le backfill

```bash
# Backfill du dernier mois seulement (pour tester)
curl -X POST http://localhost:3000/api/admin/backfill-opcvm-history \
  -H "Authorization: Bearer votre_cron_secret" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-09-01",
    "endDate": "2025-10-22",
    "type": "quotidien"
  }'
```

Durée : ~5 minutes pour ~30 fichiers

---

## 📊 Métriques Attendues

### Après backfill 1 an (2024-2025)

**Données stockées** :
- ~294 jours ouvrés × 611 fonds = **~180,000 enregistrements**
- Taille estimée : ~50 MB dans PostgreSQL
- ~294 fichiers Excel archivés : ~35 MB dans Storage

**Performance des requêtes** :
- Récupérer 1 an d'historique pour 1 fonds : **< 50ms**
- Récupérer 3 mois pour 5 fonds : **< 200ms**

---

## 🎯 Résumé

✅ **Page de détails créée** avec graphique interactif
✅ **API backfill prête** pour remplir l'historique
✅ **Bouton "Voir détails"** fonctionnel
✅ **Architecture scalable** (peut gérer des années d'historique)
✅ **Mobile responsive**

**Prochaine étape** :
1. Déployer les migrations 005-007 sur Supabase
2. Lancer le backfill pour remplir l'historique
3. Profiter des graphiques ! 🚀
