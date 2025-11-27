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
  Avatar,
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
  const [commissionVendeur, setCommissionVendeur] = useState(0.5)
  const [commissionAcheteur, setCommissionAcheteur] = useState(0.75)

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

  // Prix moyen au m²
  const prixMoyenM2 = totalSurface > 0 ? Math.round(totalValeur / totalSurface) : 0

  // TPI effective à payer = si prix DGI > prix vente, la DGI rectifie
  const dgiRectifie = prixDGI > prixMoyenM2
  const tpiAliEffective = dgiRectifie ? tpiAliDGI : tpiAli
  const tpiAminaEffective = dgiRectifie ? tpiAminaDGI : tpiAmina
  const tpiLeilaEffective = dgiRectifie ? tpiLeilaDGI : tpiLeila
  const totalTPIEffective = dgiRectifie ? totalTPIDGI : totalTPI

  // Pourcentage TPI par personne
  const tpiAliPercent = totalTPI > 0 ? (tpiAli / totalTPI) * 100 : 0
  const tpiAminaPercent = totalTPI > 0 ? (tpiAmina / totalTPI) * 100 : 0
  const tpiLeilaPercent = totalTPI > 0 ? (tpiLeila / totalTPI) * 100 : 0

  // Pourcentage TPI par personne - DGI
  const tpiAliDGIPercent = totalTPIDGI > 0 ? (tpiAliDGI / totalTPIDGI) * 100 : 0
  const tpiAminaDGIPercent = totalTPIDGI > 0 ? (tpiAminaDGI / totalTPIDGI) * 100 : 0
  const tpiLeilaDGIPercent = totalTPIDGI > 0 ? (tpiLeilaDGI / totalTPIDGI) * 100 : 0

  // Commission par personne (vendeur)
  const commissionVendeurRate = commissionVendeur / 100
  const commissionAli = valeurAli * commissionVendeurRate
  const commissionAmina = valeurAmina * commissionVendeurRate
  const commissionLeila = valeurLeila * commissionVendeurRate
  const totalCommissionVendeur = totalValeur * commissionVendeurRate

  // Commission acheteur
  const commissionAcheteurRate = commissionAcheteur / 100
  const totalCommissionAcheteur = totalValeur * commissionAcheteurRate

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
                <FormLabel fontSize="sm">Commission vendeur (%)</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  value={commissionVendeur}
                  onChange={(e) => setCommissionVendeur(Number(e.target.value))}
                  size="sm"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Commission acheteur (%)</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  value={commissionAcheteur}
                  onChange={(e) => setCommissionAcheteur(Number(e.target.value))}
                  size="sm"
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
                <Tfoot>
                  <Tr bg="gray.100">
                    <Td fontWeight="bold" color="gray.700">TOTAL</Td>
                    <Td></Td>
                    <Td isNumeric fontWeight="bold" color="gray.700">{formatNumber(totalSurface)} m²</Td>
                    <Td isNumeric fontWeight="bold" color="gray.700">{formatNumber(Math.round(totalValeur / totalSurface))}</Td>
                    <Td colSpan={4}></Td>
                    <Td isNumeric fontWeight="bold" color="gray.700">{formatNumber(totalValeur)} MAD</Td>
                  </Tr>
                  <Tr bg="brand.700">
                    <Td color="white" fontWeight="bold" colSpan={3}>Prix moyen au m²</Td>
                    <Td isNumeric color="white" fontWeight="bold" fontSize="lg">{formatNumber(Math.round(totalValeur / totalSurface))} MAD/m²</Td>
                    <Td colSpan={5}></Td>
                  </Tr>
                </Tfoot>
              </Table>
            </Box>
          </CardBody>
        </Card>

        {/* Récapitulatif transaction */}
        <Card bg={bgCard}>
          <CardBody>
            <Heading size="md" mb={6} color="brand.700">
              Récapitulatif de la transaction
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              {/* Colonne 1 : Informations générales */}
              <Card borderWidth="1px" borderColor="gray.200" shadow="sm">
                <Box bg="gray.100" py={2} px={4}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.600" textTransform="uppercase">Informations</Text>
                </Box>
                <CardBody py={4}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Surface totale</Text>
                      <Text fontSize="sm" fontWeight="semibold">{formatNumber(totalSurface)} m²</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Prix moyen / m²</Text>
                      <Text fontSize="sm" fontWeight="semibold">{formatNumber(prixMoyenM2)} MAD</Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="md" fontWeight="semibold" color="gray.700">Prix de vente</Text>
                      <Text fontSize="lg" fontWeight="bold" color="gray.800">{formatNumber(totalValeur)} MAD</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Colonne 2 : Côté Vendeur */}
              <Card borderWidth="1px" borderColor="teal.200" shadow="sm">
                <Box bg="teal.500" py={2} px={4}>
                  <Text fontSize="sm" fontWeight="semibold" color="white" textTransform="uppercase">Côté Vendeur</Text>
                </Box>
                <CardBody py={4}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Prix de vente</Text>
                      <Text fontSize="sm" fontWeight="medium">{formatNumber(totalValeur)} MAD</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">TPI ({formatPercent((totalTPI / totalValeur) * 100)}%)</Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">- {formatNumber(totalTPI)} MAD</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Commission ({commissionVendeur}%)</Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">- {formatNumber(totalCommissionVendeur)} MAD</Text>
                    </HStack>
                    <Divider />
                    <Box bg="teal.50" p={3} borderRadius="md">
                      <HStack justify="space-between">
                        <Text fontSize="md" fontWeight="semibold" color="teal.700">Net à percevoir</Text>
                        <Text fontSize="xl" fontWeight="bold" color="teal.700">{formatNumber(totalValeur - totalTPI - totalCommissionVendeur)} MAD</Text>
                      </HStack>
                      <Text fontSize="xs" color="teal.600" textAlign="right">{formatPercent(((totalValeur - totalTPI - totalCommissionVendeur) / totalValeur) * 100)}% du prix de vente</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Colonne 3 : Côté Acheteur */}
              <Card borderWidth="1px" borderColor="blue.200" shadow="sm">
                <Box bg="blue.500" py={2} px={4}>
                  <Text fontSize="sm" fontWeight="semibold" color="white" textTransform="uppercase">Côté Acheteur</Text>
                </Box>
                <CardBody py={4}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Prix de vente</Text>
                      <Text fontSize="sm" fontWeight="medium">{formatNumber(totalValeur)} MAD</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">Commission ({commissionAcheteur}%)</Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.700">+ {formatNumber(totalCommissionAcheteur)} MAD</Text>
                    </HStack>
                    <Divider />
                    <Box bg="blue.50" p={3} borderRadius="md" mb={3}>
                      <HStack justify="space-between">
                        <Text fontSize="md" fontWeight="semibold" color="blue.700">Coût total</Text>
                        <Text fontSize="xl" fontWeight="bold" color="blue.700">{formatNumber(totalValeur + totalCommissionAcheteur)} MAD</Text>
                      </HStack>
                    </Box>
                    <Box bg="blue.600" p={3} borderRadius="md" textAlign="center">
                      <Text fontSize="xs" color="blue.100" textTransform="uppercase" mb={1}>Prix au m² (com incluse)</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="white">{formatNumber(Math.round((totalValeur + totalCommissionAcheteur) / totalSurface))} MAD/m²</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Calcul TPI détaillé au prix DGI */}
        <Card bg={bgCard} borderWidth="2px" borderColor="orange.200">
          <CardBody>
            <HStack mb={6} spacing={3}>
              <Heading size="md" color="brand.700">
                Calcul TPI détaillé par lot
              </Heading>
              <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>Prix DGI : {formatNumber(prixDGI)} MAD/m²</Badge>
            </HStack>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead bg="orange.50">
                  <Tr>
                    <Th>Lot</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Année</Th>
                    <Th isNumeric>Val. M²</Th>
                    <Th isNumeric>Prix DGI</Th>
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
                  {resultatsDGI.map((r, i) => (
                    <Tr key={i} bg={r.tpi20 < r.cotisMin ? 'orange.50' : undefined}>
                      <Td fontWeight="bold">{r.lot.nom}</Td>
                      <Td>
                        <Badge colorScheme={r.lot.type === 'donation' ? 'purple' : 'blue'} variant="subtle">
                          {r.lot.type === 'donation' ? 'Donation' : 'Héritage'}
                        </Badge>
                      </Td>
                      <Td isNumeric>{r.lot.annee}</Td>
                      <Td isNumeric>{formatNumber(r.lot.valeurM2)}</Td>
                      <Td isNumeric fontWeight="medium" color="orange.700">{formatNumber(r.prixVente)}</Td>
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
                    <Td color="white" fontWeight="bold" colSpan={11}>TOTAL TPI (prix DGI)</Td>
                    <Td isNumeric color="white" fontWeight="bold" fontSize="lg">{formatNumber(totalTPIDGI)} MAD</Td>
                  </Tr>
                </Tfoot>
              </Table>
            </Box>
            <Text fontSize="xs" color="gray.500" mt={2}>
              Les lignes en orange indiquent que la cotisation minimale (3%) s'applique car elle est supérieure à la TPI calculée (20%).
            </Text>
            <HStack spacing={4} mt={3}>
              <HStack spacing={2}>
                <Badge colorScheme="purple" variant="subtle">Donation</Badge>
                <Text fontSize="xs" color="gray.500">Année: {anneeDonation} | Valeur: {formatNumber(valeurDonation)} MAD/m²</Text>
              </HStack>
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="subtle">Héritage</Badge>
                <Text fontSize="xs" color="gray.500">Année: {anneeHeritage} | Valeur: {formatNumber(valeurHeritage)} MAD/m²</Text>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        {/* TPI par personne - Détail complet */}
        <Card bg={bgCard}>
          <CardBody>
            <Heading size="md" mb={6} color="brand.700">
              Récapitulatif par personne
            </Heading>

            <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
              {/* ALI */}
              <Card borderWidth="1px" borderColor="gray.200" overflow="hidden" shadow="md">
                <Box bg="blue.600" py={4} px={4}>
                  <HStack spacing={4}>
                    <Avatar size="lg" name="Ali" src="/images/ali.jpg" />
                    <Box>
                      <Text fontSize="xl" fontWeight="bold" color="white">Ali</Text>
                      <Text fontSize="sm" color="blue.100">Part de vente : {formatNumber(valeurAli)} MAD</Text>
                    </Box>
                  </HStack>
                </Box>
                <CardBody p={0}>
                  {/* Tableau comparatif */}
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr bg="gray.50">
                        <Th fontSize="xs" py={3}>Lot</Th>
                        <Th fontSize="xs" py={3} isNumeric>TPI 20%</Th>
                        <Th fontSize="xs" py={3} isNumeric>Cotis. 3%</Th>
                        <Th fontSize="xs" py={3} isNumeric bg="blue.50" color="blue.700">A payer</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {resultats.map((r, i) => r.lot.ali > 0 && (
                        <Tr key={i}>
                          <Td fontSize="xs" py={2}>
                            <Text fontWeight="medium">{r.lot.nom}</Text>
                            <Text fontSize="xs" color="gray.500">{(r.lot.ali * 100).toFixed(0)}%</Text>
                          </Td>
                          <Td fontSize="xs" py={2} isNumeric>
                            <Text color={r.tpi20 >= r.cotisMin ? 'blue.600' : 'gray.400'} fontWeight={r.tpi20 >= r.cotisMin ? 'semibold' : 'normal'}>
                              {formatNumber(r.tpi20 * r.lot.ali)}
                            </Text>
                          </Td>
                          <Td fontSize="xs" py={2} isNumeric>
                            <Text color={r.tpi20 < r.cotisMin ? 'blue.600' : 'gray.400'} fontWeight={r.tpi20 < r.cotisMin ? 'semibold' : 'normal'}>
                              {formatNumber(r.cotisMin * r.lot.ali)}
                            </Text>
                          </Td>
                          <Td fontSize="xs" py={2} isNumeric bg="blue.50">
                            <Text fontWeight="bold" color="blue.700">{formatNumber(r.tpiAPayer * r.lot.ali)}</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <Tfoot>
                      <Tr bg="blue.600">
                        <Td colSpan={3} color="white" fontWeight="bold" fontSize="sm">Total TPI</Td>
                        <Td isNumeric color="white" fontWeight="bold" fontSize="md">{formatNumber(tpiAli)}</Td>
                      </Tr>
                    </Tfoot>
                  </Table>

                  {/* Si DGI rectifie */}
                  <Box bg="amber.50" borderTop="3px solid" borderColor="amber.400">
                    <Box px={4} py={2} bg="amber.100">
                      <Text fontSize="xs" fontWeight="bold" color="amber.800">SI LA DGI RECTIFIE AU PRIX DE {formatNumber(prixDGI)} MAD/M²</Text>
                    </Box>
                    <Table size="sm" variant="simple">
                      <Tbody>
                        {resultatsDGI.map((r, i) => r.lot.ali > 0 && (
                          <Tr key={i}>
                            <Td fontSize="xs" py={2}>
                              <Text fontWeight="medium">{r.lot.nom}</Text>
                            </Td>
                            <Td fontSize="xs" py={2} isNumeric>
                              <Text color={r.tpi20 >= r.cotisMin ? 'amber.700' : 'gray.400'} fontWeight={r.tpi20 >= r.cotisMin ? 'semibold' : 'normal'}>
                                {formatNumber(r.tpi20 * r.lot.ali)}
                              </Text>
                            </Td>
                            <Td fontSize="xs" py={2} isNumeric>
                              <Text color={r.tpi20 < r.cotisMin ? 'amber.700' : 'gray.400'} fontWeight={r.tpi20 < r.cotisMin ? 'semibold' : 'normal'}>
                                {formatNumber(r.cotisMin * r.lot.ali)}
                              </Text>
                            </Td>
                            <Td fontSize="xs" py={2} isNumeric bg="amber.100">
                              <Text fontWeight="bold" color="amber.800">{formatNumber(r.tpiAPayer * r.lot.ali)}</Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                      <Tfoot>
                        <Tr bg="amber.500">
                          <Td colSpan={3} color="white" fontWeight="bold" fontSize="sm">Total TPI (DGI)</Td>
                          <Td isNumeric color="white" fontWeight="bold" fontSize="md">{formatNumber(tpiAliDGI)}</Td>
                        </Tr>
                      </Tfoot>
                    </Table>
                  </Box>

                  {/* Résumé */}
                  <Box p={4} bg="gray.50">
                    <SimpleGrid columns={2} spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Commission ({commissionVendeur}%)</Text>
                        <Text fontSize="sm" fontWeight="medium">-{formatNumber(commissionAli)} MAD</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="amber.600" fontWeight="semibold">Surcoût si DGI</Text>
                        <Text fontSize="sm" fontWeight="bold" color="amber.700">+{formatNumber(tpiAliDGI - tpiAli)} MAD</Text>
                      </Box>
                    </SimpleGrid>
                    <Divider my={3} />
                    <SimpleGrid columns={2} spacing={3}>
                      <Box p={3} bg="teal.50" borderRadius="md">
                        <Text fontSize="xs" color="teal.600">Net (prix vente)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="teal.700">{formatNumber(valeurAli - tpiAli - commissionAli)}</Text>
                      </Box>
                      <Box p={3} bg="amber.50" borderRadius="md">
                        <Text fontSize="xs" color="amber.600">Net (prix DGI)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="amber.700">{formatNumber(valeurAli - tpiAliDGI - commissionAli)}</Text>
                      </Box>
                    </SimpleGrid>
                    <Box mt={3} p={2} bg="red.50" borderRadius="md" textAlign="center">
                      <Text fontSize="xs" color="red.600">Impact si rectification DGI</Text>
                      <Text fontSize="xl" fontWeight="bold" color="red.600">-{formatPercent(valeurAli > 0 ? ((tpiAliDGI - tpiAli) / valeurAli) * 100 : 0)}%</Text>
                    </Box>
                  </Box>
                </CardBody>
              </Card>

              {/* AMINA */}
              <Card borderWidth="1px" borderColor="gray.200" overflow="hidden" shadow="md">
                <Box bg="purple.600" py={4} px={4}>
                  <HStack spacing={4}>
                    <Avatar size="lg" name="Amina" src="/images/Amina_Slaoui_by_MediaCommunity.jpg" />
                    <Box>
                      <Text fontSize="xl" fontWeight="bold" color="white">Amina</Text>
                      <Text fontSize="sm" color="purple.100">Part de vente : {formatNumber(valeurAmina)} MAD</Text>
                    </Box>
                  </HStack>
                </Box>
                <CardBody p={0}>
                  {/* Tableau comparatif */}
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr bg="gray.50">
                        <Th fontSize="xs" py={3}>Lot</Th>
                        <Th fontSize="xs" py={3} isNumeric>TPI 20%</Th>
                        <Th fontSize="xs" py={3} isNumeric>Cotis. 3%</Th>
                        <Th fontSize="xs" py={3} isNumeric bg="purple.50" color="purple.700">A payer</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {resultats.map((r, i) => r.lot.amina > 0 && (
                        <Tr key={i}>
                          <Td fontSize="xs" py={2}>
                            <Text fontWeight="medium">{r.lot.nom}</Text>
                            <Text fontSize="xs" color="gray.500">{(r.lot.amina * 100).toFixed(0)}%</Text>
                          </Td>
                          <Td fontSize="xs" py={2} isNumeric>
                            <Text color={r.tpi20 >= r.cotisMin ? 'purple.600' : 'gray.400'} fontWeight={r.tpi20 >= r.cotisMin ? 'semibold' : 'normal'}>
                              {formatNumber(r.tpi20 * r.lot.amina)}
                            </Text>
                          </Td>
                          <Td fontSize="xs" py={2} isNumeric>
                            <Text color={r.tpi20 < r.cotisMin ? 'purple.600' : 'gray.400'} fontWeight={r.tpi20 < r.cotisMin ? 'semibold' : 'normal'}>
                              {formatNumber(r.cotisMin * r.lot.amina)}
                            </Text>
                          </Td>
                          <Td fontSize="xs" py={2} isNumeric bg="purple.50">
                            <Text fontWeight="bold" color="purple.700">{formatNumber(r.tpiAPayer * r.lot.amina)}</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <Tfoot>
                      <Tr bg="purple.600">
                        <Td colSpan={3} color="white" fontWeight="bold" fontSize="sm">Total TPI</Td>
                        <Td isNumeric color="white" fontWeight="bold" fontSize="md">{formatNumber(tpiAmina)}</Td>
                      </Tr>
                    </Tfoot>
                  </Table>

                  {/* Si DGI rectifie */}
                  <Box bg="amber.50" borderTop="3px solid" borderColor="amber.400">
                    <Box px={4} py={2} bg="amber.100">
                      <Text fontSize="xs" fontWeight="bold" color="amber.800">SI LA DGI RECTIFIE AU PRIX DE {formatNumber(prixDGI)} MAD/M²</Text>
                    </Box>
                    <Table size="sm" variant="simple">
                      <Tbody>
                        {resultatsDGI.map((r, i) => r.lot.amina > 0 && (
                          <Tr key={i}>
                            <Td fontSize="xs" py={2}>
                              <Text fontWeight="medium">{r.lot.nom}</Text>
                            </Td>
                            <Td fontSize="xs" py={2} isNumeric>
                              <Text color={r.tpi20 >= r.cotisMin ? 'amber.700' : 'gray.400'} fontWeight={r.tpi20 >= r.cotisMin ? 'semibold' : 'normal'}>
                                {formatNumber(r.tpi20 * r.lot.amina)}
                              </Text>
                            </Td>
                            <Td fontSize="xs" py={2} isNumeric>
                              <Text color={r.tpi20 < r.cotisMin ? 'amber.700' : 'gray.400'} fontWeight={r.tpi20 < r.cotisMin ? 'semibold' : 'normal'}>
                                {formatNumber(r.cotisMin * r.lot.amina)}
                              </Text>
                            </Td>
                            <Td fontSize="xs" py={2} isNumeric bg="amber.100">
                              <Text fontWeight="bold" color="amber.800">{formatNumber(r.tpiAPayer * r.lot.amina)}</Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                      <Tfoot>
                        <Tr bg="amber.500">
                          <Td colSpan={3} color="white" fontWeight="bold" fontSize="sm">Total TPI (DGI)</Td>
                          <Td isNumeric color="white" fontWeight="bold" fontSize="md">{formatNumber(tpiAminaDGI)}</Td>
                        </Tr>
                      </Tfoot>
                    </Table>
                  </Box>

                  {/* Résumé */}
                  <Box p={4} bg="gray.50">
                    <SimpleGrid columns={2} spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Commission ({commissionVendeur}%)</Text>
                        <Text fontSize="sm" fontWeight="medium">-{formatNumber(commissionAmina)} MAD</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="amber.600" fontWeight="semibold">Surcoût si DGI</Text>
                        <Text fontSize="sm" fontWeight="bold" color="amber.700">+{formatNumber(tpiAminaDGI - tpiAmina)} MAD</Text>
                      </Box>
                    </SimpleGrid>
                    <Divider my={3} />
                    <SimpleGrid columns={2} spacing={3}>
                      <Box p={3} bg="teal.50" borderRadius="md">
                        <Text fontSize="xs" color="teal.600">Net (prix vente)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="teal.700">{formatNumber(valeurAmina - tpiAmina - commissionAmina)}</Text>
                      </Box>
                      <Box p={3} bg="amber.50" borderRadius="md">
                        <Text fontSize="xs" color="amber.600">Net (prix DGI)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="amber.700">{formatNumber(valeurAmina - tpiAminaDGI - commissionAmina)}</Text>
                      </Box>
                    </SimpleGrid>
                    <Box mt={3} p={2} bg="red.50" borderRadius="md" textAlign="center">
                      <Text fontSize="xs" color="red.600">Impact si rectification DGI</Text>
                      <Text fontSize="xl" fontWeight="bold" color="red.600">-{formatPercent(valeurAmina > 0 ? ((tpiAminaDGI - tpiAmina) / valeurAmina) * 100 : 0)}%</Text>
                    </Box>
                  </Box>
                </CardBody>
              </Card>

              {/* LEILA */}
              <Card borderWidth="1px" borderColor="gray.200" overflow="hidden" shadow="md">
                <Box bg="pink.600" py={4} px={4}>
                  <HStack spacing={4}>
                    <Avatar size="lg" name="Leila" src="/images/leila.jpg" />
                    <Box>
                      <Text fontSize="xl" fontWeight="bold" color="white">Leila</Text>
                      <Text fontSize="sm" color="pink.100">Part de vente : {formatNumber(valeurLeila)} MAD</Text>
                    </Box>
                  </HStack>
                </Box>
                <CardBody p={0}>
                  {/* Tableau comparatif */}
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr bg="gray.50">
                        <Th fontSize="xs" py={3}>Lot</Th>
                        <Th fontSize="xs" py={3} isNumeric>TPI 20%</Th>
                        <Th fontSize="xs" py={3} isNumeric>Cotis. 3%</Th>
                        <Th fontSize="xs" py={3} isNumeric bg="pink.50" color="pink.700">A payer</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {resultats.map((r, i) => r.lot.leila > 0 && (
                        <Tr key={i}>
                          <Td fontSize="xs" py={2}>
                            <Text fontWeight="medium">{r.lot.nom}</Text>
                            <Text fontSize="xs" color="gray.500">{(r.lot.leila * 100).toFixed(0)}%</Text>
                          </Td>
                          <Td fontSize="xs" py={2} isNumeric>
                            <Text color={r.tpi20 >= r.cotisMin ? 'pink.600' : 'gray.400'} fontWeight={r.tpi20 >= r.cotisMin ? 'semibold' : 'normal'}>
                              {formatNumber(r.tpi20 * r.lot.leila)}
                            </Text>
                          </Td>
                          <Td fontSize="xs" py={2} isNumeric>
                            <Text color={r.tpi20 < r.cotisMin ? 'pink.600' : 'gray.400'} fontWeight={r.tpi20 < r.cotisMin ? 'semibold' : 'normal'}>
                              {formatNumber(r.cotisMin * r.lot.leila)}
                            </Text>
                          </Td>
                          <Td fontSize="xs" py={2} isNumeric bg="pink.50">
                            <Text fontWeight="bold" color="pink.700">{formatNumber(r.tpiAPayer * r.lot.leila)}</Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                    <Tfoot>
                      <Tr bg="pink.600">
                        <Td colSpan={3} color="white" fontWeight="bold" fontSize="sm">Total TPI</Td>
                        <Td isNumeric color="white" fontWeight="bold" fontSize="md">{formatNumber(tpiLeila)}</Td>
                      </Tr>
                    </Tfoot>
                  </Table>

                  {/* Si DGI rectifie */}
                  <Box bg="amber.50" borderTop="3px solid" borderColor="amber.400">
                    <Box px={4} py={2} bg="amber.100">
                      <Text fontSize="xs" fontWeight="bold" color="amber.800">SI LA DGI RECTIFIE AU PRIX DE {formatNumber(prixDGI)} MAD/M²</Text>
                    </Box>
                    <Table size="sm" variant="simple">
                      <Tbody>
                        {resultatsDGI.map((r, i) => r.lot.leila > 0 && (
                          <Tr key={i}>
                            <Td fontSize="xs" py={2}>
                              <Text fontWeight="medium">{r.lot.nom}</Text>
                            </Td>
                            <Td fontSize="xs" py={2} isNumeric>
                              <Text color={r.tpi20 >= r.cotisMin ? 'amber.700' : 'gray.400'} fontWeight={r.tpi20 >= r.cotisMin ? 'semibold' : 'normal'}>
                                {formatNumber(r.tpi20 * r.lot.leila)}
                              </Text>
                            </Td>
                            <Td fontSize="xs" py={2} isNumeric>
                              <Text color={r.tpi20 < r.cotisMin ? 'amber.700' : 'gray.400'} fontWeight={r.tpi20 < r.cotisMin ? 'semibold' : 'normal'}>
                                {formatNumber(r.cotisMin * r.lot.leila)}
                              </Text>
                            </Td>
                            <Td fontSize="xs" py={2} isNumeric bg="amber.100">
                              <Text fontWeight="bold" color="amber.800">{formatNumber(r.tpiAPayer * r.lot.leila)}</Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                      <Tfoot>
                        <Tr bg="amber.500">
                          <Td colSpan={3} color="white" fontWeight="bold" fontSize="sm">Total TPI (DGI)</Td>
                          <Td isNumeric color="white" fontWeight="bold" fontSize="md">{formatNumber(tpiLeilaDGI)}</Td>
                        </Tr>
                      </Tfoot>
                    </Table>
                  </Box>

                  {/* Résumé */}
                  <Box p={4} bg="gray.50">
                    <SimpleGrid columns={2} spacing={3}>
                      <Box>
                        <Text fontSize="xs" color="gray.500">Commission ({commissionVendeur}%)</Text>
                        <Text fontSize="sm" fontWeight="medium">-{formatNumber(commissionLeila)} MAD</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="amber.600" fontWeight="semibold">Surcoût si DGI</Text>
                        <Text fontSize="sm" fontWeight="bold" color="amber.700">+{formatNumber(tpiLeilaDGI - tpiLeila)} MAD</Text>
                      </Box>
                    </SimpleGrid>
                    <Divider my={3} />
                    <SimpleGrid columns={2} spacing={3}>
                      <Box p={3} bg="teal.50" borderRadius="md">
                        <Text fontSize="xs" color="teal.600">Net (prix vente)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="teal.700">{formatNumber(valeurLeila - tpiLeila - commissionLeila)}</Text>
                      </Box>
                      <Box p={3} bg="amber.50" borderRadius="md">
                        <Text fontSize="xs" color="amber.600">Net (prix DGI)</Text>
                        <Text fontSize="lg" fontWeight="bold" color="amber.700">{formatNumber(valeurLeila - tpiLeilaDGI - commissionLeila)}</Text>
                      </Box>
                    </SimpleGrid>
                    <Box mt={3} p={2} bg="red.50" borderRadius="md" textAlign="center">
                      <Text fontSize="xs" color="red.600">Impact si rectification DGI</Text>
                      <Text fontSize="xl" fontWeight="bold" color="red.600">-{formatPercent(valeurLeila > 0 ? ((tpiLeilaDGI - tpiLeila) / valeurLeila) * 100 : 0)}%</Text>
                    </Box>
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Récapitulatif global */}
            <Card mt={6} bg="gray.800" color="white">
              <CardBody>
                <Text fontSize="sm" fontWeight="bold" mb={4} textTransform="uppercase" letterSpacing="wide">Récapitulatif global</Text>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                  <Box p={4} bg="whiteAlpha.100" borderRadius="md">
                    <Text fontSize="xs" color="gray.400">Total TPI (prix vente)</Text>
                    <Text fontSize="2xl" fontWeight="bold">{formatNumber(totalTPI)} MAD</Text>
                    <Text fontSize="xs" color="gray.400">{formatPercent((totalTPI / totalValeur) * 100)}% du prix</Text>
                  </Box>
                  <Box p={4} bg="amber.500" borderRadius="md">
                    <Text fontSize="xs" color="amber.100">Total TPI (prix DGI)</Text>
                    <Text fontSize="2xl" fontWeight="bold">{formatNumber(totalTPIDGI)} MAD</Text>
                    <Text fontSize="xs" color="amber.100">{formatPercent((totalTPIDGI / totalValeurDGI) * 100)}% du prix DGI</Text>
                  </Box>
                  <Box p={4} bg="red.500" borderRadius="md">
                    <Text fontSize="xs" color="red.100">Surcoût DGI</Text>
                    <Text fontSize="2xl" fontWeight="bold">+{formatNumber(totalTPIDGI - totalTPI)} MAD</Text>
                  </Box>
                  <Box p={4} bg="red.600" borderRadius="md">
                    <Text fontSize="xs" color="red.100">Impact sur le net</Text>
                    <Text fontSize="2xl" fontWeight="bold">-{formatPercent(((totalTPIDGI - totalTPI) / totalValeur) * 100)}%</Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
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
