/**
 * Lexique du patrimoine — définitions de référence (contexte marocain).
 * Asset GEO/SEO : chaque terme expose une définition courte « citable »
 * et un corps de 2-3 paragraphes factuels. Source unique de vérité pour
 * /lexique et /lexique/[slug].
 */

export interface GlossaryTerm {
  /** Identifiant d'URL (déjà slugifié). */
  slug: string;
  /** Intitulé affiché du terme. */
  term: string;
  /** Définition d'une phrase, quotable par les moteurs IA. */
  short: string;
  /** Corps de 2 à 3 paragraphes. */
  body: string[];
  /** Slugs des termes liés. */
  related?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "opcvm",
    term: "OPCVM",
    short:
      "Un OPCVM (Organisme de Placement Collectif en Valeurs Mobilières) est un fonds d'investissement qui collecte l'épargne de plusieurs souscripteurs pour l'investir collectivement en actions, obligations ou produits monétaires, sous le contrôle de l'AMMC au Maroc.",
    body: [
      "Au Maroc, un OPCVM permet à un particulier ou une entreprise d'accéder aux marchés financiers sans acheter directement des titres. L'épargne collectée est gérée par une société de gestion agréée, qui répartit les montants sur un portefeuille diversifié. Chaque investisseur détient des parts (FCP) ou des actions (SICAV) dont la valeur évolue avec le portefeuille.",
      "Les OPCVM marocains se classent par nature d'actifs : Actions, Obligations (court ou moyen-long terme), Monétaires, Diversifiés et Contractuels. Ce classement, encadré par l'AMMC, détermine le niveau de risque et l'horizon de placement recommandé. Un OPCVM monétaire vise la préservation du capital à court terme, tandis qu'un OPCVM Actions cherche la performance sur le long terme.",
      "La valeur d'une part, appelée valeur liquidative (VL), est calculée périodiquement à partir de l'actif net du fonds. Souscrire ou racheter des parts se fait sur la base de cette VL, à laquelle peuvent s'ajouter des frais de souscription, de rachat et de gestion.",
    ],
    related: ["sicav", "fcp", "vl", "actif-net", "ammc", "asfim"],
  },
  {
    slug: "opci",
    term: "OPCI",
    short:
      "Un OPCI (Organisme de Placement Collectif Immobilier) est un fonds réglementé qui investit majoritairement dans l'immobilier locatif professionnel et redistribue les loyers perçus à ses porteurs de parts.",
    body: [
      "Introduit au Maroc par la loi 70-14, l'OPCI offre un accès mutualisé à l'immobilier d'entreprise (bureaux, commerces, plateformes logistiques) sans les contraintes de la détention directe. Le patrimoine du fonds est constitué à hauteur d'au moins 60 % d'actifs immobiliers, le solde pouvant être placé en liquidités ou valeurs mobilières.",
      "Deux formes coexistent : la FPI (Fonds de Placement Immobilier), transparente fiscalement et distribuant l'essentiel de ses résultats, et la SPI (Société de Placement Immobilier), constituée en société par actions. Les OPCI sont gérés par des sociétés de gestion agréées et supervisés par l'AMMC.",
      "L'OPCI vise un revenu régulier issu des loyers, complété par la valorisation potentielle des immeubles. Il s'adresse aux investisseurs recherchant une exposition immobilière diversifiée et professionnellement gérée, avec un horizon de placement généralement long.",
    ],
    related: ["opcvm", "ammc", "plus-value-immobiliere"],
  },
  {
    slug: "vl",
    term: "VL (valeur liquidative)",
    short:
      "La valeur liquidative (VL) est le prix d'une part ou action d'un OPCVM, obtenue en divisant l'actif net du fonds par le nombre de parts en circulation.",
    body: [
      "La VL est le prix de référence auquel un investisseur souscrit ou fait racheter ses parts. Elle est publiée par la société de gestion selon une périodicité définie dans le règlement du fonds — quotidienne pour la plupart des OPCVM marocains, parfois hebdomadaire.",
      "Le calcul est simple : VL = actif net ÷ nombre de parts en circulation. L'actif net correspond à la valeur de marché de tout le portefeuille (titres, liquidités) diminuée des dettes et frais du fonds. La VL varie donc au rythme des marchés sur lesquels le fonds est investi.",
      "Suivre l'évolution de la VL dans le temps permet de mesurer la performance d'un OPCVM. Une hausse de la VL, hors distribution, traduit un gain ; les performances YTD, 1 an ou 3 ans publiées reposent toutes sur cette série de valeurs liquidatives.",
    ],
    related: ["actif-net", "opcvm", "souscription-rachat", "sicav", "fcp"],
  },
  {
    slug: "actif-net",
    term: "Actif Net",
    short:
      "L'actif net d'un OPCVM est la valeur totale de son portefeuille (titres et liquidités) diminuée de ses dettes et frais ; c'est la base de calcul de la valeur liquidative.",
    body: [
      "L'actif net représente ce que vaut réellement le fonds à un instant donné. On additionne la valeur de marché de tous les actifs détenus — actions, obligations, instruments monétaires, trésorerie — puis on retranche les engagements et frais à payer.",
      "Cet agrégat sert à deux usages : diviser l'actif net par le nombre de parts donne la valeur liquidative (VL) ; et la somme des actifs nets de tous les fonds mesure la taille de l'industrie. Au Maroc, l'ASFIM publie régulièrement l'actif net global des OPCVM, indicateur suivi de la collecte d'épargne.",
      "Un actif net élevé peut refléter la confiance des investisseurs et une bonne liquidité du fonds, mais ne préjuge pas de la performance : deux fonds de tailles très différentes peuvent afficher des rendements comparables.",
    ],
    related: ["vl", "opcvm", "asfim"],
  },
  {
    slug: "sicav",
    term: "SICAV",
    short:
      "Une SICAV (Société d'Investissement à Capital Variable) est une forme d'OPCVM constituée en société par actions, dont l'investisseur devient actionnaire et dispose de droits de vote en assemblée.",
    body: [
      "La SICAV est l'une des deux structures juridiques d'OPCVM au Maroc, l'autre étant le FCP. Dotée de la personnalité morale, elle émet des actions : en souscrivant, l'épargnant devient actionnaire de la société d'investissement et peut, à ce titre, participer aux assemblées générales.",
      "Son capital est dit « variable » car il augmente à chaque souscription et diminue à chaque rachat, sans formalité de modification statutaire. La gestion du portefeuille est déléguée à une société de gestion agréée par l'AMMC.",
      "Pour l'investisseur, une SICAV fonctionne au quotidien comme un FCP : mêmes catégories (Actions, Obligations, Monétaire…), même logique de valeur liquidative et de frais. La différence tient au statut juridique — actionnaire d'une société pour la SICAV, copropriétaire d'un fonds pour le FCP.",
    ],
    related: ["fcp", "opcvm", "vl"],
  },
  {
    slug: "fcp",
    term: "FCP",
    short:
      "Un FCP (Fonds Commun de Placement) est une forme d'OPCVM sans personnalité juridique, dont les investisseurs sont copropriétaires de parts et non actionnaires.",
    body: [
      "Le FCP est la seconde structure d'OPCVM au Maroc aux côtés de la SICAV. Contrairement à cette dernière, il n'est pas une société : c'est une copropriété d'instruments financiers. En souscrivant, l'épargnant acquiert des parts et devient copropriétaire du portefeuille, sans droit de vote en assemblée.",
      "Le FCP est représenté et géré par une société de gestion agréée par l'AMMC, qui décide des investissements dans le respect de l'orientation définie au règlement du fonds. La conservation des actifs est assurée par un dépositaire distinct.",
      "Sur le plan de l'investissement, un FCP et une SICAV se comportent de la même manière : mêmes catégories de fonds, calcul de valeur liquidative identique et grille de frais comparable. Le choix entre les deux est surtout une question de forme juridique retenue par le promoteur du fonds.",
    ],
    related: ["sicav", "opcvm", "vl"],
  },
  {
    slug: "asfim",
    term: "ASFIM",
    short:
      "L'ASFIM (Association des Sociétés de Gestion et Fonds d'Investissement Marocains) est l'organisation professionnelle qui regroupe les sociétés de gestion d'OPCVM au Maroc et publie les statistiques de l'industrie.",
    body: [
      "L'ASFIM fédère les sociétés de gestion agréées opérant sur le marché des OPCVM et OPCI marocains. Elle joue un rôle de représentation de la profession, de concertation avec le régulateur et de promotion de l'épargne collective.",
      "L'association publie régulièrement des données de référence sur le secteur : actif net global, collecte nette, répartition par catégorie de fonds et classements de performance. Ces publications font autorité pour mesurer la taille et l'évolution de la gestion d'actifs au Maroc.",
      "Il faut distinguer l'ASFIM, association professionnelle, de l'AMMC, autorité de régulation : la première représente les acteurs, la seconde agrée et contrôle. Les deux structurent ensemble l'écosystème des OPCVM marocains.",
    ],
    related: ["ammc", "opcvm", "actif-net"],
  },
  {
    slug: "ammc",
    term: "AMMC",
    short:
      "L'AMMC (Autorité Marocaine du Marché des Capitaux) est le régulateur du marché financier marocain : elle agrée les OPCVM et sociétés de gestion, veille à la protection de l'épargne et contrôle l'information des investisseurs.",
    body: [
      "L'AMMC est l'autorité publique chargée de surveiller le bon fonctionnement du marché des capitaux au Maroc. Elle a succédé au CDVM et dispose de pouvoirs d'agrément, de contrôle et de sanction.",
      "Concrètement, aucun OPCVM ou OPCI ne peut être commercialisé sans l'agrément de l'AMMC, qui vérifie la conformité du règlement, la qualité de la société de gestion et la clarté des documents remis aux souscripteurs. L'autorité veille aussi à la transparence de l'information financière des sociétés cotées.",
      "Sa mission centrale est la protection de l'épargne investie en instruments financiers. En cela, l'AMMC constitue le tiers de confiance de tout l'écosystème : elle encadre les acteurs représentés par l'ASFIM et impose les règles applicables aux fonds.",
    ],
    related: ["asfim", "opcvm", "opci", "srri"],
  },
  {
    slug: "tpi",
    term: "TPI (taxe sur les profits immobiliers)",
    short:
      "La TPI (taxe sur les profits immobiliers) est l'impôt marocain prélevé sur la plus-value réalisée lors de la cession d'un bien immobilier par un particulier.",
    body: [
      "Au Maroc, la vente d'un bien immobilier par une personne physique dégage un profit imposable lorsque le prix de cession dépasse le prix d'acquisition réévalué. Cette imposition prend la forme de la taxe sur les profits immobiliers, catégorie de l'impôt sur le revenu (IR).",
      "Le profit taxable correspond au prix de cession diminué du prix d'acquisition, des frais d'acquisition, des dépenses d'investissement justifiées et des intérêts d'emprunt, le prix d'acquisition étant réévalué par des coefficients d'actualisation. Un taux s'applique au profit ainsi calculé, avec un minimum d'imposition assis sur le prix de cession.",
      "Des cas d'exonération existent, notamment pour la résidence principale occupée depuis une durée minimale. La TPI se déclare et se paie à l'occasion de la cession ; bien anticiper son calcul est essentiel dans toute stratégie patrimoniale immobilière.",
    ],
    related: ["plus-value-immobiliere", "ir"],
  },
  {
    slug: "plus-value-immobiliere",
    term: "Plus-value immobilière",
    short:
      "La plus-value immobilière est le gain réalisé lorsqu'un bien immobilier est vendu à un prix supérieur à son prix d'acquisition réévalué ; au Maroc, elle est soumise à la taxe sur les profits immobiliers (TPI).",
    body: [
      "La plus-value immobilière mesure l'enrichissement dégagé par la cession d'un bien. On la calcule en soustrayant du prix de vente le prix d'achat réévalué, augmenté des frais et des dépenses d'investissement admis. Un résultat négatif constitue une moins-value, non imposable.",
      "Au Maroc, cette plus-value réalisée par un particulier entre dans le champ de l'impôt sur le revenu au titre des profits fonciers, matérialisé par la TPI. Le prix d'acquisition est actualisé par des coefficients afin de tenir compte de l'inflation entre l'achat et la vente.",
      "Plusieurs paramètres influencent le montant final : durée de détention, nature du bien, dépenses justifiées et éventuelles exonérations (résidence principale). Estimer la plus-value en amont d'une vente permet d'optimiser le moment et les modalités de la cession.",
    ],
    related: ["tpi", "ir"],
  },
  {
    slug: "ir",
    term: "IR (impôt sur le revenu)",
    short:
      "L'IR (impôt sur le revenu) est l'impôt marocain qui frappe les revenus des personnes physiques — salaires, revenus fonciers, professionnels et de capitaux — selon un barème progressif.",
    body: [
      "L'impôt sur le revenu s'applique au Maroc à l'ensemble des revenus perçus par une personne physique au cours d'une année. Il couvre plusieurs catégories : revenus salariaux, professionnels, fonciers, agricoles et revenus de capitaux mobiliers.",
      "Le barème est progressif : le revenu net imposable est découpé en tranches, chacune taxée à un taux croissant, une tranche basse étant exonérée. Certains revenus font toutefois l'objet d'une imposition à taux spécifique ou d'une retenue à la source libératoire.",
      "En gestion de patrimoine, l'IR est un paramètre central : il détermine le rendement net d'un placement, la fiscalité des loyers et, via les profits fonciers, la taxation des plus-values immobilières. Structurer ses revenus et placements en fonction de l'IR est au cœur de toute optimisation.",
    ],
    related: ["tpi", "plus-value-immobiliere"],
  },
  {
    slug: "srri",
    term: "SRRI (niveau de risque)",
    short:
      "Le SRRI est l'indicateur synthétique de risque et de rendement d'un OPCVM, noté de 1 (risque faible) à 7 (risque élevé), qui aide l'investisseur à situer la volatilité potentielle d'un fonds.",
    body: [
      "Le SRRI (Synthetic Risk and Reward Indicator) résume sur une échelle de 1 à 7 le niveau de risque d'un fonds, calculé principalement à partir de la volatilité historique de sa valeur liquidative. Il figure dans les documents d'information remis au souscripteur.",
      "Un fonds noté 1 ou 2 — typiquement monétaire ou obligataire court terme — présente de faibles variations mais un rendement attendu modeste. À l'inverse, un fonds Actions noté 6 ou 7 peut offrir un potentiel supérieur au prix d'une volatilité forte, avec un risque de perte en capital plus élevé.",
      "Le SRRI est un repère de comparaison rapide entre fonds, mais il reste indicatif : il repose sur des données passées et ne capture pas tous les risques (liquidité, crédit, concentration). Il doit se lire au regard de son horizon de placement et de sa tolérance au risque.",
    ],
    related: ["opcvm", "benchmark", "ammc"],
  },
  {
    slug: "benchmark",
    term: "Benchmark",
    short:
      "Un benchmark (indice de référence) est l'indicateur de marché auquel on compare la performance d'un OPCVM pour juger de la valeur ajoutée de sa gestion.",
    body: [
      "Le benchmark, ou indice de référence, sert d'étalon à un fonds. Un OPCVM Actions marocain se compare souvent au MASI, un fonds obligataire à un indice obligataire de référence. Comparer la performance du fonds à celle de son benchmark permet de distinguer ce qui vient du marché de ce qui vient du gérant.",
      "Lorsqu'un fonds fait mieux que son indice, on parle de surperformance ; dans le cas inverse, de sous-performance. Cet écart mesure la capacité de la gestion active à créer de la valeur, une fois les frais pris en compte.",
      "Le choix du benchmark doit être cohérent avec l'univers d'investissement du fonds. Un indice mal adapté fausse la lecture : comparer un fonds Actions à un indice monétaire n'a pas de sens. Le règlement du fonds précise l'indice de référence retenu.",
    ],
    related: ["masi", "opcvm", "srri"],
  },
  {
    slug: "masi",
    term: "MASI",
    short:
      "Le MASI (Moroccan All Shares Index) est l'indice phare de la Bourse de Casablanca, composé de l'ensemble des valeurs cotées et servant de baromètre du marché actions marocain.",
    body: [
      "Le MASI regroupe la totalité des sociétés cotées à la Bourse de Casablanca et reflète l'évolution globale du marché actions marocain. Sa variation quotidienne est l'indicateur le plus suivi pour mesurer la tendance de la place casablancaise.",
      "En tant qu'indice large, le MASI sert fréquemment de benchmark aux OPCVM Actions marocains : la performance d'un fonds Actions se lit souvent par rapport à celle du MASI sur la même période. Il existe des déclinaisons, comme un indice de rendement intégrant les dividendes.",
      "Suivre le MASI donne une vision d'ensemble du climat boursier, utile pour contextualiser la performance d'un placement en actions. Il ne se substitue toutefois pas à l'analyse propre à chaque fonds ou valeur.",
    ],
    related: ["benchmark", "opcvm"],
  },
  {
    slug: "souscription-rachat",
    term: "Souscription / Rachat",
    short:
      "La souscription est l'achat de parts d'un OPCVM et le rachat leur revente au fonds ; les deux opérations s'effectuent à la valeur liquidative, éventuellement majorée ou minorée de frais d'entrée et de sortie.",
    body: [
      "Souscrire, c'est entrer dans un OPCVM en achetant des parts nouvellement créées ; racheter, c'est en sortir en demandant au fonds de reprendre ses parts contre leur valeur. Ces deux mouvements alimentent la variabilité du capital d'un FCP ou d'une SICAV.",
      "Le prix d'exécution est la valeur liquidative (VL) applicable à la date de l'ordre, calculée après réception de la demande. À la souscription peuvent s'ajouter des frais d'entrée (droits de souscription) ; au rachat, des frais de sortie (droits de rachat), lorsqu'ils sont prévus au règlement.",
      "Certains fonds imposent un montant minimum de souscription ou un délai de règlement. La liquidité — la facilité à racheter rapidement ses parts — dépend de la nature du fonds : elle est généralement quotidienne pour les OPCVM classiques, plus contrainte pour l'immobilier via les OPCI.",
    ],
    related: ["vl", "frais-de-gestion", "opcvm", "actif-net"],
  },
  {
    slug: "frais-de-gestion",
    term: "Frais de gestion",
    short:
      "Les frais de gestion sont la rémunération annuelle prélevée par la société de gestion d'un OPCVM, exprimée en pourcentage de l'actif et déjà déduite de la valeur liquidative.",
    body: [
      "Les frais de gestion couvrent le travail de la société de gestion : sélection des titres, suivi du portefeuille, administration du fonds. Ils s'expriment en pourcentage annuel de l'actif net et sont prélevés en continu, ce qui les rend indolores en apparence puisqu'ils sont déjà intégrés dans la valeur liquidative publiée.",
      "Il faut les distinguer des frais ponctuels que sont les droits de souscription (à l'entrée) et de rachat (à la sortie). Les frais de gestion, eux, pèsent chaque année, quelle que soit la performance : ils réduisent d'autant le rendement net perçu par l'investisseur.",
      "À performance brute comparable, un niveau de frais plus bas améliore le résultat final. Les frais doivent toutefois se juger au regard du type de fonds : une gestion Actions active justifie généralement des frais supérieurs à ceux d'un fonds monétaire à gestion plus passive.",
    ],
    related: ["souscription-rachat", "vl", "opcvm", "benchmark"],
  },
];

/** Récupère un terme par son slug, ou undefined si inconnu. */
export function getTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
