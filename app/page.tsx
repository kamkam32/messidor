'use client'

import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { FaChartLine, FaShieldAlt, FaUsers, FaHandshake } from 'react-icons/fa'
import NextLink from 'next/link'

const features = [
  {
    title: 'Expertise Locale',
    text: 'Une connaissance approfondie du marché financier marocain et des opportunités d\'investissement.',
    icon: FaChartLine,
  },
  {
    title: 'Sécurité & Conformité',
    text: 'Des solutions conformes à la réglementation marocaine pour protéger vos actifs.',
    icon: FaShieldAlt,
  },
  {
    title: 'Accompagnement Personnalisé',
    text: 'Un conseiller dédié pour comprendre vos objectifs et adapter nos recommandations.',
    icon: FaUsers,
  },
  {
    title: 'Relation de Confiance',
    text: 'Une transparence totale et un engagement à long terme pour votre réussite financière.',
    icon: FaHandshake,
  },
]

export default function Home() {
  return (
    <Box flex="1">
      {/* Hero Section */}
      <Box position="relative" h="100vh" overflow="hidden">
        {/* Video Background */}
        <Box
          as="video"
          autoPlay
          loop
          muted
          playsInline
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          objectFit="cover"
          zIndex="0"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </Box>

        {/* Dark Overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          bg="blackAlpha.600"
          zIndex="1"
        />

        {/* Content */}
        <Container
          maxW="container.xl"
          position="relative"
          zIndex="2"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Stack spacing={10} maxW="5xl" color="white" textAlign="center" align="center">
            <Heading
              as="h1"
              fontSize={{ base: '5xl', md: '7xl', lg: '8xl' }}
              fontWeight="bold"
              lineHeight="1.1"
              letterSpacing="tight"
            >
              Bâtissez un patrimoine d'exception
            </Heading>
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="300" lineHeight="1.5" maxW="4xl">
              Messidor Patrimoine vous accompagne dans la construction et la préservation de votre richesse avec une expertise sur-mesure du marché financier marocain.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={6} pt={6}>
              <Button
                as={NextLink}
                href="/services"
                size="lg"
                colorScheme="accent"
                variant="solid"
                px={10}
                py={8}
                fontSize="xl"
                fontWeight="semibold"
              >
                Découvrir nos solutions
              </Button>
              <Button
                as={NextLink}
                href="/contact"
                size="lg"
                variant="outline"
                color="white"
                borderColor="white"
                borderWidth="2px"
                _hover={{ bg: 'whiteAlpha.200' }}
                px={10}
                py={8}
                fontSize="xl"
                fontWeight="semibold"
              >
                Prendre rendez-vous
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Value Proposition Section */}
      <Box py={{ base: 20, md: 24 }} bg="white">
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <Stack spacing={8}>
              <Stack spacing={5}>
                <Heading as="h2" fontSize={{ base: '4xl', md: '5xl' }} lineHeight="1.2" fontWeight="500">
                  L'offre la plus complète du marché marocain
                </Heading>
                <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" lineHeight="1.8" fontWeight="300">
                  Simplifiez la gestion de votre patrimoine avec notre approche sur-mesure,
                  conçue pour vous offrir une expérience client d'excellence et des solutions
                  adaptées au marché financier marocain.
                </Text>
              </Stack>

              <Stack spacing={4}>
                <Flex align="start" gap={4}>
                  <Box
                    w={2}
                    h={2}
                    bg="accent.500"
                    rounded="full"
                    mt={2}
                    flexShrink={0}
                  />
                  <Text fontSize="lg" color="gray.700">
                    Accès aux meilleurs OPCVM et OPCI du marché marocain
                  </Text>
                </Flex>
                <Flex align="start" gap={4}>
                  <Box
                    w={2}
                    h={2}
                    bg="accent.500"
                    rounded="full"
                    mt={2}
                    flexShrink={0}
                  />
                  <Text fontSize="lg" color="gray.700">
                    Suivi personnalisé et reporting détaillé de vos investissements
                  </Text>
                </Flex>
                <Flex align="start" gap={4}>
                  <Box
                    w={2}
                    h={2}
                    bg="accent.500"
                    rounded="full"
                    mt={2}
                    flexShrink={0}
                  />
                  <Text fontSize="lg" color="gray.700">
                    Conseils indépendants sans conflit d'intérêt
                  </Text>
                </Flex>
                <Flex align="start" gap={4}>
                  <Box
                    w={2}
                    h={2}
                    bg="accent.500"
                    rounded="full"
                    mt={2}
                    flexShrink={0}
                  />
                  <Text fontSize="lg" color="gray.700">
                    Stratégies patrimoniales adaptées à vos objectifs
                  </Text>
                </Flex>
              </Stack>

              <Box pt={4}>
                <Button
                  as={NextLink}
                  href="/services"
                  size="lg"
                  colorScheme="accent"
                  rightIcon={<Icon as={FaChartLine} />}
                >
                  Découvrir nos solutions
                </Button>
              </Box>
            </Stack>

            <Box
              position="relative"
              h={{ base: '400px', md: '550px' }}
              rounded="2xl"
              overflow="hidden"
              boxShadow="2xl"
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                w="100%"
                h="100%"
                bgImage="url('/images/hero2.jpg')"
                bgSize="cover"
                bgPosition="center"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg="gray.50">
        <Container maxW="container.xl">
          <Stack spacing={12}>
            <Stack spacing={4} textAlign="center">
              <Heading as="h2" size="xl">
                Pourquoi Choisir Messidor Patrimoine ?
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Un partenaire de confiance pour vos investissements au Maroc
              </Text>
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
              {features.map((feature, index) => (
                <Stack
                  key={index}
                  align="center"
                  textAlign="center"
                  bg="white"
                  p={6}
                  rounded="lg"
                  shadow="md"
                >
                  <Flex
                    w={16}
                    h={16}
                    align="center"
                    justify="center"
                    color="white"
                    rounded="full"
                    bg="accent.500"
                    mb={2}
                  >
                    <Icon as={feature.icon} w={8} h={8} />
                  </Flex>
                  <Heading as="h3" size="md" mb={2}>
                    {feature.title}
                  </Heading>
                  <Text color="gray.600">{feature.text}</Text>
                </Stack>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Team Section */}
      <Box
        py={20}
        bgGradient="linear(to-br, gray.50 0%, white 50%, gray.100 100%)"
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: 'radial(circle at 30% 20%, accent.50 0%, transparent 50%)',
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <Stack spacing={12}>
            <Stack spacing={4} textAlign="center">
              <Heading as="h2" size="xl">
                Les Fondateurs
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Une expertise reconnue au service de votre patrimoine
              </Text>
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              {/* Tarik Belghazi */}
              <Box
                position="relative"
                h="500px"
                w="400px"
                rounded="xl"
                overflow="hidden"
                cursor="pointer"
                role="group"
                boxShadow="xl"
                mx="auto"
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="100%"
                  bgImage="url('/images/tarik.jpg')"
                  bgSize="cover"
                  bgPosition="center"
                  transition="transform 0.5s ease"
                  _groupHover={{ transform: 'scale(1.05)' }}
                />
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="100%"
                  bg="linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)"
                  transition="all 0.5s ease"
                  _groupHover={{ bg: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 100%)' }}
                />
                <Stack
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  p={8}
                  spacing={4}
                  color="white"
                >
                  <Stack spacing={2}>
                    <Heading as="h3" size="lg">
                      Tarik Belghazi
                    </Heading>
                    <Text fontSize="md" color="accent.300" fontWeight="600">
                      Fondateur & CEO - Messidor Patrimoine
                    </Text>
                  </Stack>
                  <Text
                    fontSize="sm"
                    lineHeight="1.7"
                    opacity={0}
                    transform="translateY(20px)"
                    transition="all 0.5s ease"
                    _groupHover={{ opacity: 1, transform: 'translateY(0)' }}
                  >
                    Fort de plus de 20 ans d'expérience dans la banque privée internationale (HSBC Private Bank, UBS Wealth Management, BMCI Groupe BNP Paribas), Tarik Belghazi fonde en 2013 Belghazi Family Office.
                    Diplômé de KEDGE Business School en Finance et gestion financière, il accompagne une clientèle internationale dans leurs stratégies patrimoniales, la gouvernance familiale et l'organisation successorale, avec une approche unique : créer de la richesse avec et pour les personnes.
                  </Text>
                </Stack>
              </Box>

              {/* Kamil Alami */}
              <Box
                position="relative"
                h="500px"
                w="400px"
                rounded="xl"
                overflow="hidden"
                cursor="pointer"
                role="group"
                boxShadow="xl"
                mx="auto"
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="100%"
                  bgImage="url('/images/kamil.jpg')"
                  bgSize="cover"
                  bgPosition="center"
                  transition="transform 0.5s ease"
                  _groupHover={{ transform: 'scale(1.05)' }}
                />
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w="100%"
                  h="100%"
                  bg="linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)"
                  transition="all 0.5s ease"
                  _groupHover={{ bg: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 100%)' }}
                />
                <Stack
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  p={8}
                  spacing={4}
                  color="white"
                >
                  <Stack spacing={2}>
                    <Heading as="h3" size="lg">
                      Kamil Alami
                    </Heading>
                    <Text fontSize="md" color="accent.300" fontWeight="600">
                      Chief Product Officer - Messidor Patrimoine
                    </Text>
                  </Stack>
                  <Text
                    fontSize="sm"
                    lineHeight="1.7"
                    opacity={0}
                    transform="translateY(20px)"
                    transition="all 0.5s ease"
                    _groupHover={{ opacity: 1, transform: 'translateY(0)' }}
                  >
                    Diplômé d'ESCP Business School (Master in International Wealth Management) et de NEOMA Business School, Kamil allie une solide expérience en gestion de patrimoine (BNP Paribas, Zénith Capital) et une expertise en product management digital acquise dans l'esport et le SaaS B2B (Fanprime, OSMOZE).
                    Chez Messidor Patrimoine, il repense l'expérience client et digitalise les services de conseil patrimonial pour offrir une approche moderne et personnalisée.
                  </Text>
                </Stack>
              </Box>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bg="gray.50">
        <Container maxW="container.xl">
          <Stack
            spacing={6}
            bg="brand.800"
            p={12}
            rounded="xl"
            textAlign="center"
            align="center"
          >
            <Heading as="h2" size="xl" color="white">
              Prêt à Optimiser Votre Patrimoine ?
            </Heading>
            <Text fontSize="lg" color="whiteAlpha.900" maxW="2xl">
              Contactez-nous dès aujourd'hui pour une consultation personnalisée et découvrez
              comment nous pouvons vous aider à atteindre vos objectifs financiers.
            </Text>
            <Button
              as={NextLink}
              href="/contact"
              size="lg"
              colorScheme="accent"
            >
              Contactez-nous
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
