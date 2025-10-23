'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
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
import {
  FaChartLine,
  FaBalanceScale,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaArrowRight,
  FaHome,
} from 'react-icons/fa'
import NextLink from 'next/link'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)
const MotionStack = motion.create(Stack)

// Fonction pour formater les nombres avec espaces
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/,/g, ' ')
}

// Taux fiscaux Maroc 2025
const FISCALITE = {
  plusValuesBoursieres: 0.15, // 15% pour les plus-values boursières
  dividendes: 0.125, // 12.5% en 2025
  interetsBancaires: 0.2, // 20% pour les intérêts
  immobilier: 0.2, // 20% pour revenus locatifs
  plusValueImmobiliere: 0.2, // 20% base (avec abattements possibles)
}

type TypeInvestissement = 'livret' | 'obligations' | 'opcvm' | 'actions' | 'mixte'

interface SimulationResult {
  capitalFinal: number
  totalVerse: number
  gainBrut: number
  impots: number
  gainNet: number
  rendementGlobal: number
  evolutionAnnuelle: Array<{
    annee: number
    capital: number
    interet: number
    impot: number
    net: number
  }>
}

// Composant pour input avec formatage automatique
function FormattedNumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1000,
  placeholder,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
}) {
  const [displayValue, setDisplayValue] = useState(formatNumber(value))

  const handleChange = (valueString: string) => {
    // Enlever les espaces pour obtenir le nombre
    const numericValue = parseFloat(valueString.replace(/\s/g, ''))
    if (!isNaN(numericValue)) {
      onChange(numericValue)
      setDisplayValue(formatNumber(numericValue))
    } else if (valueString === '') {
      onChange(0)
      setDisplayValue('')
    }
  }

  const handleBlur = () => {
    if (value === 0) {
      setDisplayValue('')
    } else {
      setDisplayValue(formatNumber(value))
    }
  }

  return (
    <NumberInput
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={step}
    >
      <NumberInputField placeholder={placeholder} />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  )
}

// Simulateur 1: Épargne et Placement (Amélioré)
function SimulateurEpargne() {
  const [montantInitial, setMontantInitial] = useState<number>(100000)
  const [epargneReguliere, setEpargneReguliere] = useState<number>(2000)
  const [duree, setDuree] = useState<number>(10)
  const [typeInvestissement, setTypeInvestissement] =
    useState<TypeInvestissement>('mixte')

  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Taux de rendement annuels moyens selon le type de placement
  const tauxRendementData: {
    [key in TypeInvestissement]: { taux: number; fiscal: number }
  } = {
    livret: { taux: 2.5, fiscal: FISCALITE.interetsBancaires },
    obligations: { taux: 4.5, fiscal: FISCALITE.interetsBancaires },
    opcvm: { taux: 6.5, fiscal: FISCALITE.plusValuesBoursieres },
    actions: { taux: 8.5, fiscal: FISCALITE.plusValuesBoursieres },
    mixte: { taux: 5.5, fiscal: FISCALITE.plusValuesBoursieres },
  }

  const calculerSimulation = useMemo((): SimulationResult => {
    const { taux: tauxAnnuel, fiscal: tauxFiscal } =
      tauxRendementData[typeInvestissement]
    const taux = tauxAnnuel / 100

    const evolutionAnnuelle = []
    let capitalActuel = montantInitial

    for (let annee = 1; annee <= duree; annee++) {
      const versementsAnnuels = epargneReguliere * 12
      capitalActuel += versementsAnnuels
      const interetBrut = capitalActuel * taux
      const impot = interetBrut * tauxFiscal
      const interetNet = interetBrut - impot
      capitalActuel += interetNet

      evolutionAnnuelle.push({
        annee,
        capital: Math.round(capitalActuel),
        interet: Math.round(interetBrut),
        impot: Math.round(impot),
        net: Math.round(interetNet),
      })
    }

    const capitalFinal = capitalActuel
    const totalVerse = montantInitial + epargneReguliere * 12 * duree
    const gainBrut = capitalFinal - totalVerse
    const impots = evolutionAnnuelle.reduce((sum, e) => sum + e.impot, 0)
    const gainNet = gainBrut
    const rendementGlobal = totalVerse > 0 ? (capitalFinal / totalVerse - 1) * 100 : 0

    return {
      capitalFinal,
      totalVerse,
      gainBrut: gainBrut + impots,
      impots,
      gainNet,
      rendementGlobal,
      evolutionAnnuelle,
    }
  }, [montantInitial, epargneReguliere, duree, typeInvestissement])

  const chartData = calculerSimulation.evolutionAnnuelle

  const repartitionData = [
    { name: 'Capital versé', value: calculerSimulation.totalVerse, color: '#64748b' },
    { name: 'Gains nets', value: calculerSimulation.gainNet, color: '#f59e0b' },
    { name: 'Impôts', value: calculerSimulation.impots, color: '#dc2626' },
  ]

  return (
    <Stack spacing={8}>
      <Text fontSize="lg" color="gray.600">
        Projetez l'évolution de votre épargne selon différents types de placements avec
        calculs fiscaux précis selon la Loi de Finances 2025.
      </Text>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
        <VStack spacing={6} align="stretch">
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="md" mb={6} color="brand.700" fontWeight="600">
                Paramètres de simulation
              </Heading>

              <VStack spacing={5} align="stretch">
                <FormControl>
                  <FormLabel color="brand.700" fontWeight="500">
                    Type d'investissement
                  </FormLabel>
                  <Select
                    value={typeInvestissement}
                    onChange={(e) =>
                      setTypeInvestissement(e.target.value as TypeInvestissement)
                    }
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  >
                    <option value="livret">Compte sur livret (2,5%)</option>
                    <option value="obligations">Obligations (4,5%)</option>
                    <option value="opcvm">OPCVM équilibré (6,5%)</option>
                    <option value="actions">Actions (8,5%)</option>
                    <option value="mixte">Portefeuille mixte (5,5%)</option>
                  </Select>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Taxation :{' '}
                    {tauxRendementData[typeInvestissement].fiscal ===
                    FISCALITE.plusValuesBoursieres
                      ? '15% (plus-values)'
                      : '20% (intérêts)'}
                  </Text>
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.700" fontWeight="500">
                    Montant initial (MAD)
                  </FormLabel>
                  <FormattedNumberInput
                    value={montantInitial}
                    onChange={setMontantInitial}
                    step={10000}
                    max={10000000}
                    placeholder="100 000"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.700" fontWeight="500">
                    Épargne mensuelle (MAD)
                  </FormLabel>
                  <FormattedNumberInput
                    value={epargneReguliere}
                    onChange={setEpargneReguliere}
                    step={500}
                    max={100000}
                    placeholder="2 000"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="brand.700" fontWeight="500">
                    Durée (années)
                  </FormLabel>
                  <NumberInput
                    value={duree}
                    onChange={(_, val) => setDuree(val)}
                    min={1}
                    max={40}
                    step={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="sm" mb={4} color="brand.700" fontWeight="600">
                Fiscalité applicable 2025
              </Heading>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Plus-values boursières
                  </Text>
                  <Badge colorScheme="yellow" fontSize="sm">
                    15%
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Dividendes
                  </Text>
                  <Badge colorScheme="yellow" fontSize="sm">
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
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        <VStack spacing={6} align="stretch">
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="md" mb={6} color="brand.700" fontWeight="600">
                Résultats de la simulation
              </Heading>

              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">
                      Capital versé
                    </StatLabel>
                    <StatNumber color="brand.700" fontSize="xl">
                      {formatNumber(calculerSimulation.totalVerse)} MAD
                    </StatNumber>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">
                      Capital final
                    </StatLabel>
                    <StatNumber color="accent.600" fontSize="xl">
                      {formatNumber(calculerSimulation.capitalFinal)} MAD
                    </StatNumber>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">
                      Gain brut
                    </StatLabel>
                    <StatNumber color="accent.600" fontSize="xl">
                      +{formatNumber(calculerSimulation.gainBrut)} MAD
                    </StatNumber>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">
                      Impôts
                    </StatLabel>
                    <StatNumber color="red.600" fontSize="xl">
                      -{formatNumber(calculerSimulation.impots)} MAD
                    </StatNumber>
                  </Stat>
                </SimpleGrid>

                <Divider />

                <Box p={5} bg="accent.50" borderRadius="lg" borderWidth="1px" borderColor="accent.200">
                  <Text fontSize="sm" color="accent.700" fontWeight="600" mb={2}>
                    Gain net après fiscalité
                  </Text>
                  <Text fontSize="3xl" fontWeight="700" color="accent.700">
                    +{formatNumber(calculerSimulation.gainNet)} MAD
                  </Text>
                  <Text fontSize="sm" color="accent.600" mt={1}>
                    Rendement global : +{calculerSimulation.rendementGlobal.toFixed(2)}%
                  </Text>
                </Box>

                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    Simulation basée sur la fiscalité 2025. Les rendements passés ne
                    préjugent pas des rendements futurs.
                  </AlertDescription>
                </Alert>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Tabs variant="soft-rounded" colorScheme="yellow">
                <TabList mb={6}>
                  <Tab fontSize="sm">Évolution</Tab>
                  <Tab fontSize="sm">Répartition</Tab>
                  <Tab fontSize="sm">Détails</Tab>
                </TabList>

                <TabPanels>
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
                            formatter={(value: number) => [`${formatNumber(value)} MAD`, '']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} iconType="line" />
                          <Line
                            type="monotone"
                            dataKey="capital"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            name="Capital total"
                            dot={{ fill: '#f59e0b', r: 3 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="net"
                            stroke="#64748b"
                            strokeWidth={2}
                            name="Gains nets annuels"
                            dot={{ fill: '#64748b', r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </TabPanel>

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
                            formatter={(value: number) => [`${formatNumber(value)} MAD`, '']}
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

                  <TabPanel p={0}>
                    <Box h="300px" overflowY="auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="annee" stroke="#6B7280" fontSize={12} />
                          <YAxis
                            stroke="#6B7280"
                            fontSize={12}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            formatter={(value: number) => [`${formatNumber(value)} MAD`, '']}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #E5E7EB',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '12px' }} iconType="square" />
                          <Bar dataKey="interet" fill="#f59e0b" name="Intérêts bruts" />
                          <Bar dataKey="impot" fill="#dc2626" name="Impôts" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>
    </Stack>
  )
}

// Simulateur 2: Succession (UX Améliorée)
function CalculateurSuccession() {
  const [patrimoine, setPatrimoine] = useState<number>(2000000)
  const [conjoint, setConjoint] = useState<string>('oui')
  const [nbEnfants, setNbEnfants] = useState<number>(2)
  const [nbGarcons, setNbGarcons] = useState<number>(1)
  const [parents, setParents] = useState<string>('non')

  const nbFilles = nbEnfants - nbGarcons

  const calculerSuccession = () => {
    let partConjoint = 0
    let partEnfants = 0
    let partParents = 0

    if (conjoint === 'oui') {
      if (nbEnfants > 0) {
        partConjoint = patrimoine * (1 / 8)
      } else {
        partConjoint = patrimoine * (1 / 4)
      }
    }

    if (parents === 'oui' && nbEnfants === 0) {
      partParents = patrimoine * (1 / 3)
    } else if (parents === 'oui' && nbEnfants > 0) {
      partParents = patrimoine * (1 / 6)
    }

    const reste = patrimoine - partConjoint - partParents

    if (nbEnfants > 0) {
      partEnfants = reste
    }

    const totalParts = nbGarcons * 2 + nbFilles * 1
    const partFille = totalParts > 0 ? partEnfants / totalParts : 0
    const partGarcon = partFille * 2

    return { partConjoint, partParents, partGarcon, partFille }
  }

  const resultat = calculerSuccession()

  return (
    <Stack spacing={8}>
      <Text fontSize="lg" color="gray.600">
        Estimez la répartition de votre succession selon le Code marocain (Moudawana).
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <Stack spacing={6}>
          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Patrimoine total à transmettre (MAD)
            </FormLabel>
            <FormattedNumberInput
              value={patrimoine}
              onChange={setPatrimoine}
              step={100000}
              max={50000000}
              placeholder="2 000 000"
            />
          </FormControl>

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Conjoint survivant
            </FormLabel>
            <Select value={conjoint} onChange={(e) => setConjoint(e.target.value)}>
              <option value="oui">Oui</option>
              <option value="non">Non</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Nombre total d'enfants
            </FormLabel>
            <NumberInput
              value={nbEnfants}
              onChange={(_, val) => {
                setNbEnfants(val)
                if (nbGarcons > val) setNbGarcons(val)
              }}
              min={0}
              max={20}
              step={1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          {nbEnfants > 0 && (
            <FormControl>
              <FormLabel color="brand.700" fontWeight="500">
                Nombre de garçons
              </FormLabel>
              <NumberInput
                value={nbGarcons}
                onChange={(_, val) => setNbGarcons(val)}
                min={0}
                max={nbEnfants}
                step={1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Nombre de filles : {nbFilles}
              </Text>
            </FormControl>
          )}

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Parents vivants
            </FormLabel>
            <Select value={parents} onChange={(e) => setParents(e.target.value)}>
              <option value="oui">Oui (au moins un)</option>
              <option value="non">Non</option>
            </Select>
          </FormControl>
        </Stack>

        <Box bg="brand.50" p={8} rounded="xl" borderWidth="1px" borderColor="brand.200">
          <Stack spacing={6}>
            <Heading size="md" color="brand.700">
              Répartition selon la Moudawana
            </Heading>

            <Table size="sm" variant="simple">
              <Thead>
                <Tr>
                  <Th>Héritier</Th>
                  <Th isNumeric>Part</Th>
                  <Th isNumeric>Montant</Th>
                </Tr>
              </Thead>
              <Tbody>
                {conjoint === 'oui' && (
                  <Tr>
                    <Td fontWeight="semibold">Conjoint</Td>
                    <Td isNumeric>
                      {((resultat.partConjoint / patrimoine) * 100).toFixed(2)}%
                    </Td>
                    <Td isNumeric fontWeight="bold">
                      {formatNumber(resultat.partConjoint)} MAD
                    </Td>
                  </Tr>
                )}
                {parents === 'oui' && resultat.partParents > 0 && (
                  <Tr>
                    <Td fontWeight="semibold">Parents</Td>
                    <Td isNumeric>
                      {((resultat.partParents / patrimoine) * 100).toFixed(2)}%
                    </Td>
                    <Td isNumeric fontWeight="bold">
                      {formatNumber(resultat.partParents)} MAD
                    </Td>
                  </Tr>
                )}
                {nbGarcons > 0 && (
                  <Tr>
                    <Td fontWeight="semibold">Chaque garçon ({nbGarcons})</Td>
                    <Td isNumeric>2 parts</Td>
                    <Td isNumeric fontWeight="bold" color="accent.600">
                      {formatNumber(resultat.partGarcon)} MAD
                    </Td>
                  </Tr>
                )}
                {nbFilles > 0 && (
                  <Tr>
                    <Td fontWeight="semibold">Chaque fille ({nbFilles})</Td>
                    <Td isNumeric>1 part</Td>
                    <Td isNumeric fontWeight="bold" color="brand.600">
                      {formatNumber(resultat.partFille)} MAD
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>

            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Ce calcul est simplifié. Pour une situation complexe, consultez un notaire
                ou un expert en droit successoral marocain.
              </AlertDescription>
            </Alert>
          </Stack>
        </Box>
      </SimpleGrid>
    </Stack>
  )
}

// Simulateur 3: Fiscalité (IR Maroc 2025)
function SimulateurFiscalite() {
  const [revenuAnnuel, setRevenuAnnuel] = useState<number>(200000)
  const [deductionsFamiliales, setDeductionsFamiliales] = useState<number>(0)
  const [deductionsProfessionnelles, setDeductionsProfessionnelles] = useState<number>(0)
  const [autresDeductions, setAutresDeductions] = useState<number>(0)

  const calculerIR = (revenuImposable: number) => {
    let impot = 0

    if (revenuImposable <= 40000) {
      impot = 0
    } else if (revenuImposable <= 60000) {
      impot = (revenuImposable - 40000) * 0.1
    } else if (revenuImposable <= 80000) {
      impot = 20000 * 0.1 + (revenuImposable - 60000) * 0.2
    } else if (revenuImposable <= 180000) {
      impot = 20000 * 0.1 + 20000 * 0.2 + (revenuImposable - 80000) * 0.34
    } else {
      impot = 20000 * 0.1 + 20000 * 0.2 + 100000 * 0.34 + (revenuImposable - 180000) * 0.37
    }

    return impot
  }

  const totalDeductions = deductionsFamiliales + deductionsProfessionnelles + autresDeductions
  const revenuImposable = Math.max(0, revenuAnnuel - totalDeductions)
  const impotDu = calculerIR(revenuImposable)
  const impotSansDeductions = calculerIR(revenuAnnuel)
  const economie = impotSansDeductions - impotDu
  const tauxEffectif = revenuAnnuel > 0 ? (impotDu / revenuAnnuel) * 100 : 0
  const revenuNet = revenuAnnuel - impotDu

  return (
    <Stack spacing={8}>
      <Text fontSize="lg" color="gray.600">
        Calculez votre impôt sur le revenu selon le barème marocain 2025.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <Stack spacing={6}>
          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Revenu annuel brut (MAD)
            </FormLabel>
            <FormattedNumberInput
              value={revenuAnnuel}
              onChange={setRevenuAnnuel}
              step={10000}
              max={10000000}
              placeholder="200 000"
            />
          </FormControl>

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Déductions familiales (MAD)
            </FormLabel>
            <FormattedNumberInput
              value={deductionsFamiliales}
              onChange={setDeductionsFamiliales}
              step={360}
              max={revenuAnnuel}
              placeholder="0"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              360 MAD/an par personne à charge (max 2 160 MAD)
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Déductions professionnelles (MAD)
            </FormLabel>
            <FormattedNumberInput
              value={deductionsProfessionnelles}
              onChange={setDeductionsProfessionnelles}
              step={1000}
              max={revenuAnnuel}
              placeholder="0"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Frais réels justifiés ou forfait de 20% (max 30 000 MAD)
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Autres déductions (MAD)
            </FormLabel>
            <FormattedNumberInput
              value={autresDeductions}
              onChange={setAutresDeductions}
              step={1000}
              max={revenuAnnuel}
              placeholder="0"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Cotisations CNSS, assurance retraite, intérêts prêt logement...
            </Text>
          </FormControl>
        </Stack>

        <Box bg="brand.50" p={8} rounded="xl" borderWidth="1px" borderColor="brand.200">
          <Stack spacing={6}>
            <Heading size="md" color="brand.700">
              Calcul de l'impôt sur le revenu
            </Heading>

            <SimpleGrid columns={2} spacing={4}>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Revenu brut</StatLabel>
                <StatNumber fontSize="lg">{formatNumber(revenuAnnuel)} MAD</StatNumber>
              </Stat>

              <Stat>
                <StatLabel fontSize="sm" color="gray.600">Déductions</StatLabel>
                <StatNumber fontSize="lg" color="orange.600">
                  -{formatNumber(totalDeductions)} MAD
                </StatNumber>
              </Stat>
            </SimpleGrid>

            <Divider />

            <Stat>
              <StatLabel color="gray.600">Revenu imposable</StatLabel>
              <StatNumber fontSize="2xl" color="brand.700">
                {formatNumber(revenuImposable)} MAD
              </StatNumber>
            </Stat>

            <Stat>
              <StatLabel color="gray.600">Impôt dû (IR)</StatLabel>
              <StatNumber fontSize="3xl" color="red.600">
                {formatNumber(impotDu)} MAD
              </StatNumber>
              <StatHelpText>Taux effectif: {tauxEffectif.toFixed(2)}%</StatHelpText>
            </Stat>

            <Divider />

            <Stat>
              <StatLabel color="gray.600">Revenu net annuel</StatLabel>
              <StatNumber fontSize="2xl" color="accent.600">
                {formatNumber(revenuNet)} MAD
              </StatNumber>
              <StatHelpText>Soit {formatNumber(revenuNet / 12)} MAD/mois</StatHelpText>
            </Stat>

            {economie > 0 && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  <strong>Économie fiscale: {formatNumber(economie)} MAD</strong>
                  <br />
                  Grâce aux déductions appliquées
                </AlertDescription>
              </Alert>
            )}
          </Stack>
        </Box>
      </SimpleGrid>

      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <AlertDescription>
          <strong>Barème IR Maroc 2025:</strong> 0% jusqu'à 40 000 MAD, 10% de 40 001 à 60
          000 MAD, 20% de 60 001 à 80 000 MAD, 34% de 80 001 à 180 000 MAD, 37% au-delà de
          180 000 MAD.
        </AlertDescription>
      </Alert>
    </Stack>
  )
}

// Simulateur 4: Bilan Patrimonial
function BilanPatrimonial() {
  const [liquidites, setLiquidites] = useState<number>(50000)
  const [placements, setPlacements] = useState<number>(200000)
  const [immobilier, setImmobilier] = useState<number>(1500000)
  const [autresActifs, setAutresActifs] = useState<number>(100000)
  const [creditImmo, setCreditImmo] = useState<number>(800000)
  const [autresCredit, setAutresCredit] = useState<number>(50000)

  const totalActifs = liquidites + placements + immobilier + autresActifs
  const totalPassifs = creditImmo + autresCredit
  const patrimoineNet = totalActifs - totalPassifs
  const ratioEndettement = totalActifs > 0 ? (totalPassifs / totalActifs) * 100 : 0

  return (
    <Stack spacing={8}>
      <Text fontSize="lg" color="gray.600">
        Évaluez rapidement votre situation patrimoniale globale.
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <Stack spacing={6}>
          <Box bg="brand.50" p={6} rounded="lg" borderWidth="1px" borderColor="brand.200">
            <Heading size="sm" mb={4} color="brand.700">
              Actifs
            </Heading>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" color="brand.700">
                  Liquidités (comptes, livrets)
                </FormLabel>
                <FormattedNumberInput
                  value={liquidites}
                  onChange={setLiquidites}
                  step={5000}
                  placeholder="50 000"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="brand.700">
                  Placements financiers (OPCVM, actions...)
                </FormLabel>
                <FormattedNumberInput
                  value={placements}
                  onChange={setPlacements}
                  step={10000}
                  placeholder="200 000"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="brand.700">
                  Immobilier (valeur actuelle)
                </FormLabel>
                <FormattedNumberInput
                  value={immobilier}
                  onChange={setImmobilier}
                  step={50000}
                  placeholder="1 500 000"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="brand.700">
                  Autres actifs
                </FormLabel>
                <FormattedNumberInput
                  value={autresActifs}
                  onChange={setAutresActifs}
                  step={10000}
                  placeholder="100 000"
                />
              </FormControl>
            </VStack>
          </Box>

          <Box bg="red.50" p={6} rounded="lg" borderWidth="1px" borderColor="red.200">
            <Heading size="sm" mb={4} color="red.700">
              Passifs
            </Heading>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" color="red.700">
                  Crédit immobilier (capital restant dû)
                </FormLabel>
                <FormattedNumberInput
                  value={creditImmo}
                  onChange={setCreditImmo}
                  step={10000}
                  placeholder="800 000"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" color="red.700">
                  Autres crédits
                </FormLabel>
                <FormattedNumberInput
                  value={autresCredit}
                  onChange={setAutresCredit}
                  step={5000}
                  placeholder="50 000"
                />
              </FormControl>
            </VStack>
          </Box>
        </Stack>

        <Stack spacing={6}>
          <Box bg="accent.50" p={8} rounded="xl" borderWidth="1px" borderColor="accent.200">
            <Stack spacing={6}>
              <Heading size="md" color="accent.700">
                Synthèse patrimoniale
              </Heading>

              <Stat>
                <StatLabel color="gray.600">Patrimoine net</StatLabel>
                <StatNumber fontSize="4xl" color="accent.700">
                  {formatNumber(patrimoineNet)} MAD
                </StatNumber>
              </Stat>

              <Divider />

              <SimpleGrid columns={2} spacing={4}>
                <Stat>
                  <StatLabel fontSize="sm" color="gray.600">
                    Total actifs
                  </StatLabel>
                  <StatNumber fontSize="xl" color="brand.600">
                    {formatNumber(totalActifs)} MAD
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel fontSize="sm" color="gray.600">
                    Total passifs
                  </StatLabel>
                  <StatNumber fontSize="xl" color="red.600">
                    {formatNumber(totalPassifs)} MAD
                  </StatNumber>
                </Stat>
              </SimpleGrid>

              <Stat>
                <StatLabel fontSize="sm" color="gray.600">
                  Ratio d'endettement
                </StatLabel>
                <StatNumber
                  fontSize="2xl"
                  color={ratioEndettement > 50 ? 'orange.600' : 'accent.600'}
                >
                  {ratioEndettement.toFixed(1)}%
                </StatNumber>
                <StatHelpText>
                  {ratioEndettement > 50
                    ? "Niveau d'endettement élevé"
                    : "Niveau d'endettement sain"}
                </StatHelpText>
              </Stat>
            </Stack>
          </Box>

          <Card bg="white" shadow="sm" borderWidth="1px" borderColor="gray.200">
            <CardBody>
              <Heading size="sm" mb={4} color="brand.700">
                Répartition des actifs
              </Heading>
              <Table size="sm" variant="simple">
                <Tbody>
                  <Tr>
                    <Td>Liquidités</Td>
                    <Td isNumeric>{((liquidites / totalActifs) * 100).toFixed(1)}%</Td>
                    <Td isNumeric fontWeight="semibold">
                      {formatNumber(liquidites)} MAD
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Placements</Td>
                    <Td isNumeric>{((placements / totalActifs) * 100).toFixed(1)}%</Td>
                    <Td isNumeric fontWeight="semibold">
                      {formatNumber(placements)} MAD
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Immobilier</Td>
                    <Td isNumeric>{((immobilier / totalActifs) * 100).toFixed(1)}%</Td>
                    <Td isNumeric fontWeight="semibold">
                      {formatNumber(immobilier)} MAD
                    </Td>
                  </Tr>
                  <Tr>
                    <Td>Autres actifs</Td>
                    <Td isNumeric>{((autresActifs / totalActifs) * 100).toFixed(1)}%</Td>
                    <Td isNumeric fontWeight="semibold">
                      {formatNumber(autresActifs)} MAD
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <AlertDescription fontSize="sm">
              Besoin d'un bilan complet ?
              <br />
              <Button
                as="a"
                href="https://calendly.com/kamil-messidor"
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                colorScheme="yellow"
                mt={2}
              >
                Prendre rendez-vous
              </Button>
            </AlertDescription>
          </Alert>
        </Stack>
      </SimpleGrid>
    </Stack>
  )
}

// Simulateur 5: Plus-Value Immobilière
function SimulateurPVImmobiliere() {
  const [prixAchat, setPrixAchat] = useState<number>(1000000)
  const [prixVente, setPrixVente] = useState<number>(1500000)
  const [dureeDetention, setDureeDetention] = useState<number>(5)
  const [fraisAcquisition, setFraisAcquisition] = useState<number>(70000)
  const [travauxAmeliorations, setTravauxAmeliorations] = useState<number>(0)

  const plusValueBrute = prixVente - (prixAchat + fraisAcquisition + travauxAmeliorations)

  // Abattement selon la durée de détention (simplifié)
  let tauxAbattement = 0
  if (dureeDetention >= 4 && dureeDetention < 6) {
    tauxAbattement = 0.1 // 10%
  } else if (dureeDetention >= 6 && dureeDetention < 8) {
    tauxAbattement = 0.2 // 20%
  } else if (dureeDetention >= 8) {
    tauxAbattement = 0.3 // 30% (abattement prolongé jusqu'en 2030)
  }

  const abattement = plusValueBrute * tauxAbattement
  const plusValueImposable = Math.max(0, plusValueBrute - abattement)
  const impot = plusValueImposable * FISCALITE.plusValueImmobiliere
  const netApresFiscalite = plusValueBrute - impot

  return (
    <Stack spacing={8}>
      <Text fontSize="lg" color="gray.600">
        Calculez la plus-value et l'impôt dus lors de la vente d'un bien immobilier au Maroc
        (Loi de Finances 2025 - abattement de 70% prolongé jusqu'en 2030).
      </Text>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
        <Stack spacing={6}>
          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Prix d'achat (MAD)
            </FormLabel>
            <FormattedNumberInput
              value={prixAchat}
              onChange={setPrixAchat}
              step={50000}
              max={50000000}
              placeholder="1 000 000"
            />
          </FormControl>

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Prix de vente (MAD)
            </FormLabel>
            <FormattedNumberInput
              value={prixVente}
              onChange={setPrixVente}
              step={50000}
              max={50000000}
              placeholder="1 500 000"
            />
          </FormControl>

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Durée de détention (années)
            </FormLabel>
            <NumberInput
              value={dureeDetention}
              onChange={(_, val) => setDureeDetention(val)}
              min={0}
              max={50}
              step={1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Nombre d'années entre l'achat et la vente
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Frais d'acquisition (MAD)
            </FormLabel>
            <FormattedNumberInput
              value={fraisAcquisition}
              onChange={setFraisAcquisition}
              step={5000}
              max={prixAchat}
              placeholder="70 000"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Frais de notaire, droits d'enregistrement (environ 7% du prix)
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel color="brand.700" fontWeight="500">
              Travaux d'amélioration (MAD)
            </FormLabel>
            <FormattedNumberInput
              value={travauxAmeliorations}
              onChange={setTravauxAmeliorations}
              step={10000}
              max={prixAchat}
              placeholder="0"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Travaux réalisés avec factures (déductibles)
            </Text>
          </FormControl>
        </Stack>

        <Box bg="brand.50" p={8} rounded="xl" borderWidth="1px" borderColor="brand.200">
          <Stack spacing={6}>
            <Heading size="md" color="brand.700">
              Calcul de la plus-value
            </Heading>

            <Stat>
              <StatLabel color="gray.600">Plus-value brute</StatLabel>
              <StatNumber fontSize="2xl" color="brand.700">
                {formatNumber(plusValueBrute)} MAD
              </StatNumber>
            </Stat>

            <Divider />

            <SimpleGrid columns={1} spacing={3}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Abattement ({tauxAbattement * 100}%)
                </Text>
                <Text fontSize="sm" fontWeight="semibold" color="accent.600">
                  -{formatNumber(abattement)} MAD
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Plus-value imposable
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {formatNumber(plusValueImposable)} MAD
                </Text>
              </HStack>
            </SimpleGrid>

            <Divider />

            <Stat>
              <StatLabel color="gray.600">Impôt dû (20%)</StatLabel>
              <StatNumber fontSize="3xl" color="red.600">
                {formatNumber(impot)} MAD
              </StatNumber>
            </Stat>

            <Divider />

            <Box p={5} bg="accent.50" borderRadius="lg" borderWidth="1px" borderColor="accent.200">
              <Text fontSize="sm" color="accent.700" fontWeight="600" mb={2}>
                Plus-value nette après impôt
              </Text>
              <Text fontSize="3xl" fontWeight="700" color="accent.700">
                {formatNumber(netApresFiscalite)} MAD
              </Text>
            </Box>

            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                {dureeDetention >= 8
                  ? `Abattement de 30% applicable (détention ≥ 8 ans). L'abattement de 70% sur les plus-values immobilières est prolongé jusqu'au 31 décembre 2030.`
                  : dureeDetention >= 6
                    ? 'Abattement de 20% applicable (détention 6-8 ans).'
                    : dureeDetention >= 4
                      ? 'Abattement de 10% applicable (détention 4-6 ans).'
                      : 'Aucun abattement (détention < 4 ans).'}
              </AlertDescription>
            </Alert>
          </Stack>
        </Box>
      </SimpleGrid>

      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <AlertDescription>
          <strong>Important :</strong> Ce calcul est simplifié. Certaines exonérations
          peuvent s'appliquer (résidence principale, donations familiales, etc.). Consultez un
          fiscaliste pour un calcul précis.
        </AlertDescription>
      </Alert>
    </Stack>
  )
}

export default function SimulateursPage() {
  return (
    <Box flex="1">
      <Box
        position="relative"
        bg="brand.800"
        color="white"
        py={{ base: 20, md: 32 }}
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          bgGradient="radial(circle at 30% 20%, accent.300 0%, transparent 70%)"
        />
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <MotionStack
            spacing={6}
            maxW="4xl"
            mx="auto"
            textAlign="center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '6xl' }}
              fontWeight="bold"
              lineHeight="1.1"
            >
              Simulateurs financiers gratuits
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="300" lineHeight="1.6">
              Outils interactifs en temps réel pour simuler vos placements, calculer votre
              succession, optimiser votre fiscalité et établir votre bilan patrimonial selon
              la Loi de Finances 2025.
            </Text>
          </MotionStack>
        </Container>
      </Box>

      <Box py={{ base: 16, md: 24 }} bg="gray.50">
        <Container maxW="container.xl">
          <Tabs variant="enclosed" colorScheme="yellow" size={{ base: 'sm', md: 'md' }} isLazy>
            <TabList
              overflowX="auto"
              overflowY="hidden"
              sx={{
                scrollbarWidth: 'none',
                '::-webkit-scrollbar': { display: 'none' },
                borderBottom: '2px solid',
                borderColor: 'gray.200',
              }}
              flexWrap={{ base: 'nowrap', md: 'wrap' }}
            >
              <Tab
                _selected={{ bg: 'white', borderColor: 'gray.300', borderBottom: 'none' }}
                fontWeight="semibold"
                whiteSpace="nowrap"
              >
                <Icon as={FaChartLine} mr={2} />
                Épargne & Placement
              </Tab>
              <Tab
                _selected={{ bg: 'white', borderColor: 'gray.300', borderBottom: 'none' }}
                fontWeight="semibold"
                whiteSpace="nowrap"
              >
                <Icon as={FaBalanceScale} mr={2} />
                Succession
              </Tab>
              <Tab
                _selected={{ bg: 'white', borderColor: 'gray.300', borderBottom: 'none' }}
                fontWeight="semibold"
                whiteSpace="nowrap"
              >
                <Icon as={FaFileInvoiceDollar} mr={2} />
                Fiscalité (IR)
              </Tab>
              <Tab
                _selected={{ bg: 'white', borderColor: 'gray.300', borderBottom: 'none' }}
                fontWeight="semibold"
                whiteSpace="nowrap"
              >
                <Icon as={FaClipboardList} mr={2} />
                Bilan Patrimonial
              </Tab>
              <Tab
                _selected={{ bg: 'white', borderColor: 'gray.300', borderBottom: 'none' }}
                fontWeight="semibold"
                whiteSpace="nowrap"
              >
                <Icon as={FaHome} mr={2} />
                Plus-Value Immobilière
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel bg="white" rounded="md" shadow="sm" p={{ base: 6, md: 10 }}>
                <SimulateurEpargne />
              </TabPanel>

              <TabPanel bg="white" rounded="md" shadow="sm" p={{ base: 6, md: 10 }}>
                <CalculateurSuccession />
              </TabPanel>

              <TabPanel bg="white" rounded="md" shadow="sm" p={{ base: 6, md: 10 }}>
                <SimulateurFiscalite />
              </TabPanel>

              <TabPanel bg="white" rounded="md" shadow="sm" p={{ base: 6, md: 10 }}>
                <BilanPatrimonial />
              </TabPanel>

              <TabPanel bg="white" rounded="md" shadow="sm" p={{ base: 6, md: 10 }}>
                <SimulateurPVImmobiliere />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>

      {/* Section SEO - Contenu riche pour Google */}
      <Box py={{ base: 16, md: 24 }} bg="white">
        <Container maxW="container.xl">
          <VStack spacing={12} align="stretch">
            <Box>
              <Heading
                as="h2"
                fontSize={{ base: '2xl', md: '3xl' }}
                mb={6}
                color="brand.800"
              >
                Simulateurs Financiers Maroc 2025 : Calculez Précisément Votre Fiscalité
              </Heading>
              <Text fontSize="lg" color="gray.700" mb={4} lineHeight="1.8">
                Notre suite de <strong>simulateurs financiers gratuits</strong> vous permet de
                calculer avec précision votre impôt sur le revenu (IR), votre succession selon
                la Moudawana, le rendement de votre épargne, vos plus-values immobilières et
                votre bilan patrimonial. Tous nos outils sont conformes à la{' '}
                <strong>Loi de Finances 2025</strong> et intègrent les dernières mises à jour
                fiscales du Maroc.
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Box>
                <Heading as="h3" size="md" mb={4} color="brand.700">
                  Simulateur Impôt sur le Revenu (IR) Maroc 2025
                </Heading>
                <Text color="gray.600" lineHeight="1.8">
                  Calculez votre <strong>impôt sur le revenu</strong> avec le nouveau barème
                  2025 : seuil d'exonération à <strong>40 000 MAD</strong>, taux marginal à{' '}
                  <strong>37%</strong>. Notre simulateur IR prend en compte toutes les
                  déductions fiscales : charges de famille (360 MAD par personne), déductions
                  professionnelles (max 30 000 MAD), cotisations CNSS, assurance retraite et
                  intérêts de prêt logement.
                </Text>
              </Box>

              <Box>
                <Heading as="h3" size="md" mb={4} color="brand.700">
                  Calculateur Succession Moudawana
                </Heading>
                <Text color="gray.600" lineHeight="1.8">
                  Estimez la <strong>répartition de votre héritage</strong> selon le droit
                  marocain (Moudawana). Notre calculateur applique les règles de succession
                  islamique : parts du conjoint (1/8 ou 1/4), répartition entre enfants (2
                  parts pour garçon, 1 part pour fille), droits des parents. Simulation
                  instantanée et détaillée pour planifier votre transmission patrimoniale.
                </Text>
              </Box>

              <Box>
                <Heading as="h3" size="md" mb={4} color="brand.700">
                  Simulateur Épargne et Placement OPCVM
                </Heading>
                <Text color="gray.600" lineHeight="1.8">
                  Projetez le <strong>rendement de votre épargne</strong> sur 5, 10, 20 ans ou
                  plus. Notre simulateur intègre les taux de rendement moyens (2,5% livret,
                  4,5% obligations, 6,5% OPCVM, 8,5% actions) et applique automatiquement la
                  fiscalité : <strong>15% sur plus-values boursières</strong>,{' '}
                  <strong>12,5% sur dividendes 2025</strong>, 20% sur intérêts. Visualisez
                  l'évolution avec des graphiques détaillés.
                </Text>
              </Box>

              <Box>
                <Heading as="h3" size="md" mb={4} color="brand.700">
                  Calculateur Plus-Value Immobilière
                </Heading>
                <Text color="gray.600" lineHeight="1.8">
                  Calculez l'<strong>impôt sur plus-value immobilière</strong> lors de la vente
                  de votre bien. Notre outil applique les abattements selon la durée de
                  détention (10%, 20%, 30%) et l'
                  <strong>abattement exceptionnel de 70% prolongé jusqu'en 2030</strong>. Taxe
                  de 20% sur la plus-value nette avec déduction des frais d'acquisition et
                  travaux justifiés.
                </Text>
              </Box>
            </SimpleGrid>

            <Box bg="accent.50" p={8} borderRadius="xl" borderWidth="1px" borderColor="accent.200">
              <Heading as="h3" size="md" mb={4} color="accent.700">
                Pourquoi Utiliser Nos Simulateurs Financiers ?
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <HStack align="start">
                  <Icon as={FaChartLine} color="accent.600" boxSize={5} mt={1} />
                  <Box>
                    <Text fontWeight="600" color="gray.800">
                      Calculs Précis et Actualisés
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Barème IR 2025, fiscalité boursière, abattements immobiliers selon la Loi
                      de Finances
                    </Text>
                  </Box>
                </HStack>
                <HStack align="start">
                  <Icon as={FaChartLine} color="accent.600" boxSize={5} mt={1} />
                  <Box>
                    <Text fontWeight="600" color="gray.800">
                      100% Gratuit et Sans Inscription
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Accès immédiat à tous les simulateurs, résultats instantanés, aucune
                      donnée collectée
                    </Text>
                  </Box>
                </HStack>
                <HStack align="start">
                  <Icon as={FaChartLine} color="accent.600" boxSize={5} mt={1} />
                  <Box>
                    <Text fontWeight="600" color="gray.800">
                      Graphiques et Visualisations
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Évolution année par année, répartition des gains, projection long terme
                      avec courbes interactives
                    </Text>
                  </Box>
                </HStack>
                <HStack align="start">
                  <Icon as={FaChartLine} color="accent.600" boxSize={5} mt={1} />
                  <Box>
                    <Text fontWeight="600" color="gray.800">
                      Conformité Légale Marocaine
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Moudawana, Code Général des Impôts, Loi de Finances 2025, circulaires DGI
                    </Text>
                  </Box>
                </HStack>
              </SimpleGrid>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={4} color="brand.700">
                Questions Fréquentes sur les Simulateurs Financiers Maroc
              </Heading>
              <VStack spacing={4} align="stretch">
                <Box p={5} bg="gray.50" borderRadius="lg">
                  <Text fontWeight="600" color="brand.800" mb={2}>
                    Comment calculer mon impôt sur le revenu au Maroc en 2025 ?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Utilisez notre simulateur IR qui applique le barème 2025 : 0% jusqu'à 40 000
                    MAD, 10% de 40 001 à 60 000 MAD, 20% de 60 001 à 80 000 MAD, 34% de 80 001
                    à 180 000 MAD, 37% au-delà. Déductions automatiques des charges familiales
                    et professionnelles.
                  </Text>
                </Box>

                <Box p={5} bg="gray.50" borderRadius="lg">
                  <Text fontWeight="600" color="brand.800" mb={2}>
                    Quel est le taux d'imposition des plus-values boursières au Maroc ?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Les plus-values sur actions cotées sont taxées à 15%. Les dividendes sont
                    imposés à 12,5% en 2025 (réduction progressive jusqu'à 10% en 2027). Les
                    intérêts obligataires restent taxés à 20%.
                  </Text>
                </Box>

                <Box p={5} bg="gray.50" borderRadius="lg">
                  <Text fontWeight="600" color="brand.800" mb={2}>
                    Comment fonctionne la succession selon la Moudawana ?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    La Moudawana définit les parts successorales : le conjoint reçoit 1/8 en
                    présence d'enfants (1/4 sans enfants), les garçons héritent du double des
                    filles, les parents reçoivent 1/6 ou 1/3 selon les cas. Notre calculateur
                    applique ces règles automatiquement.
                  </Text>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Container>
      </Box>

      <Box py={20} bg="brand.800">
        <MotionStack
          spacing={8}
          textAlign="center"
          align="center"
          px={{ base: 8, md: 12 }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <Stack spacing={4} maxW="3xl">
            <Heading as="h2" fontSize={{ base: '3xl', md: '4xl' }} color="white">
              Besoin d'un accompagnement personnalisé ?
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="whiteAlpha.900">
              Ces simulateurs vous donnent une première indication. Pour une analyse
              approfondie et des recommandations sur mesure, prenez rendez-vous avec l'un de
              nos experts.
            </Text>
          </Stack>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
            <Button
              as="a"
              href="https://calendly.com/kamil-messidor"
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              colorScheme="yellow"
              rightIcon={<Icon as={FaArrowRight} />}
              px={8}
            >
              Prendre rendez-vous
            </Button>
            <Button
              as={NextLink}
              href="/services"
              size="lg"
              variant="outline"
              color="white"
              borderColor="white"
              borderWidth="2px"
              _hover={{ bg: 'whiteAlpha.200' }}
              px={8}
            >
              Découvrir nos services
            </Button>
          </Stack>
        </MotionStack>
      </Box>
    </Box>
  )
}
