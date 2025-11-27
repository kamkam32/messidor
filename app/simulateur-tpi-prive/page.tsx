'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  FormControl,
  FormLabel,
  Progress,
} from '@chakra-ui/react'
import { FaLock } from 'react-icons/fa'

const PASSWORD = 'laraki'

// Coefficients de réévaluation approximatifs
function getCoeffReevaluation(annee: number, anneeVente: number): number {
  const coefficients: { [key: number]: number } = {
    2024: 1.0, 2023: 1.014, 2022: 1.035, 2021: 1.048,
    2020: 1.055, 2019: 1.063, 2018: 1.075, 2017: 1.087,
    2016: 1.104, 2015: 1.12, 2014: 1.125, 2013: 1.145,
    2012: 1.16, 2011: 1.17, 2010: 1.18, 2009: 1.19,
    2008: 1.205, 2007: 1.225, 2006: 1.26, 2005: 1.275,
    2004: 1.295, 2003: 1.31, 2002: 1.325, 2001: 1.345,
    2000: 1.36, 1999: 1.38, 1998: 1.4, 1997: 1.42,
    1996: 1.45, 1995: 1.5, 1994: 1.55, 1993: 1.6,
    1992: 1.65, 1991: 1.7, 1990: 1.8
  }

  if (annee >= anneeVente) return 1
  if (coefficients[annee]) return coefficients[annee]
  if (annee < 1990) return 1.8 + (1990 - annee) * 0.03
  return 1
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(num))
}

function formatPercent(num: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
}

interface TPIResult {
  prixVente: number
  valeurDeclaree: number
  forfait15: number
  coeff: number
  prixRevient: number
  plusValue: number
  tauxAbattement: number
  abattement: number
  pvImposable: number
  tpi20: number
  cotisMin: number
  tpiAPayer: number
}

function calculerTPI(prixVente: number, valeurDeclaree: number, anneeAcquisition: number, anneeVente: number): TPIResult {
  const forfait15 = valeurDeclaree * 0.15
  const coeff = getCoeffReevaluation(anneeAcquisition, anneeVente)
  const prixRevient = (valeurDeclaree + forfait15) * coeff

  const plusValue = prixVente - prixRevient

  const duree = anneeVente - anneeAcquisition
  let tauxAbattement = 0
  if (duree > 5) {
    tauxAbattement = Math.min((duree - 5) * 0.03, 0.2)
  }

  const abattement = Math.max(0, plusValue) * tauxAbattement
  const pvImposable = Math.max(0, plusValue - abattement)

  const tpi20 = pvImposable * 0.2
  const cotisMin = prixVente * 0.03

  const tpiAPayer = Math.max(tpi20, cotisMin)

  return {
    prixVente,
    valeurDeclaree,
    forfait15,
    coeff,
    prixRevient,
    plusValue,
    tauxAbattement,
    abattement,
    pvImposable,
    tpi20,
    cotisMin,
    tpiAPayer
  }
}

interface LotData {
  nom: string
  type: string
  surface: number
  prix: number
  ali: number
  amina: number
  leila: number
  annee: number
  valeurM2: number
}

function SimulateurContent() {
  // Hypothèses
  const [anneeDonation, setAnneeDonation] = useState(2000)
  const [valeurDonation, setValeurDonation] = useState(200)
  const [anneeHeritage, setAnneeHeritage] = useState(2015)
  const [valeurHeritage, setValeurHeritage] = useState(20000)
  const [prixDGI, setPrixDGI] = useState(20000)
  const [anneeVente, setAnneeVente] = useState(2025)
  const [commission, setCommission] = useState(0.5)

  // Lots - surfaces et prix
  const [surface1, setSurface1] = useState(1577)
  const [prix1, setPrix1] = useState(18000)
  const [surface2, setSurface2] = useState(1425)
  const [prix2, setPrix2] = useState(17000)
  const [surface3, setSurface3] = useState(1373)
  const [prix3, setPrix3] = useState(17000)
  const [surface4, setSurface4] = useState(1213)
  const [prix4, setPrix4] = useState(17000)

  // Lots - pourcentages par personne
  const [ali1, setAli1] = useState(100)
  const [amina1, setAmina1] = useState(0)
  const [leila1, setLeila1] = useState(0)

  const [ali2, setAli2] = useState(0)
  const [amina2, setAmina2] = useState(50)
  const [leila2, setLeila2] = useState(50)

  const [ali3, setAli3] = useState(50)
  const [amina3, setAmina3] = useState(25)
  const [leila3, setLeila3] = useState(25)

  const [ali4, setAli4] = useState(50)
  const [amina4, setAmina4] = useState(25)
  const [leila4, setLeila4] = useState(25)

  // Types de lots
  const [type1, setType1] = useState('donation')
  const [type2, setType2] = useState('heritage')
  const [type3, setType3] = useState('heritage')
  const [type4, setType4] = useState('heritage')

  const bgCard = useColorModeValue('white', 'gray.800')
  const bgHeader = useColorModeValue('gray.50', 'gray.700')

  const lots: LotData[] = [
    {
      nom: 'Lot 1',
      type: type1,
      surface: surface1,
      prix: prix1,
      ali: ali1 / 100,
      amina: amina1 / 100,
      leila: leila1 / 100,
      annee: type1 === 'donation' ? anneeDonation : anneeHeritage,
      valeurM2: type1 === 'donation' ? valeurDonation : valeurHeritage
    },
    {
      nom: 'Lot 2',
      type: type2,
      surface: surface2,
      prix: prix2,
      ali: ali2 / 100,
      amina: amina2 / 100,
      leila: leila2 / 100,
      annee: type2 === 'donation' ? anneeDonation : anneeHeritage,
      valeurM2: type2 === 'donation' ? valeurDonation : valeurHeritage
    },
    {
      nom: 'Lot 3',
      type: type3,
      surface: surface3,
      prix: prix3,
      ali: ali3 / 100,
      amina: amina3 / 100,
      leila: leila3 / 100,
      annee: type3 === 'donation' ? anneeDonation : anneeHeritage,
      valeurM2: type3 === 'donation' ? valeurDonation : valeurHeritage
    },
    {
      nom: 'Lot 4',
      type: type4,
      surface: surface4,
      prix: prix4,
      ali: ali4 / 100,
      amina: amina4 / 100,
      leila: leila4 / 100,
      annee: type4 === 'donation' ? anneeDonation : anneeHeritage,
      valeurM2: type4 === 'donation' ? valeurDonation : valeurHeritage
    }
  ]

  // Calculs à ton prix
  const resultats = lots.map(lot => {
    const valeurTotale = lot.surface * lot.prix
    const valeurDeclaree = lot.surface * lot.valeurM2
    const result = calculerTPI(valeurTotale, valeurDeclaree, lot.annee, anneeVente)
    return { ...result, lot, valeurTotale, valeurDeclaree }
  })

  // Calculs au prix DGI
  const resultatsDGI = lots.map(lot => {
    const valeurTotaleDGI = lot.surface * prixDGI
    const valeurDeclaree = lot.surface * lot.valeurM2
    const result = calculerTPI(valeurTotaleDGI, valeurDeclaree, lot.annee, anneeVente)
    return { ...result, lot, valeurTotale: valeurTotaleDGI, valeurDeclaree }
  })

  const totalSurface = lots.reduce((sum, lot) => sum + lot.surface, 0)
  const totalValeur = resultats.reduce((sum, r) => sum + r.valeurTotale, 0)
  const totalValeurDGI = resultatsDGI.reduce((sum, r) => sum + r.valeurTotale, 0)
  const totalTPI = resultats.reduce((sum, r) => sum + r.tpiAPayer, 0)
  const totalTPIDGI = resultatsDGI.reduce((sum, r) => sum + r.tpiAPayer, 0)

  // Différences
  const diffTPI = totalTPIDGI - totalTPI
  const diffTPIPercent = totalTPI > 0 ? (diffTPI / totalTPI) * 100 : 0
  const diffTPISurVente = (diffTPI / totalValeur) * 100
  const tpiSurVentePercent = (totalTPI / totalValeur) * 100
  const tpiDGISurVenteDGIPercent = (totalTPIDGI / totalValeurDGI) * 100

  // TPI par personne - ton prix
  const tpiAli = resultats.reduce((sum, r) => sum + r.tpiAPayer * r.lot.ali, 0)
  const tpiAmina = resultats.reduce((sum, r) => sum + r.tpiAPayer * r.lot.amina, 0)
  const tpiLeila = resultats.reduce((sum, r) => sum + r.tpiAPayer * r.lot.leila, 0)

  const valeurAli = resultats.reduce((sum, r) => sum + r.valeurTotale * r.lot.ali, 0)
  const valeurAmina = resultats.reduce((sum, r) => sum + r.valeurTotale * r.lot.amina, 0)
  const valeurLeila = resultats.reduce((sum, r) => sum + r.valeurTotale * r.lot.leila, 0)

  // TPI par personne - prix DGI
  const tpiAliDGI = resultatsDGI.reduce((sum, r) => sum + r.tpiAPayer * r.lot.ali, 0)
  const tpiAminaDGI = resultatsDGI.reduce((sum, r) => sum + r.tpiAPayer * r.lot.amina, 0)
  const tpiLeilaDGI = resultatsDGI.reduce((sum, r) => sum + r.tpiAPayer * r.lot.leila, 0)

  // Pourcentage TPI par personne
  const tpiAliPercent = totalTPI > 0 ? (tpiAli / totalTPI) * 100 : 0
  const tpiAminaPercent = totalTPI > 0 ? (tpiAmina / totalTPI) * 100 : 0
  const tpiLeilaPercent = totalTPI > 0 ? (tpiLeila / totalTPI) * 100 : 0

  // Pourcentage TPI par personne - DGI
  const tpiAliDGIPercent = totalTPIDGI > 0 ? (tpiAliDGI / totalTPIDGI) * 100 : 0
  const tpiAminaDGIPercent = totalTPIDGI > 0 ? (tpiAminaDGI / totalTPIDGI) * 100 : 0
  const tpiLeilaDGIPercent = totalTPIDGI > 0 ? (tpiLeilaDGI / totalTPIDGI) * 100 : 0

  // Commission par personne
  const commissionRate = commission / 100
  const commissionAli = valeurAli * commissionRate
  const commissionAmina = valeurAmina * commissionRate
  const commissionLeila = valeurLeila * commissionRate
  const totalCommission = totalValeur * commissionRate

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" color="brand.700" mb={2}>
            Simulateur TPI - Terrains Famille
          </Heading>
          <Text color="gray.600">
            Calcul de la Taxe sur le Profit Immobilier pour chaque lot
          </Text>
        </Box>

        {/* Hypothèses */}
        <Card bg={bgCard}>
          <CardBody>
            <Heading size="md" mb={6} color="brand.700">
              Hypothèses globales
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Année donation</FormLabel>
                <Input
                  type="number"
                  value={anneeDonation}
                  onChange={(e) => setAnneeDonation(Number(e.target.value))}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Valeur donation (MAD/m²)</FormLabel>
                <Input
                  type="number"
                  value={valeurDonation}
                  onChange={(e) => setValeurDonation(Number(e.target.value))}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Année héritage</FormLabel>
                <Input
                  type="number"
                  value={anneeHeritage}
                  onChange={(e) => setAnneeHeritage(Number(e.target.value))}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Valeur héritage (MAD/m²)</FormLabel>
                <Input
                  type="number"
                  value={valeurHeritage}
                  onChange={(e) => setValeurHeritage(Number(e.target.value))}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Prix DGI (MAD/m²)</FormLabel>
                <Input
                  type="number"
                  value={prixDGI}
                  onChange={(e) => setPrixDGI(Number(e.target.value))}
                  size="sm"
                  borderColor="orange.300"
                  bg="orange.50"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Année de vente</FormLabel>
                <Input
                  type="number"
                  value={anneeVente}
                  onChange={(e) => setAnneeVente(Number(e.target.value))}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Commission (%)</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  size="sm"
                  borderColor="purple.300"
                  bg="purple.50"
                />
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Tableau des terrains avec % modifiables */}
        <Card bg={bgCard}>
          <CardBody>
            <Heading size="md" mb={6} color="brand.700">
              Détail des terrains
            </Heading>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead bg={bgHeader}>
                  <Tr>
                    <Th>Lot</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Surface (m²)</Th>
                    <Th isNumeric>Prix/m²</Th>
                    <Th isNumeric>Ali %</Th>
                    <Th isNumeric>Amina %</Th>
                    <Th isNumeric>Leila %</Th>
                    <Th isNumeric>Total %</Th>
                    <Th isNumeric>Valeur totale</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {/* Lot 1 */}
                  <Tr>
                    <Td fontWeight="bold">Lot 1</Td>
                    <Td>
                      <select
                        value={type1}
                        onChange={(e) => setType1(e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="donation">Donation</option>
                        <option value="heritage">Héritage</option>
                      </select>
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={surface1} onChange={(e) => setSurface1(Number(e.target.value))} w="70px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={prix1} onChange={(e) => setPrix1(Number(e.target.value))} w="70px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={ali1} onChange={(e) => setAli1(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={amina1} onChange={(e) => setAmina1(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={leila1} onChange={(e) => setLeila1(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme={ali1 + amina1 + leila1 === 100 ? 'green' : 'red'}>
                        {ali1 + amina1 + leila1}%
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold">{formatNumber(surface1 * prix1)} MAD</Td>
                  </Tr>
                  {/* Lot 2 */}
                  <Tr>
                    <Td fontWeight="bold">Lot 2</Td>
                    <Td>
                      <select
                        value={type2}
                        onChange={(e) => setType2(e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="donation">Donation</option>
                        <option value="heritage">Héritage</option>
                      </select>
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={surface2} onChange={(e) => setSurface2(Number(e.target.value))} w="70px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={prix2} onChange={(e) => setPrix2(Number(e.target.value))} w="70px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={ali2} onChange={(e) => setAli2(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={amina2} onChange={(e) => setAmina2(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={leila2} onChange={(e) => setLeila2(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme={ali2 + amina2 + leila2 === 100 ? 'green' : 'red'}>
                        {ali2 + amina2 + leila2}%
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold">{formatNumber(surface2 * prix2)} MAD</Td>
                  </Tr>
                  {/* Lot 3 */}
                  <Tr>
                    <Td fontWeight="bold">Lot 3</Td>
                    <Td>
                      <select
                        value={type3}
                        onChange={(e) => setType3(e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="donation">Donation</option>
                        <option value="heritage">Héritage</option>
                      </select>
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={surface3} onChange={(e) => setSurface3(Number(e.target.value))} w="70px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={prix3} onChange={(e) => setPrix3(Number(e.target.value))} w="70px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={ali3} onChange={(e) => setAli3(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={amina3} onChange={(e) => setAmina3(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={leila3} onChange={(e) => setLeila3(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme={ali3 + amina3 + leila3 === 100 ? 'green' : 'red'}>
                        {ali3 + amina3 + leila3}%
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold">{formatNumber(surface3 * prix3)} MAD</Td>
                  </Tr>
                  {/* Lot 4 */}
                  <Tr>
                    <Td fontWeight="bold">Lot 4</Td>
                    <Td>
                      <select
                        value={type4}
                        onChange={(e) => setType4(e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="donation">Donation</option>
                        <option value="heritage">Héritage</option>
                      </select>
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={surface4} onChange={(e) => setSurface4(Number(e.target.value))} w="70px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={prix4} onChange={(e) => setPrix4(Number(e.target.value))} w="70px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={ali4} onChange={(e) => setAli4(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={amina4} onChange={(e) => setAmina4(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Input size="xs" type="number" value={leila4} onChange={(e) => setLeila4(Number(e.target.value))} w="50px" textAlign="right" />
                    </Td>
                    <Td isNumeric>
                      <Badge colorScheme={ali4 + amina4 + leila4 === 100 ? 'green' : 'red'}>
                        {ali4 + amina4 + leila4}%
                      </Badge>
                    </Td>
                    <Td isNumeric fontWeight="bold">{formatNumber(surface4 * prix4)} MAD</Td>
                  </Tr>
                </Tbody>
                <Tfoot bg="brand.700">
                  <Tr>
                    <Td color="white" fontWeight="bold">TOTAL</Td>
                    <Td></Td>
                    <Td isNumeric color="white" fontWeight="bold">{formatNumber(totalSurface)} m²</Td>
                    <Td colSpan={5}></Td>
                    <Td isNumeric color="white" fontWeight="bold">{formatNumber(totalValeur)} MAD</Td>
                  </Tr>
                </Tfoot>
              </Table>
            </Box>
          </CardBody>
        </Card>

        {/* IMPACT RECTIFICATION DGI - Section principale */}
        <Card bg="orange.50" borderWidth="2px" borderColor="orange.300">
          <CardBody>
            <Heading size="md" mb={6} color="orange.700">
              Impact si la DGI rectifie le prix à {formatNumber(prixDGI)} MAD/m²
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {/* Comparaison côte à côte */}
              <Box>
                <SimpleGrid columns={2} spacing={4}>
                  <Card bg="white">
                    <CardBody textAlign="center">
                      <Text fontSize="sm" color="gray.500" mb={1}>TON PRIX</Text>
                      <Text fontSize="lg" fontWeight="bold" color="gray.700">
                        {formatNumber(totalValeur)} MAD
                      </Text>
                      <Divider my={3} />
                      <Text fontSize="sm" color="gray.500">TPI à payer</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="red.600">
                        {formatNumber(totalTPI)} MAD
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        ({formatPercent(tpiSurVentePercent)}% du prix de vente)
                      </Text>
                    </CardBody>
                  </Card>

                  <Card bg="orange.100">
                    <CardBody textAlign="center">
                      <Text fontSize="sm" color="orange.600" mb={1}>PRIX DGI</Text>
                      <Text fontSize="lg" fontWeight="bold" color="orange.700">
                        {formatNumber(totalValeurDGI)} MAD
                      </Text>
                      <Divider my={3} />
                      <Text fontSize="sm" color="orange.600">TPI à payer</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="orange.700">
                        {formatNumber(totalTPIDGI)} MAD
                      </Text>
                      <Text fontSize="sm" color="orange.600">
                        ({formatPercent(tpiDGISurVenteDGIPercent)}% du prix de vente)
                      </Text>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </Box>

              {/* Résumé de l'impact */}
              <Box>
                <Card bg="white" h="100%">
                  <CardBody>
                    <Text fontWeight="bold" color="gray.700" mb={4}>Résumé de l'impact</Text>

                    <VStack spacing={4} align="stretch">
                      <Box>
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm">Différence de TPI</Text>
                          <Text fontWeight="bold" color="orange.600">+{formatNumber(diffTPI)} MAD</Text>
                        </HStack>
                        <Progress value={Math.min(diffTPIPercent, 100)} colorScheme="orange" size="sm" borderRadius="full" />
                      </Box>

                      <Divider />

                      <SimpleGrid columns={2} spacing={4}>
                        <Box textAlign="center" p={3} bg="gray.50" borderRadius="md">
                          <Text fontSize="xs" color="gray.500">% de la TPI initiale</Text>
                          <Text fontSize="xl" fontWeight="bold" color="orange.600">
                            +{formatPercent(diffTPIPercent)}%
                          </Text>
                        </Box>
                        <Box textAlign="center" p={3} bg="green.50" borderRadius="md">
                          <Text fontSize="xs" color="gray.500">% du prix de vente</Text>
                          <Text fontSize="xl" fontWeight="bold" color="green.600">
                            +{formatPercent(diffTPISurVente)}%
                          </Text>
                        </Box>
                      </SimpleGrid>

                      <Alert status={diffTPISurVente < 1 ? 'success' : diffTPISurVente < 3 ? 'warning' : 'error'} borderRadius="md">
                        <AlertIcon />
                        <Text fontSize="sm">
                          {diffTPISurVente < 1
                            ? `Impact faible : même si la DGI rectifie, tu paies seulement ${formatPercent(diffTPISurVente)}% de plus sur ta vente.`
                            : diffTPISurVente < 3
                              ? `Impact modéré : la rectification DGI représente ${formatPercent(diffTPISurVente)}% du prix de vente.`
                              : `Impact significatif : la rectification DGI représente ${formatPercent(diffTPISurVente)}% du prix de vente.`
                          }
                        </Text>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Calcul TPI détaillé */}
        <Card bg={bgCard}>
          <CardBody>
            <Heading size="md" mb={6} color="brand.700">
              Calcul TPI détaillé par lot
            </Heading>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead bg={bgHeader}>
                  <Tr>
                    <Th>Lot</Th>
                    <Th isNumeric>Prix vente</Th>
                    <Th isNumeric>Val. déclarée</Th>
                    <Th isNumeric>Coeff</Th>
                    <Th isNumeric>Prix revient</Th>
                    <Th isNumeric>Plus-value</Th>
                    <Th isNumeric>TPI 20%</Th>
                    <Th isNumeric>Cotis. 3%</Th>
                    <Th isNumeric>TPI finale</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {resultats.map((r, i) => (
                    <Tr key={i} bg={r.tpi20 < r.cotisMin ? 'orange.50' : undefined}>
                      <Td fontWeight="bold">{r.lot.nom}</Td>
                      <Td isNumeric>{formatNumber(r.prixVente)}</Td>
                      <Td isNumeric>{formatNumber(r.valeurDeclaree)}</Td>
                      <Td isNumeric>{r.coeff.toFixed(3)}</Td>
                      <Td isNumeric>{formatNumber(r.prixRevient)}</Td>
                      <Td isNumeric color={r.plusValue < 0 ? 'red.600' : 'green.600'} fontWeight="bold">
                        {formatNumber(r.plusValue)}
                      </Td>
                      <Td isNumeric>{formatNumber(r.tpi20)}</Td>
                      <Td isNumeric color={r.tpi20 < r.cotisMin ? 'orange.600' : undefined} fontWeight={r.tpi20 < r.cotisMin ? 'bold' : undefined}>
                        {formatNumber(r.cotisMin)}
                      </Td>
                      <Td isNumeric fontWeight="bold" color="red.600">{formatNumber(r.tpiAPayer)}</Td>
                    </Tr>
                  ))}
                </Tbody>
                <Tfoot bg="red.600">
                  <Tr>
                    <Td color="white" fontWeight="bold" colSpan={8}>TOTAL TPI</Td>
                    <Td isNumeric color="white" fontWeight="bold" fontSize="lg">{formatNumber(totalTPI)} MAD</Td>
                  </Tr>
                </Tfoot>
              </Table>
            </Box>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Les lignes en orange indiquent que la cotisation minimale (3%) s'applique car elle est supérieure à la TPI calculée (20%).
            </Text>
          </CardBody>
        </Card>

        {/* TPI par personne - Résumé clair */}
        <Card bg={bgCard}>
          <CardBody>
            <Heading size="md" mb={2} color="brand.700">
              Récapitulatif par personne
            </Heading>
            <Text fontSize="sm" color="gray.500" mb={6}>
              Ce que chacun reçoit et ce qu'il doit payer en impôts
            </Text>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {/* ALI */}
              <Card borderWidth="2px" borderColor="blue.400" overflow="hidden">
                <Box bg="blue.500" py={3} px={4}>
                  <Text fontSize="xl" fontWeight="bold" color="white" textAlign="center">Ali</Text>
                </Box>
                <CardBody>
                  {/* Ce qu'il reçoit */}
                  <Box bg="green.50" p={4} borderRadius="md" mb={3}>
                    <Text fontSize="xs" color="green.600" fontWeight="semibold" textTransform="uppercase" mb={1}>Prix de vente</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.700">{formatNumber(valeurAli)} MAD</Text>
                  </Box>

                  {/* Frais à déduire */}
                  <Box bg="red.50" p={4} borderRadius="md" mb={3}>
                    <Text fontSize="xs" color="red.600" fontWeight="semibold" textTransform="uppercase" mb={2}>Frais à déduire</Text>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" color="gray.600">TPI ({formatPercent((tpiAli / valeurAli) * 100)}%)</Text>
                      <Text fontSize="sm" fontWeight="bold" color="red.600">-{formatNumber(tpiAli)} MAD</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Commission ({commission}%)</Text>
                      <Text fontSize="sm" fontWeight="bold" color="red.600">-{formatNumber(commissionAli)} MAD</Text>
                    </HStack>
                    <Divider my={2} />
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="bold" color="red.700">Total frais</Text>
                      <Text fontSize="md" fontWeight="bold" color="red.700">-{formatNumber(tpiAli + commissionAli)} MAD</Text>
                    </HStack>
                  </Box>

                  {/* Net */}
                  <Box bg="blue.100" p={4} borderRadius="md" mb={3}>
                    <Text fontSize="xs" color="blue.700" fontWeight="semibold" textTransform="uppercase" mb={1}>Il te reste net</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.800">{formatNumber(valeurAli - tpiAli - commissionAli)} MAD</Text>
                    <Text fontSize="xs" color="blue.600">soit {formatPercent(((valeurAli - tpiAli - commissionAli) / valeurAli) * 100)}% du prix de vente</Text>
                  </Box>

                  {/* Impact DGI */}
                  <Box bg="orange.50" p={4} borderRadius="md" borderWidth="1px" borderColor="orange.200">
                    <HStack mb={2}>
                      <Box w="8px" h="8px" borderRadius="full" bg="orange.400" />
                      <Text fontSize="xs" color="orange.700" fontWeight="semibold" textTransform="uppercase">Si la DGI rectifie</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="orange.700">+{formatNumber(tpiAliDGI - tpiAli)} MAD</Text>
                    <Box mt={2} p={2} bg="orange.100" borderRadius="md">
                      <Text fontSize="lg" fontWeight="bold" color="orange.800" textAlign="center">
                        +{formatPercent(valeurAli > 0 ? ((tpiAliDGI - tpiAli) / valeurAli) * 100 : 0)}%
                      </Text>
                      <Text fontSize="xs" color="orange.600" textAlign="center">de ta vente en plus d'impôts</Text>
                    </Box>
                  </Box>
                </CardBody>
              </Card>

              {/* AMINA */}
              <Card borderWidth="2px" borderColor="purple.400" overflow="hidden">
                <Box bg="purple.500" py={3} px={4}>
                  <Text fontSize="xl" fontWeight="bold" color="white" textAlign="center">Amina</Text>
                </Box>
                <CardBody>
                  {/* Ce qu'elle reçoit */}
                  <Box bg="green.50" p={4} borderRadius="md" mb={3}>
                    <Text fontSize="xs" color="green.600" fontWeight="semibold" textTransform="uppercase" mb={1}>Prix de vente</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.700">{formatNumber(valeurAmina)} MAD</Text>
                  </Box>

                  {/* Frais à déduire */}
                  <Box bg="red.50" p={4} borderRadius="md" mb={3}>
                    <Text fontSize="xs" color="red.600" fontWeight="semibold" textTransform="uppercase" mb={2}>Frais à déduire</Text>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" color="gray.600">TPI ({formatPercent((tpiAmina / valeurAmina) * 100)}%)</Text>
                      <Text fontSize="sm" fontWeight="bold" color="red.600">-{formatNumber(tpiAmina)} MAD</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Commission ({commission}%)</Text>
                      <Text fontSize="sm" fontWeight="bold" color="red.600">-{formatNumber(commissionAmina)} MAD</Text>
                    </HStack>
                    <Divider my={2} />
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="bold" color="red.700">Total frais</Text>
                      <Text fontSize="md" fontWeight="bold" color="red.700">-{formatNumber(tpiAmina + commissionAmina)} MAD</Text>
                    </HStack>
                  </Box>

                  {/* Net */}
                  <Box bg="purple.100" p={4} borderRadius="md" mb={3}>
                    <Text fontSize="xs" color="purple.700" fontWeight="semibold" textTransform="uppercase" mb={1}>Il te reste net</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.800">{formatNumber(valeurAmina - tpiAmina - commissionAmina)} MAD</Text>
                    <Text fontSize="xs" color="purple.600">soit {formatPercent(((valeurAmina - tpiAmina - commissionAmina) / valeurAmina) * 100)}% du prix de vente</Text>
                  </Box>

                  {/* Impact DGI */}
                  <Box bg="orange.50" p={4} borderRadius="md" borderWidth="1px" borderColor="orange.200">
                    <HStack mb={2}>
                      <Box w="8px" h="8px" borderRadius="full" bg="orange.400" />
                      <Text fontSize="xs" color="orange.700" fontWeight="semibold" textTransform="uppercase">Si la DGI rectifie</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="orange.700">+{formatNumber(tpiAminaDGI - tpiAmina)} MAD</Text>
                    <Box mt={2} p={2} bg="orange.100" borderRadius="md">
                      <Text fontSize="lg" fontWeight="bold" color="orange.800" textAlign="center">
                        +{formatPercent(valeurAmina > 0 ? ((tpiAminaDGI - tpiAmina) / valeurAmina) * 100 : 0)}%
                      </Text>
                      <Text fontSize="xs" color="orange.600" textAlign="center">de ta vente en plus d'impôts</Text>
                    </Box>
                  </Box>
                </CardBody>
              </Card>

              {/* LEILA */}
              <Card borderWidth="2px" borderColor="pink.400" overflow="hidden">
                <Box bg="pink.500" py={3} px={4}>
                  <Text fontSize="xl" fontWeight="bold" color="white" textAlign="center">Leila</Text>
                </Box>
                <CardBody>
                  {/* Ce qu'elle reçoit */}
                  <Box bg="green.50" p={4} borderRadius="md" mb={3}>
                    <Text fontSize="xs" color="green.600" fontWeight="semibold" textTransform="uppercase" mb={1}>Prix de vente</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.700">{formatNumber(valeurLeila)} MAD</Text>
                  </Box>

                  {/* Frais à déduire */}
                  <Box bg="red.50" p={4} borderRadius="md" mb={3}>
                    <Text fontSize="xs" color="red.600" fontWeight="semibold" textTransform="uppercase" mb={2}>Frais à déduire</Text>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" color="gray.600">TPI ({formatPercent((tpiLeila / valeurLeila) * 100)}%)</Text>
                      <Text fontSize="sm" fontWeight="bold" color="red.600">-{formatNumber(tpiLeila)} MAD</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Commission ({commission}%)</Text>
                      <Text fontSize="sm" fontWeight="bold" color="red.600">-{formatNumber(commissionLeila)} MAD</Text>
                    </HStack>
                    <Divider my={2} />
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="bold" color="red.700">Total frais</Text>
                      <Text fontSize="md" fontWeight="bold" color="red.700">-{formatNumber(tpiLeila + commissionLeila)} MAD</Text>
                    </HStack>
                  </Box>

                  {/* Net */}
                  <Box bg="pink.100" p={4} borderRadius="md" mb={3}>
                    <Text fontSize="xs" color="pink.700" fontWeight="semibold" textTransform="uppercase" mb={1}>Il te reste net</Text>
                    <Text fontSize="2xl" fontWeight="bold" color="pink.800">{formatNumber(valeurLeila - tpiLeila - commissionLeila)} MAD</Text>
                    <Text fontSize="xs" color="pink.600">soit {formatPercent(((valeurLeila - tpiLeila - commissionLeila) / valeurLeila) * 100)}% du prix de vente</Text>
                  </Box>

                  {/* Impact DGI */}
                  <Box bg="orange.50" p={4} borderRadius="md" borderWidth="1px" borderColor="orange.200">
                    <HStack mb={2}>
                      <Box w="8px" h="8px" borderRadius="full" bg="orange.400" />
                      <Text fontSize="xs" color="orange.700" fontWeight="semibold" textTransform="uppercase">Si la DGI rectifie</Text>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="orange.700">+{formatNumber(tpiLeilaDGI - tpiLeila)} MAD</Text>
                    <Box mt={2} p={2} bg="orange.100" borderRadius="md">
                      <Text fontSize="lg" fontWeight="bold" color="orange.800" textAlign="center">
                        +{formatPercent(valeurLeila > 0 ? ((tpiLeilaDGI - tpiLeila) / valeurLeila) * 100 : 0)}%
                      </Text>
                      <Text fontSize="xs" color="orange.600" textAlign="center">de ta vente en plus d'impôts</Text>
                    </Box>
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Avertissements */}
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            <strong>Important :</strong> Les coefficients de réévaluation sont approximatifs.
            La DGI peut rectifier le prix de vente ET la valeur déclarée. Demandez un avis préalable
            à la DGI pour sécuriser votre transaction.
          </AlertDescription>
        </Alert>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            <strong>Rappel fiscal :</strong> TPI = 20% de la plus-value | Cotisation minimale = 3% du prix de vente |
            Forfait frais = 15% du prix d'acquisition | Abattement durée = 3%/an après 5 ans (max 20%)
          </AlertDescription>
        </Alert>
      </VStack>
    </Container>
  )
}

export default function SimulateurTPIPrive() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const auth = sessionStorage.getItem('tpi_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    if (password === PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('tpi_auth', 'true')
      setError('')
    } else {
      setError('Mot de passe incorrect')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  if (!isAuthenticated) {
    return (
      <Container maxW="400px" py={20}>
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <Box textAlign="center">
                <FaLock size={40} color="#718096" />
                <Heading size="md" mt={4} color="gray.700">
                  Accès protégé
                </Heading>
                <Text color="gray.500" mt={2}>
                  Ce simulateur est privé
                </Text>
              </Box>

              <FormControl>
                <InputGroup>
                  <InputLeftElement>
                    <FaLock color="gray" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </InputGroup>
              </FormControl>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <Button
                colorScheme="brand"
                width="100%"
                onClick={handleLogin}
              >
                Accéder
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    )
  }

  return <SimulateurContent />
}
