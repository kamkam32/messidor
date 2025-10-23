'use client'

import { use, useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  Badge,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Skeleton,
} from '@chakra-ui/react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Fund } from '@/lib/types/fund.types'

interface PerformanceHistoryData {
  date: string
  nav?: number
  perf_ytd?: number
  perf_1m?: number
  perf_3m?: number
  perf_1y?: number
}

export default function FundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [fund, setFund] = useState<Fund | null>(null)
  const [history, setHistory] = useState<PerformanceHistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '1y' | '3y'>('1y')
  const [metric, setMetric] = useState<'nav' | 'perf_ytd'>('nav')

  const supabase = createClient()

  useEffect(() => {
    fetchFundData()
  }, [resolvedParams.id, period])

  const fetchFundData = async () => {
    setLoading(true)
    try {
      // Récupérer les infos du fonds
      const { data: fundData, error: fundError } = await supabase
        .from('funds')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (fundError) throw fundError
      setFund(fundData)

      // Calculer la date de début selon la période
      const endDate = new Date()
      const startDate = new Date()
      switch (period) {
        case '1m':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case '3m':
          startDate.setMonth(startDate.getMonth() - 3)
          break
        case '6m':
          startDate.setMonth(startDate.getMonth() - 6)
          break
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
        case '3y':
          startDate.setFullYear(startDate.getFullYear() - 3)
          break
      }

      // Récupérer l'historique des performances
      const { data: historyData, error: historyError } = await supabase
        .from('fund_performance_history')
        .select('date, nav, perf_ytd, perf_1m, perf_3m, perf_1y')
        .eq('fund_id', resolvedParams.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (historyError) throw historyError
      setHistory(historyData || [])

    } catch (error) {
      console.error('Error fetching fund data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
  }

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <Skeleton height="400px" />
      </Container>
    )
  }

  if (!fund) {
    return (
      <Container maxW="7xl" py={8}>
        <Text>Fonds non trouvé</Text>
      </Container>
    )
  }

  return (
    <Container maxW="7xl" py={8}>
      {/* En-tête */}
      <Box mb={8}>
        <HStack justify="space-between" mb={4}>
          <Box>
            <Heading size="xl" mb={2}>{fund.name}</Heading>
            <HStack spacing={3}>
              <Badge colorScheme="purple">{fund.classification}</Badge>
              <Badge colorScheme={fund.risk_level && fund.risk_level > 5 ? 'red' : 'green'}>
                Risque {fund.risk_level}/7
              </Badge>
              <Text color="gray.600">{fund.management_company}</Text>
            </HStack>
          </Box>
          <Button onClick={() => window.history.back()}>
            Retour
          </Button>
        </HStack>
      </Box>

      {/* Stats principales */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Valeur Liquidative</StatLabel>
              <StatNumber fontSize="2xl">{formatCurrency(fund.nav)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Performance YTD</StatLabel>
              <StatNumber fontSize="2xl" color={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.500' : 'red.500'}>
                {fund.ytd_performance && <StatArrow type={fund.ytd_performance > 0 ? 'increase' : 'decrease'} />}
                {formatPercent(fund.ytd_performance)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Performance 1 an</StatLabel>
              <StatNumber fontSize="2xl" color={fund.perf_1y && fund.perf_1y > 0 ? 'green.500' : 'red.500'}>
                {formatPercent(fund.perf_1y)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Actif Net</StatLabel>
              <StatNumber fontSize="2xl">{formatCurrency(fund.asset_value)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Graphique */}
      <Card mb={8}>
        <CardBody>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Heading size="md">Historique des Performances</Heading>
              <HStack>
                {/* Sélection de période */}
                <HStack>
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
                {/* Sélection de métrique */}
                <HStack>
                  <Button
                    size="sm"
                    variant={metric === 'nav' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    onClick={() => setMetric('nav')}
                  >
                    VL
                  </Button>
                  <Button
                    size="sm"
                    variant={metric === 'perf_ytd' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    onClick={() => setMetric('perf_ytd')}
                  >
                    Perf YTD
                  </Button>
                </HStack>
              </HStack>
            </HStack>

            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                    formatter={(value: number) =>
                      metric === 'nav' ? formatCurrency(value) : formatPercent(value)
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke="#8884d8"
                    strokeWidth={2}
                    name={metric === 'nav' ? 'Valeur Liquidative' : 'Performance YTD'}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box textAlign="center" py={12}>
                <Text color="gray.500" fontSize="lg">
                  📊 Aucun historique disponible pour ce fonds
                </Text>
                <Text color="gray.400" fontSize="sm" mt={2}>
                  Les données historiques seront disponibles après le backfill
                </Text>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Détails du fonds */}
      <Tabs colorScheme="purple">
        <TabList>
          <Tab>Informations</Tab>
          <Tab>Performances</Tab>
          <Tab>Frais</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontWeight="bold" color="gray.600">Code ISIN</Text>
                <Text>{fund.isin_code || 'N/A'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">Code Maroclear</Text>
                <Text>{fund.morocco_code || 'N/A'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">Nature juridique</Text>
                <Text>{fund.legal_nature || 'N/A'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">Dépositaire</Text>
                <Text>{fund.depositary || 'N/A'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">Distributeur</Text>
                <Text>{fund.distributor || 'N/A'}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">Indice Benchmark</Text>
                <Text>{fund.benchmark_index || 'N/A'}</Text>
              </Box>
            </SimpleGrid>
          </TabPanel>

          <TabPanel>
            <SimpleGrid columns={3} spacing={4}>
              <Box>
                <Text fontWeight="bold" color="gray.600">1 Jour</Text>
                <Text fontSize="xl" color={fund.perf_1d && fund.perf_1d > 0 ? 'green.500' : 'red.500'}>
                  {formatPercent(fund.perf_1d)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">1 Semaine</Text>
                <Text fontSize="xl" color={fund.perf_1w && fund.perf_1w > 0 ? 'green.500' : 'red.500'}>
                  {formatPercent(fund.perf_1w)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">1 Mois</Text>
                <Text fontSize="xl" color={fund.perf_1m && fund.perf_1m > 0 ? 'green.500' : 'red.500'}>
                  {formatPercent(fund.perf_1m)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">3 Mois</Text>
                <Text fontSize="xl" color={fund.perf_3m && fund.perf_3m > 0 ? 'green.500' : 'red.500'}>
                  {formatPercent(fund.perf_3m)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">6 Mois</Text>
                <Text fontSize="xl" color={fund.perf_6m && fund.perf_6m > 0 ? 'green.500' : 'red.500'}>
                  {formatPercent(fund.perf_6m)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">1 An</Text>
                <Text fontSize="xl" color={fund.perf_1y && fund.perf_1y > 0 ? 'green.500' : 'red.500'}>
                  {formatPercent(fund.perf_1y)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">2 Ans</Text>
                <Text fontSize="xl" color={fund.perf_2y && fund.perf_2y > 0 ? 'green.500' : 'red.500'}>
                  {formatPercent(fund.perf_2y)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">3 Ans</Text>
                <Text fontSize="xl" color={fund.perf_3y && fund.perf_3y > 0 ? 'green.500' : 'red.500'}>
                  {formatPercent(fund.perf_3y)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">5 Ans</Text>
                <Text fontSize="xl" color={fund.perf_5y && fund.perf_5y > 0 ? 'green.500' : 'red.500'}>
                  {formatPercent(fund.perf_5y)}
                </Text>
              </Box>
            </SimpleGrid>
          </TabPanel>

          <TabPanel>
            <SimpleGrid columns={3} spacing={4}>
              <Box>
                <Text fontWeight="bold" color="gray.600">Souscription</Text>
                <Text fontSize="xl">{fund.subscription_fee}%</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">Gestion</Text>
                <Text fontSize="xl">{fund.management_fees}%</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">Rachat</Text>
                <Text fontSize="xl">{fund.redemption_fee}%</Text>
              </Box>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}
