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
  {
    slug: "gestion-de-patrimoine",
    term: "Gestion de patrimoine",
    short:
      "La gestion de patrimoine est l'ensemble des conseils et arbitrages visant à organiser, développer et transmettre les actifs financiers, immobiliers et professionnels d'un particulier ou d'une famille, en tenant compte de sa situation fiscale et de ses objectifs.",
    body: [
      "La gestion de patrimoine dépasse le simple placement : elle articule bilan patrimonial, allocation d'actifs, optimisation fiscale, prévoyance et transmission. L'objectif est de faire correspondre la structure des actifs aux projets de vie du détenteur — revenus complémentaires, préparation de la retraite, protection des proches ou financement d'un projet.",
      "Au Maroc, cette discipline combine placements financiers (OPCVM, actions, obligations), immobilier (direct ou via OPCI) et la prise en compte de l'impôt sur le revenu, de la TPI et des règles de transmission. Une bonne gestion repose sur un diagnostic complet avant toute recommandation.",
      "Le conseiller en gestion de patrimoine agit comme coordinateur : il hiérarchise les priorités, propose une allocation cohérente avec l'horizon de placement et la tolérance au risque, puis ajuste dans le temps. La démarche est continue, non ponctuelle, car la situation du client et les marchés évoluent.",
    ],
    related: ["allocation-d-actifs", "family-office", "diversification", "ir"],
  },
  {
    slug: "family-office",
    term: "Family Office",
    short:
      "Un family office est une structure dédiée à la gestion globale et coordonnée du patrimoine d'une famille fortunée, couvrant investissements, fiscalité, immobilier, gouvernance et transmission entre générations.",
    body: [
      "Le family office centralise la gestion des intérêts patrimoniaux d'une famille, souvent au-delà d'un certain seuil de patrimoine. Il coordonne les différents métiers — gestion financière, conseil fiscal, juridique, immobilier — autour d'une vision unique et de long terme, dans l'intérêt de la famille.",
      "On distingue le single family office, dédié à une seule famille, du multi family office, qui mutualise ses services entre plusieurs familles pour en réduire le coût. Sa valeur ajoutée tient à l'indépendance, à la confidentialité et à la continuité du suivi sur plusieurs générations.",
      "Au Maroc, cette approche répond aux besoins de familles disposant d'un patrimoine diversifié — entreprises, immobilier, placements financiers, actifs à l'étranger. Le family office structure la gouvernance familiale, prépare la transmission et veille à la cohérence globale de l'allocation d'actifs.",
    ],
    related: ["gestion-de-patrimoine", "allocation-d-actifs", "diversification"],
  },
  {
    slug: "allocation-d-actifs",
    term: "Allocation d'actifs",
    short:
      "L'allocation d'actifs est la répartition d'un patrimoine entre grandes classes de placements — actions, obligations, monétaire, immobilier — en fonction de l'horizon, des objectifs et de la tolérance au risque de l'investisseur.",
    body: [
      "L'allocation d'actifs est la décision structurante d'une stratégie d'investissement : elle détermine le poids accordé à chaque classe d'actifs. C'est elle, plus que le choix de tel ou tel titre, qui explique l'essentiel du couple rendement-risque d'un portefeuille sur la durée.",
      "On distingue l'allocation stratégique, cible de long terme alignée sur les objectifs et l'horizon de placement, et l'allocation tactique, qui ajuste temporairement les pondérations selon les conditions de marché. Un profil prudent privilégiera le monétaire et l'obligataire, un profil dynamique surpondérera les actions.",
      "Au Maroc, l'allocation peut s'appuyer sur les OPCVM (Actions, Obligations, Monétaires, Diversifiés) et l'immobilier via les OPCI, combinés selon le profil. La diversification entre classes d'actifs peu corrélées vise à lisser les performances et à réduire le risque global.",
    ],
    related: ["diversification", "gestion-de-patrimoine", "horizon-de-placement", "opcvm"],
  },
  {
    slug: "diversification",
    term: "Diversification",
    short:
      "La diversification consiste à répartir ses placements entre plusieurs actifs, secteurs ou zones géographiques afin de réduire le risque global d'un portefeuille sans nécessairement sacrifier son rendement attendu.",
    body: [
      "La diversification repose sur un principe simple : ne pas concentrer son épargne sur un seul actif. En combinant des placements dont les performances ne varient pas de manière identique, les baisses des uns sont partiellement compensées par la tenue des autres, ce qui atténue les à-coups du portefeuille.",
      "Elle s'exerce à plusieurs niveaux : entre classes d'actifs (actions, obligations, monétaire, immobilier), au sein d'une classe (secteurs, émetteurs), et géographiquement. Les OPCVM offrent une diversification immédiate, puisqu'un seul fonds détient déjà un portefeuille de nombreux titres.",
      "La diversification réduit le risque spécifique — celui lié à un émetteur ou un secteur — mais ne supprime pas le risque de marché, qui affecte l'ensemble des actifs. Elle constitue néanmoins un pilier de toute allocation d'actifs équilibrée.",
    ],
    related: ["allocation-d-actifs", "opcvm", "volatilite", "gestion-de-patrimoine"],
  },
  {
    slug: "interets-composes",
    term: "Intérêts composés",
    short:
      "Les intérêts composés désignent le mécanisme par lequel les gains d'un placement sont réinvestis et génèrent à leur tour des gains, produisant une croissance qui s'accélère avec le temps.",
    body: [
      "Le principe des intérêts composés est que les intérêts d'une période s'ajoutent au capital et produisent eux-mêmes des intérêts la période suivante. Contrairement aux intérêts simples, calculés uniquement sur le capital initial, la base de calcul augmente à chaque cycle, d'où un effet cumulatif puissant.",
      "L'impact dépend fortement de la durée et du taux : plus l'horizon de placement est long, plus la part des gains issus du réinvestissement devient importante. C'est pourquoi commencer tôt et laisser fructifier sont deux leviers déterminants d'une stratégie patrimoniale.",
      "Dans un OPCVM de capitalisation, les revenus sont automatiquement réinvestis dans le fonds, ce qui matérialise concrètement les intérêts composés sur la valeur liquidative. À l'inverse, un fonds de distribution verse les revenus, qu'il revient alors à l'investisseur de réinvestir s'il souhaite bénéficier de ce mécanisme.",
    ],
    related: ["capitalisation-distribution", "horizon-de-placement", "rendement", "vl"],
  },
  {
    slug: "obligation",
    term: "Obligation",
    short:
      "Une obligation est un titre de créance représentant une part d'un emprunt émis par un État ou une entreprise, qui donne droit au remboursement du capital à l'échéance et au versement d'intérêts (le coupon).",
    body: [
      "En achetant une obligation, l'investisseur prête de l'argent à l'émetteur — l'État marocain via le Trésor, ou une entreprise. En contrepartie, il perçoit des intérêts périodiques, appelés coupons, et récupère le montant prêté (le nominal) à l'échéance prévue.",
      "Le cours d'une obligation sur le marché évolue en sens inverse des taux d'intérêt : lorsque les taux montent, la valeur des obligations existantes baisse, et inversement. La qualité de l'émetteur détermine par ailleurs le risque de crédit, c'est-à-dire le risque de non-remboursement.",
      "Au Maroc, les obligations sont une composante majeure des OPCVM Obligations et Monétaires. Considérées comme moins volatiles que les actions, elles servent à sécuriser une allocation et à générer un revenu régulier, tout en restant exposées au risque de taux et de crédit.",
    ],
    related: ["action", "monetaire", "opcvm", "rendement"],
  },
  {
    slug: "action",
    term: "Action",
    short:
      "Une action est un titre de propriété représentant une part du capital d'une entreprise, qui confère à son détenteur un droit sur les bénéfices (dividendes) et, pour les sociétés cotées, la possibilité de la revendre en bourse.",
    body: [
      "Détenir une action, c'est être copropriétaire d'une entreprise à hauteur des titres possédés. L'actionnaire peut percevoir une part des bénéfices sous forme de dividende et dispose généralement d'un droit de vote en assemblée générale. La valeur de l'action reflète les perspectives de l'entreprise et l'appréciation du marché.",
      "L'action offre un potentiel de gain double : la plus-value en cas de hausse du cours et le dividende éventuel. En contrepartie, elle présente un risque plus élevé que l'obligation, car sa valeur peut fortement varier et le capital n'est pas garanti.",
      "Au Maroc, les actions se négocient à la Bourse de Casablanca, dont le MASI mesure la tendance d'ensemble. Les OPCVM Actions permettent d'y investir de façon diversifiée et gérée, sans sélectionner soi-même chaque valeur.",
    ],
    related: ["obligation", "dividende", "masi", "opcvm"],
  },
  {
    slug: "monetaire",
    term: "Monétaire",
    short:
      "Un placement monétaire investit dans des titres de créance à très court terme et à faible risque, visant la préservation du capital et une rémunération proche des taux du marché monétaire.",
    body: [
      "Les placements monétaires portent sur des instruments de dette de courte durée : bons du Trésor à court terme, titres de créance négociables, dépôts. Leur horizon très bref les rend peu sensibles aux variations de taux, d'où une faible volatilité et un objectif prioritaire de sécurité du capital.",
      "Au Maroc, les OPCVM Monétaires figurent parmi les catégories les moins risquées, souvent notées 1 sur l'échelle SRRI. Ils servent de solution d'attente pour une trésorerie disponible ou de poche de sécurité au sein d'une allocation d'actifs.",
      "Leur rendement, corrélé aux taux courts, est généralement modeste et n'a pas vocation à protéger contre l'inflation sur le long terme. Le placement monétaire privilégie la liquidité et la stabilité plutôt que la performance.",
    ],
    related: ["obligation", "liquidite", "srri", "opcvm"],
  },
  {
    slug: "dividende",
    term: "Dividende",
    short:
      "Un dividende est la part des bénéfices d'une entreprise distribuée à ses actionnaires, généralement en numéraire et proposée à l'approbation de l'assemblée générale.",
    body: [
      "Le dividende récompense l'actionnaire en lui reversant une fraction des résultats de l'entreprise. Son montant est proposé par les dirigeants puis voté en assemblée générale ; une société peut aussi choisir de ne pas en distribuer pour réinvestir ses bénéfices dans son développement.",
      "Rapporté au cours de l'action, le dividende détermine le rendement du dividende, indicateur suivi par les investisseurs en quête de revenus réguliers. Au Maroc, les dividendes versés aux personnes physiques font l'objet d'une imposition, le plus souvent sous forme de retenue à la source.",
      "Pour un OPCVM Actions, les dividendes encaissés sur les titres détenus alimentent le résultat du fonds : ils sont soit réinvestis (fonds de capitalisation), soit reversés aux porteurs (fonds de distribution). Les indices de rendement, comme certaines déclinaisons du MASI, intègrent ces dividendes.",
    ],
    related: ["action", "capitalisation-distribution", "masi", "rendement"],
  },
  {
    slug: "capitalisation-distribution",
    term: "Capitalisation / Distribution",
    short:
      "Un fonds de capitalisation réinvestit automatiquement les revenus qu'il perçoit, tandis qu'un fonds de distribution les reverse périodiquement aux porteurs de parts ; c'est un choix entre croissance du capital et perception de revenus.",
    body: [
      "La distinction porte sur le sort des revenus encaissés par un OPCVM — dividendes, coupons, intérêts. Dans un fonds de capitalisation, ces revenus sont réintégrés au portefeuille : ils font mécaniquement progresser la valeur liquidative et bénéficient de l'effet des intérêts composés.",
      "Dans un fonds de distribution, les revenus sont versés à intervalles réguliers aux porteurs. Ce mode convient à l'investisseur qui recherche un complément de revenus, tandis que la capitalisation privilégie la croissance de l'épargne sur le long terme, sans flux à percevoir.",
      "Le choix dépend des objectifs et de l'horizon : constitution d'un capital ou génération de revenus. Il a aussi des implications fiscales, la taxation intervenant au moment de la distribution ou de la cession selon les cas. Le règlement du fonds précise sa nature.",
    ],
    related: ["interets-composes", "dividende", "vl", "opcvm"],
  },
  {
    slug: "horizon-de-placement",
    term: "Horizon de placement",
    short:
      "L'horizon de placement est la durée pendant laquelle un investisseur prévoit de conserver son épargne avant d'en avoir besoin ; il conditionne le niveau de risque acceptable et le choix des supports.",
    body: [
      "L'horizon de placement traduit l'échéance d'un projet : quelques mois pour une réserve de précaution, plusieurs années pour préparer un achat ou la retraite. Il constitue le premier paramètre à définir avant toute décision d'allocation, car il détermine la capacité à supporter les fluctuations de marché.",
      "Plus l'horizon est long, plus l'investisseur peut accepter de volatilité : le temps permet de lisser les cycles et d'espérer un rendement supérieur, notamment via les actions. À l'inverse, un horizon court impose des supports stables et liquides comme les fonds monétaires.",
      "Aligner le support sur l'horizon est une règle de bon sens patrimonial : placer sur un fonds Actions une somme nécessaire dans six mois expose à devoir vendre au mauvais moment. L'horizon guide ainsi le curseur entre sécurité et performance dans l'allocation d'actifs.",
    ],
    related: ["allocation-d-actifs", "volatilite", "liquidite", "srri"],
  },
  {
    slug: "liquidite",
    term: "Liquidité",
    short:
      "La liquidité désigne la facilité et la rapidité avec lesquelles un placement peut être converti en argent disponible sans perte de valeur significative.",
    body: [
      "Un actif liquide se vend rapidement et à un prix proche de sa valeur ; un actif peu liquide, comme un bien immobilier, demande du temps et peut nécessiter une décote pour trouver preneur. La liquidité est un critère essentiel pour adapter un placement à ses besoins de trésorerie.",
      "Au Maroc, la plupart des OPCVM offrent une liquidité élevée : les parts se rachètent à la valeur liquidative selon une périodicité souvent quotidienne. Les fonds monétaires sont parmi les plus liquides, tandis que l'immobilier, y compris via les OPCI, présente une liquidité plus contrainte.",
      "La liquidité doit se penser au regard de l'horizon de placement : une épargne susceptible d'être mobilisée rapidement gagne à rester sur des supports liquides. Un placement offrant un rendement supérieur en échange d'une liquidité réduite ne convient qu'à une épargne dont on n'a pas besoin à court terme.",
    ],
    related: ["monetaire", "souscription-rachat", "horizon-de-placement", "opci"],
  },
  {
    slug: "volatilite",
    term: "Volatilité",
    short:
      "La volatilité mesure l'ampleur des variations de la valeur d'un placement autour de sa moyenne ; plus elle est élevée, plus le prix fluctue et plus le risque perçu est important.",
    body: [
      "La volatilité quantifie l'instabilité d'un actif : un placement très volatil connaît de fortes hausses et baisses, tandis qu'un placement peu volatil évolue de façon plus régulière. Statistiquement, elle correspond à l'écart-type des variations de valeur sur une période donnée.",
      "Elle est au cœur de l'évaluation du risque d'un OPCVM : l'indicateur SRRI, noté de 1 à 7, repose principalement sur la volatilité historique de la valeur liquidative. Un fonds Actions affiche généralement une volatilité supérieure à celle d'un fonds obligataire ou monétaire.",
      "La volatilité n'est pas synonyme de perte : elle mesure l'amplitude des mouvements, dans les deux sens. Sur un horizon long, une volatilité élevée peut s'accompagner d'un rendement supérieur ; c'est pourquoi elle se juge toujours au regard de la durée de placement et de la tolérance au risque.",
    ],
    related: ["srri", "action", "rendement", "diversification"],
  },
  {
    slug: "rendement",
    term: "Rendement",
    short:
      "Le rendement est le gain rapporté par un placement sur une période, exprimé en pourcentage du montant investi ; il peut provenir des revenus perçus (coupons, dividendes, loyers) et de la plus-value.",
    body: [
      "Le rendement mesure ce que rapporte un placement relativement à sa mise de départ. Il combine, selon le support, les revenus courants — intérêts d'obligations, dividendes d'actions, loyers immobiliers — et la variation de valeur de l'actif entre l'achat et la vente.",
      "Il convient de distinguer le rendement brut du rendement net : ce dernier tient compte des frais (gestion, souscription, rachat) et de la fiscalité, seuls déterminants du gain réellement perçu. Deux placements affichant un même rendement brut peuvent offrir des résultats nets très différents.",
      "Le rendement s'apprécie toujours en regard du risque assumé : un rendement élevé rémunère généralement une volatilité ou une illiquidité plus fortes. Comparer un placement à son benchmark et sur un horizon cohérent permet de juger si le rendement obtenu justifie le risque pris.",
    ],
    related: ["volatilite", "benchmark", "frais-de-gestion", "interets-composes"],
  },
  {
    slug: "mre",
    term: "MRE (Marocain Résidant à l'Étranger)",
    short:
      "Un MRE (Marocain Résidant à l'Étranger) est un ressortissant marocain établi hors du Maroc ; il bénéficie de dispositifs spécifiques pour investir et placer son épargne au Maroc, notamment via des comptes en devises ou en dirhams convertibles.",
    body: [
      "Les Marocains résidant à l'étranger constituent une population importante et un pilier de l'épargne investie au Maroc. Ils peuvent y détenir des placements financiers et immobiliers, souvent dans une logique de préparation du retour, de constitution d'un patrimoine ou de soutien à la famille.",
      "Pour faciliter ces flux, le régime de change marocain, encadré par l'Office des Changes, prévoit des comptes spécifiques — en devises ou en dirhams convertibles — permettant de rapatrier des fonds tout en préservant, sous conditions, la possibilité de les retransférer. Ces dispositifs visent à sécuriser l'investissement des MRE.",
      "En gestion de patrimoine, la situation d'un MRE appelle une attention particulière : articulation entre la fiscalité de son pays de résidence et celle du Maroc, choix des supports (OPCVM, OPCI, immobilier) et modalités de transfert des capitaux. Un accompagnement adapté aide à structurer un patrimoine transfrontalier cohérent.",
    ],
    related: ["gestion-de-patrimoine", "opcvm", "opci", "diversification"],
  },
];

/** Récupère un terme par son slug, ou undefined si inconnu. */
export function getTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
