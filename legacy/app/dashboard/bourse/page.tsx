'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  Skeleton,
  Container,
  Flex,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface IndexSummary {
  index: string;
  date: string;
  dataCount: number;
  openValue: number | null;
  closeValue: number | null;
  highValue: number | null;
  lowValue: number | null;
  variation: number | null;
  variationPercent: number | null;
  scrapeTimestamp: string;
}

interface HistoricalPoint {
  date: string;
  data: {
    points: Array<{ transactTime: string; indexValue: string }>;
    count: number;
  };
}

interface CompositionStock {
  instrument: string;
  price: string | number;
  previousPrice: string | number;
  variation: string | number;
  variationPercent?: string | number;
  volume: string | number;
  quantity: string | number;
}

export default function BoursePage() {
  const [summary, setSummary] = useState<IndexSummary[]>([]);
  const [selectedIndex, setSelectedIndex] = useState('MASI');
  const [intradayData, setIntradayData] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [normalizedData, setNormalizedData] = useState<any[]>([]);
  const [normalizedIntradayData, setNormalizedIntradayData] = useState<any[]>([]);
  const [composition, setComposition] = useState<CompositionStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<'supabase' | 'live'>('supabase');

  // Fallback: Scraper en direct si Supabase est vide
  const fetchLiveData = async () => {
    try {
      console.log('📡 Fallback: Scraping live depuis Casablanca Bourse...');
      const response = await fetch('/api/bourse?type=all');
      const result = await response.json();

      if (result.success && result.data) {
        // Convertir les données live en format summary
        const liveSummary: IndexSummary = {
          index: 'MASI',
          date: new Date().toISOString().split('T')[0],
          dataCount: result.data.intraday?.length || 0,
          openValue: result.data.intraday?.[0]?.indexValue
            ? parseFloat(result.data.intraday[0].indexValue)
            : null,
          closeValue: result.data.quote?.indexValue
            ? parseFloat(result.data.quote.indexValue)
            : null,
          highValue: result.data.quote?.high ? parseFloat(result.data.quote.high) : null,
          lowValue: result.data.quote?.low ? parseFloat(result.data.quote.low) : null,
          variation: result.data.quote?.variation
            ? parseFloat(result.data.quote.variation)
            : null,
          variationPercent: result.data.quote?.variationPercent
            ? parseFloat(result.data.quote.variationPercent)
            : null,
          scrapeTimestamp: new Date().toISOString(),
        };

        setSummary([liveSummary]);
        setSelectedIndex('MASI');
        setDataSource('live');

        // Charger les données intraday
        if (result.data.intraday) {
          const formattedPoints = result.data.intraday.map((p: any) => ({
            time: new Date(p.transactTime).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            value: parseFloat(p.indexValue),
          }));
          setIntradayData(formattedPoints);
        }

        setLastUpdate(new Date());
        console.log('✅ Données live chargées');
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
    }
  };

  // Fetch summary (tous les indices)
  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/bourse/summary');
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        setSummary(result.data);
        setLastUpdate(new Date());
        setDataSource('supabase');

        // Si aucun indice sélectionné ou si l'indice sélectionné n'existe pas dans les données
        if (!selectedIndex || !result.data.find((d: IndexSummary) => d.index === selectedIndex)) {
          setSelectedIndex(result.data[0].index);
        }
      } else {
        // Fallback vers scraping live
        await fetchLiveData();
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
      // Fallback vers scraping live
      await fetchLiveData();
    }
  };

  // Fetch intraday pour l'indice sélectionné
  const fetchIntraday = async (index: string) => {
    try {
      const response = await fetch(`/api/bourse/history?index=${index}&type=intraday&limit=1`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const points = result.data[0].data?.points || [];
        const formattedPoints = points.map((p: any) => ({
          time: new Date(p.transactTime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          value: parseFloat(p.indexValue),
        }));
        setIntradayData(formattedPoints);
      } else {
        setIntradayData([]);
      }
    } catch (err) {
      console.error('Error fetching intraday:', err);
      setIntradayData([]);
    }
  };

  // Fetch historical (30 derniers jours)
  const fetchHistorical = async (index: string) => {
    try {
      const response = await fetch(`/api/bourse/history?index=${index}&type=intraday&limit=30`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        // Calculer la valeur de clôture pour chaque jour
        const dailyData = result.data.map((record: any) => {
          const points = record.data?.points || [];
          const closeValue = points.length > 0
            ? parseFloat(points[points.length - 1].indexValue)
            : null;

          return {
            date: new Date(record.date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit'
            }),
            value: closeValue,
          };
        }).filter((d: any) => d.value !== null).reverse(); // Ordre chronologique

        setHistoricalData(dailyData);
      } else {
        setHistoricalData([]);
      }
    } catch (err) {
      console.error('Error fetching historical:', err);
      setHistoricalData([]);
    }
  };

  // Fetch composition (uniquement disponible pour MASI)
  const fetchComposition = async (index: string) => {
    try {
      const response = await fetch(`/api/bourse/history?index=${index}&type=composition&limit=1`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const stocks = result.data[0].data?.stocks || [];
        setComposition(stocks);
      } else {
        setComposition([]);
      }
    } catch (err) {
      console.error('Error fetching composition:', err);
      setComposition([]);
    }
  };

  // Fetch normalized performance data (tous les indices)
  const fetchNormalizedPerformance = async () => {
    try {
      const indices = summary.map(s => s.index);
      if (indices.length === 0) return;

      // Récupérer les données historiques pour tous les indices
      const historicalPromises = indices.map(async (index) => {
        const response = await fetch(`/api/bourse/history?index=${index}&type=intraday&limit=30`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          return {
            index,
            data: result.data.map((record: any) => {
              const points = record.data?.points || [];
              const closeValue = points.length > 0
                ? parseFloat(points[points.length - 1].indexValue)
                : null;

              return {
                date: record.date,
                value: closeValue,
              };
            }).filter((d: any) => d.value !== null).reverse(),
          };
        }
        return { index, data: [] };
      });

      const allHistorical = await Promise.all(historicalPromises);

      // Trouver les dates communes à tous les indices
      const allDates = new Set<string>();
      allHistorical.forEach(({ data }) => {
        data.forEach((point: any) => allDates.add(point.date));
      });

      const sortedDates = Array.from(allDates).sort();

      // Normaliser chaque indice à 100 au point de départ
      const normalized = sortedDates.map(date => {
        const dataPoint: any = { date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) };

        allHistorical.forEach(({ index, data }) => {
          const indexData = data as any[];
          const point = indexData.find((p: any) => p.date === date);

          if (point && indexData.length > 0) {
            const baseValue = indexData[0].value;
            const normalizedValue = (point.value / baseValue) * 100;
            dataPoint[index] = normalizedValue;
          }
        });

        return dataPoint;
      });

      setNormalizedData(normalized);
    } catch (err) {
      console.error('Error fetching normalized performance:', err);
      setNormalizedData([]);
    }
  };

  // Fetch normalized intraday data (tous les indices aujourd'hui)
  const fetchNormalizedIntraday = async () => {
    try {
      const indices = summary.map(s => s.index);
      if (indices.length === 0) return;

      // Récupérer les données intraday pour tous les indices
      const intradayPromises = indices.map(async (index) => {
        const response = await fetch(`/api/bourse/history?index=${index}&type=intraday&limit=1`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          const points = result.data[0].data?.points || [];
          // Filtrer les points valides
          const validPoints = points.filter((p: any) => p.indexValue && parseFloat(p.indexValue) > 0);

          return {
            index,
            data: validPoints.map((p: any) => ({
              time: new Date(p.transactTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date(p.transactTime).getTime(),
              value: parseFloat(p.indexValue),
            }))
          };
        }
        return { index, data: [] };
      });

      const allIntraday = await Promise.all(intradayPromises);

      // Trouver tous les timestamps uniques
      const allTimestamps = new Set<number>();
      allIntraday.forEach(({ data }) => {
        data.forEach((point: any) => allTimestamps.add(point.timestamp));
      });

      const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

      // Normaliser chaque indice à 100 au point de départ
      const normalized = sortedTimestamps.map(timestamp => {
        const dataPoint: any = {
          time: new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          timestamp
        };

        allIntraday.forEach(({ index, data }) => {
          const indexData = data as any[];
          // Trouver le point le plus proche de ce timestamp
          const point = indexData.find((p: any) => p.timestamp === timestamp);

          if (point && indexData.length > 0) {
            const baseValue = indexData[0].value;
            const normalizedValue = (point.value / baseValue) * 100;
            dataPoint[index] = normalizedValue;
          }
        });

        return dataPoint;
      });

      setNormalizedIntradayData(normalized);
    } catch (err) {
      console.error('Error fetching normalized intraday:', err);
      setNormalizedIntradayData([]);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSummary();
      // Charger la composition MASI pour le bandeau
      await fetchComposition('MASI');
      setLoading(false);
    };
    loadData();
  }, []);

  // Auto-refresh: 30s si Supabase, 5min si live scraping
  useEffect(() => {
    const refreshInterval = dataSource === 'supabase' ? 30000 : 300000; // 30s ou 5min
    const interval = setInterval(() => {
      fetchSummary();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [dataSource]);

  // Charger les données de l'indice sélectionné
  useEffect(() => {
    if (selectedIndex) {
      fetchIntraday(selectedIndex);
      fetchHistorical(selectedIndex);
      // Composition uniquement disponible pour MASI
      if (selectedIndex === 'MASI') {
        fetchComposition(selectedIndex);
      } else {
        setComposition([]);
      }
    }
  }, [selectedIndex]);

  // Charger les données normalisées quand le summary est disponible
  useEffect(() => {
    if (summary.length > 0) {
      fetchNormalizedPerformance();
      fetchNormalizedIntraday();
    }
  }, [summary]);

  const formatNumber = (value: number | null) => {
    if (value === null || isNaN(value)) return '-';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getVariationColor = (variation: number | null) => {
    if (variation === null || variation === 0) return 'gray.500';
    return variation > 0 ? 'green.600' : 'red.600';
  };

  // Loading state
  if (loading) {
    return (
      <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }} py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="50px" borderRadius="lg" />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height="120px" borderRadius="lg" />
            ))}
          </SimpleGrid>
          <Skeleton height="400px" borderRadius="lg" />
        </VStack>
      </Container>
    );
  }

  // No data state (ne devrait jamais arriver grâce au fallback)
  if (!loading && summary.length === 0) {
    return (
      <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }} py={8}>
        <Card>
          <CardBody textAlign="center" py={12}>
            <Heading size="md" mb={4} color="red.600">
              ❌ Erreur de chargement
            </Heading>
            <Text color="gray.500">
              Impossible de charger les données de la bourse. Veuillez réessayer plus tard.
            </Text>
          </CardBody>
        </Card>
      </Container>
    );
  }

  const currentIndex = summary.find(s => s.index === selectedIndex);

  return (
    <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }} py={8}>
      {/* Header avec auto-refresh indicator */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading as="h1" size="lg">Bourse de Casablanca</Heading>
          <HStack spacing={2}>
            <Text color="gray.600" fontSize="sm">
              {lastUpdate ? `Mis à jour: ${lastUpdate.toLocaleTimeString('fr-FR')}` : 'Chargement...'}
            </Text>
            <Badge
              colorScheme={dataSource === 'supabase' ? 'green' : 'orange'}
              fontSize="xs"
            >
              {dataSource === 'supabase' ? 'Historique' : 'Live'}
            </Badge>
            <Badge colorScheme="blue" fontSize="xs">
              Auto-refresh {dataSource === 'supabase' ? '30s' : '5min'}
            </Badge>
          </HStack>
        </VStack>
      </Flex>

      {/* Bandeau défilant avec les actions MASI */}
      {composition.length > 0 && (
        <Box
          mb={6}
          bg="gray.50"
          borderRadius="lg"
          overflow="hidden"
          position="relative"
          height="60px"
        >
          <Box
            display="flex"
            alignItems="center"
            height="100%"
            sx={{
              '@keyframes scroll': {
                '0%': { transform: 'translateX(0)' },
                '100%': { transform: 'translateX(-50%)' }
              },
              animation: 'scroll 30s linear infinite',
              '&:hover': {
                animationPlayState: 'paused'
              }
            }}
          >
            {/* Dupliquer pour un défilement continu */}
            {[...composition, ...composition].map((stock, index) => {
              const variationValue = typeof stock.variation === 'string'
                ? parseFloat(stock.variation)
                : stock.variation;
              const isPositive = variationValue > 0;
              const isNegative = variationValue < 0;

              return (
                <HStack
                  key={index}
                  spacing={2}
                  px={6}
                  py={2}
                  borderRight="1px"
                  borderColor="gray.200"
                  minW="fit-content"
                >
                  <Text fontWeight="bold" fontSize="sm" color="gray.700">
                    {stock.instrument}
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {typeof stock.price === 'number' ? formatNumber(stock.price) : stock.price}
                  </Text>
                  <HStack spacing={1}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={isPositive ? 'green.600' : isNegative ? 'red.600' : 'gray.600'}
                    >
                      {isPositive ? '▲' : isNegative ? '▼' : '●'}
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={isPositive ? 'green.600' : isNegative ? 'red.600' : 'gray.600'}
                    >
                      {stock.variationPercent || stock.variation}
                    </Text>
                  </HStack>
                </HStack>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Sélecteur d'indice - Boutons au lieu de dropdown */}
      <Box mb={6} overflowX="auto" pb={2}>
        <HStack spacing={2} flexWrap={{ base: 'nowrap', md: 'wrap' }} minW={{ base: 'max-content', md: 'auto' }}>
          {[...summary].sort((a, b) => a.index === 'MASI' ? -1 : b.index === 'MASI' ? 1 : 0).map((s) => (
            <Button
              key={s.index}
              onClick={() => setSelectedIndex(s.index)}
              size={{ base: 'md', md: 'lg' }}
              colorScheme={s.index === selectedIndex ? 'blue' : 'gray'}
              variant={s.index === selectedIndex ? 'solid' : 'outline'}
              fontWeight="bold"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'md'
              }}
              transition="all 0.2s"
              flexShrink={0}
            >
              {s.index}
            </Button>
          ))}
        </HStack>
      </Box>

      {/* Statistiques de l'indice sélectionné */}
      {currentIndex && (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Clôture</StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold">
                  {formatNumber(currentIndex.closeValue)}
                </StatNumber>
                {currentIndex.variationPercent !== null && (
                  <HStack mt={1}>
                    <StatArrow
                      type={currentIndex.variationPercent >= 0 ? 'increase' : 'decrease'}
                    />
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={getVariationColor(currentIndex.variationPercent)}
                    >
                      {formatNumber(currentIndex.variationPercent)}%
                    </Text>
                  </HStack>
                )}
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Ouverture</StatLabel>
                <StatNumber fontSize="xl">
                  {formatNumber(currentIndex.openValue)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Plus Haut</StatLabel>
                <StatNumber fontSize="xl" color="green.600">
                  {formatNumber(currentIndex.highValue)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Plus Bas</StatLabel>
                <StatNumber fontSize="xl" color="red.600">
                  {formatNumber(currentIndex.lowValue)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel fontSize="xs" color="gray.600">Variation</StatLabel>
                <StatNumber
                  fontSize="xl"
                  color={getVariationColor(currentIndex.variation)}
                >
                  {currentIndex.variation !== null && currentIndex.variation >= 0 ? '+' : ''}
                  {formatNumber(currentIndex.variation)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Comparaison rapide de tous les indices */}
      <Card mb={8}>
        <CardBody>
          <Heading as="h2" size="md" mb={4}>Tous les indices</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {[...summary].sort((a, b) => a.index === 'MASI' ? -1 : b.index === 'MASI' ? 1 : 0).map((idx) => (
              <Card
                key={idx.index}
                variant="outline"
                cursor="pointer"
                onClick={() => setSelectedIndex(idx.index)}
                bg={idx.index === selectedIndex ? 'blue.50' : 'white'}
                borderColor={idx.index === selectedIndex ? 'blue.500' : 'gray.200'}
                _hover={{ borderColor: 'blue.300', shadow: 'sm' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="sm">{idx.index}</Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {formatNumber(idx.closeValue)}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={getVariationColor(idx.variationPercent)}
                      >
                        {idx.variationPercent !== null && idx.variationPercent >= 0 ? '+' : ''}
                        {formatNumber(idx.variationPercent)}%
                      </Text>
                      <Badge
                        colorScheme={
                          idx.variationPercent === null ? 'gray' :
                          idx.variationPercent > 0 ? 'green' : 'red'
                        }
                        fontSize="xs"
                      >
                        {idx.date}
                      </Badge>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Graphiques */}
      <Tabs variant="enclosed" colorScheme="blue" isLazy>
        <TabList overflowX="auto" overflowY="hidden" flexWrap="nowrap">
          <Tab fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} whiteSpace="nowrap">Intraday</Tab>
          <Tab fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} whiteSpace="nowrap">Comparaison</Tab>
          <Tab fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} whiteSpace="nowrap">Historique</Tab>
          <Tab fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} whiteSpace="nowrap">Performance</Tab>
        </TabList>

        <TabPanels>
          {/* Graphique Intraday */}
          <TabPanel p={0} pt={4}>
            <Card>
              <CardBody>
                {intradayData.length > 0 ? (
                  <>
                    <Heading size={{ base: 'xs', md: 'sm' }} mb={4}>
                      Évolution intraday - {selectedIndex} ({intradayData.length} points)
                    </Heading>
                    <Box height={{ base: "300px", md: "400px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={intradayData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4299e1" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#4299e1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 20', 'dataMax + 20']} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a202c',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                            }}
                            formatter={(value: any) => [formatNumber(value), 'Valeur']}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#4299e1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </>
                ) : (
                  <Box textAlign="center" py={12}>
                    <Text color="gray.500">Aucune donnée intraday disponible pour {selectedIndex}</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Graphique Comparaison Intraday */}
          <TabPanel p={0} pt={4}>
            <Card>
              <CardBody>
                {normalizedIntradayData.length > 0 ? (
                  <>
                    <Heading size={{ base: 'xs', md: 'sm' }} mb={4}>
                      Comparaison des Indices - Intraday (Base 100)
                    </Heading>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" mb={4}>
                      Comparaison des performances intraday de tous les indices (base 100 à l'ouverture)
                    </Text>
                    <Box height={{ base: "300px", md: "400px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={normalizedIntradayData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            domain={['dataMin - 1', 'dataMax + 1']}
                            tickFormatter={(value) => value.toFixed(1)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a202c',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                            }}
                            formatter={(value: any) => [value.toFixed(2), '']}
                          />
                          <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                          />
                          {[...summary].sort((a, b) => a.index === 'MASI' ? -1 : b.index === 'MASI' ? 1 : 0).map((idx, i) => {
                            const colors = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565'];
                            return (
                              <Line
                                key={idx.index}
                                type="monotone"
                                dataKey={idx.index}
                                stroke={colors[i % colors.length]}
                                strokeWidth={2}
                                dot={false}
                                name={idx.index}
                                connectNulls={true}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </>
                ) : (
                  <Box textAlign="center" py={12}>
                    <Text color="gray.500">
                      Données de comparaison intraday non encore disponibles
                    </Text>
                    <Text color="gray.400" fontSize="sm" mt={2}>
                      Chargement en cours...
                    </Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Graphique Historique */}
          <TabPanel p={0} pt={4}>
            <Card>
              <CardBody>
                {historicalData.length > 0 ? (
                  <>
                    <Heading size={{ base: 'xs', md: 'sm' }} mb={4}>
                      Historique 30 jours - {selectedIndex} ({historicalData.length} jours)
                    </Heading>
                    <Box height={{ base: "300px", md: "400px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 100', 'dataMax + 100']} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a202c',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                            }}
                            formatter={(value: any) => [formatNumber(value), 'Clôture']}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#48bb78"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#48bb78' }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </>
                ) : (
                  <Box textAlign="center" py={12}>
                    <Text color="gray.500">
                      Historique non encore disponible pour {selectedIndex}
                    </Text>
                    <Text color="gray.400" fontSize="sm" mt={2}>
                      L'historique se construira au fil des collectes quotidiennes
                    </Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Graphique Performance Normalisée */}
          <TabPanel p={0} pt={4}>
            <Card>
              <CardBody>
                {normalizedData.length > 0 ? (
                  <>
                    <Heading size={{ base: 'xs', md: 'sm' }} mb={4}>
                      Performance Normalisée (Base 100) - Comparaison de tous les indices
                    </Heading>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" mb={4}>
                      Tous les indices démarrent à 100 pour faciliter la comparaison des performances relatives
                    </Text>
                    <Box height={{ base: "300px", md: "400px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={normalizedData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            domain={['dataMin - 2', 'dataMax + 2']}
                            tickFormatter={(value) => value.toFixed(1)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1a202c',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                            }}
                            formatter={(value: any) => [value.toFixed(2), '']}
                          />
                          <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="line"
                          />
                          {[...summary].sort((a, b) => a.index === 'MASI' ? -1 : b.index === 'MASI' ? 1 : 0).map((idx, i) => {
                            const colors = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565'];
                            return (
                              <Line
                                key={idx.index}
                                type="monotone"
                                dataKey={idx.index}
                                stroke={colors[i % colors.length]}
                                strokeWidth={2}
                                dot={false}
                                name={idx.index}
                                connectNulls={true}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </>
                ) : (
                  <Box textAlign="center" py={12}>
                    <Text color="gray.500">
                      Données de performance normalisée non encore disponibles
                    </Text>
                    <Text color="gray.400" fontSize="sm" mt={2}>
                      Les données se construiront au fil des collectes quotidiennes
                    </Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Composition (Actions) - Uniquement pour MASI */}
      {selectedIndex === 'MASI' && composition.length > 0 && (
        <Card mb={8} mt={8}>
          <CardBody>
            <Heading size={{ base: 'sm', md: 'md' }} mb={4}>
              Composition de l'indice MASI ({composition.length} titres)
            </Heading>
            <TableContainer overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Instrument</Th>
                    <Th isNumeric>Cours</Th>
                    <Th isNumeric>Var. (%)</Th>
                    <Th isNumeric>Volume</Th>
                    <Th isNumeric>Quantité</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {composition.map((stock, index) => {
                    const variationValue = typeof stock.variation === 'string'
                      ? parseFloat(stock.variation)
                      : stock.variation;
                    const isPositive = variationValue > 0;
                    const isNegative = variationValue < 0;

                    return (
                      <Tr key={index} _hover={{ bg: 'gray.50' }}>
                        <Td fontWeight="medium">{stock.instrument}</Td>
                        <Td isNumeric fontWeight="bold">
                          {typeof stock.price === 'number'
                            ? formatNumber(stock.price)
                            : stock.price}
                        </Td>
                        <Td
                          isNumeric
                          fontWeight="bold"
                          color={isPositive ? 'green.600' : isNegative ? 'red.600' : 'gray.600'}
                        >
                          {isPositive && '+'}
                          {stock.variationPercent || stock.variation}
                          {stock.variationPercent && '%'}
                        </Td>
                        <Td isNumeric color="gray.600">
                          {typeof stock.volume === 'number'
                            ? new Intl.NumberFormat('fr-FR').format(stock.volume)
                            : stock.volume}
                        </Td>
                        <Td isNumeric color="gray.600">
                          {typeof stock.quantity === 'number'
                            ? new Intl.NumberFormat('fr-FR').format(stock.quantity)
                            : stock.quantity}
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      )}

      {/* Footer */}
      <Box mt={8} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          Source: Bourse de Casablanca
          {dataSource === 'supabase'
            ? ' - Données historiques collectées toutes les 10 minutes'
            : ' - Scraping en direct'
          }
        </Text>
        <Text fontSize="xs" color="gray.400" mt={1}>
          Dernier scraping: {currentIndex?.scrapeTimestamp
            ? new Date(currentIndex.scrapeTimestamp).toLocaleString('fr-FR')
            : '-'
          }
        </Text>
      </Box>
    </Container>
  );
}
