import { Box, Container, Heading, Text, SimpleGrid, Card, CardBody, Badge, HStack, VStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog OPCVM Maroc - Analyses & Insights',
  description: 'Découvrez nos analyses approfondies du marché des OPCVM marocains, guides pratiques et insights exclusifs pour optimiser vos investissements.',
  keywords: ['blog opcvm maroc', 'analyses opcvm', 'guide investissement maroc', 'opcvm insights'],
  openGraph: {
    title: 'Blog OPCVM Maroc - Analyses & Insights | Messidor Patrimoine',
    description: 'Analyses approfondies, guides pratiques et insights exclusifs sur les OPCVM marocains',
    url: 'https://www.messidor-patrimoine.com/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <Container maxW="7xl" py={12} pt={32}>
      <VStack align="stretch" spacing={8}>
        <Box textAlign="center" mb={8}>
          <Heading size="2xl" mb={4}>Blog & Analyses OPCVM</Heading>
          <Text fontSize="lg" color="gray.600" maxW="3xl" mx="auto">
            Analyses approfondies, guides pratiques et insights exclusifs pour optimiser vos investissements en OPCVM au Maroc
          </Text>
        </Box>

        {posts.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text color="gray.500">Aucun article disponible pour le moment</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
            {posts.map(post => (
              <Card
                key={post.slug}
                as={NextLink}
                href={`/blog/${post.slug}`}
                overflow="hidden"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                cursor="pointer"
              >
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <HStack spacing={2}>
                      <Badge colorScheme="purple">{post.category}</Badge>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(post.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Text>
                    </HStack>

                    <Heading size="md" noOfLines={2}>{post.title}</Heading>

                    <Text color="gray.600" noOfLines={3} fontSize="sm">
                      {post.excerpt}
                    </Text>

                    <Text fontSize="sm" color="gray.500">
                      Par {post.author}
                    </Text>

                    <Text color="purple.600" fontWeight="600" fontSize="sm">
                      Lire l'article →
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  )
}
