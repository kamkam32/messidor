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
  Stack,
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
import { getManagementCompanyLogo } from '@/lib/utils/management-company-logos'

export const dynamic = 'force-dynamic'

export default function OPCVMPage() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterClassification, setFilterClassification] = useState<string>('all')
  const [filterRisk, setFilterRisk] = useState<string>('all')
  const [filterCompany, setFilterCompany] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [displayedCount, setDisplayedCount] = useState(20) // Nombre de fonds affichés
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

      // Récupérer la date de dernière mise à jour depuis la vue fund_performance_stats
      const { data: statsData } = await supabase
        .from('fund_performance_stats')
        .select('last_updated_at')
        .order('last_updated_at', { ascending: false })
        .limit(1)
        .single()

      if (statsData?.last_updated_at) {
        setLastUpdate(new Date(statsData.last_updated_at).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }))
      }
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
        case 'perf_3y_desc':
          return (b.perf_3y || 0) - (a.perf_3y || 0)
        case 'perf_5y_desc':
          return (b.perf_5y || 0) - (a.perf_5y || 0)
        case 'perf_1m_desc':
          return (b.perf_1m || 0) - (a.perf_1m || 0)
        case 'risk_asc':
          return (a.risk_level || 0) - (b.risk_level || 0)
        case 'risk_desc':
          return (b.risk_level || 0) - (a.risk_level || 0)
        case 'nav_desc':
          return (b.nav || 0) - (a.nav || 0)
        case 'asset_desc':
          return (b.asset_value || 0) - (a.asset_value || 0)
        case 'fees_asc':
          return (a.management_fees || 0) - (b.management_fees || 0)
        default:
          return 0
      }
    })

    return result
  }, [funds, searchQuery, filterClassification, filterRisk, filterCompany, sortBy])

  // Only display a subset of filtered funds
  const displayedFunds = useMemo(() => {
    return filteredFunds.slice(0, displayedCount)
  }, [filteredFunds, displayedCount])

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(20)
  }, [searchQuery, filterClassification, filterRisk, filterCompany, sortBy])

  // Load more when scrolling near bottom
  useEffect(() => {
    if (displayedCount >= filteredFunds.length) return

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight

      // Load more when 200px from bottom
      if (scrollHeight - scrollTop - clientHeight < 200) {
        setDisplayedCount(prev => Math.min(prev + 20, filteredFunds.length))
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [displayedCount, filteredFunds.length])

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
        <HStack justify="space-between" mb={2} flexWrap="wrap" gap={2}>
          <Heading as="h1" size="xl">
            Fonds OPCVM
          </Heading>
          <HStack gap={2}>
            <Button
              size="sm"
              onClick={() => window.location.href = '/dashboard/opcvm/comparateur'}
              colorScheme="blue"
              leftIcon={<Text>📊</Text>}
            >
              Comparateur
            </Button>
            {lastUpdate && (
              <Badge colorScheme="green" px={3} py={1} borderRadius="md" fontSize="sm">
                🔄 Mis à jour le {lastUpdate}
              </Badge>
            )}
            <Button
              size="sm"
              onClick={fetchFunds}
              isLoading={loading}
              colorScheme="purple"
              variant="outline"
            >
              Actualiser
            </Button>
          </HStack>
        </HStack>
        <Text color="gray.600" fontSize="lg">
          Affichage de {displayedFunds.length} sur {filteredFunds.length} fonds {filteredFunds.length !== funds.length && `(${funds.length} au total)`}
        </Text>
      </Box>

      {/* Search and Filters */}
      <Box mb={6} p={{ base: 4, md: 6 }} bg="white" borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
        <VStack spacing={4} align="stretch">
          <InputGroup size={{ base: 'md', md: 'lg' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher par nom, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="gray.50"
              border="none"
              _focus={{ bg: 'white', border: '2px solid', borderColor: 'purple.500' }}
            />
          </InputGroup>

          <Stack spacing={3}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" display={{ base: 'none', sm: 'block' }}>
              Filtrer par :
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              <Select
                value={filterClassification}
                onChange={(e) => setFilterClassification(e.target.value)}
                bg="gray.50"
                size={{ base: 'sm', md: 'md' }}
              >
                <option value="all">Toutes classifications</option>
                {classifications.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>

              <Select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                bg="gray.50"
                size={{ base: 'sm', md: 'md' }}
              >
                <option value="all">Tous niveaux de risque</option>
                {[1, 2, 3, 4, 5, 6, 7].map(r => (
                  <option key={r} value={r}>Risque {r}/7</option>
                ))}
              </Select>

              <Select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                bg="gray.50"
                size={{ base: 'sm', md: 'md' }}
              >
                <option value="all">Toutes sociétés</option>
                {companies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </SimpleGrid>
          </Stack>

          <Stack spacing={3}>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" display={{ base: 'none', sm: 'block' }}>
                Trier par :
              </Text>
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
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              bg="gray.50"
              size={{ base: 'sm', md: 'md' }}
            >
              <option value="name">Nom (A-Z)</option>
              <option value="perf_ytd_desc">Performance YTD ↓</option>
              <option value="perf_ytd_asc">Performance YTD ↑</option>
              <option value="perf_1y_desc">Performance 1 an ↓</option>
              <option value="perf_3y_desc">Performance 3 ans ↓</option>
              <option value="perf_5y_desc">Performance 5 ans ↓</option>
              <option value="perf_1m_desc">Performance 1 mois ↓</option>
              <option value="asset_desc">Actif Net ↓</option>
              <option value="risk_asc">Risque ↑</option>
              <option value="risk_desc">Risque ↓</option>
              <option value="nav_desc">VL ↓</option>
              <option value="fees_asc">Frais ↑</option>
            </Select>
          </Stack>
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
        <>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {displayedFunds.map((fund) => (
            <Card key={fund.id} _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }} transition="all 0.3s" overflow="hidden" display="flex" flexDirection="column" h="full">
              <Image
                src={getManagementCompanyLogo(fund.management_company)}
                alt={fund.management_company || fund.name}
                h={{ base: "150px", md: "180px" }}
                w="100%"
                objectFit="contain"
                objectPosition="center"
                bg="white"
                p={4}
                loading="lazy"
                fallbackSrc="/images/logomessidor.jpg"
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
                    <Heading size={{ base: 'sm', md: 'md' }} mb={2} lineHeight="1.3" noOfLines={2}>
                      {fund.name}
                    </Heading>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.600" fontWeight="500" noOfLines={1}>
                      {fund.management_company}
                    </Text>
                    <Text fontSize="xs" color="gray.500" mt={1} noOfLines={1}>
                      {fund.legal_nature} • {fund.isin_code}
                    </Text>
                  </Box>

                  <Divider />

                  {/* VL, Actif Net & Performance YTD */}
                  <HStack
                    spacing={0}
                    divider={<Box h="60px" w="1px" bg="gray.300" />}
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    overflow="hidden"
                  >
                    <VStack
                      flex={1}
                      py={4}
                      spacing={1}
                      align="center"
                      _hover={{ bg: 'gray.50' }}
                      transition="all 0.2s"
                    >
                      <Text fontSize="2xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wide">
                        Valeur Liquidative
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="gray.900">
                        {fund.nav ? `${fund.nav.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}` : 'N/A'}
                      </Text>
                      <Text fontSize="2xs" color="gray.400" fontWeight="500">MAD</Text>
                    </VStack>

                    <VStack
                      flex={1}
                      py={4}
                      spacing={1}
                      align="center"
                      _hover={{ bg: 'purple.50' }}
                      transition="all 0.2s"
                    >
                      <Text fontSize="2xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wide">
                        Actif Net
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="purple.600">
                        {fund.asset_value ? `${(fund.asset_value / 1000000).toFixed(1)}M` : 'N/A'}
                      </Text>
                      <Text fontSize="2xs" color="gray.400" fontWeight="500">MAD</Text>
                    </VStack>

                    <VStack
                      flex={1}
                      py={4}
                      spacing={1}
                      align="center"
                      bg={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.50' : fund.ytd_performance && fund.ytd_performance < 0 ? 'red.50' : 'gray.50'}
                      _hover={{ bg: fund.ytd_performance && fund.ytd_performance > 0 ? 'green.100' : fund.ytd_performance && fund.ytd_performance < 0 ? 'red.100' : 'gray.100' }}
                      transition="all 0.2s"
                    >
                      <Text fontSize="2xs" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wide">
                        Performance YTD
                      </Text>
                      <HStack spacing={1}>
                        {fund.ytd_performance && (
                          <Text fontSize="lg" color={fund.ytd_performance > 0 ? 'green.600' : 'red.600'}>
                            {fund.ytd_performance > 0 ? '↗' : '↘'}
                          </Text>
                        )}
                        <Text fontSize="lg" fontWeight="bold" color={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.600' : fund.ytd_performance && fund.ytd_performance < 0 ? 'red.600' : 'gray.600'}>
                          {fund.ytd_performance !== null && fund.ytd_performance !== undefined
                            ? `${fund.ytd_performance > 0 ? '+' : ''}${fund.ytd_performance.toFixed(2)}%`
                            : 'N/A'}
                        </Text>
                      </HStack>
                      <Text fontSize="2xs" color="gray.400" fontWeight="500">Année en cours</Text>
                    </VStack>
                  </HStack>

                  {/* Short-term performance */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={3} textTransform="uppercase" letterSpacing="wide">
                      Performances
                    </Text>
                    <SimpleGrid columns={4} spacing={2} mb={2}>
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
                    <SimpleGrid columns={3} spacing={2}>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>3M</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_3m && fund.perf_3m > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_3m)}
                        </Text>
                      </Box>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>3A</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_3y && fund.perf_3y > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_3y)}
                        </Text>
                      </Box>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>5A</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_5y && fund.perf_5y > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_5y)}
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
                    onClick={() => window.location.href = `/dashboard/opcvm/${fund.id}`}
                  >
                    Voir les détails
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Loading indicator when there are more funds to load */}
        {displayedCount < filteredFunds.length && (
          <Box mt={8} textAlign="center">
            <Text color="gray.500" fontSize="sm">
              Chargement de plus de fonds...
            </Text>
          </Box>
        )}
        </>
      )}
    </Container>
  )
}
