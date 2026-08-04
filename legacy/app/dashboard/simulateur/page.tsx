'use client'

import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from 'recharts'

// Barème IR Maroc 2025
const BAREME_IR = [
  { min: 0, max: 40000, taux: 0, deduction: 0 },
  { min: 40001, max: 60000, taux: 0.1, deduction: 4000 },
  { min: 60001, max: 80000, taux: 0.2, deduction: 10000 },
  { min: 80001, max: 180000, taux: 0.34, deduction: 21200 },
  { min: 180001, max: Infinity, taux: 0.37, deduction: 26600 },
]

// Taux fiscaux
const FISCALITE = {
  plusValuesBoursieres: 0.15, // 15% pour les plus-values boursières
  dividendes: 0.125, // 12.5% en 2025
  interetsBancaires: 0.2, // 20% pour les intérêts
}

type TypeInvestissement =
  | 'actions'
  | 'immobilier'
  | 'obligations'
  | 'compteEpargne'

interface SimulationResult {
  valeurFinale: number
  capitalInitial: number
  gains: number
  impots: number
  netApresFiscalite: number
  evolutionAnnuelle: Array<{
    annee: number
    capital: number
    interet: number
    impot: number
    net: number
  }>
}

// Fonction pour formater les nombres avec espaces
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/,/g, ' ')
}

export default function SimulateurPage() {
  const [montantInitial, setMontantInitial] = useState('')
  const [duree, setDuree] = useState('')
  const [tauxRendement, setTauxRendement] = useState('')
  const [typeInvestissement, setTypeInvestissement] =
    useState<TypeInvestissement>('actions')
  const [versementMensuel, setVersementMensuel] = useState('')

  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const calculerSimulation = useMemo((): SimulationResult | null => {
    const capital = parseFloat(montantInitial)
    const annees = parseFloat(duree)
    const taux = parseFloat(tauxRendement) / 100
    const versement = parseFloat(versementMensuel) || 0

    if (!capital || !annees || !taux) return null

    const evolutionAnnuelle = []
    let capitalActuel = capital

    for (let annee = 1; annee <= annees; annee++) {
      // Ajout des versements mensuels sur l'année
      const versementsAnnuels = versement * 12
      capitalActuel += versementsAnnuels

      // Calcul des intérêts
      const interetAnnee = capitalActuel * taux

      // Calcul de l'impôt selon le type d'investissement
      let tauxImposition = 0
      switch (typeInvestissement) {
        case 'actions':
          tauxImposition = FISCALITE.plusValuesBoursieres
          break
        case 'immobilier':
          tauxImposition = 0.2 // 20% pour l'immobilier locatif
          break
        case 'obligations':
          tauxImposition = FISCALITE.interetsBancaires
          break
        case 'compteEpargne':
          tauxImposition = FISCALITE.interetsBancaires
          break
      }

      const impotAnnee = interetAnnee * tauxImposition
      const netAnnee = interetAnnee - impotAnnee

      capitalActuel += netAnnee

      evolutionAnnuelle.push({
        annee,
        capital: Math.round(capitalActuel),
        interet: Math.round(interetAnnee),
        impot: Math.round(impotAnnee),
        net: Math.round(netAnnee),
      })
    }

    const valeurFinale = capitalActuel
    const totalVersements = capital + versement * 12 * annees
    const gains = valeurFinale - totalVersements
    const impots = evolutionAnnuelle.reduce((sum, e) => sum + e.impot, 0)
    const netApresFiscalite = valeurFinale

    return {
      valeurFinale,
      capitalInitial: totalVersements,
      gains,
      impots,
      netApresFiscalite,
      evolutionAnnuelle,
    }
  }, [montantInitial, duree, tauxRendement, typeInvestissement, versementMensuel])

  const chartData = calculerSimulation?.evolutionAnnuelle || []

  const repartitionData = calculerSimulation
    ? [
        {
          name: 'Capital investi',
          value: calculerSimulation.capitalInitial,
          color: '#64748B',
        },
        {
          name: 'Gains nets',
          value: calculerSimulation.gains - calculerSimulation.impots,
          color: '#10B981',
        },
        {
          name: 'Impôts',
          value: calculerSimulation.impots,
          color: '#EF4444',
        },
      ]
    : []

  return (
    <Box>
      {/* Header avec SEO */}
      <Box mb={8}>
        <Heading
          as="h1"
          size={{ base: 'lg', md: 'xl' }}
          mb={3}
          color="gray.800"
          fontWeight="700"
        >
          Simulateur d&apos;Investissement et de Fiscalité au Maroc
        </Heading>
        <Text color="gray.600" fontSize={{ base: 'md', md: 'lg' }} mb={4}>
          Calculez le rendement de vos investissements avec une simulation
          fiscale précise selon la législation marocaine 2025
        </Text>
        <Text color="gray.500" fontSize="sm">
          Barème IR 2025 • Plus-values boursières • Fiscalité des dividendes •
          Investissements immobiliers
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={{ base: 6, md: 8 }}>
        {/* Formulaire */}
        <VStack spacing={6} align="stretch">
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="md" mb={6} color="gray.700" fontWeight="600">
                Paramètres de simulation
              </Heading>

              <VStack spacing={5} align="stretch">
                <FormControl>
                  <FormLabel color="gray.700" fontWeight="500">
                    Type d&apos;investissement
                  </FormLabel>
                  <Select
                    value={typeInvestissement}
                    onChange={(e) =>
                      setTypeInvestissement(e.target.value as TypeInvestissement)
                    }
                    size="lg"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  >
                    <option value="actions">Actions cotées en bourse</option>
                    <option value="immobilier">Immobilier locatif</option>
                    <option value="obligations">Obligations</option>
                    <option value="compteEpargne">Compte épargne</option>
                  </Select>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {typeInvestissement === 'actions' &&
                      'Taxation : 15% sur les plus-values'}
                    {typeInvestissement === 'immobilier' &&
                      'Taxation : 20% sur les revenus locatifs'}
                    {typeInvestissement === 'obligations' &&
                      'Taxation : 20% sur les intérêts'}
                    {typeInvestissement === 'compteEpargne' &&
                      'Taxation : 20% sur les intérêts'}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.700" fontWeight="500">
                    Montant initial (MAD)
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="100 000"
                    value={montantInitial}
                    onChange={(e) => setMontantInitial(e.target.value)}
                    size="lg"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.700" fontWeight="500">
                    Versement mensuel (MAD) - optionnel
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="1 000"
                    value={versementMensuel}
                    onChange={(e) => setVersementMensuel(e.target.value)}
                    size="lg"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Montant que vous prévoyez d&apos;investir chaque mois
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.700" fontWeight="500">
                    Durée de placement (années)
                  </FormLabel>
                  <Input
                    type="number"
                    placeholder="10"
                    value={duree}
                    onChange={(e) => setDuree(e.target.value)}
                    size="lg"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.700" fontWeight="500">
                    Taux de rendement annuel estimé (%)
                  </FormLabel>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="7.5"
                    value={tauxRendement}
                    onChange={(e) => setTauxRendement(e.target.value)}
                    size="lg"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Rendement moyen annuel attendu avant impôts
                  </Text>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Informations fiscales */}
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="sm" mb={4} color="gray.700" fontWeight="600">
                Fiscalité applicable (Loi de Finances 2025)
              </Heading>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Plus-values boursières
                  </Text>
                  <Badge colorScheme="blue" fontSize="sm">
                    15%
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Dividendes (2025)
                  </Text>
                  <Badge colorScheme="green" fontSize="sm">
                    12,5%
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Intérêts obligataires
                  </Text>
                  <Badge colorScheme="orange" fontSize="sm">
                    20%
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Revenus immobiliers
                  </Text>
                  <Badge colorScheme="purple" fontSize="sm">
                    20%
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Résultats */}
        <VStack spacing={6} align="stretch">
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="md" mb={6} color="gray.700" fontWeight="600">
                Résultats de la simulation
              </Heading>

              {calculerSimulation ? (
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={2} spacing={4}>
                    <Stat>
                      <StatLabel color="gray.600" fontSize="sm">
                        Capital investi
                      </StatLabel>
                      <StatNumber color="gray.700" fontSize="xl">
                        {formatNumber(calculerSimulation.capitalInitial)} MAD
                      </StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel color="gray.600" fontSize="sm">
                        Valeur finale
                      </StatLabel>
                      <StatNumber color="blue.600" fontSize="xl">
                        {formatNumber(calculerSimulation.valeurFinale)} MAD
                      </StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel color="gray.600" fontSize="sm">
                        Gains bruts
                      </StatLabel>
                      <StatNumber color="green.600" fontSize="xl">
                        +{formatNumber(calculerSimulation.gains)} MAD
                      </StatNumber>
                      <StatHelpText color="gray.500" fontSize="xs">
                        +
                        {(
                          (calculerSimulation.gains /
                            calculerSimulation.capitalInitial) *
                          100
                        ).toFixed(1)}
                        %
                      </StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel color="gray.600" fontSize="sm">
                        Impôts estimés
                      </StatLabel>
                      <StatNumber color="red.600" fontSize="xl">
                        -{formatNumber(calculerSimulation.impots)} MAD
                      </StatNumber>
                      <StatHelpText color="gray.500" fontSize="xs">
                        Fiscalité applicable
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>

                  <Divider />

                  <Box
                    p={5}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    borderRadius="lg"
                  >
                    <Text
                      fontSize="sm"
                      color="blue.700"
                      fontWeight="600"
                      mb={2}
                    >
                      Gain net après fiscalité
                    </Text>
                    <Text fontSize="3xl" fontWeight="700" color="blue.700">
                      {formatNumber(
                        calculerSimulation.gains - calculerSimulation.impots
                      )}{' '}
                      MAD
                    </Text>
                    <Text fontSize="sm" color="blue.600" mt={1}>
                      Soit un rendement net de{' '}
                      {(
                        ((calculerSimulation.gains - calculerSimulation.impots) /
                          calculerSimulation.capitalInitial) *
                        100
                      ).toFixed(2)}
                      %
                    </Text>
                  </Box>

                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      Cette simulation est indicative et basée sur la législation
                      fiscale marocaine en vigueur en 2025. Les résultats réels
                      peuvent varier.
                    </AlertDescription>
                  </Alert>
                </VStack>
              ) : (
                <Text color="gray.500" textAlign="center" py={8}>
                  Remplissez le formulaire pour voir les résultats de votre
                  simulation
                </Text>
              )}
            </CardBody>
          </Card>

          {/* Graphiques */}
          {calculerSimulation && (
            <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
              <CardBody>
                <Tabs variant="soft-rounded" colorScheme="gray">
                  <TabList mb={6}>
                    <Tab fontSize="sm">Évolution</Tab>
                    <Tab fontSize="sm">Répartition</Tab>
                    <Tab fontSize="sm">Détails annuels</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Graphique d'évolution */}
                    <TabPanel p={0}>
                      <Box h="300px">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis
                              dataKey="annee"
                              stroke="#6B7280"
                              fontSize={12}
                              label={{
                                value: 'Années',
                                position: 'insideBottom',
                                offset: -5,
                                style: { fontSize: 12, fill: '#6B7280' },
                              }}
                            />
                            <YAxis
                              stroke="#6B7280"
                              fontSize={12}
                              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                              formatter={(value: number) => [
                                `${formatNumber(value)} MAD`,
                                '',
                              ]}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                fontSize: '12px',
                              }}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '12px' }}
                              iconType="line"
                            />
                            <Line
                              type="monotone"
                              dataKey="capital"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              name="Capital total"
                              dot={{ fill: '#3B82F6', r: 3 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="net"
                              stroke="#10B981"
                              strokeWidth={2}
                              name="Gains nets annuels"
                              dot={{ fill: '#10B981', r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </TabPanel>

                    {/* Graphique de répartition */}
                    <TabPanel p={0}>
                      <Box h="300px">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={repartitionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(props: PieLabelRenderProps) => {
                                const { name, percent } = props
                                return `${name}: ${((percent as number) * 100).toFixed(0)}%`
                              }}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {repartitionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                `${formatNumber(value)} MAD`,
                                '',
                              ]}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                fontSize: '12px',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </TabPanel>

                    {/* Tableau détails annuels */}
                    <TabPanel p={0}>
                      <Box h="300px" overflowY="auto">
                        <BarChart
                          width={500}
                          height={300}
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis
                            dataKey="annee"
                            stroke="#6B7280"
                            fontSize={12}
                          />
                          <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            formatter={(value: number) => [
                              `${formatNumber(value)} MAD`,
                              '',
                            ]}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Legend
                            wrapperStyle={{ fontSize: '12px' }}
                            iconType="square"
                          />
                          <Bar
                            dataKey="interet"
                            fill="#10B981"
                            name="Intérêts bruts"
                          />
                          <Bar dataKey="impot" fill="#EF4444" name="Impôts" />
                        </BarChart>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          )}
        </VStack>
      </SimpleGrid>

      {/* Section informative */}
      <Card mt={8} bg={bgCard} borderColor={borderColor} borderWidth="1px">
        <CardBody>
          <Heading size="md" mb={4} color="gray.700" fontWeight="600">
            À propos de ce simulateur
          </Heading>
          <VStack spacing={4} align="stretch">
            <Text color="gray.600" fontSize="sm">
              Ce simulateur vous permet d&apos;estimer le rendement de vos
              investissements au Maroc en tenant compte de la fiscalité en vigueur
              selon la Loi de Finances 2025.
            </Text>
            <Text color="gray.600" fontSize="sm">
              <strong>Nouveautés fiscales 2025 :</strong> Le seuil d&apos;exonération
              de l&apos;impôt sur le revenu passe de 30 000 à 40 000 MAD par an, et
              le taux marginal diminue de 38% à 37%. Les revenus de dividendes sont
              imposés à 12,5% en 2025 (contre 11,25% en 2026 et 10% en 2027).
            </Text>
            <Text color="gray.600" fontSize="sm">
              <strong>Calculs effectués :</strong> La simulation prend en compte les
              versements mensuels, calcule les intérêts composés annuels, applique la
              fiscalité appropriée selon le type d&apos;investissement, et vous
              présente une projection détaillée année par année.
            </Text>
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                <strong>Avertissement :</strong> Les résultats de ce simulateur sont
                fournis à titre indicatif et ne constituent pas un conseil
                financier. Les performances passées ne garantissent pas les
                rendements futurs. Consultez un conseiller financier avant toute
                décision d&apos;investissement.
              </AlertDescription>
            </Alert>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}
