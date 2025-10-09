# 📊 API Bourse de Casablanca - Découverte Complète

## ✅ Endpoints Fonctionnels

### 1. **Ticker (Données en temps réel)**
```
GET /api/proxy/fr/api/bourse/dashboard/ticker?marche=59&class[0]=25
```
✅ Fonctionne parfaitement
- Données en temps réel du marché
- Liste des valeurs actives

### 2. **Index History**
```
GET /api/proxy/fr/api/bourse_data/index_history
```
✅ Endpoint existe (paramètres à affiner)
- Potentiellement pour données historiques longues

### 3. **Bourse Indice (Métadonnées)**
```
GET /api/proxy/fr/api/node/bourse_indice
```
✅ Retourne 1 résultat
- Informations sur les indices disponibles

### 4. **Index Watch (Intraday)**
```
GET /api/proxy/fr/api/bourse_data/index_watch
```
✅ Fonctionne (avec paramètres)
- Données tick-by-tick

### 5. **Index Cotation**
```
GET /api/proxy/fr/api/bourse/dashboard/index_cotation/{id}
```
✅ Fonctionne
- IDs connus : 512335 (MASI), 512343 (MSI20)

---

## 📈 Indices Disponibles

| Indice | Code | Statut | Description |
|--------|------|--------|-------------|
| **MASI** | `MASI` | ✅ Complet | Moroccan All Shares Index (principal) |
| **MADEX** | `MADEX` | ✅ Disponible | Moroccan Most Active Shares Index |
| **MSI20** | `MSI20` | ✅ Complet | Moroccan Stock Index 20 |
| **MASI.20** | `MASI.20` | ✅ Disponible | MASI Top 20 |
| **FTSE** | `FTSE` | ✅ Disponible | FTSE CSE Morocco 15 |
| **MASI ESG** | `MASI ESG` | ✅ Disponible | MASI ESG (Environnemental, Social, Gouvernance) |
| **CFG 25** | `CFG 25` | ✅ Disponible | CFG 25 |
| **MASI MID AND SMALL CAP** | `MASI MID AND SMALL CAP` | ✅ Disponible | Moyennes et petites capitalisations |

---

## 🔧 Attributs Disponibles pour `index_watch`

Champs récupérables :
```javascript
{
  drupal_internal__id: "ID interne",
  transactTime: "2025-10-08T11:30:00",
  indexValue: "18862.9168"
}
```

---

## 📅 Limites Historiques

| Période | Disponibilité |
|---------|---------------|
| Aujourd'hui | ✅ Complet |
| Hier | ✅ Complet |
| J-2 à J-7 | ⚠️ À tester |
| > 7 jours | ❌ Non disponible via API temps réel |

**Note** : Pour l'historique long terme, l'endpoint `index_history` existe mais nécessite des paramètres spécifiques.

---

## 💡 APIs Appelées Automatiquement par le Site

Le site web appelle automatiquement ces APIs :

1. **Ticker** - Données en temps réel
   ```
   /api/proxy/fr/api/bourse/dashboard/ticker?marche=59&class[0]=25
   ```

2. **Index Cotation** - MASI
   ```
   /api/proxy/fr/api/bourse/dashboard/index_cotation/512335
   ```

3. **Index Watch** - Données intraday pour chaque indice
   ```
   /api/proxy/fr/api/bourse_data/index_watch?fields[index_watch]=...
   ```

4. **Index Cotation** - MASI.20
   ```
   /api/proxy/fr/api/bourse/dashboard/index_cotation/512343
   ```

---

## 🎯 Ce qu'on PEUT faire

### ✅ Récupérer en temps réel
- [x] Cotation de 8+ indices différents
- [x] Données intraday (aujourd'hui + hier)
- [x] Composition de l'indice (via Puppeteer)
- [x] Ticker du marché
- [x] Variations, volumes, quantités

### ✅ Créer un dashboard multi-indices
Possibilité de créer des vues pour :
- MASI (principal)
- MADEX (valeurs actives)
- MSI20 (top 20)
- MASI ESG (ESG)
- FTSE (international)

### ✅ Comparaisons
- Comparer les performances des différents indices
- Voir les divergences
- Analyser les tendances sectorielles

---

## 📊 IDs des Indices (pour API cotation)

| Indice | ID API |
|--------|--------|
| MASI | `512335` |
| MASI.20 | `512343` |
| Autres | À découvrir |

---

## 🚀 Recommandations d'Implémentation

### 1. Dashboard Multi-Indices
Créer une vue avec onglets pour :
- MASI (principal)
- MADEX
- MSI20
- FTSE
- MASI ESG

### 2. Comparateur d'Indices
Graphique superposé montrant :
- Évolution des 3-5 principaux indices
- Performance relative
- Divergences

### 3. Sauvegarde Quotidienne
- Scraper chaque soir à 18h
- Sauvegarder dans Supabase
- Construire historique propre

### 4. Alertes
- Notifications sur variations importantes
- Comparaison inter-indices
- Détection d'anomalies

---

## 📝 Exemples de Requêtes

### Récupérer MADEX intraday
```javascript
const params = new URLSearchParams({
  'fields[index_watch]': 'drupal_internal__id,transactTime,indexValue',
  'filter[index][condition][path]': 'indexCode.field_code',
  'filter[index][condition][operator]': '=',
  'filter[index][condition][value]': 'MADEX',
  'page[limit]': '1000',
});

const response = await axios.get(
  `https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_watch?${params}`,
  { httpsAgent }
);
```

### Récupérer MSI20 cotation
```javascript
const response = await axios.get(
  'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse/dashboard/index_cotation/512343',
  { httpsAgent }
);
```

---

## ⚠️ Limitations Identifiées

1. **Pas d'historique long terme** direct via API temps réel
2. **Pas de données par action individuelle** facilement
3. **Rate limiting** potentiel (à surveiller)
4. **Certificats SSL** auto-signés
5. **IDs des indices** pas tous connus

---

## 🔬 À Explorer Encore

- [ ] Paramètres exacts pour `index_history`
- [ ] IDs des autres indices pour API cotation
- [ ] Données de sociétés individuelles
- [ ] API pour secteurs
- [ ] Données fondamentales (P/E, dividendes, etc.)

---

## 🎁 Bonus : Code Multi-Indices

```typescript
const INDICES = {
  MASI: { code: 'MASI', id: 512335, name: 'MASI' },
  MADEX: { code: 'MADEX', id: null, name: 'MADEX' },
  MSI20: { code: 'MSI20', id: 512343, name: 'MSI 20' },
  FTSE: { code: 'FTSE', id: null, name: 'FTSE Morocco 15' },
  ESG: { code: 'MASI ESG', id: null, name: 'MASI ESG' },
};

async function getAllIndices() {
  const results = await Promise.all(
    Object.values(INDICES).map(async (index) => {
      const intraday = await getMASIIntraday(undefined, index.code);
      return { index: index.name, data: intraday };
    })
  );
  return results;
}
```

---

**Date de découverte** : 09/10/2025
**Statut** : Exploration complète effectuée ✅
