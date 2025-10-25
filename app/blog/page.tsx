import { Box, Container, Heading, Text, SimpleGrid, Badge, HStack, VStack, Image, AspectRatio } from '@chakra-ui/react'
import NextLink from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog Patrimoine & Investissement Maroc - Guides & Conseils',
  description: 'Conseils pratiques, analyses financières et stratégies patrimoniales : héritage, OPCVM, investissement or. Guides complets pour optimiser votre patrimoine au Maroc.',
  keywords: ['blog patrimoine maroc', 'guide investissement maroc', 'héritage maroc', 'opcvm maroc', 'investir or maroc', 'conseils financiers'],
  openGraph: {
    title: 'Blog Patrimoine & Investissement | Messidor Patrimoine',
    description: 'Conseils pratiques et stratégies patrimoniales pour optimiser vos investissements au Maroc',
    url: 'https://www.messidor-patrimoine.com/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <Container maxW="7xl" py={12} pt={32}>
      <VStack align="stretch" spacing={12}>
        {/* Hero Section */}
        <Box
          textAlign="center"
          mb={4}
          py={12}
          px={6}
          bg="brand.800"
          borderRadius="xl"
          color="white"
        >
          <Heading size="2xl" mb={4} fontWeight="700">
            Guides patrimoniaux & investissement
          </Heading>
          <Text fontSize="lg" maxW="2xl" mx="auto" color="whiteAlpha.900">
            Conseils pratiques, analyses financières et stratégies patrimoniales pour optimiser vos investissements au Maroc
          </Text>
        </Box>

        {posts.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text color="gray.500">Aucun article disponible pour le moment</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {posts.map(post => (
              <Box
                key={post.slug}
                as={NextLink}
                href={`/blog/${post.slug}`}
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-8px)', shadow: '2xl' }}
                cursor="pointer"
                borderRadius="xl"
                bg="white"
                position="relative"
                boxShadow="md"
              >
                {/* Image d'en-tête */}
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={post.image || '/images/OPCVM.jpg'}
                    alt={post.title}
                    objectFit="cover"
                    fallbackSrc="/images/OPCVM.jpg"
                  />
                </AspectRatio>

                <Box p={6}>
                  <VStack align="stretch" spacing={4}>
                    {/* Badge et date */}
                    <HStack spacing={2} flexWrap="wrap">
                      <Badge
                        colorScheme="blue"
                        fontSize="xs"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {post.category}
                      </Badge>
                      <Text fontSize="xs" color="gray.500" fontWeight="500">
                        {new Date(post.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </HStack>

                    {/* Titre */}
                    <Heading
                      size="md"
                      noOfLines={2}
                      lineHeight="1.3"
                      fontWeight="700"
                      color="gray.800"
                    >
                      {post.title}
                    </Heading>

                    {/* Extrait */}
                    <Text
                      color="gray.600"
                      noOfLines={3}
                      fontSize="sm"
                      lineHeight="1.6"
                    >
                      {post.excerpt}
                    </Text>

                    {/* Footer */}
                    <HStack justify="space-between" pt={2} borderTop="1px" borderColor="gray.100">
                      <Text fontSize="xs" color="gray.500" fontWeight="500">
                        {post.author}
                      </Text>
                      <Text
                        color="blue.600"
                        fontWeight="600"
                        fontSize="sm"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        Lire →
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  )
}
