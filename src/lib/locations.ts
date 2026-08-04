/**
 * Données des pages SEO locales (villes) et diaspora (MRE).
 * Une seule source de vérité pour les segments dynamiques
 *   /gestion-de-patrimoine/[ville] et /mre/[pays].
 */

export type City = {
  slug: string;
  name: string;
  /** Article défini contextuel ("à Casablanca", "à Rabat"). */
  intro: string;
};

export type Country = {
  slug: string;
  name: string;
  /** Gentilé au masculin pluriel ("les Marocains de France"). */
  demonym: string;
  /** Préposition + pays pour les titres ("depuis la France", "depuis le Canada"). */
  fromLabel: string;
  intro: string;
};

export const CITIES: City[] = [
  {
    slug: "casablanca",
    name: "Casablanca",
    intro:
      "Capitale économique du Maroc et siège de la Bourse de Casablanca, la ville concentre l'essentiel de l'activité financière du Royaume. Nous y accompagnons dirigeants, professions libérales et familles dans la structuration d'un patrimoine à la hauteur d'un environnement d'affaires exigeant.",
  },
  {
    slug: "rabat",
    name: "Rabat",
    intro:
      "Capitale administrative, Rabat rassemble une clientèle de hauts fonctionnaires, de cadres et de professions libérales soucieuse d'une gestion patrimoniale rigoureuse et discrète. Nous y proposons un conseil indépendant, adossé à une sélection exigeante de véhicules d'investissement.",
  },
  {
    slug: "marrakech",
    name: "Marrakech",
    intro:
      "Pôle touristique et immobilier majeur, Marrakech attire investisseurs marocains et internationaux. Nous y aidons nos clients à équilibrer actifs immobiliers, marchés financiers et liquidités, dans une logique de diversification et de performance nette d'impôt.",
  },
  {
    slug: "tanger",
    name: "Tanger",
    intro:
      "Portée par sa zone franche et son port Tanger Med, la région tangéroise connaît un dynamisme économique remarquable. Nous y accompagnons entrepreneurs et familles dans le développement et la protection d'un patrimoine en forte croissance.",
  },
  {
    slug: "fes",
    name: "Fès",
    intro:
      "Ville d'histoire et de commerce, Fès abrite un tissu entrepreneurial et familial attaché à la transmission. Nous y proposons un accompagnement patrimonial global, du bilan initial à la planification successorale, dans le respect de la réglementation marocaine.",
  },
  {
    slug: "agadir",
    name: "Agadir",
    intro:
      "Cœur de l'économie du Souss, entre agriculture, pêche et tourisme, Agadir réunit une clientèle d'entrepreneurs à la recherche d'une diversification patrimoniale solide. Nous y structurons des allocations sur-mesure, financières comme immobilières.",
  },
];

export const MRE_COUNTRIES: Country[] = [
  {
    slug: "france",
    name: "France",
    demonym: "Marocains de France",
    fromLabel: "depuis la France",
    intro:
      "Première communauté marocaine à l'étranger, les MRE établis en France disposent d'une épargne souvent investie hors du Maroc. Nous vous aidons à rapatrier et faire fructifier cette épargne au Maroc, en tenant compte de votre fiscalité de résidence et de la convention franco-marocaine.",
  },
  {
    slug: "belgique",
    name: "Belgique",
    demonym: "Marocains de Belgique",
    fromLabel: "depuis la Belgique",
    intro:
      "La communauté marocaine de Belgique est historiquement liée au Royaume par des projets immobiliers et familiaux. Nous vous accompagnons pour compléter ces projets par une épargne financière diversifiée au Maroc, gérée entièrement à distance.",
  },
  {
    slug: "canada",
    name: "Canada",
    demonym: "Marocains du Canada",
    fromLabel: "depuis le Canada",
    intro:
      "Nombreux et souvent qualifiés, les MRE installés au Canada souhaitent maintenir un ancrage patrimonial au Maroc. Nous structurons pour vous des investissements en OPCVM, OPCI et immobilier, en coordination avec votre situation fiscale nord-américaine.",
  },
  {
    slug: "emirats-arabes-unis",
    name: "Émirats arabes unis",
    demonym: "Marocains des Émirats",
    fromLabel: "depuis les Émirats arabes unis",
    intro:
      "Attirés par une fiscalité personnelle avantageuse, de nombreux Marocains des Émirats disposent d'une capacité d'épargne importante. Nous vous aidons à déployer cette épargne au Maroc de façon diversifiée et efficiente, avec un accompagnement à distance.",
  },
  {
    slug: "espagne",
    name: "Espagne",
    demonym: "Marocains d'Espagne",
    fromLabel: "depuis l'Espagne",
    intro:
      "Voisine et proche, la communauté marocaine d'Espagne investit traditionnellement dans l'immobilier au Maroc. Nous vous proposons d'élargir cette approche à une allocation financière équilibrée, adaptée à votre résidence fiscale espagnole.",
  },
  {
    slug: "allemagne",
    name: "Allemagne",
    demonym: "Marocains d'Allemagne",
    fromLabel: "depuis l'Allemagne",
    intro:
      "Les MRE établis en Allemagne recherchent des placements structurés et transparents pour valoriser leur épargne au Maroc. Nous vous accompagnons dans la sélection de véhicules réglementés (OPCVM, OPCI) et dans la coordination fiscale entre les deux pays.",
  },
];

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getCountry(slug: string): Country | undefined {
  return MRE_COUNTRIES.find((c) => c.slug === slug);
}
