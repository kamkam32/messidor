# Configuration du Domaine GoDaddy

## 📋 Checklist de Configuration

### 1️⃣ Configuration GoDaddy → Vercel

#### Option A: Nameservers (RECOMMANDÉ)
- [ ] Aller sur [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Settings → Domains → Add Domain
- [ ] Entrer votre domaine
- [ ] Noter les nameservers Vercel (ns1.vercel-dns.com, ns2.vercel-dns.com)
- [ ] Aller sur [GoDaddy](https://www.godaddy.com)
- [ ] My Products → Domains → Votre domaine
- [ ] Nameservers → Change → Custom Nameservers
- [ ] Entrer les nameservers Vercel
- [ ] Sauvegarder
- [ ] Attendre 1-48h pour la propagation

#### Option B: Configuration DNS Manuelle
- [ ] Aller sur GoDaddy → DNS Management
- [ ] Ajouter enregistrement A: @ → 76.76.21.21
- [ ] Ajouter enregistrement CNAME: www → cname.vercel-dns.com
- [ ] Sauvegarder

---

### 2️⃣ Vérification de la Propagation

**Outils de test:**
- https://www.whatsmydns.net/
- https://dnschecker.org/

**Tester votre domaine:**
```
Entrez votre domaine et vérifiez que les serveurs DNS pointent vers Vercel
```

---

### 3️⃣ Remplacement des URLs dans le Code

**IMPORTANT:** Vous devez remplacer `VOTRE-DOMAINE.com` par votre vrai domaine dans ces fichiers:

#### Fichiers à modifier:

1. **app/layout.tsx** (ligne 20)
   ```typescript
   metadataBase: new URL('https://VOTRE-DOMAINE.com'),
   ```
   ↓
   ```typescript
   metadataBase: new URL('https://votredomaine.com'),
   ```

2. **app/robots.ts** (ligne 34)
   ```typescript
   sitemap: 'https://VOTRE-DOMAINE.com/sitemap.xml',
   ```

3. **app/sitemap.ts** (ligne 4)
   ```typescript
   const baseUrl = 'https://VOTRE-DOMAINE.com'
   ```

4. **components/StructuredData.tsx** (lignes 10, 11, 12, 76, 83, 106)
   - Toutes les URLs dans les schemas JSON

5. **app/layout.tsx** (ligne 38 - Open Graph)
   ```typescript
   url: 'https://VOTRE-DOMAINE.com',
   ```

6. **Layouts des pages dashboard:**
   - app/dashboard/simulateur/layout.tsx (lignes 10, 19)
   - app/dashboard/bourse/layout.tsx (lignes 10, 19)
   - app/dashboard/opcvm/layout.tsx (lignes 10, 19)
   - app/dashboard/opci/layout.tsx (lignes 10, 19)

---

### 4️⃣ Commande Rapide pour Remplacer

**Sous Windows PowerShell:**
```powershell
# Remplacer dans tous les fichiers (remplacez PAR_VOTRE_DOMAINE.com)
$domaine = "votredomaine.com"
Get-ChildItem -Recurse -File | ForEach-Object {
  (Get-Content $_.FullName) -replace 'VOTRE-DOMAINE\.com', $domaine | Set-Content $_.FullName
}
```

**Sous Linux/Mac:**
```bash
# Remplacer dans tous les fichiers (remplacez par votre domaine)
find . -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/VOTRE-DOMAINE\.com/votredomaine.com/g'
```

**Ou manuellement:**
Utilisez la fonction "Rechercher et remplacer" de votre éditeur (Ctrl+Shift+H dans VS Code):
- Rechercher: `VOTRE-DOMAINE.com`
- Remplacer par: `votredomaine.com`

---

### 5️⃣ Après Configuration

Une fois le domaine configuré et les URLs remplacées:

1. **Commit et Push:**
   ```bash
   git add .
   git commit -m "Configure custom domain"
   git push
   ```

2. **Vérifier le déploiement Vercel:**
   - Le site devrait se redéployer automatiquement
   - Vérifier que le SSL/HTTPS est activé (automatique après quelques minutes)

3. **Tester:**
   - Visitez votre domaine
   - Vérifiez les redirections www
   - Testez le SSL (https://)

---

### 6️⃣ Configuration Google Search Console

Après que le domaine fonctionne:

1. Aller sur https://search.google.com/search-console
2. Ajouter votre propriété (domaine)
3. Copier le code de vérification
4. L'ajouter dans `app/layout.tsx`:
   ```typescript
   verification: {
     google: 'VOTRE_CODE_ICI',
   }
   ```
5. Commit et push
6. Retourner sur Google Search Console et vérifier
7. Soumettre le sitemap: `https://votredomaine.com/sitemap.xml`

---

### 7️⃣ Configuration Google Analytics

1. Créer un compte GA4: https://analytics.google.com/
2. Créer une propriété
3. Copier le Measurement ID (G-XXXXXXXXXX)
4. Installer le package:
   ```bash
   npm install @next/third-parties
   ```
5. Ajouter dans `app/layout.tsx`:
   ```typescript
   import { GoogleAnalytics } from '@next/third-parties/google'

   // Dans le body:
   <GoogleAnalytics gaId="G-XXXXXXXXXX" />
   ```

---

## ✅ Vérification Finale

Après toutes les configurations:

- [ ] Le domaine pointe vers Vercel
- [ ] Le site est accessible via https://votredomaine.com
- [ ] Le SSL/HTTPS fonctionne (cadenas vert)
- [ ] Toutes les URLs sont remplacées dans le code
- [ ] Google Search Console est configuré
- [ ] Sitemap soumis
- [ ] Google Analytics (optionnel) configuré
- [ ] Vercel Analytics fonctionne
- [ ] Open Graph tags affichent le bon domaine

---

## 🚨 Problèmes Courants

### "Domain not verified"
- Attendre 24-48h pour la propagation DNS
- Vérifier les nameservers sur GoDaddy

### "SSL certificate pending"
- Normal, attendre 5-15 minutes après la configuration DNS
- Vercel génère automatiquement le certificat

### "404 Not Found"
- Vérifier que le projet est bien déployé sur Vercel
- Vérifier les enregistrements DNS

### "Mixed content warning"
- Vérifier que toutes les URLs en dur dans le code utilisent https://

---

## 📞 Support

- Vercel Documentation: https://vercel.com/docs/concepts/projects/domains
- GoDaddy Support: https://www.godaddy.com/help
- Next.js Documentation: https://nextjs.org/docs

---

**Quel est votre domaine GoDaddy?**
Notez-le ici pour référence: ___________________________
