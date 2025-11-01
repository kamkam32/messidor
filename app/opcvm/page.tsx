'use client'

import { useEffect, useState, useMemo } from 'react'
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
  Divider,
  Skeleton,
  Container,
  Image,
  Stack,
} from '@chakra-ui/react'
import { createClient } from '@/lib/supabase/client'
import type { Fund } from '@/lib/types/fund.types'
import { getManagementCompanyLogo } from '@/lib/utils/management-company-logos'
import { OPCVMStructuredData } from '@/components/OPCVMStructuredData'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function OPCVMPublicPage() {
  const [topFunds, setTopFunds] = useState<Fund[]>([])
  const [loading, setLoading] = useState(true)
  const [totalFunds, setTotalFunds] = useState(0)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const fetchTopFunds = async () => {
      try {
        // Get total count
        const { count } = await supabase
          .from('funds')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'OPCVM')
          .eq('is_active', true)

        setTotalFunds(count || 0)

        // Get top 10 by YTD performance
        const { data, error } = await supabase
          .from('funds')
          .select('*')
          .eq('type', 'OPCVM')
          .eq('is_active', true)
          .not('ytd_performance', 'is', null)
          .order('ytd_performance', { ascending: false })
          .limit(10)

        if (error) throw error
        setTopFunds(data || [])
      } catch (error) {
        console.error('Error fetching funds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopFunds()
  }, [supabase])

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (loading) {
    return (
      <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }} py={12}>
        <Box mb={8}>
          <Heading size="2xl" mb={2}>
            Top 10 des Fonds OPCVM
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Les fonds OPCVM les plus performants au Maroc
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
    <>
      <OPCVMStructuredData funds={topFunds} />
      <Container maxW="7xl" px={{ base: 4, md: 8, lg: 12 }} py={12}>
        {/* Hero Section */}
        <Box mb={12} textAlign="center">
          <Badge colorScheme="purple" mb={4} fontSize="md" px={4} py={2} borderRadius="md" fontWeight="600">
            SÉLECTION PREMIUM
          </Badge>
          <Heading as="h1" size="2xl" mb={4}>
            Top 10 des Fonds OPCVM au Maroc
          </Heading>
          <Text color="gray.600" fontSize="xl" maxW="2xl" mx="auto">
            Découvrez les fonds OPCVM les plus performants. Performances actualisées quotidiennement.
          </Text>
          <HStack justify="center" mt={6} spacing={4} flexWrap="wrap">
            <Badge colorScheme="blue" fontSize="md" px={4} py={2} borderRadius="md" fontWeight="500">
              {totalFunds}+ fonds disponibles
            </Badge>
            <Badge colorScheme="green" fontSize="md" px={4} py={2} borderRadius="md" fontWeight="500">
              Mise à jour quotidienne
            </Badge>
          </HStack>
        </Box>

        {/* Top 10 Funds */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={12}>
          {topFunds.map((fund, index) => (
            <Card
              key={fund.id}
              _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
              transition="all 0.3s"
              overflow="hidden"
              display="flex"
              flexDirection="column"
              h="full"
              position="relative"
            >
              {/* Ranking Badge */}
              <Badge
                position="absolute"
                top={3}
                left={3}
                bg={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'gray.700'}
                color={index < 3 ? 'gray.900' : 'white'}
                fontSize="sm"
                fontWeight="bold"
                px={3}
                py={1}
                borderRadius="md"
                zIndex={1}
                boxShadow="sm"
              >
                #{index + 1}
              </Badge>

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
                  </Box>

                  <Divider />

                  {/* Performance YTD - Featured */}
                  <Box
                    bg={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.50' : 'red.50'}
                    p={4}
                    borderRadius="lg"
                    textAlign="center"
                    border="2px solid"
                    borderColor={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.200' : 'red.200'}
                  >
                    <Text fontSize="xs" color="gray.600" fontWeight="600" textTransform="uppercase" mb={1}>
                      Performance YTD
                    </Text>
                    <HStack spacing={2} justify="center">
                      <Text fontSize="3xl" fontWeight="bold" color={fund.ytd_performance && fund.ytd_performance > 0 ? 'green.600' : 'red.600'}>
                        {fund.ytd_performance !== null && fund.ytd_performance !== undefined
                          ? `${fund.ytd_performance > 0 ? '+' : ''}${fund.ytd_performance.toFixed(2)}%`
                          : 'N/A'}
                      </Text>
                    </HStack>
                  </Box>

                  {/* Short-term performance */}
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={2}>
                      Autres performances
                    </Text>
                    <SimpleGrid columns={4} spacing={2}>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>1M</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_1m && fund.perf_1m > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_1m)}
                        </Text>
                      </Box>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>3M</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_3m && fund.perf_3m > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_3m)}
                        </Text>
                      </Box>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>1A</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_1y && fund.perf_1y > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_1y)}
                        </Text>
                      </Box>
                      <Box bg="gray.50" p={2} borderRadius="md" textAlign="center">
                        <Text color="gray.500" fontSize="2xs" mb={1}>3A</Text>
                        <Text fontWeight="bold" fontSize="xs" color={fund.perf_3y && fund.perf_3y > 0 ? 'green.600' : 'red.600'}>
                          {formatPercent(fund.perf_3y)}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  <Button
                    as={Link}
                    href={`/dashboard/opcvm/${fund.slug}`}
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

        {/* CTA Section - Unlock Full Access */}
        <Box
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          p={{ base: 8, md: 12 }}
          borderRadius="2xl"
          textAlign="center"
          color="white"
          shadow="2xl"
          position="relative"
          overflow="hidden"
        >
          {/* Decorative elements */}
          <Box
            position="absolute"
            top="-50px"
            right="-50px"
            w="200px"
            h="200px"
            borderRadius="full"
            bg="whiteAlpha.200"
          />
          <Box
            position="absolute"
            bottom="-30px"
            left="-30px"
            w="150px"
            h="150px"
            borderRadius="full"
            bg="whiteAlpha.200"
          />

          <VStack spacing={6} position="relative" zIndex={1}>
            <Badge bg="whiteAlpha.300" color="white" fontSize="sm" px={4} py={2} borderRadius="md" fontWeight="600" letterSpacing="wide">
              ACCÈS COMPLET
            </Badge>
            <Heading size="xl" color="white">
              Accédez aux {totalFunds}+ fonds OPCVM
            </Heading>
            <Text fontSize="lg" maxW="2xl" opacity={0.95}>
              Créez votre compte gratuit pour accéder à la liste complète des fonds OPCVM, utiliser le comparateur avancé, et suivre vos favoris.
            </Text>

            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} pt={4}>
              <Button
                as={Link}
                href="/dashboard/opcvm"
                size="lg"
                bg="white"
                color="purple.600"
                _hover={{ transform: 'scale(1.05)', shadow: 'xl' }}
                transition="all 0.2s"
                px={8}
                fontWeight="600"
              >
                Créer mon compte gratuit
              </Button>
              <Button
                as={Link}
                href="/dashboard/opcvm"
                size="lg"
                variant="outline"
                borderColor="white"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                px={8}
                fontWeight="600"
              >
                Se connecter
              </Button>
            </Stack>

            <SimpleGrid columns={4} spacing={8} pt={6} w="full" maxW="xl">
              <VStack spacing={2}>
                <Box w="40px" h="40px" borderRadius="md" bg="whiteAlpha.300" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="lg" fontWeight="bold">✓</Text>
                </Box>
                <Text fontSize="sm" opacity={0.9} textAlign="center">Liste complète</Text>
              </VStack>
              <VStack spacing={2}>
                <Box w="40px" h="40px" borderRadius="md" bg="whiteAlpha.300" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="lg" fontWeight="bold">✓</Text>
                </Box>
                <Text fontSize="sm" opacity={0.9} textAlign="center">Comparateur</Text>
              </VStack>
              <VStack spacing={2}>
                <Box w="40px" h="40px" borderRadius="md" bg="whiteAlpha.300" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="lg" fontWeight="bold">✓</Text>
                </Box>
                <Text fontSize="sm" opacity={0.9} textAlign="center">Alertes</Text>
              </VStack>
              <VStack spacing={2}>
                <Box w="40px" h="40px" borderRadius="md" bg="whiteAlpha.300" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="lg" fontWeight="bold">✓</Text>
                </Box>
                <Text fontSize="sm" opacity={0.9} textAlign="center">Gratuit</Text>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Box>

        {/* Why create an account */}
        <Box mt={16} mb={12}>
          <Heading size="lg" textAlign="center" mb={8}>
            Pourquoi créer un compte ?
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Card>
              <CardBody textAlign="center" p={8}>
                <Box w="60px" h="60px" mx="auto" mb={4} borderRadius="lg" bg="blue.50" display="flex" alignItems="center" justifyContent="center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3182CE' }}>
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </Box>
                <Heading size="md" mb={3}>Comparateur avancé</Heading>
                <Text color="gray.600">
                  Comparez jusqu'à 5 fonds côte à côte avec tous les indicateurs de performance.
                </Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody textAlign="center" p={8}>
                <Box w="60px" h="60px" mx="auto" mb={4} borderRadius="lg" bg="green.50" display="flex" alignItems="center" justifyContent="center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#38A169' }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </Box>
                <Heading size="md" mb={3}>Alertes personnalisées</Heading>
                <Text color="gray.600">
                  Recevez des notifications quand vos fonds atteignent vos objectifs de performance.
                </Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody textAlign="center" p={8}>
                <Box w="60px" h="60px" mx="auto" mb={4} borderRadius="lg" bg="purple.50" display="flex" alignItems="center" justifyContent="center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#805AD5' }}>
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </Box>
                <Heading size="md" mb={3}>Liste de favoris</Heading>
                <Text color="gray.600">
                  Créez votre watchlist personnalisée pour suivre les fonds qui vous intéressent.
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      </Container>
    </>
  )
}
