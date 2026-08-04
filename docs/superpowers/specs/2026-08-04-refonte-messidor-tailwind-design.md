# Refonte Messidor Patrimoine — Design & Spec

**Date:** 2026-08-04
**Branche:** `refonte-messidor-tailwind`
**Objectif:** Refonte complète du site (public + Espace Client), de-Chakra → Tailwind v4, calquée sur l'architecture Palm Estates. Objectifs forts : **SEO + GEO** et **machine à leads**. Suppression du scraping bourse (cause du crash Supabase).

## Contexte
- Repo `kamkam32/messidor`, Supabase `bjiwkxqjovdnheotagtr` (org Pro, nano, région Paris).
- L'ancien stack (Next 15 + **Chakra UI** + scraping bourse Puppeteer) est abandonné.
- Incident résolu : l'instance Supabase avait crashé (cron bourse 10 min + Puppeteer sur nano) → restart. Données intactes (funds 611, fund_performance_history 60900).
- ⚠️ À traiter hors-code : factures impayées (autre org) + activer backups.

## Décisions verrouillées
- **Stack cible :** Next 16 (App Router, `src/`) · React 19 · **Tailwind v4** (CSS-first `@theme`, pas de config JS) · TypeScript · `@supabase/ssr` · `motion` · `lucide-react` · `@vercel/analytics`. Fonts via `next/font`.
- **Périmètre :** site public **+ Espace Client** (portail patrimoine complet).
- **Données fonds :** conservées + sync quotidienne Excel ASFIM (légère, sans Puppeteer).
- **Scraping bourse :** supprimé intégralement.
- **Langue :** Français seul (structure prête pour i18n futur).
- **Identité :** éditorial premium « banque privée » — **Crème + Navy + Or**.

## Design system (tokens Tailwind v4, `src/app/globals.css`)
Palette Crème / Navy / Or (valeurs de départ, à affiner) :
```
--color-cream:       #F6F2EA   /* fond principal */
--color-cream-light: #FBF9F3
--color-cream-dark:  #EAE3D5
--color-navy:        #0E1A2B   /* texte principal / fonds sombres */
--color-navy-soft:   #35435A   /* texte secondaire */
--color-navy-mute:   #6B7789   /* captions */
--color-slate:       #C3C9D2   /* filet neutre par défaut */
--color-gold:        #B08A3E   /* accent */
--color-gold-light:  #CBA85E
--color-gold-deep:   #8A6A2A
```
- **Typo :** display serif (Fraunces ou équivalent « private banking ») + sans lisible (Hanken Grotesk / Inter). Chargées via `next/font`, câblées en variables `@theme`.
- **Style :** coins nets (radius quasi nul), filets 1px (`border-slate/50`), motion lente (`cubic-bezier(0.22,1,0.36,1)`), whitespace éditorial (`py-16 md:py-24`+), conteneur `max-w-[1440px] px-6 sm:px-10 lg:px-20`.
- **Règle :** jamais de couleur en dur, toujours un token.
- **Motion :** composants maison `Reveal` / `ImageReveal` / `ParallaxImage` (IntersectionObserver, honorent `prefers-reduced-motion`) + `motion` pour scroll-linked. Voir Palm Estates.

## Arborescence (pages)
### Public
| Route | Rôle | Données |
|---|---|---|
| `/` | Home lead-machine (hero, preuve sociale, services, CTA) | statique + vidéo Storage |
| `/gestion-de-patrimoine` | Services (ex-`/services`) + JSON-LD FinancialService | statique |
| `/opcvm` | Base OPCVM : recherche/filtres/tri, top perfs | `funds` |
| `/opcvm/[slug]` | Fiche fonds (611) + graphes NAV/perf | `funds`, `fund_performance_history` |
| `/opcvm/societe/[slug]` | Landing par société de gestion (Wafa Gestion…) | `funds` |
| `/opcvm/categorie/[slug]` | Landing par classification (Actions, Monétaire…) | `funds` |
| `/opcvm/comparateur` | Comparateur de portefeuille (Recharts) | `funds`, history API |
| `/opci` | Page contenu OPCI (SEO) | statique/`funds` OPCI |
| `/simulateurs` | Index des simulateurs | — |
| `/simulateurs/[outil]` | 1 URL/simu (impot-revenu, plus-value-tpi, epargne-opcvm, succession, bilan-patrimonial) | client compute |
| `/simulateur-tpi-prive` | Outil privé famille (password `laraki`), conservé | client compute |
| `/blog` + `/blog/[slug]` | 10 articles markdown | `content/blog/*.md` |
| `/contact` | Formulaire de capture leads | → `leads` + email |

### Espace Client (auth Supabase, `/espace-client/*`) — Portail patrimoine complet
- `/espace-client/connexion`, `/inscription`, `/reset` (auth).
- Tableau de bord : suivi d'investissements (tables `profiles` + `investments` réactivées), portefeuilles sauvegardés (comparateur), fonds favoris, perfs perso, documents, historique de demandes/RDV.
- Protégé par middleware ; le reste du contenu OPCVM/simus devient **public**.

### SEO/GEO infra (route files)
- `sitemap.ts` dynamique complet (pages + 611 fonds + articles + simus + landings société/catégorie).
- `robots.ts` : allow all, **accueille GPTBot/ClaudeBot/PerplexityBot**, disallow `/espace-client`, `/api`, `/auth`.
- `/llms.txt` : brief Messidor pour IA (qui, données OPCVM + méthodo de citation, pages clés). GEO.
- `opengraph-image.tsx` colocalisés (site + fonds + articles). Corrige l'og-image manquante.
- `generateMetadata` + canonical propre par page (corrige les bugs `VOTRE-DOMAINE.com` / domaine incohérent).
- JSON-LD : Organization/FinancialService + WebSite sitewide ; par fonds `FinancialProduct` ; par simu `WebApplication` ; par article `Article`+`FAQPage` ; `BreadcrumbList`.
- ISR + revalidation ; middleware court-circuite la session pour l'anonyme (cacheabilité).

## Machine à leads
- **Table `leads`** unique (fusionne `simulator_leads` + contact) : `email, phone, first_name, last_name, source, simulator_type, payload jsonb, utm_*, referer, landing_url, consent_marketing, status, organization_id, created_at`.
- Points de capture : `/contact`, gate résultat détaillé des simulateurs, CTA blog, hero.
- `/api/lead` (node, dynamic) : validation + honeypot (`spamReason`, réponse silencieuse aux bots) + insert (anon, RLS insert-only) + **email notif** (Resend, fire-and-forget) + attribution UTM.
- **Bouton WhatsApp flottant** contextuel (message pré-rempli selon page) + Calendly conservé pour RDV.

## Données & sécurité (Supabase)
- **Garde :** `funds`, `fund_performance_history`, vues `latest_fund_performance` / `fund_performance_stats`.
- **Réactive :** `profiles`, `investments` (Espace Client).
- **Nouveau :** `leads`.
- **Supprime :** `bourse_history`.
- **Sécurité :** recréer les 3 vues `SECURITY DEFINER` (`latest_fund_performance`, `fund_matching_helper`, +1) en `security_invoker=true` ; RLS propre partout (30 warnings) ; `leads` insert-only anon (aucun select public) ; `funds`/`fund_performance_history` public read.
- **Sync OPCVM :** garder `lib/services/opcvm-excel-parser.ts` + cron `sync-opcvm-performance` (re-planifier dans `vercel.json`, sans Puppeteer). Storage `opcvm-archives`.

## Suppression bourse (surface complète)
Fichiers : `lib/casablanca-bourse-scraper.ts`, `lib/cache.ts`, `app/api/bourse/*`, `app/api/cron/save-bourse`, `app/dashboard/bourse/*`, entrée Sidebar « Bourse », entrées sitemap/robots bourse, migration/table `bourse_history`, 9 `test_*.js` racine, 4 docs bourse. Deps retirées : `puppeteer`, `puppeteer-core`, `@sparticuz/chromium`. (`axios` gardé ou remplacé par `fetch` dans le sync jeudi.)

## Approche de build
1. **Foundation :** deps (retirer Chakra/Puppeteer, ajouter Tailwind v4 + motion), structure `src/`, `globals.css` + tokens, fonts, root layout + shell (Header/Footer/WhatsApp), factories Supabase SSR, `proxy.ts`, ports (`lib/blog`, `lib/services/opcvm-excel-parser`, types, data funds), SEO infra (sitemap/robots/llms.txt/JSON-LD/OG), composants motion + UI de base (Button, Card, Field).
2. **Pages publiques :** home, services, opcvm (+ [slug] + landings + comparateur), opci, simulateurs (+ [outil]), tpi-privé, blog, contact.
3. **Machine à leads :** table `leads` + `/api/lead` + WhatsApp FAB + captures.
4. **Espace Client :** auth + portail investissements.
5. **Sécurité DB :** migrations RLS + vues `security_invoker`.
6. **Nettoyage :** suppression surface bourse + deps, retrait ancien `app/` + Chakra.
7. **Vérif :** `npm run build` + `tsc --noEmit`, preview Vercel, contrôle SEO (metadata/JSON-LD/sitemap).

## Cutover
Big-bang sur la branche : nouvelle structure `src/app`, l'ancien `app/` racine retiré au moment du basculement (Next n'accepte pas les deux). Merge après preview validée.
