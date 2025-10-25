# Encart Calendly pour les articles de blog

## Comment l'utiliser

Pour ajouter un encart de prise de rendez-vous Calendly dans vos articles, copiez-collez ce code HTML à l'endroit souhaité dans votre fichier markdown:

```html
<div style="background: #1e3a8a; color: white; padding: 32px; border-radius: 12px; text-align: center; margin: 48px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <h3 style="font-size: 1.4em; font-weight: 700; margin-bottom: 12px; color: white;">Besoin de conseils personnalisés ?</h3>
  <p style="color: rgba(255,255,255,0.9); margin-bottom: 24px; font-size: 1.05em;">Nos experts analysent votre situation patrimoniale et vous proposons une stratégie d'investissement sur mesure.</p>
  <a href="https://calendly.com/kamil-messidor" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: white; color: #1e3a8a; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1em; transition: all 0.2s;">
    Prendre rendez-vous gratuitement →
  </a>
</div>
```

## Personnalisation

Vous pouvez personnaliser le texte selon le contexte de l'article:

### Pour un article sur l'héritage:
```html
<div style="background: #1e3a8a; color: white; padding: 32px; border-radius: 12px; text-align: center; margin: 48px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <h3 style="font-size: 1.4em; font-weight: 700; margin-bottom: 12px; color: white;">Protégez votre famille dès aujourd'hui</h3>
  <p style="color: rgba(255,255,255,0.9); margin-bottom: 24px; font-size: 1.05em;">Échangez avec un expert pour élaborer votre stratégie de transmission patrimoniale personnalisée.</p>
  <a href="https://calendly.com/kamil-messidor" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: white; color: #1e3a8a; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1em; transition: all 0.2s;">
    Prendre rendez-vous gratuitement →
  </a>
</div>
```

### Pour un article sur les OPCVM:
```html
<div style="background: #1e3a8a; color: white; padding: 32px; border-radius: 12px; text-align: center; margin: 48px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <h3 style="font-size: 1.4em; font-weight: 700; margin-bottom: 12px; color: white;">Optimisez votre portefeuille OPCVM</h3>
  <p style="color: rgba(255,255,255,0.9); margin-bottom: 24px; font-size: 1.05em;">Laissez nos experts analyser votre portefeuille et vous recommander les meilleurs fonds pour votre profil.</p>
  <a href="https://calendly.com/kamil-messidor" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: white; color: #1e3a8a; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1em; transition: all 0.2s;">
    Prendre rendez-vous gratuitement →
  </a>
</div>
```

### Pour un article sur l'investissement en général:
```html
<div style="background: #1e3a8a; color: white; padding: 32px; border-radius: 12px; text-align: center; margin: 48px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
  <h3 style="font-size: 1.4em; font-weight: 700; margin-bottom: 12px; color: white;">Construisez votre stratégie d'investissement</h3>
  <p style="color: rgba(255,255,255,0.9); margin-bottom: 24px; font-size: 1.05em;">Bénéficiez d'un diagnostic patrimonial gratuit et d'un plan d'action personnalisé.</p>
  <a href="https://calendly.com/kamil-messidor" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: white; color: #1e3a8a; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.1em; transition: all 0.2s;">
    Prendre rendez-vous gratuitement →
  </a>
</div>
```

## Placement recommandé

Pour une meilleure conversion, placez l'encart:
- **Après une section clé** qui explique un problème ou une opportunité
- **Au milieu de l'article** (pas au début ni à la fin)
- **Avant une section pratique** (comme "Comment faire", "Comparaison", etc.)
- **Après avoir présenté un cas concret** qui illustre l'intérêt du conseil

## Exemples d'emplacements dans les articles actuels

### Article sur l'or (`investir-or-maroc-guide.md`)
✅ Ajouté après la section "Option 3: Les bijoux" et avant "Comparaison chiffrée"

### Article sur l'héritage (`heritage-maroc-guide-complet.md`)
✅ Ajouté après la section "La société civile immobilière" et avant "Passer à l'action"

## Notes techniques

- Le code HTML est directement supporté dans les fichiers markdown grâce à `rehype-raw`
- Les styles inline sont utilisés pour garantir le rendu
- Le lien s'ouvre dans un nouvel onglet (`target="_blank"`)
- Le bouton utilise la couleur brand blue (`#1e3a8a`) pour cohérence avec le site
