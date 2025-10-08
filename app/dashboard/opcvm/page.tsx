'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
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
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Flex,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { createClient } from '@/lib/supabase/client'
import type { Fund } from '@/lib/types/fund.types'

export const dynamic = 'force-dynamic'

export default function OPCVMPage() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterClassification, setFilterClassification] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [filterCompany, setFilterCompany] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const supabase = useMemo(() => createClient(), [])
  const toast = useToast()

  const fetchFunds = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('funds')
        .select('*')
        .eq('type', 'OPCVM')
        .eq('is_active', true)
        .order('name')

      if (error) throw error

      setFunds(data || [])
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les fonds OPCVM',
        status: 'error',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    fetchFunds()
  }, [fetchFunds])

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`
  }

  // Extract unique values for filters
  const classifications = useMemo(() => {
    return Array.from(new Set(funds.map(f => f.classification).filter((c): c is string => Boolean(c))))
  }, [funds])

  const companies = useMemo(() => {
    return Array.from(new Set(funds.map(f => f.management_company).filter((c): c is string => Boolean(c)))).sort()
  }, [funds])

  // Filter and sort funds
  const filteredFunds = useMemo(() => {
    const result = funds.filter(fund => {
      const matchesSearch = searchQuery === '' ||
        fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fund.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fund.management_company?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesClassification = filterClassification === 'all' || fund.classification === filterClassification
      const matchesRisk = filterRisk === 'all' || (fund.risk_level && fund.risk_level.toString() === filterRisk)
      const matchesCompany = filterCompany === 'all' || fund.management_company === filterCompany

      return matchesSearch && matchesClassification && matchesRisk && matchesCompany
    })

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'perf_ytd_asc':
          return (a.ytd_performance || 0) - (b.ytd_performance || 0)
        case 'perf_ytd_desc':
          return (b.ytd_performance || 0) - (a.ytd_performance || 0)
        case 'perf_1y_desc':
          return (b.perf_1y || 0) - (a.perf_1y || 0)
        case 'risk_asc':
          return (a.risk_level || 0) - (b.risk_level || 0)
        case 'risk_desc':
          return (b.risk_level || 0) - (a.risk_level || 0)
        case 'nav_desc':
          return (b.nav || 0) - (a.nav || 0)
        case 'fees_asc':
          return (a.management_fees || 0) - (b.management_fees || 0)
        default:
          return 0
      }
    })

    return result
  }, [funds, searchQuery, filterClassification, filterRisk, filterCompany, sortBy])

  if (loading) {
    return (
      <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }}>
        <Box mb={8}>
          <Heading size="xl" mb={2}>
            Fonds OPCVM
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Organismes de Placement Collectif en Valeurs Mobilières
          </Text>
        </Box>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="400px" borderRadius="lg" />
          ))}
        </SimpleGrid>
      </Container>
    )
  }

  return (
    <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }}>
      <Box mb={8}>
        <Heading size="xl" mb={2}>
          Fonds OPCVM
        </Heading>
        <Text color="gray.600" fontSize="lg">
          {filteredFunds.length} fonds disponibles {filteredFunds.length !== funds.length && `sur ${funds.length}`}
        </Text>
      </Box>

      {/* Search and Filters */}
      <Box mb={6} p={6} bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <VStack spacing={4} align="stretch">
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher par nom, code ou société..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="gray.50"
              border="none"
              _focus={{ bg: 'white', border: '2px solid', borderColor: 'purple.500' }}
            />
          </InputGroup>

          <Flex gap={4} flexWrap="wrap" align="center">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" minW="fit-content">
              Filtrer par :
            </Text>
            <Select
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              maxW={{ base: '100%', md: '200px' }}
              bg="gray.50"
            >
              <option value="all">Toutes classifications</option>
              {classifications.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>

            <Select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              maxW={{ base: '100%', md: '180px' }}
              bg="gray.50"
            >
              <option value="all">Tous niveaux de risque</option>
              {[1, 2, 3, 4, 5, 6, 7].map(r => (
                <option key={r} value={r}>Risque {r}/7</option>
              ))}
            </Select>

            <Select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              flex="1"
              minW="200px"
              bg="gray.50"
            >
              <option value="all">Toutes sociétés</option>
              {companies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Flex>

          <Flex gap={4} flexWrap="wrap" align="center">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" minW="fit-content">
              Trier par :
            </Text>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              maxW={{ base: '100%', md: '250px' }}
              bg="gray.50"
            >
              <option value="name">Nom (A-Z)</option>
              <option value="perf_ytd_desc">Performance YTD (meilleure)</option>
              <option value="perf_ytd_asc">Performance YTD (plus faible)</option>
              <option value="perf_1y_desc">Performance 1 an (meilleure)</option>
              <option value="risk_asc">Risque (plus faible)</option>
              <option value="risk_desc">Risque (plus élevé)</option>
              <option value="nav_desc">Valeur liquidative (plus élevée)</option>
              <option value="fees_asc">Frais de gestion (plus bas)</option>
            </Select>

            {(searchQuery || filterClassification !== 'all' || filterRisk !== 'all' || filterCompany !== 'all' || sortBy !== 'name') && (
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setFilterClassification('all')
                  setFilterRisk('all')
                  setFilterCompany('all')
                  setSortBy('name')
                }}
                variant="ghost"
                colorScheme="red"
                size="sm"
                ml="auto"
              >
                Réinitialiser
              </Button>
            )}
          </Flex>
        </VStack>
      </Box>

      {filteredFunds.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Text color="gray.600" fontSize="lg">
              {funds.length === 0 ? 'Aucun fonds OPCVM disponible pour le moment' : 'Aucun fonds ne correspond à vos critères de recherche'}
            </Text>
          </CardBody>
        </Card>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredFunds.map((fund) => (
            <Card key={fund.id} _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s" overflow="hidden" display="flex" flexDirection="column" h="full">
              <Image
                src={`https://picsum.photos/seed/${fund.code}/400/200`}
                alt={fund.name}
                h="180px"
                w="100%"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/400x200/4299e1/ffffff?text=OPCVM"
              />
              <CardBody display="flex" flexDirection="column" flex="1">
                <VStack align="stretch" spacing={3} flex="1">
                  {/* Header */}
                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Badge colorScheme="purple" fontSize="xs" px={2} py={1} borderRadius="md">
                        {fund.classification}
                      </Badge>
                      <Badge
                        colorScheme={fund.risk_level && fund.risk_level > 5 ? 'red' : fund.risk_level && fund.risk_level > 3 ? 'orange' : 'green'}
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        Risque {fund.risk_level}/7
                      </Badge>
                    </HStack>
                    <Heading size="md" mb={2} lineHeight="1.3">
                      {fund.name}
                    </Heading>
                    <Text fontSize="sm" color="gray.600" fontWeight="500">
                      {fund.management_company}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {fund.legal_nature} • {fund.isin_code}
                    </Text>
                  </Box>

                  <Divider />

                  {/* VL & Performance YTD */}
                  <Box bg="gray.50" p={4} borderRadius="md">
                    <SimpleGrid columns={2} spacing={4}>
                      <Stat size="sm">
                        <StatLabel fontSize="xs" color="gray.600">Valeur Liquidative</StatLabel>
                        <StatNumber fontSize="md" fontWeight="bold" mt={1}>{formatCurrency(fund.nav)}</StatNumber>
                      </Stat>
                      <Stat size="sm">
                        <StatLabel fontSize="xs" color="gray.600">Performance YTD</StatLabel>
                        <StatNumber fontSize="md" fontWeight="bold" color={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.600' : 'red.600'} mt={1}>
                          {fund.ytd_performance && (
                            <StatArrow type={fund.ytd_performance > 0 ? 'increase' : 'decrease'} />
                          )}
                          {formatPercent(fund.ytd_performance)}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>
                  </Box>

                  {/* Short-term performance */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={3} textTransform="uppercase" letterSpacing="wide">
                      Performances récentes
                    </Text>
                    <SimpleGrid columns={4} spacing={2}>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>1J</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_1d && fund.perf_1d > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_1d)}
                        </Text>
                      </Box>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>1S</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_1w && fund.perf_1w > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_1w)}
                        </Text>
                      </Box>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>1M</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_1m && fund.perf_1m > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_1m)}
                        </Text>
                      </Box>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>1A</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_1y && fund.perf_1y > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_1y)}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  <Divider />

                  {/* Fees */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={3} textTransform="uppercase" letterSpacing="wide">
                      Frais
                    </Text>
                    <SimpleGrid columns={3} spacing={3}>
                      <Box textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>Souscription</Text>
                        <Text fontWeight="bold" fontSize="sm">{fund.subscription_fee}%</Text>
                      </Box>
                      <Box textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>Gestion</Text>
                        <Text fontWeight="bold" fontSize="sm">{fund.management_fees}%</Text>
                      </Box>
                      <Box textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>Rachat</Text>
                        <Text fontWeight="bold" fontSize="sm">{fund.redemption_fee}%</Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  <Button
                    size="md"
                    w="full"
                    mt="auto"
                    bg="#0A1929"
                    color="white"
                    _hover={{ transform: 'scale(1.02)', bg: '#1a2942' }}
                    transition="all 0.2s"
                  >
                    Voir les détails
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  )
}
