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
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react'
import {
  FaChartLine,
  FaBuilding,
  FaHandshake,
  FaChartPie,
  FaShieldAlt,
  FaUserTie,
  FaGlobeAfrica,
  FaCheck,
  FaArrowRight,
  FaUniversity,
  FaHome,
  FaCoins,
} from 'react-icons/fa'
import NextLink from 'next/link'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)
const MotionStack = motion(Stack)

// JSON-LD Schema pour le SEO
const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "name": "Messidor Patrimoine - Services de Gestion de Patrimoine",
  "description": "Cabinet de conseil en investissement financier au Maroc. Construction de portefeuilles sur mesure, OPCVM, OPCI, opportunités immobilières et club deals.",
  "url": "https://messidor-patrimoine.com/services",
  "areaServed": {
    "@type": "Country",
    "name": "Morocco"
  },
  "serviceType": [
    "Conseil en investissement financier",
    "Gestion de patrimoine",
    "Construction de portefeuilles",
    "OPCVM",
    "OPCI",
    "Investissement immobilier",
    "Club deals"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services de Gestion de Patrimoine",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Conseil en Investissement Financier",
          "description": "Accompagnement personnalisé pour optimiser votre stratégie d'investissement"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Construction de Portefeuilles Sur Mesure",
          "description": "Portefeuilles diversifiés avec OPCVM et OPCI"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Opportunités Immobilières",
          "description": "Accès à des opportunités immobilières exclusives"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Club Deals & Investissements Privés",
          "description": "Opportunités d'investissement exclusives en partenariat"
        }
      }
    ]
  }
}

const services = [
  {
    icon: FaUserTie,
    title: 'Conseil en investissement financier',
    description: 'Un accompagnement personnalisé pour optimiser votre stratégie d\'investissement selon vos objectifs et votre profil de risque.',
    features: [
      'Analyse approfondie de votre situation patrimoniale',
      'Recommandations d\'allocation d\'actifs sur mesure',
      'Conseil indépendant sans conflit d\'intérêt',
      'Suivi régulier et ajustements stratégiques',
      'Reporting détaillé de performance',
    ],
    color: 'accent.500',
  },
  {
    icon: FaChartPie,
    title: 'Construction de portefeuilles sur mesure',
    description: 'Des portefeuilles diversifiés adaptés à vos objectifs : croissance, revenus, préservation du capital ou équilibre.',
    features: [
      'Sélection rigoureuse d\'OPCVM actions, obligations et monétaires',
      'Accès aux meilleurs fonds OPCI immobilier',
      'Diversification géographique et sectorielle',
      'Optimisation fiscale de vos investissements',
      'Rééquilibrage périodique du portefeuille',
    ],
    color: 'blue.500',
  },
  {
    icon: FaBuilding,
    title: 'Opportunités immobilières',
    description: 'Accédez à des opportunités immobilières exclusives pour diversifier votre patrimoine et générer des revenus locatifs.',
    features: [
      'Sélection d\'actifs immobiliers premium',
      'Analyse de rendement locatif et plus-value potentielle',
      'Gestion déléguée et accompagnement fiscal',
      'Opportunités en OPCI pour investissement mutualisé',
      'Accès à des projets de développement immobilier',
    ],
    color: 'orange.500',
  },
  {
    icon: FaHandshake,
    title: 'Club deals & investissements privés',
    description: 'Des opportunités d\'investissement exclusives en partenariat avec d\'autres investisseurs qualifiés.',
    features: [
      'Co-investissement dans des projets à fort potentiel',
      'Due diligence approfondie par nos experts',
      'Accès à des opportunités non cotées',
      'Diversification alternative de votre patrimoine',
      'Accompagnement juridique et fiscal',
    ],
    color: 'purple.500',
  },
  {
    icon: FaGlobeAfrica,
    title: 'Expertise marché marocain',
    description: 'Une connaissance approfondie du marché financier marocain pour maximiser vos opportunités locales.',
    features: [
      'Accès privilégié à la Bourse de Casablanca',
      'Sélection d\'actions marocaines à fort potentiel',
      'Bons du Trésor et obligations d\'État marocaines',
      'Fonds d\'investissement spécialisés sur le Maroc',
      'Veille réglementaire et fiscale locale',
    ],
    color: 'green.500',
  },
  {
    icon: FaShieldAlt,
    title: 'Gestion patrimoniale globale',
    description: 'Une approche holistique pour structurer, protéger et transmettre votre patrimoine efficacement.',
    features: [
      'Stratégie patrimoniale personnalisée',
      'Optimisation de la structure de détention',
      'Planification successorale',
      'Protection des actifs',
      'Conseil en assurance-vie et prévoyance',
    ],
    color: 'teal.500',
  },
]

const investmentTypes = [
  {
    icon: FaChartLine,
    title: 'OPCVM actions',
    description: 'Fonds diversifiés pour une exposition aux marchés actions marocains et internationaux',
  },
  {
    icon: FaUniversity,
    title: 'OPCVM obligations',
    description: 'Fonds obligataires pour générer des revenus réguliers avec un risque maîtrisé',
  },
  {
    icon: FaHome,
    title: 'OPCI immobilier',
    description: 'Fonds immobiliers pour investir dans la pierre papier avec liquidité',
  },
  {
    icon: FaCoins,
    title: 'Produits structurés',
    description: 'Solutions d\'investissement sur mesure pour des objectifs spécifiques',
  },
]

export default function ServicesPage() {
  return (
    <>
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />

      <Box flex="1">
        {/* Hero Section */}
      <Box
        position="relative"
        bg="brand.800"
        color="white"
        py={{ base: 20, md: 32 }}
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          bgGradient="radial(circle at 30% 20%, accent.300 0%, transparent 70%)"
        />
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <MotionStack
            spacing={6}
            maxW="4xl"
            mx="auto"
            textAlign="center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Heading
              as="h1"
              fontSize={{ base: '4xl', md: '6xl' }}
              fontWeight="bold"
              lineHeight="1.1"
            >
              Nos services de gestion de patrimoine
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="300" lineHeight="1.6">
              Conseil en investissement financier, construction de portefeuilles sur mesure et opportunités exclusives au Maroc.
              Messidor Patrimoine vous accompagne dans la croissance et la protection de votre patrimoine.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} justify="center" pt={4}>
              <Button
                as="a"
                href="https://calendly.com/kamil-messidor"
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                colorScheme="accent"
                rightIcon={<Icon as={FaArrowRight} />}
                px={8}
              >
                Prendre rendez-vous
              </Button>
              <Button
                as={NextLink}
                href="/login"
                size="lg"
                variant="outline"
                color="white"
                borderColor="white"
                borderWidth="2px"
                _hover={{ bg: 'whiteAlpha.200' }}
                px={8}
              >
                Accéder à votre espace
              </Button>
            </Stack>
          </MotionStack>
        </Container>
      </Box>

      {/* Services Grid */}
      <Box py={{ base: 20, md: 24 }} bg="gray.50">
        <Container maxW="container.xl">
          <Stack spacing={16}>
            <Stack spacing={4} textAlign="center" maxW="3xl" mx="auto">
              <Heading as="h2" fontSize={{ base: '3xl', md: '4xl' }}>
                Une offre complète de services financiers
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Nous mettons notre expertise au service de vos objectifs patrimoniaux avec des solutions
                personnalisées et adaptées au marché marocain.
              </Text>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {services.map((service, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Stack
                    bg="white"
                    p={8}
                    rounded="xl"
                    shadow="md"
                    height="full"
                    spacing={6}
                    transition="all 0.3s"
                    _hover={{
                      shadow: '2xl',
                      transform: 'translateY(-8px)',
                    }}
                  >
                    <Flex
                      w={16}
                      h={16}
                      align="center"
                      justify="center"
                      color="white"
                      rounded="xl"
                      bg={service.color}
                    >
                      <Icon as={service.icon} w={8} h={8} />
                    </Flex>
                    <Stack spacing={3}>
                      <Heading as="h3" size="md">
                        {service.title}
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        {service.description}
                      </Text>
                    </Stack>
                    <List spacing={2}>
                      {service.features.map((feature, i) => (
                        <ListItem key={i} display="flex" alignItems="start" fontSize="sm">
                          <ListIcon
                            as={FaCheck}
                            color={service.color}
                            mt={1}
                            fontSize="xs"
                          />
                          <Text>{feature}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Investment Types Section */}
      <Box py={{ base: 20, md: 24 }} bg="white">
        <Container maxW="container.xl">
          <Stack spacing={12}>
            <Stack spacing={4} textAlign="center" maxW="3xl" mx="auto">
              <Heading as="h2" fontSize={{ base: '3xl', md: '4xl' }}>
                Nos solutions d'investissement
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Accédez aux meilleurs véhicules d'investissement du marché marocain et international,
                sélectionnés avec rigueur par nos experts.
              </Text>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              {investmentTypes.map((type, index) => (
                <MotionStack
                  key={index}
                  bg="gray.50"
                  p={6}
                  rounded="lg"
                  textAlign="center"
                  align="center"
                  spacing={4}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  _hover={{ bg: 'accent.50' }}
                >
                  <Flex
                    w={14}
                    h={14}
                    align="center"
                    justify="center"
                    color="accent.500"
                    rounded="full"
                    bg="white"
                    shadow="md"
                  >
                    <Icon as={type.icon} w={6} h={6} />
                  </Flex>
                  <Heading as="h3" size="sm">
                    {type.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    {type.description}
                  </Text>
                </MotionStack>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Box py={{ base: 20, md: 24 }} bg="gray.50">
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={16} alignItems="center">
            <MotionStack
              spacing={8}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <Stack spacing={4}>
                <Heading as="h2" fontSize={{ base: '3xl', md: '4xl' }}>
                  Pourquoi choisir Messidor Patrimoine ?
                </Heading>
                <Text fontSize="lg" color="gray.600" lineHeight="1.8">
                  Notre expertise du marché financier marocain, combinée à notre approche personnalisée,
                  fait de nous le partenaire idéal pour développer et protéger votre patrimoine.
                </Text>
              </Stack>

              <Stack spacing={4}>
                {[
                  'Conseil indépendant et transparent, sans conflit d\'intérêt',
                  'Expertise approfondie du marché financier marocain',
                  'Accès privilégié aux meilleures opportunités d\'investissement',
                  'Accompagnement personnalisé par des experts certifiés',
                  'Reporting complet et suivi régulier de vos investissements',
                  'Conformité avec la réglementation marocaine (AMMC, ACAPS)',
                ].map((item, i) => (
                  <Flex key={i} align="start" gap={3}>
                    <Icon as={FaCheck} color="accent.500" mt={1} flexShrink={0} />
                    <Text fontSize="md" color="gray.700">
                      {item}
                    </Text>
                  </Flex>
                ))}
              </Stack>

              <Box pt={4}>
                <Button
                  as="a"
                  href="https://calendly.com/kamil-messidor"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  colorScheme="accent"
                  rightIcon={<Icon as={FaArrowRight} />}
                >
                  Discutons de vos objectifs
                </Button>
              </Box>
            </MotionStack>

            <MotionBox
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <Stack spacing={6}>
                <Box
                  bg="white"
                  p={8}
                  rounded="xl"
                  shadow="lg"
                  borderLeft="4px solid"
                  borderColor="accent.500"
                >
                  <Stack spacing={4}>
                    <Heading as="h3" size="md" color="accent.600">
                      Une approche sur mesure
                    </Heading>
                    <Text color="gray.600">
                      Chaque client est unique. Nous prenons le temps de comprendre votre situation,
                      vos objectifs et votre tolérance au risque pour vous proposer des solutions
                      parfaitement adaptées.
                    </Text>
                  </Stack>
                </Box>

                <Box
                  bg="white"
                  p={8}
                  rounded="xl"
                  shadow="lg"
                  borderLeft="4px solid"
                  borderColor="blue.500"
                >
                  <Stack spacing={4}>
                    <Heading as="h3" size="md" color="blue.600">
                      Expertise locale
                    </Heading>
                    <Text color="gray.600">
                      Notre connaissance approfondie du marché marocain (Bourse de Casablanca, OPCVM locaux,
                      fiscalité) vous garantit des conseils pertinents et des opportunités exclusives.
                    </Text>
                  </Stack>
                </Box>

                <Box
                  bg="white"
                  p={8}
                  rounded="xl"
                  shadow="lg"
                  borderLeft="4px solid"
                  borderColor="green.500"
                >
                  <Stack spacing={4}>
                    <Heading as="h3" size="md" color="green.600">
                      Transparence totale
                    </Heading>
                    <Text color="gray.600">
                      Des frais clairs, des reportings détaillés et un accès permanent à votre conseiller.
                      Votre confiance est notre priorité.
                    </Text>
                  </Stack>
                </Box>
              </Stack>
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bg="brand.800">
        <MotionStack
          spacing={8}
          textAlign="center"
          align="center"
          px={{ base: 8, md: 12 }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <Stack spacing={4} maxW="3xl">
            <Heading as="h2" fontSize={{ base: '3xl', md: '4xl' }} color="white">
              Prêt à optimiser votre patrimoine ?
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} color="whiteAlpha.900">
              Bénéficiez d'une consultation gratuite avec l'un de nos experts en gestion de patrimoine.
              Ensemble, nous élaborerons une stratégie sur mesure pour atteindre vos objectifs financiers.
            </Text>
          </Stack>
          <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
            <Button
              as="a"
              href="https://calendly.com/kamil-messidor"
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              colorScheme="accent"
              rightIcon={<Icon as={FaArrowRight} />}
              px={8}
            >
              Réserver une consultation
            </Button>
            <Button
              as={NextLink}
              href="/login"
              size="lg"
              variant="outline"
              color="white"
              borderColor="white"
              borderWidth="2px"
              _hover={{ bg: 'whiteAlpha.200' }}
              px={8}
            >
              Accéder à mon espace
            </Button>
          </Stack>
        </MotionStack>
      </Box>
    </Box>
    </>
  )
}
