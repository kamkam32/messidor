import { use } from 'react'
import { Box, Container, Heading, Text, HStack, Badge, VStack, Button, Grid, GridItem, Show } from '@chakra-ui/react'
import NextLink from 'next/link'
import { getPostBySlug, getPostSlugs } from '@/lib/blog'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TableOfContents from '@/components/blog/TableOfContents'
import CallToActionBox from '@/components/blog/CallToActionBox'
import FloatingCTA from '@/components/blog/FloatingCTA'

export async function generateStaticParams() {
  const slugs = getPostSlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getPostBySlug(resolvedParams.slug)

  if (!post) {
    return { title: 'Article non trouvé' }
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      url: `https://www.messidor-patrimoine.com/blog/${post.slug}`,
    },
  }
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const post = use(getPostBySlug(resolvedParams.slug))

  if (!post) {
    notFound()
  }

  return (
    <Container maxW="7xl" py={12} pt={32}>
      <Button as={NextLink} href="/blog" variant="ghost" mb={6}>
        ← Retour au blog
      </Button>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 300px' }} gap={8}>
        <GridItem>
          <VStack align="stretch" spacing={8}>
            <Box>
              <HStack spacing={3} mb={4}>
                <Badge colorScheme="purple" fontSize="sm">{post.category}</Badge>
                <Text color="gray.600">
                  {new Date(post.date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </HStack>

              <Heading size="2xl" mb={4}>{post.title}</Heading>

              <Text color="gray.600" fontSize="lg" mb={6}>
                {post.excerpt}
              </Text>

              <Text color="gray.500" fontSize="sm">
                Par {post.author}
              </Text>
            </Box>

            <Box
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
              sx={{
                '& h1, & h2, & h3': { mt: 8, mb: 4, fontWeight: 'bold', scrollMarginTop: '100px' },
                '& h1': { fontSize: '2xl' },
                '& h2': { fontSize: 'xl' },
                '& h3': { fontSize: 'lg', color: 'gray.800' },
                '& h4': { fontSize: 'md', fontWeight: '600', mt: 6, mb: 3, color: 'purple.700' },
                '& p': { mb: 4, lineHeight: 1.8 },
                '& ul, & ol': { ml: 6, mb: 4 },
                '& li': { mb: 2 },
                '& a': { color: 'purple.600', textDecoration: 'underline', _hover: { color: 'purple.800' } },
                '& table': {
                  width: '100%',
                  mb: 4,
                  borderCollapse: 'collapse',
                  boxShadow: 'sm',
                  borderRadius: 'md',
                  overflow: 'hidden'
                },
                '& th, & td': {
                  border: '1px solid',
                  borderColor: 'gray.200',
                  p: 3,
                  textAlign: 'left'
                },
                '& th': {
                  bg: 'purple.50',
                  fontWeight: 'bold',
                  color: 'purple.900',
                  fontSize: 'sm',
                  textTransform: 'uppercase'
                },
                '& td': {
                  bg: 'white'
                },
                '& tbody tr:hover': {
                  bg: 'gray.50'
                },
                '& code': { bg: 'gray.100', px: 1, borderRadius: 'sm', fontSize: 'sm' },
                '& blockquote': { borderLeft: '4px solid', borderColor: 'purple.500', pl: 4, ml: 0, fontStyle: 'italic', color: 'gray.600' },
                '& hr': { my: 8, borderColor: 'gray.200' },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 'md',
                  boxShadow: 'md'
                },
                '& div': {
                  '& img': {
                    display: 'inline-block'
                  }
                }
              }}
            />

            <Box borderTop="1px" borderColor="gray.200" pt={8}>
              <Text color="gray.600" fontSize="sm" mb={4}>
                Cet article vous a été utile ? Partagez-le !
              </Text>
              <Button as={NextLink} href="/blog" variant="outline" colorScheme="purple">
                Voir plus d'articles
              </Button>
            </Box>
          </VStack>
        </GridItem>

        <Show above="lg">
          <GridItem>
            <CallToActionBox />
            {post.headings.length > 0 && (
              <TableOfContents headings={post.headings} />
            )}
          </GridItem>
        </Show>
      </Grid>

      <FloatingCTA />
    </Container>
  )
}
