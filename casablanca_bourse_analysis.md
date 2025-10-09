# Analyse du site Bourse de Casablanca

## Résumé

Le site https://www.casablanca-bourse.com est **scrapable** et utilise des APIs JSON bien structurées.

---

## 1. Politique de scraping

✅ **AUTORISÉ** - Le fichier `robots.txt` indique `Allow: /` pour tous les user-agents.

```
User-agent: *
Allow: /
```

---

## 2. Architecture technique

- **Framework** : Next.js (React SSR)
- **Format de données** : JSON:API (standard RESTful)
- **Rendu** : Hybride (SSR + Client-side hydration)

---

## 3. APIs identifiées

### 3.1 API Cotation de l'indice MASI
```
GET /api/proxy/fr/api/bourse/dashboard/index_cotation/512335
```

**Données retournées** :
- Capitalisation boursière
- Valeur de l'indice
- Diviseur
- Plus haut/Plus bas
- Variation
- Volume

### 3.2 API Ticker (données en temps réel)
```
GET /api/proxy/fr/api/bourse/dashboard/ticker?marche=59&class[0]=25
```

**Données retournées** :
- Liste des valeurs en direct
- Cours actuels
- Variations
- Volumes

### 3.3 API Index Watch (historique intraday)
```
GET /api/proxy/fr/api/bourse_data/index_watch
```

**Paramètres** :
- `fields[index_watch]` : drupal_internal__id, transactTime, indexValue
- `filter[seance][condition][value]` : Date (format: 2025-10-08)
- `filter[index][condition][value]` : Code indice (ex: MASI)
- `page[offset]` : 0
- `page[limit]` : 250

**Données retournées** :
- Données tick-by-tick de l'indice
- Horodatage
- Valeur de l'indice

### 3.4 API Next.js Data (données de page complètes)
```
GET /_next/data/uwlP8zo7fj-u9phPebGR5/fr/live-market/indices/MASI.json
```

---

## 4. Structure des données

### Tableau 1 : Cotation
| En-tête | Description |
|---------|-------------|
| Valeur | Valeur actuelle de l'indice |
| Veille | Valeur de clôture précédente |
| Variation % | Variation en pourcentage |
| Plus haut | Plus haut de la séance |
| Plus bas | Plus bas de la séance |
| Variation 31/12 | Performance depuis le début d'année |

### Tableau 2 : Composition
| En-tête | Description |
|---------|-------------|
| Instrument | Nom de la société |
| Cours (MAD) | Cours actuel en Dirhams |
| Cours Veille | Cours de clôture précédent |
| Variation | Variation en % |
| Volume | Volume échangé en MAD |
| Quantité échangée | Nombre de titres échangés |

**Exemples de sociétés trouvées** :
- AFMA
- AFRIC INDUSTRIES SA
- AFRIQUIA GAZ
- AGMA
- AKDITAL
- ALLIANCES

---

## 5. Approches de scraping recommandées

### Option 1 : Appel direct aux APIs (⭐ RECOMMANDÉ)
**Avantages** :
- ✅ Plus rapide et léger
- ✅ Données structurées en JSON
- ✅ Pas besoin de navigateur headless
- ✅ Moins de ressources CPU/mémoire

**Inconvénients** :
- ❌ Les URLs des APIs peuvent changer
- ❌ Nécessite de comprendre les paramètres de filtrage

**Code exemple** :
```javascript
const axios = require('axios');

// Récupérer la cotation de l'indice MASI
async function getMASIQuote() {
  const response = await axios.get(
    'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse/dashboard/index_cotation/512335',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }
  );
  return response.data;
}

// Récupérer les données intraday
async function getMASIIntraday(date = new Date().toISOString().split('T')[0]) {
  const params = new URLSearchParams({
    'fields[index_watch]': 'drupal_internal__id,transactTime,indexValue',
    'filter[seance][condition][path]': 'transactTime',
    'filter[seance][condition][operator]': 'STARTS_WITH',
    'filter[seance][condition][value]': date,
    'filter[index][condition][path]': 'indexCode.field_code',
    'filter[index][condition][operator]': '=',
    'filter[index][condition][value]': 'MASI',
    'page[offset]': '0',
    'page[limit]': '250'
  });

  const response = await axios.get(
    `https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data/index_watch?${params}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    }
  );
  return response.data;
}
```

### Option 2 : Scraping HTML avec Puppeteer
**Avantages** :
- ✅ Plus robuste aux changements d'API
- ✅ Récupère exactement ce que l'utilisateur voit

**Inconvénients** :
- ❌ Plus lent (lance un navigateur)
- ❌ Plus de ressources requises
- ❌ Données non structurées (parsing HTML)

**Code exemple** :
```javascript
const puppeteer = require('puppeteer');

async function scrapeWithPuppeteer() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--ignore-certificate-errors']
  });

  const page = await browser.newPage();
  await page.goto('https://www.casablanca-bourse.com/fr/live-market/indices/MASI', {
    waitUntil: 'networkidle2'
  });

  const data = await page.evaluate(() => {
    const tables = [];
    document.querySelectorAll('table').forEach(table => {
      const headers = Array.from(table.querySelectorAll('thead th'))
        .map(th => th.textContent.trim());
      const rows = Array.from(table.querySelectorAll('tbody tr'))
        .map(tr => Array.from(tr.querySelectorAll('td'))
          .map(td => td.textContent.trim()));
      tables.push({ headers, rows });
    });
    return tables;
  });

  await browser.close();
  return data;
}
```

### Option 3 : Scraping HTML avec Cheerio (HTTP simple)
**Avantages** :
- ✅ Très léger
- ✅ Rapide

**Inconvénients** :
- ❌ Ne fonctionne PAS avec ce site (données chargées en JavaScript)
- ❌ HTML initial ne contient que des placeholders

---

## 6. Recommandation finale

### 🏆 Approche recommandée : **Appel direct aux APIs**

**Pourquoi ?**
1. Le site expose des APIs JSON bien structurées
2. Format JSON:API standard
3. Beaucoup plus rapide qu'un navigateur headless
4. Moins de ressources système requises
5. Données déjà structurées

**Plan d'implémentation** :
1. Utiliser `axios` ou `fetch` pour appeler les APIs
2. Implémenter une gestion du cache pour éviter les appels répétés
3. Respecter un rate limiting (ex: max 1 requête/seconde)
4. Gérer les erreurs SSL avec `rejectUnauthorized: false`
5. Ajouter un User-Agent approprié dans les headers

---

## 7. Points d'attention

### Légalité et éthique
- ✅ Le `robots.txt` autorise le scraping
- ⚠️ Vérifiez les conditions d'utilisation du site
- ⚠️ Respectez un rate limiting raisonnable
- ⚠️ Identifiez votre bot avec un User-Agent approprié

### Technique
- ⚠️ Le site utilise des certificats SSL auto-signés (erreur SSL)
- ⚠️ Les IDs des APIs peuvent changer (ex: `uwlP8zo7fj-u9phPebGR5`)
- ⚠️ Les données sont en différé de 15 minutes (sauf les indices)
- ⚠️ Le site est fermé en dehors des heures de marché

---

## 8. Exemple de données récupérées

Voici un échantillon des données disponibles :

**Composition de l'indice MASI** :
| Instrument | Cours | Cours Veille | Variation | Volume | Quantité |
|------------|-------|--------------|-----------|---------|----------|
| AFMA | 1 335,00 | 1 335,00 | 0,00 % | - | - |
| AFRIC INDUSTRIES SA | 334,50 | 334,50 | 0,00 % | - | - |
| AFRIQUIA GAZ | 4 100,00 | 4 100,00 | 0,00 % | 270 601,00 | 66 |
| AGMA | 6 455,00 | 6 455,00 | 0,00 % | - | - |
| AKDITAL | 1 325,00 | 1 342,00 | -1,27 % | 32 137 827,00 | 24 124 |
| ALLIANCES | 527,00 | 525,00 | 0,38 % | - | - |

---

## Prochaines étapes suggérées

1. Créer un module de scraping avec appels API directs
2. Implémenter un système de cache
3. Ajouter une gestion d'erreurs robuste
4. Stocker les données dans votre base de données Supabase
5. Créer un cron job pour récupérer les données périodiquement
6. Implémenter un système de notification en cas d'erreur
