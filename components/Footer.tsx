'use client'

import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  Divider,
} from '@chakra-ui/react'
import NextLink from 'next/link'

export default function Footer() {
  return (
    <Box
      bg="gray.50"
      color="gray.700"
      mt="auto"
    >
      <Container maxW="container.xl" py={10}>
        <Stack spacing={6}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="space-between">
            <Stack align="flex-start">
              <Text fontSize="lg" fontWeight="bold" color="brand.800">
                Messidor Patrimoine
              </Text>
              <Text fontSize="sm">
                Votre partenaire en gestion de patrimoine au Maroc
              </Text>
            </Stack>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={6}>
              <Stack align="flex-start">
                <Text fontWeight="600">Navigation</Text>
                <Link as={NextLink} href="/" fontSize="sm">
                  Accueil
                </Link>
                <Link as={NextLink} href="/services" fontSize="sm">
                  Services
                </Link>
              </Stack>
              <Stack align="flex-start">
                <Text fontWeight="600">Contact</Text>
                <Text fontSize="sm">Casablanca, Maroc</Text>
                <Text fontSize="sm">contact@messidor-patrimoine.ma</Text>
              </Stack>
            </Stack>
          </Stack>
          <Divider />
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="space-between" align="center">
            <Text fontSize="sm">
              © {new Date().getFullYear()} Messidor Patrimoine. Tous droits réservés.
            </Text>
            <Stack direction="row" spacing={6}>
              <Link fontSize="sm">Mentions légales</Link>
              <Link fontSize="sm">Politique de confidentialité</Link>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
