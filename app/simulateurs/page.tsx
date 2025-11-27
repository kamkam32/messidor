'use client'

import { useState, useMemo, useEffect } from 'react'
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
import LeadCaptureModal from '@/components/LeadCaptureModal'

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

// Composant pour input avec formatage automatique (au blur uniquement)
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
  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())

  // Afficher la valeur formatée ou brute selon le focus
  const displayValue = isFocused ? inputValue : formatNumber(value)

  const handleChange = (valueString: string) => {
    // Pendant la saisie, on stocke la valeur brute
    setInputValue(valueString)

    // Enlever les espaces pour obtenir le nombre
    const numericValue = parseFloat(valueString.replace(/\s/g, ''))
    if (!isNaN(numericValue)) {
      onChange(numericValue)
    } else if (valueString === '') {
      onChange(0)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    setInputValue(value > 0 ? value.toString() : '')
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Formater la valeur finale
    setInputValue(value.toString())
  }

  return (
    <NumberInput
      value={displayValue}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
    >
      <NumberInputField
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
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
              max={500000000}
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

// Simulateur 5: Plus-Value Immobilière (TPI - Taxe sur le Profit Immobilier)
function SimulateurPVImmobiliere() {
  const [prixAchat, setPrixAchat] = useState<number>(1000000)
  const [prixVente, setPrixVente] = useState<number>(1500000)
  const [dureeDetention, setDureeDetention] = useState<number>(5)
  const [anneeAchat, setAnneeAchat] = useState<number>(2019)
  const [fraisAcquisitionReels, setFraisAcquisitionReels] = useState<number>(0)
  const [travauxAmeliorations, setTravauxAmeliorations] = useState<number>(0)
  const [interetsBancaires, setInteretsBancaires] = useState<number>(0)
  const [fraisCession, setFraisCession] = useState<number>(0)
  const [estResidencePrincipale, setEstResidencePrincipale] = useState<string>('non')
  const [typeBien, setTypeBien] = useState<string>('appartement')
  const [modeAcquisition, setModeAcquisition] = useState<string>('achat')
  const [valeurSuccession, setValeurSuccession] = useState<number>(0)
  const [fraisSuccession, setFraisSuccession] = useState<number>(0)
  const [prixReferenceDGI, setPrixReferenceDGI] = useState<number>(0)
  const [showOptionsDGI, setShowOptionsDGI] = useState<boolean>(false)

  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Coefficients de réévaluation approximatifs (basés sur l'inflation)
  // En pratique, ces coefficients sont fixés chaque année par arrêté ministériel
  const getCoeffReevaluation = (annee: number): number => {
    const coefficients: { [key: number]: number } = {
      2024: 1.000, 2023: 1.014, 2022: 1.035, 2021: 1.048,
      2020: 1.055, 2019: 1.063, 2018: 1.075, 2017: 1.087,
      2016: 1.104, 2015: 1.120, 2014: 1.125, 2013: 1.145,
      2012: 1.160, 2011: 1.170, 2010: 1.180, 2009: 1.190,
      2008: 1.205, 2007: 1.225, 2006: 1.260, 2005: 1.275,
      2004: 1.295, 2003: 1.310, 2002: 1.325, 2001: 1.345,
      2000: 1.360,
    }
    if (annee >= 2024) return 1.0
    if (annee < 2000) return 1.36 + (2000 - annee) * 0.03 // Estimation pour années antérieures
    return coefficients[annee] || 1.0
  }

  // Déterminer le prix de base selon le mode d'acquisition
  const estSuccession = modeAcquisition === 'succession' || modeAcquisition === 'donation'
  const prixBase = estSuccession ? valeurSuccession : prixAchat

  // Forfait frais d'acquisition : 15% du prix d'achat (accordé par l'État)
  // S'applique aussi aux biens hérités (sur la valeur déclarée à la succession)
  const forfaitFraisAcquisition = prixBase * 0.15

  // Pour les successions, on ajoute aussi les frais de succession (droits, notaire...)
  const fraisReelsTotaux = estSuccession
    ? fraisAcquisitionReels + fraisSuccession
    : fraisAcquisitionReels

  // On prend le maximum entre le forfait et les frais réels
  const fraisAcquisitionRetenus = Math.max(forfaitFraisAcquisition, fraisReelsTotaux)

  // Coefficient de réévaluation
  const coeffReevaluation = getCoeffReevaluation(anneeAchat)

  // Prix de revient réévalué
  const prixRevientBase = prixBase + fraisAcquisitionRetenus + travauxAmeliorations + (estSuccession ? 0 : interetsBancaires)
  const prixRevientReevalue = prixRevientBase * coeffReevaluation

  // Prix retenu pour le calcul de la TPI (DGI peut rectifier)
  const prixRetenuTPI = prixReferenceDGI > 0 ? Math.max(prixVente, prixReferenceDGI) : prixVente
  const estPrixRectifie = prixReferenceDGI > 0 && prixReferenceDGI > prixVente

  // Plus-value brute (calculée sur le prix retenu par la DGI)
  const plusValueBrute = prixRetenuTPI - fraisCession - prixRevientReevalue

  // Abattement pour durée de détention : 3% par année au-delà de 5 ans, plafonné à 20%
  let tauxAbattementDetention = 0
  if (dureeDetention > 5) {
    const anneesSupplementaires = dureeDetention - 5
    tauxAbattementDetention = Math.min(anneesSupplementaires * 0.03, 0.20)
  }

  const abattementDetention = Math.max(0, plusValueBrute) * tauxAbattementDetention
  const plusValueApresAbattement = Math.max(0, plusValueBrute - abattementDetention)

  // Calcul TPI : 20% de la plus-value
  const tpiCalculee = plusValueApresAbattement * 0.20

  // Cotisation minimale : 3% du prix retenu (même sans plus-value !)
  const cotisationMinimale = prixRetenuTPI * 0.03

  // Vérification exonération résidence principale
  let exonere = false
  let tpiExoneration = 0
  let messageExoneration = ''

  if (estResidencePrincipale === 'oui' && dureeDetention >= 6) {
    if (prixRetenuTPI <= 4000000) {
      exonere = true
      messageExoneration = 'Exonération totale : résidence principale occupée 6+ ans et prix de vente ≤ 4 000 000 MAD'
    } else {
      // Exonération partielle : 3% sur le montant excédentaire
      tpiExoneration = (prixRetenuTPI - 4000000) * 0.03
      messageExoneration = `Exonération partielle : 3% sur le montant excédant 4 000 000 MAD (${formatNumber(prixRetenuTPI - 4000000)} MAD)`
    }
  }

  // Impôt final : maximum entre TPI calculée et cotisation minimale, sauf exonération
  let impotFinal = 0
  let estCotisationMinimale = false

  if (exonere) {
    impotFinal = 0
  } else if (tpiExoneration > 0) {
    impotFinal = tpiExoneration
  } else {
    if (tpiCalculee < cotisationMinimale) {
      impotFinal = cotisationMinimale
      estCotisationMinimale = true
    } else {
      impotFinal = tpiCalculee
    }
  }

  const netApresFiscalite = prixVente - fraisCession - prixRevientBase - impotFinal

  return (
    <Stack spacing={8}>
      <Text fontSize="lg" color="gray.600">
        Calculez la <strong>Taxe sur le Profit Immobilier (TPI)</strong> lors de la vente d'un bien
        immobilier au Maroc. Simulation complète avec coefficient de réévaluation, abattements pour
        durée de détention et cotisation minimale de 3%.
      </Text>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
        <VStack spacing={6} align="stretch">
          {/* Paramètres du bien */}
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="md" mb={6} color="brand.700" fontWeight="600">
                Informations sur le bien
              </Heading>

              <VStack spacing={5} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel color="brand.700" fontWeight="500">
                      Type de bien
                    </FormLabel>
                    <Select
                      value={typeBien}
                      onChange={(e) => setTypeBien(e.target.value)}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                    >
                      <option value="appartement">Appartement</option>
                      <option value="villa">Villa / Maison</option>
                      <option value="terrain">Terrain nu</option>
                      <option value="local">Local commercial</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel color="brand.700" fontWeight="500">
                      Mode d'acquisition
                    </FormLabel>
                    <Select
                      value={modeAcquisition}
                      onChange={(e) => setModeAcquisition(e.target.value)}
                      bg={useColorModeValue('gray.50', 'gray.700')}
                    >
                      <option value="achat">Achat classique</option>
                      <option value="succession">Héritage / Succession</option>
                      <option value="donation">Donation</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                {estSuccession && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      Pour un bien hérité ou reçu en donation, le prix de référence est la{' '}
                      <strong>valeur vénale déclarée</strong> dans l'acte de succession/donation.
                      Le forfait de 15% s'applique sur cette valeur.
                    </AlertDescription>
                  </Alert>
                )}

                <FormControl>
                  <FormLabel color="brand.700" fontWeight="500">
                    Résidence principale ?
                  </FormLabel>
                  <Select
                    value={estResidencePrincipale}
                    onChange={(e) => setEstResidencePrincipale(e.target.value)}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  >
                    <option value="non">Non</option>
                    <option value="oui">Oui (occupée au moins 6 ans)</option>
                  </Select>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    L'exonération s'applique si occupée 6+ ans et prix ≤ 4M MAD
                  </Text>
                </FormControl>

                {/* Champs pour achat classique */}
                {!estSuccession && (
                  <SimpleGrid columns={2} spacing={4}>
                    <FormControl>
                      <FormLabel color="brand.700" fontWeight="500">
                        Prix d'achat (MAD)
                      </FormLabel>
                      <FormattedNumberInput
                        value={prixAchat}
                        onChange={setPrixAchat}
                        step={50000}
                        max={500000000}
                        placeholder="1 000 000"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel color="brand.700" fontWeight="500">
                        Année d'achat
                      </FormLabel>
                      <NumberInput
                        value={anneeAchat}
                        onChange={(_, val) => {
                          setAnneeAchat(val)
                          setDureeDetention(2025 - val)
                        }}
                        min={1970}
                        max={2024}
                        step={1}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                )}

                {/* Champs pour succession/donation */}
                {estSuccession && (
                  <>
                    <SimpleGrid columns={2} spacing={4}>
                      <FormControl>
                        <FormLabel color="brand.700" fontWeight="500">
                          Valeur déclarée à la {modeAcquisition === 'succession' ? 'succession' : 'donation'} (MAD)
                        </FormLabel>
                        <FormattedNumberInput
                          value={valeurSuccession}
                          onChange={setValeurSuccession}
                          step={50000}
                          max={500000000}
                          placeholder="500 000"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Valeur vénale inscrite dans l'inventaire successoral
                        </Text>
                      </FormControl>

                      <FormControl>
                        <FormLabel color="brand.700" fontWeight="500">
                          Année de {modeAcquisition === 'succession' ? 'succession' : 'donation'}
                        </FormLabel>
                        <NumberInput
                          value={anneeAchat}
                          onChange={(_, val) => {
                            setAnneeAchat(val)
                            setDureeDetention(2025 - val)
                          }}
                          min={1970}
                          max={2024}
                          step={1}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </SimpleGrid>

                    <FormControl>
                      <FormLabel color="brand.700" fontWeight="500">
                        Frais de {modeAcquisition === 'succession' ? 'succession' : 'donation'} (MAD)
                      </FormLabel>
                      <FormattedNumberInput
                        value={fraisSuccession}
                        onChange={setFraisSuccession}
                        step={5000}
                        max={valeurSuccession * 0.2}
                        placeholder="0"
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Droits d'enregistrement, frais de notaire, honoraires...
                      </Text>
                    </FormControl>
                  </>
                )}

                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel color="brand.700" fontWeight="500">
                      Prix de vente (MAD)
                    </FormLabel>
                    <FormattedNumberInput
                      value={prixVente}
                      onChange={setPrixVente}
                      step={50000}
                      max={500000000}
                      placeholder="1 500 000"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel color="brand.700" fontWeight="500">
                      Durée de détention
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
                      {dureeDetention} an{dureeDetention > 1 ? 's' : ''}
                    </Text>
                  </FormControl>
                </SimpleGrid>

                {/* Option discrète pour le prix DGI */}
                <Box mt={2}>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    cursor="pointer"
                    onClick={() => setShowOptionsDGI(!showOptionsDGI)}
                    _hover={{ color: 'brand.600' }}
                  >
                    {showOptionsDGI ? '▼' : '▶'} Options avancées (prix référentiel DGI)
                  </Text>

                  {showOptionsDGI && (
                    <Box mt={3} p={4} bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200">
                      <FormControl>
                        <FormLabel color="orange.700" fontWeight="500" fontSize="sm">
                          Prix référentiel DGI (optionnel)
                        </FormLabel>
                        <FormattedNumberInput
                          value={prixReferenceDGI}
                          onChange={setPrixReferenceDGI}
                          step={50000}
                          max={500000000}
                          placeholder="0"
                        />
                        <Text fontSize="xs" color="orange.600" mt={1}>
                          Si vous connaissez le prix estimé par l'administration fiscale (via avis préalable ou référentiel de zone),
                          renseignez-le ici. La TPI sera calculée sur le <strong>prix le plus élevé</strong> entre votre prix de vente
                          et ce référentiel.
                        </Text>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Frais déductibles */}
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="md" mb={6} color="brand.700" fontWeight="600">
                Frais déductibles
              </Heading>

              <VStack spacing={5} align="stretch">
                <FormControl>
                  <FormLabel color="brand.700" fontWeight="500">
                    Frais d'acquisition réels (MAD)
                  </FormLabel>
                  <FormattedNumberInput
                    value={fraisAcquisitionReels}
                    onChange={setFraisAcquisitionReels}
                    step={5000}
                    max={prixAchat}
                    placeholder="0"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Notaire, droits d'enregistrement, conservation foncière...
                    <br />
                    <strong>Forfait de 15% ({formatNumber(forfaitFraisAcquisition)} MAD) appliqué si plus avantageux</strong>
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
                    Travaux réalisés avec factures justificatives
                  </Text>
                </FormControl>

                {!estSuccession && (
                  <FormControl>
                    <FormLabel color="brand.700" fontWeight="500">
                      Intérêts bancaires payés (MAD)
                    </FormLabel>
                    <FormattedNumberInput
                      value={interetsBancaires}
                      onChange={setInteretsBancaires}
                      step={5000}
                      max={prixAchat * 2}
                      placeholder="0"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Si le bien a été acquis avec un crédit immobilier
                    </Text>
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel color="brand.700" fontWeight="500">
                    Frais de cession (MAD)
                  </FormLabel>
                  <FormattedNumberInput
                    value={fraisCession}
                    onChange={setFraisCession}
                    step={5000}
                    max={prixVente * 0.1}
                    placeholder="0"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Frais d'agence immobilière, notaire pour la vente
                  </Text>
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Informations fiscales */}
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="sm" mb={4} color="brand.700" fontWeight="600">
                Fiscalité TPI - Loi de Finances 2025
              </Heading>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Taux TPI standard
                  </Text>
                  <Badge colorScheme="red" fontSize="sm">
                    20%
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Cotisation minimale
                  </Text>
                  <Badge colorScheme="orange" fontSize="sm">
                    3% du prix de vente
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Forfait frais acquisition
                  </Text>
                  <Badge colorScheme="blue" fontSize="sm">
                    15% du prix d'achat
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Abattement durée détention
                  </Text>
                  <Badge colorScheme="green" fontSize="sm">
                    3%/an après 5 ans (max 20%)
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
              <Heading size="md" mb={6} color="brand.700" fontWeight="600">
                Calcul détaillé de la TPI
              </Heading>

              <VStack spacing={4} align="stretch">
                {/* Détail du prix de revient */}
                <Box p={4} bg="gray.50" borderRadius="lg">
                  <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                    Prix de revient réévalué {estSuccession && `(${modeAcquisition})`}
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        {estSuccession
                          ? `Valeur déclarée à la ${modeAcquisition}`
                          : "Prix d'achat"}
                      </Text>
                      <Text fontSize="sm">{formatNumber(prixBase)} MAD</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        + Frais {estSuccession ? `(${fraisReelsTotaux > forfaitFraisAcquisition ? 'réels' : 'forfait 15%'})` : `acquisition (${fraisAcquisitionReels > forfaitFraisAcquisition ? 'réels' : 'forfait 15%'})`}
                      </Text>
                      <Text fontSize="sm">{formatNumber(fraisAcquisitionRetenus)} MAD</Text>
                    </HStack>
                    {travauxAmeliorations > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">+ Travaux</Text>
                        <Text fontSize="sm">{formatNumber(travauxAmeliorations)} MAD</Text>
                      </HStack>
                    )}
                    {!estSuccession && interetsBancaires > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">+ Intérêts bancaires</Text>
                        <Text fontSize="sm">{formatNumber(interetsBancaires)} MAD</Text>
                      </HStack>
                    )}
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">= Prix de revient base</Text>
                      <Text fontSize="sm" fontWeight="semibold">{formatNumber(prixRevientBase)} MAD</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">× Coefficient réévaluation ({anneeAchat})</Text>
                      <Text fontSize="sm">{coeffReevaluation.toFixed(3)}</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="600" color="brand.700">= Prix de revient réévalué</Text>
                      <Text fontSize="sm" fontWeight="bold" color="brand.700">{formatNumber(prixRevientReevalue)} MAD</Text>
                    </HStack>
                  </VStack>
                </Box>

                {/* Calcul plus-value */}
                <Box p={4} bg={estPrixRectifie ? 'orange.50' : 'gray.50'} borderRadius="lg" borderWidth={estPrixRectifie ? '1px' : '0'} borderColor="orange.300">
                  <Text fontSize="sm" fontWeight="600" color={estPrixRectifie ? 'orange.700' : 'gray.700'} mb={3}>
                    Plus-value imposable {estPrixRectifie && '(prix DGI appliqué)'}
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Prix de vente déclaré</Text>
                      <Text fontSize="sm">{formatNumber(prixVente)} MAD</Text>
                    </HStack>
                    {estPrixRectifie && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="orange.600" fontWeight="500">Prix retenu (référentiel DGI)</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="orange.600">{formatNumber(prixRetenuTPI)} MAD</Text>
                      </HStack>
                    )}
                    {fraisCession > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">- Frais de cession</Text>
                        <Text fontSize="sm">-{formatNumber(fraisCession)} MAD</Text>
                      </HStack>
                    )}
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">- Prix de revient réévalué</Text>
                      <Text fontSize="sm">-{formatNumber(prixRevientReevalue)} MAD</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="600" color={plusValueBrute >= 0 ? 'green.600' : 'red.600'}>
                        = Plus-value brute
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" color={plusValueBrute >= 0 ? 'green.600' : 'red.600'}>
                        {formatNumber(plusValueBrute)} MAD
                      </Text>
                    </HStack>
                    {tauxAbattementDetention > 0 && plusValueBrute > 0 && (
                      <>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            - Abattement durée ({(tauxAbattementDetention * 100).toFixed(0)}%)
                          </Text>
                          <Text fontSize="sm" color="accent.600">-{formatNumber(abattementDetention)} MAD</Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="600" color="brand.700">= Plus-value après abattement</Text>
                          <Text fontSize="sm" fontWeight="bold" color="brand.700">{formatNumber(plusValueApresAbattement)} MAD</Text>
                        </HStack>
                      </>
                    )}
                  </VStack>
                </Box>

                <Divider />

                {/* Calcul impôt */}
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">TPI calculée (20%)</StatLabel>
                    <StatNumber fontSize="xl" color="gray.700">
                      {formatNumber(tpiCalculee)} MAD
                    </StatNumber>
                  </Stat>

                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">Cotisation min. (3%)</StatLabel>
                    <StatNumber fontSize="xl" color="orange.600">
                      {formatNumber(cotisationMinimale)} MAD
                    </StatNumber>
                  </Stat>
                </SimpleGrid>

                <Divider />

                {/* Résultat final */}
                {exonere ? (
                  <Box p={5} bg="green.50" borderRadius="lg" borderWidth="1px" borderColor="green.200">
                    <Text fontSize="sm" color="green.700" fontWeight="600" mb={2}>
                      Exonération totale de TPI
                    </Text>
                    <Text fontSize="3xl" fontWeight="700" color="green.700">
                      0 MAD
                    </Text>
                    <Text fontSize="sm" color="green.600" mt={2}>
                      {messageExoneration}
                    </Text>
                  </Box>
                ) : (
                  <Box p={5} bg="red.50" borderRadius="lg" borderWidth="1px" borderColor="red.200">
                    <Text fontSize="sm" color="red.700" fontWeight="600" mb={2}>
                      {estCotisationMinimale
                        ? 'TPI à payer (cotisation minimale appliquée)'
                        : tpiExoneration > 0
                          ? 'TPI à payer (exonération partielle)'
                          : 'TPI à payer'}
                    </Text>
                    <Text fontSize="3xl" fontWeight="700" color="red.700">
                      {formatNumber(impotFinal)} MAD
                    </Text>
                    {estCotisationMinimale && (
                      <Text fontSize="sm" color="red.600" mt={2}>
                        La cotisation minimale de 3% s'applique car elle est supérieure à la TPI calculée
                      </Text>
                    )}
                    {tpiExoneration > 0 && (
                      <Text fontSize="sm" color="orange.600" mt={2}>
                        {messageExoneration}
                      </Text>
                    )}
                  </Box>
                )}

                <Divider />

                <Box p={5} bg="accent.50" borderRadius="lg" borderWidth="1px" borderColor="accent.200">
                  <Text fontSize="sm" color="accent.700" fontWeight="600" mb={2}>
                    Gain net après impôt
                  </Text>
                  <Text fontSize="3xl" fontWeight="700" color={netApresFiscalite >= 0 ? 'accent.700' : 'red.600'}>
                    {netApresFiscalite >= 0 ? '+' : ''}{formatNumber(netApresFiscalite)} MAD
                  </Text>
                  <Text fontSize="sm" color="gray.600" mt={1}>
                    Prix de vente - Prix de revient - TPI
                  </Text>
                </Box>

                {/* Message d'information selon la situation */}
                <Alert
                  status={dureeDetention > 5 ? 'success' : dureeDetention >= 3 ? 'info' : 'warning'}
                  borderRadius="md"
                >
                  <AlertIcon />
                  <AlertDescription fontSize="sm">
                    {dureeDetention > 5
                      ? `Abattement de ${(tauxAbattementDetention * 100).toFixed(0)}% appliqué (${dureeDetention - 5} année(s) au-delà de 5 ans, plafonné à 20%).`
                      : dureeDetention === 5
                        ? 'Aucun abattement pour durée de détention (5 ans exactement). L\'abattement commence à partir de la 6ème année.'
                        : `Aucun abattement (détention < 5 ans). Attendez encore ${5 - dureeDetention} an(s) pour bénéficier d'un abattement.`}
                  </AlertDescription>
                </Alert>
              </VStack>
            </CardBody>
          </Card>

          {/* Exonérations possibles */}
          <Card bg={bgCard} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Heading size="sm" mb={4} color="brand.700" fontWeight="600">
                Cas d'exonération de la TPI
              </Heading>
              <VStack spacing={3} align="stretch">
                <HStack align="start">
                  <Badge colorScheme="green" mt={1}>1</Badge>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Résidence principale</strong> : occupée 6+ ans et prix ≤ 4 000 000 MAD
                  </Text>
                </HStack>
                <HStack align="start">
                  <Badge colorScheme="green" mt={1}>2</Badge>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Donation familiale</strong> : entre ascendants/descendants, époux, frères/sœurs
                  </Text>
                </HStack>
                <HStack align="start">
                  <Badge colorScheme="green" mt={1}>3</Badge>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Logement social</strong> : après 4 ans d'occupation effective
                  </Text>
                </HStack>
                <HStack align="start">
                  <Badge colorScheme="green" mt={1}>4</Badge>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Expropriation</strong> : pour cause d'utilité publique
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>

      <Alert status="error" borderRadius="md" mb={4}>
        <AlertIcon />
        <AlertDescription>
          <strong>Risque de rectification par la DGI :</strong> L'administration fiscale peut
          estimer que votre prix de vente est sous-évalué et le <strong>rectifier à la hausse</strong>.
          Dans ce cas, la TPI (y compris la cotisation minimale de 3%) sera calculée sur le{' '}
          <strong>prix rectifié</strong>, pas sur votre prix déclaré. Pour sécuriser votre transaction,
          vous pouvez demander un <strong>avis préalable à la DGI</strong> dans les 30 jours suivant
          le compromis de vente.
        </AlertDescription>
      </Alert>

      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <AlertDescription>
          <strong>Important :</strong> Ce simulateur utilise des coefficients de réévaluation
          approximatifs. Les coefficients officiels sont publiés chaque année par arrêté du
          Ministère des Finances. La TPI doit être payée dans les 30 jours suivant la signature
          de l'acte de vente. Un retard entraîne une pénalité de 10% + 5%/mois supplémentaire.
        </AlertDescription>
      </Alert>
    </Stack>
  )
}

export default function SimulateursPage() {
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [currentSimulatorType, setCurrentSimulatorType] = useState('epargne')

  // Logique pour afficher le modal après quelques secondes
  useEffect(() => {
    // Vérifier si le lead a déjà été capturé ou skipped
    const leadCaptured = localStorage.getItem('lead_captured')
    const leadSkipped = localStorage.getItem('lead_modal_skipped')
    const skippedDate = localStorage.getItem('lead_modal_skipped_date')

    console.log('Lead modal check:', { leadCaptured, leadSkipped, skippedDate })

    // Si skipped, ne redemander que après 7 jours
    if (leadSkipped && skippedDate) {
      const daysSinceSkip = Math.floor(
        (Date.now() - new Date(skippedDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      console.log('Days since skip:', daysSinceSkip)
      if (daysSinceSkip < 7) {
        return
      }
    }

    // Si déjà capturé, ne plus demander
    if (leadCaptured) {
      console.log('Lead already captured, not showing modal')
      return
    }

    // Afficher le modal après 5 secondes (pour test - changer à 45000 en prod)
    console.log('Setting timer for lead modal...')
    const timer = setTimeout(() => {
      console.log('Showing lead modal now!')
      setShowLeadModal(true)
    }, 5000) // 5 secondes pour test

    return () => clearTimeout(timer)
  }, [])

  // Mapper les tabs aux types de simulateurs
  const simulatorTypes = ['epargne', 'succession', 'fiscalite', 'bilan', 'plus_value_immobiliere']

  useEffect(() => {
    setCurrentSimulatorType(simulatorTypes[activeTab])
  }, [activeTab])

  return (
    <Box flex="1">
      {/* Modal de capture de leads */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        simulatorType={currentSimulatorType}
      />
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
          <Tabs
            variant="enclosed"
            colorScheme="yellow"
            size={{ base: 'sm', md: 'md' }}
            isLazy
            index={activeTab}
            onChange={(index) => {
              setActiveTab(index)
              const types = [
                'epargne',
                'succession',
                'fiscalite',
                'bilan',
                'plus_value_immobiliere',
              ]
              setCurrentSimulatorType(types[index])
            }}
          >
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
