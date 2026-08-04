import { slugify } from "@/lib/funds";

export interface CategoryContent {
  label: string; // libellé affiché
  intro: string; // paragraphe définitionnel (SEO/GEO)
  risk: string; // profil de risque
  faq: { q: string; a: string }[];
}

/** Contenu éditorial par slug de classification (fallback générique sinon). */
const CONTENT: Record<string, CategoryContent> = {
  actions: {
    label: "OPCVM Actions",
    intro:
      "Les OPCVM Actions investissent majoritairement en actions cotées à la Bourse de Casablanca. Ils visent la performance à long terme et conviennent aux investisseurs acceptant une volatilité élevée en échange d'un potentiel de rendement supérieur.",
    risk: "Risque élevé (SRRI 5 à 7) — horizon recommandé : 5 ans et plus.",
    faq: [
      {
        q: "Qu'est-ce qu'un OPCVM Actions au Maroc ?",
        a: "Un OPCVM Actions est un fonds qui place au moins 60% de son actif en actions marocaines. Sa valeur suit les marchés actions, avec un potentiel de gain et de perte plus important que les autres catégories.",
      },
      {
        q: "Pour qui les OPCVM Actions sont-ils adaptés ?",
        a: "Pour un investisseur au profil dynamique, avec un horizon de placement long (5 ans+) et une tolérance à la volatilité des marchés.",
      },
    ],
  },
  monetaire: {
    label: "OPCVM Monétaires",
    intro:
      "Les OPCVM Monétaires investissent dans des instruments de court terme (bons du Trésor, dépôts, titres de créances négociables). Ils offrent une grande stabilité et une liquidité quotidienne, pour placer une trésorerie sans risque significatif.",
    risk: "Risque très faible (SRRI 1) — horizon : quelques jours à quelques mois.",
    faq: [
      {
        q: "Qu'est-ce qu'un OPCVM Monétaire ?",
        a: "Un fonds monétaire place la trésorerie sur des supports très courts et peu risqués. Il vise à préserver le capital tout en offrant un rendement proche des taux du marché monétaire marocain.",
      },
      {
        q: "Quel rendement attendre d'un OPCVM Monétaire ?",
        a: "Un rendement modéré, proche du taux monétaire moyen (TMP/TMJ), en contrepartie d'un risque quasi nul et d'une disponibilité immédiate des fonds.",
      },
    ],
  },
  omlt: {
    label: "OPCVM Obligataires Moyen & Long Terme (OMLT)",
    intro:
      "Les OPCVM OMLT investissent dans des obligations de maturité moyenne à longue (État et entreprises). Ils recherchent un rendement régulier supérieur au monétaire, avec une sensibilité aux variations de taux d'intérêt.",
    risk: "Risque modéré (SRRI 3 à 4) — horizon recommandé : 2 à 4 ans.",
    faq: [
      {
        q: "Qu'est-ce qu'un OPCVM OMLT ?",
        a: "Un OPCVM Obligations Moyen et Long Terme place l'essentiel de son actif en obligations de maturité longue. Son rendement provient des coupons et de l'évolution des taux.",
      },
    ],
  },
  oct: {
    label: "OPCVM Obligataires Court Terme (OCT)",
    intro:
      "Les OPCVM OCT investissent en obligations et titres de créances de courte maturité. Ils offrent un compromis entre le monétaire et l'obligataire long, avec une faible sensibilité aux taux.",
    risk: "Risque faible (SRRI 2 à 3) — horizon recommandé : 6 mois à 2 ans.",
    faq: [
      {
        q: "Différence entre OPCVM OCT et Monétaire ?",
        a: "L'OCT prend un peu plus de duration (donc de risque de taux) que le monétaire, pour viser un rendement légèrement supérieur sur un horizon un peu plus long.",
      },
    ],
  },
  diversifie: {
    label: "OPCVM Diversifiés",
    intro:
      "Les OPCVM Diversifiés combinent actions et obligations selon une allocation flexible. Ils visent un équilibre entre performance et maîtrise du risque, en s'adaptant aux conditions de marché.",
    risk: "Risque modéré à élevé (SRRI 3 à 5) — horizon recommandé : 3 à 5 ans.",
    faq: [
      {
        q: "Qu'est-ce qu'un OPCVM Diversifié ?",
        a: "Un fonds diversifié répartit son actif entre plusieurs classes (actions, obligations, monétaire) pour lisser le risque tout en captant une partie de la performance des marchés actions.",
      },
    ],
  },
  contractuel: {
    label: "OPCVM Contractuels",
    intro:
      "Les OPCVM Contractuels s'engagent contractuellement sur un objectif de performance ou de protection du capital à une échéance donnée, selon une formule définie à l'avance.",
    risk: "Risque variable selon la formule — horizon : la durée du contrat.",
    faq: [
      {
        q: "Qu'est-ce qu'un OPCVM Contractuel ?",
        a: "Un fonds contractuel garantit contractuellement un résultat (protection du capital et/ou performance liée à un indice) à une échéance précise, selon une formule prédéfinie.",
      },
    ],
  },
};

export function getCategoryContent(slug: string, label?: string): CategoryContent {
  return (
    CONTENT[slug] || {
      label: label || "OPCVM",
      intro:
        "Cette catégorie regroupe des fonds OPCVM marocains partageant une même classification. Comparez leurs performances, leur niveau de risque et leurs frais pour choisir le fonds adapté à votre stratégie.",
      risk: "Profil de risque variable selon les fonds de la catégorie.",
      faq: [],
    }
  );
}

/** Slug canonique d'une classification. */
export function categorySlug(classification: string): string {
  return slugify(classification);
}
