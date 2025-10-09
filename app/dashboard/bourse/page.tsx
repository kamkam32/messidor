'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Button,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  Divider,
  Skeleton,
  useToast,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { RepeatIcon, TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface IndexQuote {
  indexValue: string;
  previousValue: string;
  variation: string;
  variationPercent: string;
  high: string;
  low: string;
  ytdVariation: string;
  marketCap: string;
  timestamp: string;
}

interface StockComposition {
  instrument: string;
  price: string;
  previousPrice: string;
  variation: string;
  variationPercent: string;
  volume: string;
  quantity: string;
}

interface IntradayData {
  transactTime: string;
  indexValue: string;
}

interface BourseData {
  quote: IndexQuote | null;
  intraday: IntradayData[];
  composition: StockComposition[];
  timestamp: string;
  errors: string[];
}

export default function BoursePage() {
  const [data, setData] = useState<BourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const toast = useToast();

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const url = forceRefresh ? '/api/bourse?type=all&noCache=true' : '/api/bourse?type=all';
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setFromCache(result.fromCache);

        if (forceRefresh) {
          toast({
            title: 'Données actualisées',
            description: 'Les dernières données ont été récupérées',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de charger les données',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message || 'Une erreur est survenue',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatLargeNumber = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '-';

    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)} Mrd`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)} K`;
    }

    return formatNumber(num);
  };

  const getVariationColor = (variation: string | number) => {
    const num = typeof variation === 'string' ? parseFloat(variation) : variation;
    if (isNaN(num) || num === 0) return 'gray.500';
    return num > 0 ? 'green.600' : 'red.600';
  };

  // Préparer les données du graphique
  const chartData = data?.intraday.map(point => ({
    time: new Date(point.transactTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    value: parseFloat(point.indexValue),
  })) || [];

  if (loading) {
    return (
      <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }} py={8}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="100px" borderRadius="lg" />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="120px" borderRadius="lg" />
            ))}
          </SimpleGrid>
          <Skeleton height="400px" borderRadius="lg" />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }} py={8}>
      {/* Bouton actualiser */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack spacing={2}>
          <Text color="gray.600" fontSize="sm">
            Dernière mise à jour: {data?.timestamp ? new Date(data.timestamp).toLocaleString('fr-FR') : '-'}
          </Text>
          {fromCache && (
            <Badge colorScheme="blue" fontSize="xs">
              Cache
            </Badge>
          )}
        </HStack>
        <Button
          onClick={() => fetchData(true)}
          isLoading={refreshing}
          loadingText="Actualisation..."
          leftIcon={<RepeatIcon />}
          colorScheme="blue"
          size="sm"
          variant="outline"
        >
          Actualiser
        </Button>
      </Flex>

      {/* Erreurs */}
      {data?.errors && data.errors.length > 0 && (
        <Card bg="yellow.50" border="1px" borderColor="yellow.200" mb={6}>
          <CardBody>
            <Heading size="sm" color="yellow.700" mb={2}>
              Avertissements
            </Heading>
            <VStack align="start" spacing={1}>
              {data.errors.map((err, idx) => (
                <Text key={idx} fontSize="sm" color="yellow.600">
                  • {err}
                </Text>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Statistiques principales */}
      {data?.quote && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">
                  Indice MASI
                </StatLabel>
                <StatNumber fontSize="3xl" fontWeight="bold">
                  {formatNumber(data.quote.indexValue)}
                </StatNumber>
                <HStack mt={2}>
                  <StatArrow
                    type={parseFloat(data.quote.variationPercent) >= 0 ? 'increase' : 'decrease'}
                  />
                  <Text
                    fontSize="md"
                    fontWeight="bold"
                    color={getVariationColor(data.quote.variationPercent)}
                  >
                    {formatNumber(data.quote.variationPercent)}%
                  </Text>
                </HStack>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">
                  Plus Haut
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="green.600">
                  {formatNumber(data.quote.high)}
                </StatNumber>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  de la séance
                </Text>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">
                  Plus Bas
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="red.600">
                  {formatNumber(data.quote.low)}
                </StatNumber>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  de la séance
                </Text>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel fontSize="sm" color="gray.600">
                  Capitalisation
                </StatLabel>
                <StatNumber fontSize="xl" fontWeight="bold">
                  {formatLargeNumber(data.quote.marketCap)}
                </StatNumber>
                <Text fontSize="sm" color="gray.500" mt={2}>
                  MAD
                </Text>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Graphique Intraday */}
      {chartData.length > 0 && (
        <Card mb={8}>
          <CardBody>
            <Heading size="md" mb={6}>
              Évolution Intraday ({chartData.length} points)
            </Heading>
            <Box height="400px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4299e1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4299e1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 50', 'dataMax + 50']}
                  />
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
          </CardBody>
        </Card>
      )}

      {/* Composition de l'indice */}
      {data?.composition && data.composition.length > 0 && (
        <Card>
          <CardBody>
            <Heading size="md" mb={6}>
              Composition de l'indice ({data.composition.length} valeurs)
            </Heading>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Instrument</Th>
                    <Th isNumeric>Cours (MAD)</Th>
                    <Th isNumeric>Veille</Th>
                    <Th isNumeric>Variation</Th>
                    <Th isNumeric>Volume</Th>
                    <Th isNumeric>Quantité</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.composition.slice(0, 20).map((stock, idx) => (
                    <Tr key={idx} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                      <Td fontWeight="medium">{stock.instrument}</Td>
                      <Td isNumeric>{formatNumber(stock.price)}</Td>
                      <Td isNumeric color="gray.600">
                        {formatNumber(stock.previousPrice)}
                      </Td>
                      <Td isNumeric>
                        <HStack justify="flex-end" spacing={1}>
                          {parseFloat(stock.variationPercent) > 0 && (
                            <TriangleUpIcon color="green.600" boxSize={3} />
                          )}
                          {parseFloat(stock.variationPercent) < 0 && (
                            <TriangleDownIcon color="red.600" boxSize={3} />
                          )}
                          <Text
                            fontWeight="bold"
                            color={getVariationColor(stock.variationPercent)}
                          >
                            {formatNumber(stock.variationPercent)}%
                          </Text>
                        </HStack>
                      </Td>
                      <Td isNumeric>
                        {stock.volume === '-' ? '-' : formatLargeNumber(stock.volume)}
                      </Td>
                      <Td isNumeric>
                        {stock.quantity === '-' ? '-' : formatNumber(stock.quantity)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            {data.composition.length > 20 && (
              <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">
                Affichage de 20 valeurs sur {data.composition.length}
              </Text>
            )}
          </CardBody>
        </Card>
      )}

      {/* Footer */}
      <Box mt={8} textAlign="center">
        <Text fontSize="sm" color="gray.500">
          Source: Bourse de Casablanca (www.casablanca-bourse.com)
        </Text>
        <Text fontSize="xs" color="gray.400" mt={1}>
          Les données sont en différé de 15 minutes (sauf les indices)
        </Text>
      </Box>
    </Container>
  );
}
