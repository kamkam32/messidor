'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  HStack,
  VStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from '@chakra-ui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import type { Fund } from '@/lib/types/fund.types'

interface PortfolioFund {
  fund: Fund
  allocationPercent: number
  allocationAmount: number
  history: Array<{ date: string; nav: number; perf_relative: number }>
}

interface PortfolioHistory {
  date: string
  [key: string]: number | string // fund_id: performance value
}

export default function ComparateurPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Fund[]>([])
  const [portfolioFunds, setPortfolioFunds] = useState<PortfolioFund[]>([])
  const [totalAmount, setTotalAmount] = useState(100000) // Montant total par défaut
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '1y' | '3y'>('1y')
  const [showAmount, setShowAmount] = useState(false) // Switch % / MAD
  const [portfolioHistory, setPortfolioHistory] = useState<PortfolioHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestedFunds, setSuggestedFunds] = useState<Fund[]>([])
  const [topPerformers, setTopPerformers] = useState<Fund[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const supabase = createClient()
  const toast = useToast()

  // Charger les fonds suggérés au démarrage
  useEffect(() => {
    loadSuggestedFunds()
  }, [])

  const loadSuggestedFunds = async () => {
    // Top performers (meilleure perf 1Y)
    const { data: topData } = await supabase
      .from('funds')
      .select('*')
      .eq('type', 'OPCVM')
      .eq('is_active', true)
      .not('perf_1y', 'is', null)
      .order('perf_1y', { ascending: false })
      .limit(6)

    setTopPerformers(topData || [])

    // Charger tous les fonds actifs
    const { data: allData } = await supabase
      .from('funds')
      .select('*')
      .eq('type', 'OPCVM')
      .eq('is_active', true)
      .limit(200)

    // Trier côté client : perf 1Y décroissante, puis actif net décroissant (critère secondaire)
    const sorted = (allData || []).sort((a, b) => {
      // Fonds sans perf_1y à la fin
      if (a.perf_1y === null && b.perf_1y === null) {
        // Si pas de perf, trier par actif net
        return (b.asset_value || 0) - (a.asset_value || 0)
      }
      if (a.perf_1y === null) return 1
      if (b.perf_1y === null) return -1
      // Sinon tri par perf décroissante
      return (b.perf_1y || 0) - (a.perf_1y || 0)
    })

    setSuggestedFunds(sorted)
  }

  // Recherche de fonds
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const searchFunds = async () => {
      const { data } = await supabase
        .from('funds')
        .select('*')
        .eq('type', 'OPCVM')
        .eq('is_active', true)
        .or(`name.ilike.%${searchQuery}%,code.ilike.%${searchQuery}%,isin_code.ilike.%${searchQuery}%`)
        .limit(10)

      setSearchResults(data || [])
    }

    const debounce = setTimeout(searchFunds, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, supabase])

  // Charger l'historique des fonds sélectionnés
  useEffect(() => {
    if (portfolioFunds.length === 0) {
      setPortfolioHistory([])
      return
    }
    loadPortfolioHistory()
  }, [portfolioFunds.map(f => f.fund.id).join(','), period])

  // Recalculer la performance du portefeuille quand l'allocation change
  useEffect(() => {
    if (portfolioHistory.length > 0 && portfolioFunds.length > 0) {
      // Recalculer seulement les poids, pas recharger les données
      const updatedHistory = portfolioHistory.map(entry => {
        let weightedPerf = 0
        let totalWeight = 0

        portfolioFunds.forEach(pf => {
          const fundPerf = entry[pf.fund.id] as number
          if (typeof fundPerf === 'number' && pf.allocationPercent > 0) {
            weightedPerf += fundPerf * (pf.allocationPercent / 100)
            totalWeight += pf.allocationPercent
          }
        })

        return {
          ...entry,
          portfolio: totalWeight > 0 ? weightedPerf : 0
        }
      })

      setPortfolioHistory(updatedHistory)
    }
  }, [portfolioFunds.map(f => `${f.fund.id}:${f.allocationPercent}`).join(',')])

  const loadPortfolioHistory = async () => {
    if (portfolioFunds.length === 0) return

    setLoading(true)
    try {
      const endDate = new Date()
      const startDate = new Date()

      switch (period) {
        case '1m': startDate.setMonth(startDate.getMonth() - 1); break
        case '3m': startDate.setMonth(startDate.getMonth() - 3); break
        case '6m': startDate.setMonth(startDate.getMonth() - 6); break
        case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break
        case '3y': startDate.setFullYear(startDate.getFullYear() - 3); break
      }

      // Charger l'historique pour chaque fonds
      const historiesMap = new Map<string, Array<{ date: string; nav: number; perf_relative: number }>>()

      await Promise.all(
        portfolioFunds.map(async (pf) => {
          const { data } = await supabase
            .from('fund_performance_history')
            .select('date, nav')
            .eq('fund_id', pf.fund.id)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0])
            .order('date', { ascending: true })

          const historyData = data || []
          const history = historyData.map((item, index) => {
            const perfRelative = index === 0 || !historyData[0]?.nav || !item.nav
              ? 0
              : ((item.nav - historyData[0].nav) / historyData[0].nav) * 100

            return {
              date: item.date,
              nav: item.nav,
              perf_relative: perfRelative,
            }
          })

          historiesMap.set(pf.fund.id, history)
        })
      )

      // Calculer l'historique du portefeuille avec les nouvelles données
      calculatePortfolioHistoryFromMap(historiesMap)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculer la performance historique du portefeuille à partir d'une map
  const calculatePortfolioHistoryFromMap = (historiesMap: Map<string, Array<{ date: string; nav: number; perf_relative: number }>>) => {
    if (portfolioFunds.length === 0 || historiesMap.size === 0) {
      setPortfolioHistory([])
      return
    }

    // Trouver toutes les dates communes
    const allDates = new Set<string>()
    historiesMap.forEach(history => history.forEach(h => allDates.add(h.date)))
    const sortedDates = Array.from(allDates).sort()

    // Calculer la performance pondérée pour chaque date
    const history: PortfolioHistory[] = sortedDates.map(date => {
      const entry: PortfolioHistory = { date }

      portfolioFunds.forEach(pf => {
        const fundHistory = historiesMap.get(pf.fund.id)
        const dataPoint = fundHistory?.find(h => h.date === date)
        if (dataPoint) {
          entry[pf.fund.id] = dataPoint.perf_relative
        }
      })

      // Calculer la performance du portefeuille (moyenne pondérée)
      let weightedPerf = 0
      let totalWeight = 0

      portfolioFunds.forEach(pf => {
        const fundHistory = historiesMap.get(pf.fund.id)
        const dataPoint = fundHistory?.find(h => h.date === date)
        if (dataPoint && pf.allocationPercent > 0) {
          weightedPerf += dataPoint.perf_relative * (pf.allocationPercent / 100)
          totalWeight += pf.allocationPercent
        }
      })

      entry['portfolio'] = totalWeight > 0 ? weightedPerf : 0

      return entry
    })

    setPortfolioHistory(history)
  }

  // Calculer la performance historique du portefeuille
  const calculatePortfolioHistory = (funds: PortfolioFund[]) => {
    if (funds.length === 0 || funds.every(f => f.history.length === 0)) {
      setPortfolioHistory([])
      return
    }

    // Trouver toutes les dates communes
    const allDates = new Set<string>()
    funds.forEach(f => f.history.forEach(h => allDates.add(h.date)))
    const sortedDates = Array.from(allDates).sort()

    // Calculer la performance pondérée pour chaque date
    const history: PortfolioHistory[] = sortedDates.map(date => {
      const entry: PortfolioHistory = { date }

      funds.forEach(pf => {
        const dataPoint = pf.history.find(h => h.date === date)
        if (dataPoint) {
          entry[pf.fund.id] = dataPoint.perf_relative
        }
      })

      // Calculer la performance du portefeuille (moyenne pondérée)
      let weightedPerf = 0
      let totalWeight = 0

      funds.forEach(pf => {
        const dataPoint = pf.history.find(h => h.date === date)
        if (dataPoint && pf.allocationPercent > 0) {
          weightedPerf += dataPoint.perf_relative * (pf.allocationPercent / 100)
          totalWeight += pf.allocationPercent
        }
      })

      entry['portfolio'] = totalWeight > 0 ? weightedPerf : 0

      return entry
    })

    setPortfolioHistory(history)
  }

  // Ajouter un fonds au portefeuille
  const addFund = (fund: Fund) => {
    if (portfolioFunds.some(pf => pf.fund.id === fund.id)) {
      toast({
        title: 'Fonds déjà ajouté',
        status: 'warning',
        duration: 2000,
      })
      return
    }

    const newAllocationPercent = portfolioFunds.length === 0 ? 100 : 0
    const newAllocationAmount = (totalAmount * newAllocationPercent) / 100

    setPortfolioFunds([
      ...portfolioFunds,
      {
        fund,
        allocationPercent: newAllocationPercent,
        allocationAmount: newAllocationAmount,
        history: [],
      },
    ])
    setSearchQuery('')
    setSearchResults([])

    toast({
      title: 'Fonds ajouté',
      status: 'success',
      duration: 2000,
    })
  }

  // Retirer un fonds
  const removeFund = (fundId: string) => {
    setPortfolioFunds(portfolioFunds.filter(pf => pf.fund.id !== fundId))
  }

  // Mettre à jour l'allocation en %
  const updateAllocationPercent = (fundId: string, percent: number) => {
    setPortfolioFunds(
      portfolioFunds.map(pf =>
        pf.fund.id === fundId
          ? {
              ...pf,
              allocationPercent: percent,
              allocationAmount: (totalAmount * percent) / 100,
            }
          : pf
      )
    )
  }

  // Mettre à jour l'allocation en MAD
  const updateAllocationAmount = (fundId: string, amount: number) => {
    const percent = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    setPortfolioFunds(
      portfolioFunds.map(pf =>
        pf.fund.id === fundId
          ? {
              ...pf,
              allocationPercent: percent,
              allocationAmount: amount,
            }
          : pf
      )
    )
  }

  // Répartir équitablement
  const distributeEqually = () => {
    if (portfolioFunds.length === 0) return
    const equalPercent = 100 / portfolioFunds.length
    setPortfolioFunds(
      portfolioFunds.map(pf => ({
        ...pf,
        allocationPercent: equalPercent,
        allocationAmount: (totalAmount * equalPercent) / 100,
      }))
    )
  }

  const totalAllocation = portfolioFunds.reduce((sum, pf) => sum + pf.allocationPercent, 0)
  const totalAllocatedAmount = portfolioFunds.reduce((sum, pf) => sum + pf.allocationAmount, 0)

  // Performance du portefeuille
  const portfolioPerformance = portfolioHistory.length > 0
    ? (portfolioHistory[portfolioHistory.length - 1]?.portfolio as number) || 0
    : 0

  const portfolioValue = totalAmount * (1 + portfolioPerformance / 100)
  const portfolioGain = portfolioValue - totalAmount

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
  }

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  // Couleurs pour les courbes
  const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316']

  return (
    <Box px={{ base: 4, md: 6, lg: 8 }} py={8} maxW="100%" mx="auto">
      <VStack align="stretch" spacing={6}>
        {/* En-tête */}
        <Box>
          <Heading size="xl" mb={2}>Comparateur & Constructeur de Portefeuille</Heading>
          <Text color="gray.600">
            Comparez les performances de plusieurs fonds et construisez votre portefeuille optimal
          </Text>
        </Box>

        {/* Layout 3 colonnes */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4} alignItems="start">
          {/* COLONNE 1 : Sélection des fonds */}
          <VStack align="stretch" spacing={4} position="sticky" top={4} maxH="calc(100vh - 100px)" overflowY="auto">
            {/* Recherche et ajout de fonds */}
            <Card shadow="sm" borderWidth="1px">
          <CardBody p={6}>
            <VStack align="stretch" spacing={5}>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Heading size="md" fontWeight="600">Sélectionner des fonds</Heading>
                  {portfolioFunds.length > 0 && (
                    <Badge
                      colorScheme="purple"
                      fontSize="xs"
                      px={2.5}
                      py={1}
                      borderRadius="full"
                      fontWeight="600"
                    >
                      {portfolioFunds.length}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  Recherchez ou parcourez par catégorie
                </Text>
              </VStack>

              <InputGroup size="md">
                <InputLeftElement pointerEvents="none" color="gray.400">
                  🔍
                </InputLeftElement>
                <Input
                  placeholder="Rechercher un fonds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  borderRadius="lg"
                  bg="gray.50"
                  border="none"
                  _placeholder={{ color: 'gray.400' }}
                  _focus={{ bg: 'white', shadow: 'sm', borderColor: 'purple.200', borderWidth: '1px' }}
                />
              </InputGroup>

              {/* Résultats de recherche */}
              {searchResults.length > 0 && (
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                    Résultats ({searchResults.length})
                  </Text>
                  <VStack align="stretch" spacing={2} maxH="400px" overflowY="auto" pr={1}>
                    {searchResults.map(fund => (
                      <Box
                        key={fund.id}
                        p={3}
                        bg="white"
                        borderRadius="lg"
                        cursor="pointer"
                        _hover={{ bg: 'purple.50', shadow: 'sm', transform: 'translateY(-1px)' }}
                        transition="all 0.2s"
                        border="1px solid"
                        borderColor="gray.200"
                        onClick={() => addFund(fund)}
                      >
                        <VStack align="stretch" spacing={2}>
                          <HStack justify="space-between" align="start">
                            <Text fontWeight="600" fontSize="sm" noOfLines={1} flex={1}>
                              {fund.name}
                            </Text>
                            <IconButton
                              aria-label="Ajouter"
                              icon={<Text fontSize="lg">+</Text>}
                              size="xs"
                              colorScheme="purple"
                              variant="ghost"
                              borderRadius="full"
                            />
                          </HStack>
                          <HStack spacing={2} flexWrap="wrap">
                            <Badge colorScheme="purple" fontSize="2xs" borderRadius="md">{fund.classification}</Badge>
                            <Text fontSize="2xs" color="gray.500">{fund.code}</Text>
                            <Badge
                              colorScheme={fund.perf_1y && fund.perf_1y > 0 ? 'green' : 'red'}
                              fontSize="2xs"
                              borderRadius="md"
                            >
                              1Y: {formatPercent(fund.perf_1y || 0)}
                            </Badge>
                          </HStack>
                          <HStack spacing={3} fontSize="2xs" color="gray.600">
                            <HStack spacing={1}>
                              <Text fontWeight="600">AUM:</Text>
                              <Text color="purple.600" fontWeight="600">
                                {fund.asset_value ? `${(fund.asset_value / 1000000).toFixed(0)}M` : 'N/A'}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Text fontWeight="600">YTD:</Text>
                              <Text color={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.700' : 'red.600'} fontWeight="600">
                                {formatPercent(fund.ytd_performance || 0)}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Text fontWeight="600">3Y:</Text>
                              <Text color={fund.perf_3y && fund.perf_3y > 0 ? 'green.700' : 'red.600'} fontWeight="600">
                                {fund.perf_3y ? formatPercent(fund.perf_3y) : 'N/A'}
                              </Text>
                            </HStack>
                          </HStack>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                </VStack>
              )}

              {/* Suggestions si pas de recherche */}
              {searchQuery.length === 0 && (
                <VStack align="stretch" spacing={4}>
                  {/* Top Performers */}
                  {topPerformers.length > 0 && (
                    <VStack align="stretch" spacing={3}>
                      <HStack>
                        <Box fontSize="sm">🔥</Box>
                        <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                          Top Performers
                        </Text>
                      </HStack>
                      <SimpleGrid columns={{ base: 1 }} spacing={2}>
                        {topPerformers.map(fund => (
                          <Box
                            key={fund.id}
                            p={3}
                            bg="gradient-to-r from-green-50 to-emerald-50"
                            borderRadius="lg"
                            cursor="pointer"
                            _hover={{ shadow: 'sm', transform: 'translateY(-1px)', bg: 'green.100' }}
                            transition="all 0.2s"
                            border="1px solid"
                            borderColor="green.200"
                            onClick={() => addFund(fund)}
                          >
                            <VStack align="stretch" spacing={2}>
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={0} flex={1} minW={0}>
                                  <Text fontWeight="600" fontSize="sm" noOfLines={1}>{fund.name}</Text>
                                  <HStack spacing={2} mt={1}>
                                    <Badge colorScheme="green" fontSize="2xs" borderRadius="md" fontWeight="600">
                                      1Y: {formatPercent(fund.perf_1y || 0)}
                                    </Badge>
                                    <Text fontSize="2xs" color="gray.600">{fund.classification}</Text>
                                  </HStack>
                                </VStack>
                                <IconButton
                                  aria-label="Ajouter"
                                  icon={<Text fontSize="lg">+</Text>}
                                  size="xs"
                                  colorScheme="green"
                                  variant="ghost"
                                  borderRadius="full"
                                />
                              </HStack>
                              <HStack spacing={3} fontSize="2xs" color="gray.600">
                                <HStack spacing={1}>
                                  <Text fontWeight="600">AUM:</Text>
                                  <Text color="purple.600" fontWeight="600">
                                    {fund.asset_value ? `${(fund.asset_value / 1000000).toFixed(0)}M` : 'N/A'}
                                  </Text>
                                </HStack>
                                <HStack spacing={1}>
                                  <Text fontWeight="600">YTD:</Text>
                                  <Text color={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.700' : 'red.600'} fontWeight="600">
                                    {formatPercent(fund.ytd_performance || 0)}
                                  </Text>
                                </HStack>
                                <HStack spacing={1}>
                                  <Text fontWeight="600">3Y:</Text>
                                  <Text color={fund.perf_3y && fund.perf_3y > 0 ? 'green.700' : 'red.600'} fontWeight="600">
                                    {fund.perf_3y ? formatPercent(fund.perf_3y) : 'N/A'}
                                  </Text>
                                </HStack>
                              </HStack>
                            </VStack>
                          </Box>
                        ))}
                      </SimpleGrid>
                    </VStack>
                  )}

                  {/* Onglets par catégorie */}
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Box fontSize="sm">💼</Box>
                      <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                        Par catégorie
                      </Text>
                    </HStack>

                    <HStack spacing={2} flexWrap="wrap">
                      {[
                        { key: 'all', label: 'Populaires' },
                        { key: 'ACTIONS', label: 'Actions' },
                        { key: 'MONÉTAIRE', label: 'Monétaire' },
                        { key: 'OCT', label: 'Obligations CT' },
                        { key: 'OMLT', label: 'Obligations MLT' },
                        { key: 'DIVERSIFIÉ', label: 'Diversifié' },
                        { key: 'CONTRACTUEL', label: 'Contractuel' },
                      ].map(cat => {
                        const count = suggestedFunds.filter(f => {
                          if (cat.key === 'all') return true
                          if (cat.key === 'DIVERSIFIÉ') {
                            return f.classification === 'DIVERSIFIÉ' || f.classification === 'Diversifié'
                          }
                          return f.classification === cat.key
                        }).length

                        return (
                          <Button
                            key={cat.key}
                            size="xs"
                            variant={selectedCategory === cat.key ? 'solid' : 'outline'}
                            colorScheme="purple"
                            onClick={() => setSelectedCategory(cat.key)}
                            borderRadius="full"
                            fontWeight={selectedCategory === cat.key ? '600' : '500'}
                            rightIcon={
                              <Badge
                                ml={1}
                                colorScheme={selectedCategory === cat.key ? 'whiteAlpha' : 'purple'}
                                fontSize="2xs"
                                borderRadius="full"
                              >
                                {count}
                              </Badge>
                            }
                          >
                            {cat.label}
                          </Button>
                        )
                      })}
                    </HStack>

                    {(() => {
                      const filteredFunds = suggestedFunds.filter(f => {
                        if (selectedCategory === 'all') return true
                        if (selectedCategory === 'DIVERSIFIÉ') {
                          return f.classification === 'DIVERSIFIÉ' || f.classification === 'Diversifié'
                        }
                        return f.classification === selectedCategory
                      })

                      return (
                        <VStack align="stretch" spacing={2}>
                          <Text fontSize="2xs" color="gray.500" fontWeight="500">
                            {filteredFunds.length} fonds disponible{filteredFunds.length > 1 ? 's' : ''}
                          </Text>
                          <Box
                            maxH="400px"
                            overflowY="auto"
                            pr={1}
                            css={{
                              '&::-webkit-scrollbar': {
                                width: '6px',
                              },
                              '&::-webkit-scrollbar-track': {
                                background: '#f7fafc',
                                borderRadius: '10px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: '#cbd5e0',
                                borderRadius: '10px',
                              },
                              '&::-webkit-scrollbar-thumb:hover': {
                                background: '#a0aec0',
                              },
                            }}
                          >
                            <VStack align="stretch" spacing={2}>
                              {filteredFunds.map(fund => (
                                <Box
                                  key={fund.id}
                                  p={3}
                                  bg="white"
                                  borderRadius="lg"
                                  cursor="pointer"
                                  _hover={{ bg: 'purple.50', shadow: 'sm', transform: 'translateY(-1px)' }}
                                  transition="all 0.2s"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  onClick={() => addFund(fund)}
                                >
                                  <VStack align="stretch" spacing={2}>
                                    <HStack justify="space-between">
                                      <Text fontWeight="600" fontSize="sm" noOfLines={1} flex={1}>
                                        {fund.name}
                                      </Text>
                                      <IconButton
                                        aria-label="Ajouter"
                                        icon={<Text fontSize="lg">+</Text>}
                                        size="xs"
                                        colorScheme="purple"
                                        variant="ghost"
                                        borderRadius="full"
                                      />
                                    </HStack>
                                    <HStack spacing={2} flexWrap="wrap">
                                      <Badge colorScheme="purple" fontSize="2xs" borderRadius="md">{fund.classification}</Badge>
                                      <Text fontSize="2xs" color="gray.500">{fund.code}</Text>
                                      <Badge
                                        colorScheme={fund.perf_1y && fund.perf_1y > 0 ? 'green' : 'red'}
                                        fontSize="2xs"
                                        borderRadius="md"
                                      >
                                        1Y: {formatPercent(fund.perf_1y || 0)}
                                      </Badge>
                                    </HStack>
                                    <HStack spacing={3} fontSize="2xs" color="gray.600">
                                      <HStack spacing={1}>
                                        <Text fontWeight="600">AUM:</Text>
                                        <Text color="purple.600" fontWeight="600">
                                          {fund.asset_value ? `${(fund.asset_value / 1000000).toFixed(0)}M` : 'N/A'}
                                        </Text>
                                      </HStack>
                                      <HStack spacing={1}>
                                        <Text fontWeight="600">YTD:</Text>
                                        <Text color={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.700' : 'red.600'} fontWeight="600">
                                          {formatPercent(fund.ytd_performance || 0)}
                                        </Text>
                                      </HStack>
                                      <HStack spacing={1}>
                                        <Text fontWeight="600">3Y:</Text>
                                        <Text color={fund.perf_3y && fund.perf_3y > 0 ? 'green.700' : 'red.600'} fontWeight="600">
                                          {fund.perf_3y ? formatPercent(fund.perf_3y) : 'N/A'}
                                        </Text>
                                      </HStack>
                                    </HStack>
                                  </VStack>
                                </Box>
                              ))}
                            </VStack>
                          </Box>
                        </VStack>
                      )
                    })()}
                  </VStack>

                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    💡 Astuce : Utilisez la recherche ci-dessus pour trouver un fonds spécifique
                  </Text>
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>
          </VStack>

          {/* COLONNE 2 : Stats et Analyses */}
          <VStack align="stretch" spacing={4}>
        {portfolioFunds.length > 0 ? (
          <>
            {/* Stats du portefeuille */}
            <VStack align="stretch" spacing={4}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Montant investi</StatLabel>
                    <StatNumber fontSize="xl">
                      <NumberInput
                        value={totalAmount}
                        onChange={(_, val) => setTotalAmount(val)}
                        min={0}
                        step={1000}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Valeur actuelle</StatLabel>
                    <StatNumber fontSize="xl">{formatCurrency(portfolioValue)}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Gain/Perte</StatLabel>
                    <StatNumber fontSize="xl" color={portfolioGain >= 0 ? 'green.500' : 'red.500'}>
                      {portfolioGain >= 0 && <StatArrow type="increase" />}
                      {portfolioGain < 0 && <StatArrow type="decrease" />}
                      {formatCurrency(Math.abs(portfolioGain))}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Performance</StatLabel>
                    <StatNumber fontSize="xl" color={portfolioPerformance >= 0 ? 'green.500' : 'red.500'}>
                      {formatPercent(portfolioPerformance)}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </VStack>

            {/* Répartition du risque et des catégories */}
            <VStack align="stretch" spacing={4}>
              {/* Répartition du risque (SRI) */}
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Text fontSize="sm">⚠️</Text>
                      <Heading size="sm">Répartition du Risque (SRI)</Heading>
                    </HStack>

                    {(() => {
                      // Calculer la répartition du risque pondérée
                      const riskDistribution = portfolioFunds.map(pf => ({
                        name: pf.fund.name,
                        risk: pf.fund.risk_level || 0,
                        allocation: pf.allocationPercent,
                        value: (pf.fund.risk_level || 0) * (pf.allocationPercent / 100),
                      }))

                      const totalRisk = riskDistribution.reduce((sum, r) => sum + r.value, 0)
                      const avgRisk = riskDistribution.reduce((sum, r) => sum + r.allocation, 0) > 0
                        ? totalRisk / (riskDistribution.reduce((sum, r) => sum + r.allocation, 0) / 100)
                        : 0

                      // Répartition par niveau de risque (1-7)
                      const riskLevels = [1, 2, 3, 4, 5, 6, 7].map(level => {
                        const total = portfolioFunds
                          .filter(pf => (pf.fund.risk_level || 0) === level)
                          .reduce((sum, pf) => sum + pf.allocationPercent, 0)
                        return { level: `SRI ${level}`, value: total }
                      }).filter(r => r.value > 0)

                      return (
                        <>
                          <Box textAlign="center">
                            <Text fontSize="xs" color="gray.600">Niveau de risque moyen du portefeuille</Text>
                            <HStack justify="center" mt={2}>
                              <Text fontSize="3xl" fontWeight="bold" color={avgRisk <= 2 ? 'green.500' : avgRisk <= 4 ? 'yellow.500' : 'red.500'}>
                                {avgRisk.toFixed(1)}
                              </Text>
                              <Text fontSize="lg" color="gray.500">/7</Text>
                            </HStack>
                          </Box>

                          {riskLevels.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={riskLevels} layout="vertical">
                                <XAxis type="number" unit="%" />
                                <YAxis type="category" dataKey="level" width={60} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                <Bar dataKey="value" fill="#805ad5" radius={[0, 8, 8, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <Text fontSize="sm" color="gray.500" textAlign="center">
                              Aucune donnée de risque disponible
                            </Text>
                          )}
                        </>
                      )
                    })()}
                  </VStack>
                </CardBody>
              </Card>

              {/* Répartition par catégories */}
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Text fontSize="sm">📊</Text>
                      <Heading size="sm">Répartition par Catégorie</Heading>
                    </HStack>

                    {(() => {
                      // Regrouper par catégorie
                      const categoryMap = new Map<string, number>()
                      portfolioFunds.forEach(pf => {
                        const category = pf.fund.classification || 'Non classé'
                        categoryMap.set(category, (categoryMap.get(category) || 0) + pf.allocationPercent)
                      })

                      const categoryData = Array.from(categoryMap.entries())
                        .map(([name, value]) => ({ name, value }))
                        .filter(c => c.value > 0)
                        .sort((a, b) => b.value - a.value)

                      // Couleurs pour le camembert
                      const CATEGORY_COLORS: Record<string, string> = {
                        'ACTIONS': '#f56565',
                        'MONÉTAIRE': '#48bb78',
                        'OCT': '#4299e1',
                        'OMLT': '#3182ce',
                        'DIVERSIFIÉ': '#9f7aea',
                        'Diversifié': '#9f7aea',
                        'CONTRACTUEL': '#ed8936',
                      }

                      return categoryData.length > 0 ? (
                        <>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry: any) => `${entry.name}: ${Number(entry.value).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#718096'} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                            </PieChart>
                          </ResponsiveContainer>

                          <VStack align="stretch" spacing={1}>
                            {categoryData.map((cat, index) => (
                              <HStack key={cat.name} justify="space-between" fontSize="sm">
                                <HStack>
                                  <Box w={3} h={3} borderRadius="sm" bg={CATEGORY_COLORS[cat.name] || '#718096'} />
                                  <Text>{cat.name}</Text>
                                </HStack>
                                <Text fontWeight="600">{cat.value.toFixed(1)}%</Text>
                              </HStack>
                            ))}
                          </VStack>
                        </>
                      ) : (
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          Aucune allocation définie
                        </Text>
                      )
                    })()}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </>
        ) : (
          <Card>
            <CardBody py={12}>
              <VStack spacing={3}>
                <Text fontSize="4xl">📊</Text>
                <Text color="gray.600" textAlign="center">
                  Sélectionnez des fonds pour voir les statistiques et analyses
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
          </VStack>

          {/* COLONNE 3 : Graphiques, Allocation et Tableau */}
          <VStack align="stretch" spacing={4}>
        {portfolioFunds.length > 0 ? (
          <>
            {/* Graphique de comparaison */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between" flexWrap="wrap">
                    <Heading size="md">Comparaison des Performances</Heading>
                    <HStack spacing={2}>
                      {(['1m', '3m', '6m', '1y', '3y'] as const).map(p => (
                        <Button
                          key={p}
                          size="sm"
                          variant={period === p ? 'solid' : 'outline'}
                          colorScheme="purple"
                          onClick={() => setPeriod(p)}
                        >
                          {p.toUpperCase()}
                        </Button>
                      ))}
                    </HStack>
                  </HStack>

                  {portfolioHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={portfolioHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis
                          tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`}
                        />
                        <Tooltip
                          labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                          formatter={(value: number) => formatPercent(value)}
                        />
                        <Legend />

                        {/* Ligne du portefeuille */}
                        <Line
                          type="monotone"
                          dataKey="portfolio"
                          stroke="#000000"
                          strokeWidth={3}
                          name="Portefeuille"
                          dot={false}
                          connectNulls={true}
                        />

                        {/* Lignes des fonds individuels */}
                        {portfolioFunds.map((pf, index) => (
                          <Line
                            key={pf.fund.id}
                            type="monotone"
                            dataKey={pf.fund.id}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            name={pf.fund.name}
                            dot={false}
                            connectNulls={true}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box textAlign="center" py={12}>
                      <Text color="gray.500">Chargement des données...</Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Allocation du portefeuille */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between">
                    <Heading size="md">Allocation du Portefeuille</Heading>
                    <HStack>
                      <Button size="sm" onClick={distributeEqually} colorScheme="blue">
                        Répartir équitablement
                      </Button>
                      <HStack spacing={3} px={3} py={1} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight={!showAmount ? 'bold' : 'medium'}>%</Text>
                        <Switch
                          colorScheme="purple"
                          isChecked={showAmount}
                          onChange={(e) => setShowAmount(e.target.checked)}
                        />
                        <Text fontSize="sm" fontWeight={showAmount ? 'bold' : 'medium'}>MAD</Text>
                      </HStack>
                    </HStack>
                  </HStack>

                  {portfolioFunds.map((pf, index) => (
                    <Box key={pf.fund.id} p={4} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" shadow="sm">
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Box flex={1}>
                            <Text fontWeight="bold" fontSize="md">{pf.fund.name}</Text>
                            <HStack spacing={2} mt={1}>
                              <Badge colorScheme="purple" fontSize="xs">{pf.fund.classification}</Badge>
                              <Badge colorScheme={pf.fund.risk_level && pf.fund.risk_level > 5 ? 'red' : 'green'} fontSize="xs">
                                Risque {pf.fund.risk_level}/7
                              </Badge>
                              <Text fontSize="xs" color="gray.500">Code: {pf.fund.code}</Text>
                            </HStack>
                          </Box>
                          <IconButton
                            aria-label="Retirer"
                            icon={<Text>🗑️</Text>}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => removeFund(pf.fund.id)}
                          />
                        </HStack>

                        {/* Infos clés du fonds */}
                        <SimpleGrid columns={4} spacing={3} p={3} bg="gray.50" borderRadius="md">
                          <VStack spacing={0} align="center">
                            <Text fontSize="2xs" color="gray.500" fontWeight="600" textTransform="uppercase">Actif Net</Text>
                            <Text fontSize="sm" fontWeight="bold" color="purple.600">
                              {pf.fund.asset_value ? `${(pf.fund.asset_value / 1000000).toFixed(1)}M` : 'N/A'}
                            </Text>
                          </VStack>
                          <VStack spacing={0} align="center">
                            <Text fontSize="2xs" color="gray.500" fontWeight="600" textTransform="uppercase">Perf YTD</Text>
                            <Text fontSize="sm" fontWeight="bold" color={pf.fund.ytd_performance && pf.fund.ytd_performance > 0 ? 'green.600' : 'red.600'}>
                              {pf.fund.ytd_performance !== null && pf.fund.ytd_performance !== undefined
                                ? `${pf.fund.ytd_performance > 0 ? '+' : ''}${pf.fund.ytd_performance.toFixed(2)}%`
                                : 'N/A'}
                            </Text>
                          </VStack>
                          <VStack spacing={0} align="center">
                            <Text fontSize="2xs" color="gray.500" fontWeight="600" textTransform="uppercase">Perf 1 an</Text>
                            <Text fontSize="sm" fontWeight="bold" color={pf.fund.perf_1y && pf.fund.perf_1y > 0 ? 'green.600' : 'red.600'}>
                              {pf.fund.perf_1y !== null && pf.fund.perf_1y !== undefined
                                ? `${pf.fund.perf_1y > 0 ? '+' : ''}${pf.fund.perf_1y.toFixed(2)}%`
                                : 'N/A'}
                            </Text>
                          </VStack>
                          <VStack spacing={0} align="center">
                            <Text fontSize="2xs" color="gray.500" fontWeight="600" textTransform="uppercase">Perf 3 ans</Text>
                            <Text fontSize="sm" fontWeight="bold" color={pf.fund.perf_3y && pf.fund.perf_3y > 0 ? 'green.600' : 'red.600'}>
                              {pf.fund.perf_3y !== null && pf.fund.perf_3y !== undefined
                                ? `${pf.fund.perf_3y > 0 ? '+' : ''}${pf.fund.perf_3y.toFixed(2)}%`
                                : 'N/A'}
                            </Text>
                          </VStack>
                        </SimpleGrid>

                        {!showAmount ? (
                          <HStack spacing={4}>
                            <Slider
                              flex={1}
                              value={pf.allocationPercent}
                              onChange={(val) => updateAllocationPercent(pf.fund.id, val)}
                              min={0}
                              max={100}
                              step={1}
                              colorScheme="purple"
                            >
                              <SliderTrack>
                                <SliderFilledTrack />
                              </SliderTrack>
                              <SliderThumb boxSize={6}>
                                <Box color="purple.500" fontSize="xs" fontWeight="bold">
                                  {pf.allocationPercent.toFixed(0)}
                                </Box>
                              </SliderThumb>
                            </Slider>
                            <NumberInput
                              value={pf.allocationPercent.toFixed(2)}
                              onChange={(_, val) => updateAllocationPercent(pf.fund.id, val)}
                              min={0}
                              max={100}
                              step={1}
                              w="100px"
                            >
                              <NumberInputField />
                            </NumberInput>
                            <Text fontWeight="bold" minW="30px">%</Text>
                          </HStack>
                        ) : (
                          <HStack spacing={4}>
                            <NumberInput
                              flex={1}
                              value={pf.allocationAmount.toFixed(0)}
                              onChange={(_, val) => updateAllocationAmount(pf.fund.id, val)}
                              min={0}
                              max={totalAmount}
                              step={1000}
                            >
                              <NumberInputField />
                            </NumberInput>
                            <Text fontWeight="bold" minW="50px">MAD</Text>
                            <Text color="gray.600" minW="60px">({pf.allocationPercent.toFixed(1)}%)</Text>
                          </HStack>
                        )}
                      </VStack>
                    </Box>
                  ))}

                  {/* Total allocation */}
                  <Box
                    p={4}
                    bg={Math.abs(totalAllocation - 100) < 0.01 ? 'green.50' : 'orange.50'}
                    borderRadius="md"
                    borderWidth={2}
                    borderColor={Math.abs(totalAllocation - 100) < 0.01 ? 'green.500' : 'orange.500'}
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Total alloué</Text>
                      <HStack>
                        <Text fontWeight="bold" fontSize="lg">
                          {totalAllocation.toFixed(2)}%
                        </Text>
                        {!showAmount && Math.abs(totalAllocation - 100) > 0.01 && (
                          <Badge colorScheme="orange">
                            {totalAllocation > 100 ? 'Surallocation' : 'Sous-allocation'}
                          </Badge>
                        )}
                      </HStack>
                    </HStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Tableau comparatif */}
            <Card>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Tableau Comparatif</Heading>
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Fonds</Th>
                          <Th>Allocation</Th>
                          <Th isNumeric>VL</Th>
                          <Th isNumeric>1M</Th>
                          <Th isNumeric>3M</Th>
                          <Th isNumeric>6M</Th>
                          <Th isNumeric>YTD</Th>
                          <Th isNumeric>1Y</Th>
                          <Th isNumeric>3Y</Th>
                          <Th>Risque</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {portfolioFunds.map(pf => (
                          <Tr key={pf.fund.id}>
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" fontSize="sm">{pf.fund.name}</Text>
                                <Text fontSize="xs" color="gray.600">{pf.fund.code}</Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Badge colorScheme="purple">
                                {pf.allocationPercent.toFixed(1)}%
                              </Badge>
                            </Td>
                            <Td isNumeric>{formatCurrency(pf.fund.nav || 0)}</Td>
                            <Td isNumeric color={pf.fund.perf_1m && pf.fund.perf_1m > 0 ? 'green.500' : 'red.500'}>
                              {formatPercent(pf.fund.perf_1m || 0)}
                            </Td>
                            <Td isNumeric color={pf.fund.perf_3m && pf.fund.perf_3m > 0 ? 'green.500' : 'red.500'}>
                              {formatPercent(pf.fund.perf_3m || 0)}
                            </Td>
                            <Td isNumeric color={pf.fund.perf_6m && pf.fund.perf_6m > 0 ? 'green.500' : 'red.500'}>
                              {formatPercent(pf.fund.perf_6m || 0)}
                            </Td>
                            <Td isNumeric color={pf.fund.ytd_performance && pf.fund.ytd_performance > 0 ? 'green.500' : 'red.500'}>
                              {formatPercent(pf.fund.ytd_performance || 0)}
                            </Td>
                            <Td isNumeric color={pf.fund.perf_1y && pf.fund.perf_1y > 0 ? 'green.500' : 'red.500'}>
                              {formatPercent(pf.fund.perf_1y || 0)}
                            </Td>
                            <Td isNumeric color={pf.fund.perf_3y && pf.fund.perf_3y > 0 ? 'green.500' : 'red.500'}>
                              {formatPercent(pf.fund.perf_3y || 0)}
                            </Td>
                            <Td>
                              <Badge colorScheme={pf.fund.risk_level && pf.fund.risk_level > 5 ? 'red' : 'green'}>
                                {pf.fund.risk_level}/7
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </>
        ) : (
          <Card>
            <CardBody py={12}>
              <VStack spacing={3}>
                <Text fontSize="4xl">📈</Text>
                <Text color="gray.600" textAlign="center">
                  Sélectionnez des fonds pour voir les graphiques et comparaisons
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
          </VStack>
        </SimpleGrid>
      </VStack>
    </Box>
  )
}
