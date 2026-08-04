import type { LucideIcon } from "lucide-react";
import { Coins, Home, PiggyBank, Users, Scale } from "lucide-react";

export interface SimulatorDef {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  keywords: string[];
}

export const SIMULATORS: SimulatorDef[] = [
  {
    slug: "impot-revenu-maroc",
    title: "Simulateur d'impôt sur le revenu (IR) 2025",
    short: "Impôt sur le revenu",
    description:
      "Calculez votre IR au Maroc selon le barème 2025 : tranches, taux marginal et impôt net. Estimation immédiate et gratuite.",
    icon: Coins,
    keywords: ["impôt revenu maroc 2025", "barème IR maroc", "calcul IR maroc"],
  },
  {
    slug: "plus-value-immobiliere-tpi",
    title: "Simulateur de plus-value immobilière (TPI)",
    short: "Plus-value immobilière (TPI)",
    description:
      "Estimez la Taxe sur les Profits Immobiliers (TPI) lors de la vente d'un bien au Maroc : abattements, cotisation minimale de 3% et TPI à payer.",
    icon: Home,
    keywords: ["TPI maroc", "plus-value immobilière maroc", "taxe profit immobilier"],
  },
  {
    slug: "epargne-opcvm",
    title: "Simulateur d'épargne & placement OPCVM",
    short: "Épargne & OPCVM",
    description:
      "Projetez la croissance de votre épargne investie en OPCVM : capital, intérêts composés et fiscalité des plus-values au Maroc.",
    icon: PiggyBank,
    keywords: ["simulateur épargne maroc", "placement OPCVM", "intérêts composés maroc"],
  },
  {
    slug: "succession",
    title: "Simulateur de succession (droits & parts)",
    short: "Succession",
    description:
      "Estimez la répartition d'une succession au Maroc selon les règles en vigueur : part du conjoint, des enfants et des héritiers.",
    icon: Users,
    keywords: ["succession maroc", "héritage maroc", "part héritiers maroc"],
  },
  {
    slug: "bilan-patrimonial",
    title: "Simulateur de bilan patrimonial",
    short: "Bilan patrimonial",
    description:
      "Dressez votre patrimoine net : actifs immobiliers, financiers, professionnels, moins les dettes. La base d'une bonne stratégie.",
    icon: Scale,
    keywords: ["bilan patrimonial", "patrimoine net", "audit patrimonial maroc"],
  },
];

export function getSimulator(slug: string): SimulatorDef | undefined {
  return SIMULATORS.find((s) => s.slug === slug);
}
