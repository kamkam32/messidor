'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Box,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  useToast,
  Skeleton,
  Spinner,
  Divider,
} from '@chakra-ui/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import type { Fund } from '@/lib/types/fund.types'

interface PortfolioFund {
  fund: Fund
  allocationPercent: number
  allocationAmount: number
}

interface FundHistoryData {
  date: string
  nav: number
  perf_relative: number
}

interface PortfolioHistory {
  date: string
  portfolio: number
  [key: string]: number | string
}

// Couleurs sobres pour les graphiques
const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']
const CATEGORY_COLORS: Record<string, string> = {
  'ACTIONS': '#ef4444',
  'MONÉTAIRE': '#22c55e',
  'OCT': '#3b82f6',
  'OMLT': '#6366f1',
  'DIVERSIFIÉ': '#8b5cf6',
  'Diversifié': '#8b5cf6',
  'CONTRACTUEL': '#f59e0b',
}

// Fonction d'interpolation linéaire
const interpolateData = (
  sortedDates: string[],
  fundDataMap: Map<string, number>
): Map<string, number> => {
  const result = new Map<string, number>()
  fundDataMap.forEach((value, key) => result.set(key, value))

  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = sortedDates[i]
    if (result.has(currentDate)) continue

    let prevValue: number | null = null
    let nextValue: number | null = null
    let prevDate: string | null = null
    let nextDate: string | null = null

    for (let j = i - 1; j >= 0; j--) {
      if (result.has(sortedDates[j])) {
        prevDate = sortedDates[j]
        prevValue = result.get(prevDate)!
        break
      }
    }

    for (let j = i + 1; j < sortedDates.length; j++) {
      if (result.has(sortedDates[j])) {
        nextDate = sortedDates[j]
        nextValue = result.get(nextDate)!
        break
      }
    }

    if (prevValue !== null && nextValue !== null && prevDate && nextDate) {
      const ratio = (new Date(currentDate).getTime() - new Date(prevDate).getTime()) /
                   (new Date(nextDate).getTime() - new Date(prevDate).getTime())
      result.set(currentDate, prevValue + (nextValue - prevValue) * ratio)
    } else if (prevValue !== null) {
      result.set(currentDate, prevValue)
    } else if (nextValue !== null) {
      result.set(currentDate, nextValue)
    }
  }

  return result
}

export default function ComparateurPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Fund[]>([])
  const [portfolioFunds, setPortfolioFunds] = useState<PortfolioFund[]>([])
  const [totalAmount, setTotalAmount] = useState(100000)
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '1y' | '3y'>('1y')
  const [showAmount, setShowAmount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingFunds, setLoadingFunds] = useState(true)
  const [suggestedFunds, setSuggestedFunds] = useState<Fund[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [rawHistoriesMap, setRawHistoriesMap] = useState<Map<string, FundHistoryData[]>>(new Map())

  const supabase = createClient()
  const toast = useToast()
  const loadingRef = useRef(false)

  useEffect(() => {
    loadSuggestedFunds()
  }, [])

  const loadSuggestedFunds = useCallback(async () => {
    setLoadingFunds(true)
    try {
      const { data: allData } = await supabase
        .from('funds')
        .select('*')
        .eq('type', 'OPCVM')
        .eq('is_active', true)
        .limit(200)

      const sorted = (allData || []).sort((a, b) => {
        if (a.perf_1y === null && b.perf_1y === null) return (b.asset_value || 0) - (a.asset_value || 0)
        if (a.perf_1y === null) return 1
        if (b.perf_1y === null) return -1
        return (b.perf_1y || 0) - (a.perf_1y || 0)
      })

      setSuggestedFunds(sorted)
    } finally {
      setLoadingFunds(false)
    }
  }, [supabase])

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

  const dateRange = useMemo(() => {
    const endDate = new Date()
    const startDate = new Date()

    switch (period) {
      case '1m': startDate.setMonth(startDate.getMonth() - 1); break
      case '3m': startDate.setMonth(startDate.getMonth() - 3); break
      case '6m': startDate.setMonth(startDate.getMonth() - 6); break
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break
      case '3y': startDate.setFullYear(startDate.getFullYear() - 3); break
    }

    return { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] }
  }, [period])

  const fundIds = useMemo(() => portfolioFunds.map(f => f.fund.id).join(','), [portfolioFunds])

  useEffect(() => {
    if (portfolioFunds.length === 0) {
      setRawHistoriesMap(new Map())
      return
    }

    if (loadingRef.current) return
    loadingRef.current = true

    const loadHistory = async () => {
      setLoading(true)
      try {
        const newHistoriesMap = new Map<string, FundHistoryData[]>()

        await Promise.all(
          portfolioFunds.map(async (pf) => {
            const { data } = await supabase
              .from('fund_performance_history')
              .select('date, nav')
              .eq('fund_id', pf.fund.id)
              .gte('date', dateRange.start)
              .lte('date', dateRange.end)
              .order('date', { ascending: true })

            const historyData = data || []
            const firstNav = historyData[0]?.nav

            const history: FundHistoryData[] = historyData.map((item) => ({
              date: item.date,
              nav: item.nav,
              perf_relative: firstNav && item.nav ? ((item.nav - firstNav) / firstNav) * 100 : 0,
            }))

            newHistoriesMap.set(pf.fund.id, history)
          })
        )

        setRawHistoriesMap(newHistoriesMap)
      } catch (error) {
        console.error('Error loading history:', error)
      } finally {
        setLoading(false)
        loadingRef.current = false
      }
    }

    loadHistory()
  }, [fundIds, dateRange.start, dateRange.end, supabase])

  const portfolioHistory = useMemo<PortfolioHistory[]>(() => {
    if (portfolioFunds.length === 0 || rawHistoriesMap.size === 0) return []

    const allDates = new Set<string>()
    rawHistoriesMap.forEach(history => history.forEach(h => allDates.add(h.date)))
    const sortedDates = Array.from(allDates).sort()

    if (sortedDates.length === 0) return []

    const interpolatedMaps = new Map<string, Map<string, number>>()

    portfolioFunds.forEach(pf => {
      const fundHistory = rawHistoriesMap.get(pf.fund.id) || []
      const fundDataMap = new Map<string, number>()
      fundHistory.forEach(h => fundDataMap.set(h.date, h.perf_relative))
      interpolatedMaps.set(pf.fund.id, interpolateData(sortedDates, fundDataMap))
    })

    return sortedDates.map(date => {
      const entry: PortfolioHistory = { date, portfolio: 0 }
      let weightedPerf = 0
      let totalWeight = 0

      portfolioFunds.forEach(pf => {
        const perfValue = interpolatedMaps.get(pf.fund.id)?.get(date)
        if (perfValue !== undefined) {
          entry[pf.fund.id] = perfValue
          if (pf.allocationPercent > 0) {
            weightedPerf += perfValue * (pf.allocationPercent / 100)
            totalWeight += pf.allocationPercent
          }
        }
      })

      entry.portfolio = totalWeight > 0 ? weightedPerf : 0
      return entry
    })
  }, [rawHistoriesMap, portfolioFunds])

  const addFund = useCallback((fund: Fund) => {
    if (portfolioFunds.some(pf => pf.fund.id === fund.id)) {
      toast({ title: 'Fonds déjà ajouté', status: 'warning', duration: 2000 })
      return
    }

    const newAllocationPercent = portfolioFunds.length === 0 ? 100 : 0
    setPortfolioFunds([...portfolioFunds, { fund, allocationPercent: newAllocationPercent, allocationAmount: (totalAmount * newAllocationPercent) / 100 }])
    setSearchQuery('')
    setSearchResults([])
  }, [portfolioFunds, totalAmount, toast])

  const removeFund = useCallback((fundId: string) => {
    setPortfolioFunds(prev => prev.filter(pf => pf.fund.id !== fundId))
    setRawHistoriesMap(prev => { const m = new Map(prev); m.delete(fundId); return m })
  }, [])

  const updateAllocationPercent = useCallback((fundId: string, percent: number) => {
    setPortfolioFunds(prev => prev.map(pf => pf.fund.id === fundId ? { ...pf, allocationPercent: Math.max(0, Math.min(100, percent)), allocationAmount: (totalAmount * percent) / 100 } : pf))
  }, [totalAmount])

  const updateAllocationAmount = useCallback((fundId: string, amount: number) => {
    const percent = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    setPortfolioFunds(prev => prev.map(pf => pf.fund.id === fundId ? { ...pf, allocationPercent: percent, allocationAmount: amount } : pf))
  }, [totalAmount])

  const distributeEqually = useCallback(() => {
    if (portfolioFunds.length === 0) return
    const equalPercent = 100 / portfolioFunds.length
    setPortfolioFunds(prev => prev.map(pf => ({ ...pf, allocationPercent: equalPercent, allocationAmount: (totalAmount * equalPercent) / 100 })))
  }, [portfolioFunds.length, totalAmount])

  const totalAllocation = useMemo(() => portfolioFunds.reduce((sum, pf) => sum + pf.allocationPercent, 0), [portfolioFunds])
  const portfolioPerformance = useMemo(() => portfolioHistory.length > 0 ? portfolioHistory[portfolioHistory.length - 1]?.portfolio || 0 : 0, [portfolioHistory])
  const portfolioValue = useMemo(() => totalAmount * (1 + portfolioPerformance / 100), [totalAmount, portfolioPerformance])
  const portfolioGain = useMemo(() => portfolioValue - totalAmount, [portfolioValue, totalAmount])

  const formatCurrency = useCallback((value: number) => `${value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MAD`, [])
  const formatPercent = useCallback((value: number | null | undefined) => value !== null && value !== undefined ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%` : '-', [])

  const filteredFunds = useMemo(() => {
    return suggestedFunds.filter(f => {
      if (selectedCategory === 'all') return true
      if (selectedCategory === 'DIVERSIFIÉ') return f.classification === 'DIVERSIFIÉ' || f.classification === 'Diversifié'
      return f.classification === selectedCategory
    })
  }, [suggestedFunds, selectedCategory])

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    portfolioFunds.forEach(pf => {
      const cat = pf.fund.classification || 'Autre'
      map.set(cat, (map.get(cat) || 0) + pf.allocationPercent)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).filter(c => c.value > 0)
  }, [portfolioFunds])

  const categories = [
    { key: 'all', label: 'Tous' },
    { key: 'ACTIONS', label: 'Actions' },
    { key: 'MONÉTAIRE', label: 'Monétaire' },
    { key: 'OCT', label: 'Oblig. CT' },
    { key: 'OMLT', label: 'Oblig. MLT' },
    { key: 'DIVERSIFIÉ', label: 'Diversifié' },
    { key: 'CONTRACTUEL', label: 'Contractuel' },
  ]

  return (
    <Box px={{ base: 4, md: 6 }} py={6} maxW="1600px" mx="auto">
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <Box>
          <Heading size="lg" fontWeight="600" color="gray.900">Comparateur de Portefeuille</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Comparez et construisez votre allocation optimale
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={5} alignItems="start">
          {/* COLONNE 1 : Sélection */}
          <Card variant="outline" shadow="sm">
            <CardBody p={5}>
              <VStack align="stretch" spacing={5}>
                <HStack justify="space-between">
                  <Text fontWeight="600" fontSize="md" color="gray.800">Sélectionner des fonds</Text>
                  {portfolioFunds.length > 0 && (
                    <Box px={2.5} py={1} bg="purple.500" borderRadius="full">
                      <Text fontSize="xs" color="white" fontWeight="600">{portfolioFunds.length} sélectionné{portfolioFunds.length > 1 ? 's' : ''}</Text>
                    </Box>
                  )}
                </HStack>

                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none" color="gray.400">
                    <Text fontSize="sm">🔍</Text>
                  </InputLeftElement>
                  <Input
                    placeholder="Rechercher un fonds..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="lg"
                    fontSize="sm"
                    bg="gray.50"
                    border="none"
                    _focus={{ bg: 'white', boxShadow: '0 0 0 2px #805AD5' }}
                    _placeholder={{ color: 'gray.400' }}
                  />
                </InputGroup>

                {searchResults.length > 0 && (
                  <VStack align="stretch" spacing={2} maxH="350px" overflowY="auto">
                    {searchResults.map(fund => {
                      const isSelected = portfolioFunds.some(pf => pf.fund.id === fund.id)
                      return (
                        <Box
                          key={fund.id}
                          p={3}
                          borderRadius="lg"
                          cursor="pointer"
                          bg={isSelected ? 'purple.50' : 'white'}
                          border="2px solid"
                          borderColor={isSelected ? 'purple.500' : 'gray.200'}
                          _hover={{ borderColor: isSelected ? 'purple.600' : 'purple.300', bg: isSelected ? 'purple.100' : 'gray.50' }}
                          transition="all 0.15s"
                          onClick={() => isSelected ? removeFund(fund.id) : addFund(fund)}
                        >
                          <HStack justify="space-between" align="start">
                            <Box flex={1} minW={0}>
                              <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1} mb={1}>{fund.name}</Text>
                              <HStack spacing={3}>
                                <Text fontSize="xs" color="gray.500" fontWeight="500">{fund.classification}</Text>
                                <Text fontSize="xs" fontWeight="600" color={fund.perf_1y && fund.perf_1y > 0 ? 'green.600' : 'red.500'}>
                                  1Y: {formatPercent(fund.perf_1y)}
                                </Text>
                              </HStack>
                            </Box>
                            {isSelected ? (
                              <Box p={1.5} borderRadius="md" bg="purple.500" color="white">
                                <Text fontSize="xs" fontWeight="bold">✓</Text>
                              </Box>
                            ) : (
                              <Box p={1.5} borderRadius="md" bg="gray.100" color="gray.500">
                                <Text fontSize="sm" fontWeight="bold">+</Text>
                              </Box>
                            )}
                          </HStack>
                        </Box>
                      )
                    })}
                  </VStack>
                )}

                {searchQuery.length === 0 && (
                  <>
                    {/* Filtres par catégorie */}
                    <Box>
                      <HStack spacing={2} flexWrap="wrap" pb={1}>
                        {categories.map(cat => {
                          const isActive = selectedCategory === cat.key
                          return (
                            <Button
                              key={cat.key}
                              size="sm"
                              variant="unstyled"
                              onClick={() => setSelectedCategory(cat.key)}
                              fontWeight="500"
                              borderRadius="full"
                              px={3}
                              py={1}
                              h="auto"
                              bg={isActive ? 'gray.800' : 'gray.100'}
                              color={isActive ? 'white' : 'gray.600'}
                              _hover={{ bg: isActive ? 'gray.700' : 'gray.200' }}
                              transition="all 0.15s"
                            >
                              {cat.label}
                            </Button>
                          )
                        })}
                      </HStack>
                    </Box>

                    {loadingFunds ? (
                      <VStack spacing={3}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <Skeleton key={i} h="70px" borderRadius="lg" />
                        ))}
                      </VStack>
                    ) : (
                      <VStack align="stretch" spacing={0}>
                        {/* Section Top Performers (seulement si catégorie "Tous") */}
                        {selectedCategory === 'all' && (
                          <Box mb={4}>
                            <HStack mb={2}>
                              <Text fontSize="xs" fontWeight="600" color="orange.500">🏆 TOP PERFORMERS</Text>
                            </HStack>
                            <VStack align="stretch" spacing={2}>
                              {filteredFunds.slice(0, 5).map((fund, index) => {
                                const isSelected = portfolioFunds.some(pf => pf.fund.id === fund.id)
                                const selectedIndex = portfolioFunds.findIndex(pf => pf.fund.id === fund.id)
                                return (
                                  <Box
                                    key={fund.id}
                                    p={3}
                                    borderRadius="lg"
                                    cursor="pointer"
                                    bg={isSelected ? 'purple.50' : 'orange.50'}
                                    border="2px solid"
                                    borderColor={isSelected ? 'purple.500' : 'orange.200'}
                                    _hover={{
                                      borderColor: isSelected ? 'purple.600' : 'orange.400',
                                      transform: 'translateX(2px)'
                                    }}
                                    transition="all 0.15s"
                                    onClick={() => isSelected ? removeFund(fund.id) : addFund(fund)}
                                    position="relative"
                                  >
                                    {/* Badge de rang */}
                                    <Box
                                      position="absolute"
                                      top={-2}
                                      left={3}
                                      bg={index === 0 ? 'yellow.400' : index === 1 ? 'gray.400' : 'orange.400'}
                                      color={index === 0 ? 'yellow.900' : 'white'}
                                      px={2}
                                      py={0.5}
                                      borderRadius="full"
                                      fontSize="2xs"
                                      fontWeight="bold"
                                    >
                                      #{index + 1}
                                    </Box>
                                    <HStack justify="space-between" align="start">
                                      <Box flex={1} minW={0} pt={1}>
                                        <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1} mb={1}>{fund.name}</Text>
                                        <HStack spacing={3} flexWrap="wrap">
                                          <Text fontSize="xs" color="gray.500" fontWeight="500">{fund.classification}</Text>
                                          <HStack spacing={1}>
                                            <Text fontSize="xs" fontWeight="700" color="green.600">
                                              1Y: {formatPercent(fund.perf_1y)}
                                            </Text>
                                          </HStack>
                                          <HStack spacing={1}>
                                            <Text fontSize="xs" fontWeight="500" color={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.600' : 'red.500'}>
                                              YTD: {formatPercent(fund.ytd_performance)}
                                            </Text>
                                          </HStack>
                                        </HStack>
                                      </Box>
                                      {isSelected ? (
                                        <VStack spacing={0}>
                                          <Box p={1.5} borderRadius="md" bg="purple.500" color="white">
                                            <Text fontSize="xs" fontWeight="bold">✓</Text>
                                          </Box>
                                          <Box
                                            w={3}
                                            h={3}
                                            borderRadius="full"
                                            bg={CHART_COLORS[selectedIndex % CHART_COLORS.length]}
                                            mt={1}
                                          />
                                        </VStack>
                                      ) : (
                                        <Box p={1.5} borderRadius="md" bg="orange.200" color="orange.700">
                                          <Text fontSize="sm" fontWeight="bold">+</Text>
                                        </Box>
                                      )}
                                    </HStack>
                                  </Box>
                                )
                              })}
                            </VStack>
                          </Box>
                        )}

                        {/* Liste principale */}
                        <Box>
                          <HStack mb={2}>
                            <Text fontSize="xs" fontWeight="600" color="gray.500">
                              {selectedCategory === 'all' ? 'TOUS LES FONDS' : categories.find(c => c.key === selectedCategory)?.label.toUpperCase()}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              ({selectedCategory === 'all' ? filteredFunds.length - 5 : filteredFunds.length} fonds)
                            </Text>
                          </HStack>
                          <VStack align="stretch" spacing={2} maxH="350px" overflowY="auto" pr={1}>
                            {(selectedCategory === 'all' ? filteredFunds.slice(5) : filteredFunds).map((fund) => {
                              const isSelected = portfolioFunds.some(pf => pf.fund.id === fund.id)
                              const selectedIndex = portfolioFunds.findIndex(pf => pf.fund.id === fund.id)
                              return (
                                <Box
                                  key={fund.id}
                                  p={3}
                                  borderRadius="lg"
                                  cursor="pointer"
                                  bg={isSelected ? 'purple.50' : 'white'}
                                  border="2px solid"
                                  borderColor={isSelected ? 'purple.500' : 'gray.200'}
                                  _hover={{
                                    borderColor: isSelected ? 'purple.600' : 'gray.400',
                                    bg: isSelected ? 'purple.100' : 'gray.50'
                                  }}
                                  transition="all 0.15s"
                                  onClick={() => isSelected ? removeFund(fund.id) : addFund(fund)}
                                >
                                  <HStack justify="space-between" align="start">
                                    <Box flex={1} minW={0}>
                                      <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1} mb={1}>{fund.name}</Text>
                                      <HStack spacing={3} flexWrap="wrap">
                                        <Text fontSize="xs" color="gray.500" fontWeight="500">{fund.classification}</Text>
                                        <HStack spacing={1}>
                                          <Text fontSize="xs" color="gray.400">1Y:</Text>
                                          <Text fontSize="xs" fontWeight="700" color={fund.perf_1y && fund.perf_1y > 0 ? 'green.600' : 'red.500'}>
                                            {formatPercent(fund.perf_1y)}
                                          </Text>
                                        </HStack>
                                        <HStack spacing={1}>
                                          <Text fontSize="xs" color="gray.400">YTD:</Text>
                                          <Text fontSize="xs" fontWeight="500" color={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.600' : 'red.500'}>
                                            {formatPercent(fund.ytd_performance)}
                                          </Text>
                                        </HStack>
                                      </HStack>
                                    </Box>
                                    {isSelected ? (
                                      <VStack spacing={0}>
                                        <Box p={1.5} borderRadius="md" bg="purple.500" color="white">
                                          <Text fontSize="xs" fontWeight="bold">✓</Text>
                                        </Box>
                                        <Box
                                          w={3}
                                          h={3}
                                          borderRadius="full"
                                          bg={CHART_COLORS[selectedIndex % CHART_COLORS.length]}
                                          mt={1}
                                        />
                                      </VStack>
                                    ) : (
                                      <Box p={1.5} borderRadius="md" bg="gray.100" color="gray.500" _hover={{ bg: 'purple.100', color: 'purple.600' }}>
                                        <Text fontSize="sm" fontWeight="bold">+</Text>
                                      </Box>
                                    )}
                                  </HStack>
                                </Box>
                              )
                            })}
                          </VStack>
                        </Box>
                      </VStack>
                    )}
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* COLONNE 2 : Stats + Répartition */}
          <VStack align="stretch" spacing={4}>
            {portfolioFunds.length > 0 ? (
              <>
                {/* Stats principales */}
                <Card variant="outline" shadow="sm">
                  <CardBody p={5}>
                    <VStack align="stretch" spacing={5}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" fontWeight="500" mb={2}>MONTANT INVESTI</Text>
                        <NumberInput
                          value={totalAmount}
                          onChange={(_, val) => setTotalAmount(val || 0)}
                          min={0}
                          step={10000}
                          size="lg"
                        >
                          <NumberInputField
                            fontWeight="700"
                            fontSize="xl"
                            border="none"
                            bg="gray.50"
                            borderRadius="lg"
                            _focus={{ bg: 'white', boxShadow: '0 0 0 2px #805AD5' }}
                          />
                        </NumberInput>
                      </Box>

                      <Divider />

                      <SimpleGrid columns={2} spacing={4}>
                        <Box p={3} bg="gray.50" borderRadius="lg">
                          <Text fontSize="xs" color="gray.500" mb={1}>Valeur estimée</Text>
                          <Text fontSize="lg" fontWeight="700" color="gray.800">{formatCurrency(portfolioValue)}</Text>
                        </Box>
                        <Box p={3} bg={portfolioPerformance >= 0 ? 'green.50' : 'red.50'} borderRadius="lg">
                          <Text fontSize="xs" color="gray.500" mb={1}>Performance</Text>
                          <Text fontSize="lg" fontWeight="700" color={portfolioPerformance >= 0 ? 'green.600' : 'red.600'}>
                            {formatPercent(portfolioPerformance)}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      <Box p={4} bg={portfolioGain >= 0 ? 'green.500' : 'red.500'} borderRadius="lg" color="white">
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="500">
                            {portfolioGain >= 0 ? 'Gain estimé' : 'Perte estimée'}
                          </Text>
                          <Text fontSize="lg" fontWeight="700">
                            {portfolioGain >= 0 ? '+' : ''}{formatCurrency(portfolioGain)}
                          </Text>
                        </HStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Répartition par catégorie */}
                {categoryData.length > 0 && (
                  <Card variant="outline" shadow="sm">
                    <CardBody p={4}>
                      <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>Répartition</Text>
                      <HStack spacing={4}>
                        <Box w="120px" h="120px">
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={50}
                                dataKey="value"
                              >
                                {categoryData.map((entry, i) => (
                                  <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                        <VStack align="stretch" spacing={1} flex={1}>
                          {categoryData.map((cat) => (
                            <HStack key={cat.name} justify="space-between" fontSize="xs">
                              <HStack spacing={2}>
                                <Box w={2} h={2} borderRadius="sm" bg={CATEGORY_COLORS[cat.name] || '#94a3b8'} />
                                <Text color="gray.600">{cat.name}</Text>
                              </HStack>
                              <Text fontWeight="500" color="gray.800">{cat.value.toFixed(0)}%</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                {/* Allocation */}
                <Card variant="outline" shadow="sm">
                  <CardBody p={5}>
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="md" fontWeight="600" color="gray.800">Allocation</Text>
                      <HStack spacing={2} bg="gray.100" px={3} py={1} borderRadius="full">
                        <Text fontSize="sm" fontWeight={!showAmount ? '600' : '400'} color={!showAmount ? 'gray.800' : 'gray.400'}>%</Text>
                        <Switch size="sm" colorScheme="purple" isChecked={showAmount} onChange={(e) => setShowAmount(e.target.checked)} />
                        <Text fontSize="sm" fontWeight={showAmount ? '600' : '400'} color={showAmount ? 'gray.800' : 'gray.400'}>MAD</Text>
                      </HStack>
                    </HStack>

                    {/* Boutons de répartition intelligente */}
                    {portfolioFunds.length >= 2 && (() => {
                      // Analyser les types de fonds
                      const hasLowRisk = portfolioFunds.some(pf =>
                        ['MONÉTAIRE', 'OCT'].includes(pf.fund.classification || '')
                      )
                      const hasMediumRisk = portfolioFunds.some(pf =>
                        ['OMLT', 'DIVERSIFIÉ', 'Diversifié', 'CONTRACTUEL'].includes(pf.fund.classification || '')
                      )
                      const hasHighRisk = portfolioFunds.some(pf =>
                        ['ACTIONS'].includes(pf.fund.classification || '')
                      )

                      const applyProfile = (profile: 'prudent' | 'equilibre' | 'dynamique') => {
                        const weights: Record<string, number> = {}

                        portfolioFunds.forEach(pf => {
                          const classification = pf.fund.classification || ''
                          const isLowRisk = ['MONÉTAIRE', 'OCT'].includes(classification)
                          const isMediumRisk = ['OMLT', 'DIVERSIFIÉ', 'Diversifié', 'CONTRACTUEL'].includes(classification)
                          const isHighRisk = ['ACTIONS'].includes(classification)

                          if (profile === 'prudent') {
                            if (isLowRisk) weights[pf.fund.id] = 60
                            else if (isMediumRisk) weights[pf.fund.id] = 30
                            else if (isHighRisk) weights[pf.fund.id] = 10
                            else weights[pf.fund.id] = 20
                          } else if (profile === 'equilibre') {
                            if (isLowRisk) weights[pf.fund.id] = 30
                            else if (isMediumRisk) weights[pf.fund.id] = 40
                            else if (isHighRisk) weights[pf.fund.id] = 30
                            else weights[pf.fund.id] = 33
                          } else { // dynamique
                            if (isLowRisk) weights[pf.fund.id] = 10
                            else if (isMediumRisk) weights[pf.fund.id] = 30
                            else if (isHighRisk) weights[pf.fund.id] = 60
                            else weights[pf.fund.id] = 40
                          }
                        })

                        // Normaliser pour que le total = 100%
                        const total = Object.values(weights).reduce((a, b) => a + b, 0)
                        const normalizedWeights: Record<string, number> = {}
                        Object.keys(weights).forEach(id => {
                          normalizedWeights[id] = (weights[id] / total) * 100
                        })

                        setPortfolioFunds(prev => prev.map(pf => ({
                          ...pf,
                          allocationPercent: normalizedWeights[pf.fund.id] || 0,
                          allocationAmount: (totalAmount * (normalizedWeights[pf.fund.id] || 0)) / 100
                        })))
                      }

                      return (
                        <Box mb={4} p={3} bg="gray.50" borderRadius="lg">
                          <Text fontSize="xs" fontWeight="600" color="gray.500" mb={2}>RÉPARTITION SUGGÉRÉE</Text>
                          <SimpleGrid columns={4} spacing={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={distributeEqually}
                              borderRadius="lg"
                              fontWeight="500"
                              fontSize="xs"
                              h="auto"
                              py={2}
                              borderColor="gray.300"
                              _hover={{ bg: 'gray.100' }}
                            >
                              <VStack spacing={0}>
                                <Text>⚖️</Text>
                                <Text>Égale</Text>
                              </VStack>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => applyProfile('prudent')}
                              borderRadius="lg"
                              fontWeight="500"
                              fontSize="xs"
                              h="auto"
                              py={2}
                              borderColor="green.300"
                              color="green.700"
                              _hover={{ bg: 'green.50' }}
                            >
                              <VStack spacing={0}>
                                <Text>🛡️</Text>
                                <Text>Prudent</Text>
                              </VStack>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => applyProfile('equilibre')}
                              borderRadius="lg"
                              fontWeight="500"
                              fontSize="xs"
                              h="auto"
                              py={2}
                              borderColor="blue.300"
                              color="blue.700"
                              _hover={{ bg: 'blue.50' }}
                            >
                              <VStack spacing={0}>
                                <Text>⚡</Text>
                                <Text>Équilibré</Text>
                              </VStack>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => applyProfile('dynamique')}
                              borderRadius="lg"
                              fontWeight="500"
                              fontSize="xs"
                              h="auto"
                              py={2}
                              borderColor="orange.300"
                              color="orange.700"
                              _hover={{ bg: 'orange.50' }}
                            >
                              <VStack spacing={0}>
                                <Text>🚀</Text>
                                <Text>Dynamique</Text>
                              </VStack>
                            </Button>
                          </SimpleGrid>
                          <Text fontSize="2xs" color="gray.400" mt={2} textAlign="center">
                            Basé sur : Monétaire/OCT = faible risque • Obligations/Diversifié = moyen • Actions = élevé
                          </Text>
                        </Box>
                      )
                    })()}

                    <VStack align="stretch" spacing={3}>
                      {portfolioFunds.map((pf, index) => (
                        <Box
                          key={pf.fund.id}
                          p={4}
                          bg="white"
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="gray.200"
                          borderLeft="4px solid"
                          borderLeftColor={CHART_COLORS[index % CHART_COLORS.length]}
                        >
                          <HStack justify="space-between" mb={3}>
                            <Box flex={1} minW={0}>
                              <HStack spacing={2}>
                                <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>{pf.fund.name}</Text>
                                {pf.fund.classification === 'ACTIONS' && (
                                  <Box px={1.5} py={0.5} bg="red.100" borderRadius="md">
                                    <Text fontSize="2xs" color="red.700" fontWeight="600">Risqué</Text>
                                  </Box>
                                )}
                                {['MONÉTAIRE', 'OCT'].includes(pf.fund.classification || '') && (
                                  <Box px={1.5} py={0.5} bg="green.100" borderRadius="md">
                                    <Text fontSize="2xs" color="green.700" fontWeight="600">Sécurisé</Text>
                                  </Box>
                                )}
                              </HStack>
                              <Text fontSize="xs" color="gray.500">{pf.fund.classification}</Text>
                            </Box>
                            <IconButton
                              aria-label="Retirer"
                              icon={<Text fontSize="md">×</Text>}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => removeFund(pf.fund.id)}
                            />
                          </HStack>

                          {!showAmount ? (
                            <HStack spacing={3}>
                              <Slider
                                flex={1}
                                value={pf.allocationPercent}
                                onChange={(val) => updateAllocationPercent(pf.fund.id, val)}
                                min={0}
                                max={100}
                                colorScheme="purple"
                              >
                                <SliderTrack bg="gray.200" h="6px" borderRadius="full">
                                  <SliderFilledTrack bg={CHART_COLORS[index % CHART_COLORS.length]} />
                                </SliderTrack>
                                <SliderThumb boxSize={5} />
                              </Slider>
                              <InputGroup size="sm" maxW="80px">
                                <NumberInput
                                  value={pf.allocationPercent.toFixed(0)}
                                  onChange={(valueString) => {
                                    const val = parseFloat(valueString) || 0
                                    updateAllocationPercent(pf.fund.id, val)
                                  }}
                                  min={0}
                                  max={100}
                                  size="sm"
                                >
                                  <NumberInputField
                                    textAlign="center"
                                    fontWeight="700"
                                    borderRadius="lg"
                                    bg="gray.50"
                                    px={2}
                                  />
                                </NumberInput>
                              </InputGroup>
                              <Text fontSize="sm" fontWeight="600" color="gray.500">%</Text>
                            </HStack>
                          ) : (
                            <HStack spacing={3}>
                              <NumberInput
                                flex={1}
                                value={pf.allocationAmount.toFixed(0)}
                                onChange={(_, val) => updateAllocationAmount(pf.fund.id, val)}
                                min={0}
                                size="md"
                              >
                                <NumberInputField borderRadius="lg" fontWeight="600" />
                              </NumberInput>
                              <Text fontSize="sm" color="gray.500" fontWeight="500">MAD</Text>
                              <Box bg="gray.100" px={2} py={1} borderRadius="md">
                                <Text fontSize="xs" fontWeight="600" color="gray.600">({pf.allocationPercent.toFixed(0)}%)</Text>
                              </Box>
                            </HStack>
                          )}
                        </Box>
                      ))}

                      <Box
                        p={3}
                        borderRadius="lg"
                        bg={Math.abs(totalAllocation - 100) < 0.5 ? 'green.500' : 'orange.500'}
                        color="white"
                      >
                        <HStack justify="space-between">
                          <Text fontSize="sm" fontWeight="500">Total alloué</Text>
                          <HStack spacing={2}>
                            <Text fontSize="lg" fontWeight="700">
                              {totalAllocation.toFixed(0)}%
                            </Text>
                            {Math.abs(totalAllocation - 100) >= 0.5 && (
                              <Text fontSize="xs" opacity={0.9}>
                                ({totalAllocation > 100 ? 'surallocation' : 'sous-allocation'})
                              </Text>
                            )}
                          </HStack>
                        </HStack>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </>
            ) : (
              <Card variant="outline" shadow="sm">
                <CardBody p={8} textAlign="center">
                  <Text color="gray.400" fontSize="sm">Sélectionnez des fonds pour commencer</Text>
                </CardBody>
              </Card>
            )}
          </VStack>

          {/* COLONNE 3 : Graphique + Tableau */}
          <VStack align="stretch" spacing={4}>
            {portfolioFunds.length > 0 ? (
              <>
                {/* Graphique */}
                <Card variant="outline" shadow="sm">
                  <CardBody p={5}>
                    <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight="600" color="gray.800">Performance comparée</Text>
                        <HStack spacing={2} mt={1}>
                          <Box w={3} h={3} bg="gray.800" borderRadius="sm" />
                          <Text fontSize="sm" color="gray.600">Portefeuille:</Text>
                          <Text fontSize="sm" fontWeight="700" color={portfolioPerformance >= 0 ? 'green.600' : 'red.500'}>
                            {formatPercent(portfolioPerformance)}
                          </Text>
                        </HStack>
                      </VStack>
                      <HStack spacing={1} bg="gray.100" p={1} borderRadius="lg">
                        {(['1m', '3m', '6m', '1y', '3y'] as const).map(p => (
                          <Button
                            key={p}
                            size="sm"
                            variant={period === p ? 'solid' : 'ghost'}
                            colorScheme={period === p ? 'purple' : 'gray'}
                            onClick={() => setPeriod(p)}
                            fontWeight="600"
                            borderRadius="md"
                            minW="42px"
                          >
                            {p.toUpperCase()}
                          </Button>
                        ))}
                      </HStack>
                    </HStack>

                    <Box position="relative">
                      {loading && (
                        <Box position="absolute" inset={0} bg="whiteAlpha.900" zIndex={10} display="flex" alignItems="center" justifyContent="center" borderRadius="lg">
                          <VStack spacing={2}>
                            <Spinner size="lg" color="purple.500" thickness="3px" />
                            <Text fontSize="sm" color="gray.500">Chargement...</Text>
                          </VStack>
                        </Box>
                      )}

                      {portfolioHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart data={portfolioHistory} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(d) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              stroke="#94a3b8"
                              fontSize={11}
                              tickLine={false}
                              axisLine={{ stroke: '#e2e8f0' }}
                            />
                            <YAxis
                              tickFormatter={(v) => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
                              stroke="#94a3b8"
                              fontSize={11}
                              tickLine={false}
                              axisLine={false}
                            />
                            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                            <Tooltip
                              contentStyle={{
                                fontSize: '13px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: '12px'
                              }}
                              labelFormatter={(d) => new Date(d as string).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
                              formatter={(value: number, name: string) => [
                                <Text as="span" fontWeight="700" color={value >= 0 ? 'green.600' : 'red.500'}>{formatPercent(value)}</Text>,
                                name
                              ]}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }}
                              formatter={(value) => <Text as="span" color="gray.600">{value.length > 25 ? value.slice(0, 25) + '...' : value}</Text>}
                            />
                            <Line
                              type="monotone"
                              dataKey="portfolio"
                              stroke="#1f2937"
                              strokeWidth={3}
                              name="Portefeuille"
                              dot={false}
                              activeDot={{ r: 6, fill: '#1f2937', stroke: 'white', strokeWidth: 2 }}
                            />
                            {portfolioFunds.map((pf, i) => (
                              <Line
                                key={pf.fund.id}
                                type="monotone"
                                dataKey={pf.fund.id}
                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                strokeWidth={2}
                                name={pf.fund.name.length > 25 ? pf.fund.name.slice(0, 25) + '...' : pf.fund.name}
                                dot={false}
                                activeDot={{ r: 5, fill: CHART_COLORS[i % CHART_COLORS.length], stroke: 'white', strokeWidth: 2 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box h="320px" display="flex" alignItems="center" justifyContent="center" bg="gray.50" borderRadius="lg">
                          <VStack spacing={2}>
                            <Spinner size="lg" color="purple.500" thickness="3px" />
                            <Text fontSize="sm" color="gray.500">Chargement de l'historique...</Text>
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                {/* Tableau */}
                <Card variant="outline" shadow="sm">
                  <CardBody p={5}>
                    <Text fontSize="md" fontWeight="600" color="gray.800" mb={4}>Comparatif détaillé</Text>
                    <Box overflowX="auto">
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr bg="gray.50">
                            <Th fontSize="xs" color="gray.600" borderColor="gray.200" py={3}>Fonds</Th>
                            <Th fontSize="xs" color="gray.600" borderColor="gray.200" py={3} isNumeric>Alloc.</Th>
                            <Th fontSize="xs" color="gray.600" borderColor="gray.200" py={3} isNumeric>YTD</Th>
                            <Th fontSize="xs" color="gray.600" borderColor="gray.200" py={3} isNumeric>1Y</Th>
                            <Th fontSize="xs" color="gray.600" borderColor="gray.200" py={3} isNumeric>3Y</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {portfolioFunds.map((pf, index) => (
                            <Tr key={pf.fund.id} _hover={{ bg: 'gray.50' }}>
                              <Td borderColor="gray.100" py={3}>
                                <HStack spacing={2}>
                                  <Box w={2} h={2} borderRadius="full" bg={CHART_COLORS[index % CHART_COLORS.length]} />
                                  <Text fontSize="sm" fontWeight="500" color="gray.800" noOfLines={1}>{pf.fund.name}</Text>
                                </HStack>
                              </Td>
                              <Td borderColor="gray.100" py={3} isNumeric>
                                <Text fontSize="sm" fontWeight="600" color="purple.600">{pf.allocationPercent.toFixed(0)}%</Text>
                              </Td>
                              <Td borderColor="gray.100" py={3} isNumeric>
                                <Text fontSize="sm" fontWeight="600" color={pf.fund.ytd_performance && pf.fund.ytd_performance > 0 ? 'green.600' : 'red.500'}>
                                  {formatPercent(pf.fund.ytd_performance)}
                                </Text>
                              </Td>
                              <Td borderColor="gray.100" py={3} isNumeric>
                                <Text fontSize="sm" fontWeight="600" color={pf.fund.perf_1y && pf.fund.perf_1y > 0 ? 'green.600' : 'red.500'}>
                                  {formatPercent(pf.fund.perf_1y)}
                                </Text>
                              </Td>
                              <Td borderColor="gray.100" py={3} isNumeric>
                                <Text fontSize="sm" fontWeight="600" color={pf.fund.perf_3y && pf.fund.perf_3y > 0 ? 'green.600' : 'red.500'}>
                                  {formatPercent(pf.fund.perf_3y)}
                                </Text>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </CardBody>
                </Card>

                {/* Performance Annualisée */}
                {portfolioHistory.length > 0 && (
                  <Card variant="outline" shadow="sm">
                    <CardBody p={5}>
                      <HStack justify="space-between" mb={4}>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="md" fontWeight="600" color="gray.800">Performance Annualisée</Text>
                          <Text fontSize="xs" color="gray.500">
                            Rendement moyen par an sur la période {period.toUpperCase()}
                          </Text>
                        </VStack>
                        <Box px={3} py={1} bg="purple.50" borderRadius="full">
                          <Text fontSize="xs" color="purple.700" fontWeight="600">CAGR</Text>
                        </Box>
                      </HStack>

                      {(() => {
                        // Calculer le nombre d'années pour la période
                        const yearsMap: Record<string, number> = {
                          '1m': 1/12,
                          '3m': 0.25,
                          '6m': 0.5,
                          '1y': 1,
                          '3y': 3
                        }
                        const years = yearsMap[period]

                        // Fonction pour calculer le CAGR
                        const calculateCAGR = (perfCumulative: number, years: number): number => {
                          if (years <= 0 || perfCumulative <= -100) return 0
                          // CAGR = ((1 + perf/100)^(1/years) - 1) * 100
                          const totalReturn = 1 + perfCumulative / 100
                          if (totalReturn <= 0) return -100
                          return (Math.pow(totalReturn, 1 / years) - 1) * 100
                        }

                        // Calculer la perf du portefeuille sur la période
                        const portfolioCAGR = calculateCAGR(portfolioPerformance, years)

                        // Calculer pour chaque fonds
                        const fundsCAGR = portfolioFunds.map((pf, index) => {
                          const lastEntry = portfolioHistory[portfolioHistory.length - 1]
                          const fundPerf = lastEntry?.[pf.fund.id] as number || 0
                          return {
                            fund: pf.fund,
                            perfCumulative: fundPerf,
                            cagr: calculateCAGR(fundPerf, years),
                            allocation: pf.allocationPercent,
                            colorIndex: index
                          }
                        }).sort((a, b) => b.cagr - a.cagr)

                        return (
                          <VStack align="stretch" spacing={4}>
                            {/* Performance du portefeuille */}
                            <Box p={4} bg="gray.800" borderRadius="lg" color="white">
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontSize="sm" fontWeight="500" opacity={0.8}>Portefeuille</Text>
                                  <HStack spacing={3} align="baseline">
                                    <Text fontSize="2xl" fontWeight="700">
                                      {portfolioCAGR >= 0 ? '+' : ''}{portfolioCAGR.toFixed(2)}%
                                    </Text>
                                    <Text fontSize="sm" opacity={0.7}>/an</Text>
                                  </HStack>
                                </VStack>
                                <VStack align="end" spacing={0}>
                                  <Text fontSize="xs" opacity={0.6}>Perf. cumulée</Text>
                                  <Text fontSize="md" fontWeight="600">
                                    {formatPercent(portfolioPerformance)}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Box>

                            {/* Classement des fonds par CAGR */}
                            <Box>
                              <Text fontSize="xs" fontWeight="600" color="gray.500" mb={3}>CLASSEMENT PAR RENDEMENT ANNUALISÉ</Text>
                              <VStack align="stretch" spacing={2}>
                                {fundsCAGR.map((item, rank) => (
                                  <Box
                                    key={item.fund.id}
                                    p={3}
                                    bg="white"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="lg"
                                    borderLeft="4px solid"
                                    borderLeftColor={CHART_COLORS[item.colorIndex % CHART_COLORS.length]}
                                  >
                                    <HStack justify="space-between">
                                      <HStack spacing={3}>
                                        <Box
                                          w={6}
                                          h={6}
                                          borderRadius="full"
                                          bg={rank === 0 ? 'yellow.400' : rank === 1 ? 'gray.300' : rank === 2 ? 'orange.300' : 'gray.100'}
                                          display="flex"
                                          alignItems="center"
                                          justifyContent="center"
                                        >
                                          <Text fontSize="xs" fontWeight="bold" color={rank < 3 ? 'white' : 'gray.600'}>
                                            {rank + 1}
                                          </Text>
                                        </Box>
                                        <Box>
                                          <Text fontSize="sm" fontWeight="600" color="gray.800" noOfLines={1}>{item.fund.name}</Text>
                                          <Text fontSize="xs" color="gray.500">{item.allocation.toFixed(0)}% du portefeuille</Text>
                                        </Box>
                                      </HStack>
                                      <VStack align="end" spacing={0}>
                                        <Text fontSize="lg" fontWeight="700" color={item.cagr >= 0 ? 'green.600' : 'red.500'}>
                                          {item.cagr >= 0 ? '+' : ''}{item.cagr.toFixed(2)}%
                                        </Text>
                                        <Text fontSize="xs" color="gray.400">/an</Text>
                                      </VStack>
                                    </HStack>
                                  </Box>
                                ))}
                              </VStack>
                            </Box>

                            {/* Note explicative */}
                            <Box p={3} bg="blue.50" borderRadius="lg">
                              <HStack spacing={2} align="start">
                                <Text fontSize="sm">💡</Text>
                                <Text fontSize="xs" color="blue.700">
                                  <Text as="span" fontWeight="600">CAGR (Taux de croissance annuel composé)</Text> : représente le rendement annuel moyen que vous auriez obtenu si la croissance avait été constante chaque année.
                                  {years < 1 && " Note: Pour les périodes inférieures à 1 an, le CAGR est extrapolé sur une base annuelle."}
                                </Text>
                              </HStack>
                            </Box>
                          </VStack>
                        )
                      })()}
                    </CardBody>
                  </Card>
                )}
              </>
            ) : (
              <Card variant="outline" shadow="sm">
                <CardBody py={16} textAlign="center">
                  <VStack spacing={3}>
                    <Box p={4} bg="gray.100" borderRadius="full">
                      <Text fontSize="2xl">📊</Text>
                    </Box>
                    <Text color="gray.500" fontSize="sm">Sélectionnez des fonds pour voir les graphiques</Text>
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
