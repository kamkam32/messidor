'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  HStack,
  Link,
  Button,
  Container,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const links = [
  { name: 'Accueil', href: '/' },
  { name: 'Services', href: '/services' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <Box
      bg={scrolled ? 'white' : 'transparent'}
      backdropFilter={scrolled ? 'none' : 'blur(10px)'}
      borderBottom={scrolled ? 1 : 0}
      borderStyle="solid"
      borderColor="gray.200"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      transition="all 0.3s ease-in-out"
      boxShadow={scrolled ? 'sm' : 'none'}
    >
      <Container maxW="container.xl">
        <Flex h={20} alignItems="center" justifyContent="space-between">
          <HStack spacing={10} alignItems="center">
            <Link
              as={NextLink}
              href="/"
              fontSize={isHomePage ? "2xl" : undefined}
              fontWeight={isHomePage ? "bold" : undefined}
              color={isHomePage ? (scrolled ? 'brand.800' : 'white') : undefined}
              _hover={{ textDecoration: 'none', color: isHomePage ? (scrolled ? 'accent.600' : 'accent.300') : undefined }}
              transition="all 0.3s"
            >
              {isHomePage ? (
                'Messidor Patrimoine'
              ) : (
                <Image
                  src="/images/logomessidor.jpg"
                  alt="Messidor Patrimoine"
                  width={180}
                  height={60}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              )}
            </Link>
            <HStack as="nav" spacing={6} display={{ base: 'none', md: 'flex' }}>
              {links.map((link) => (
                <Link
                  key={link.name}
                  as={NextLink}
                  href={link.href}
                  px={3}
                  py={2}
                  rounded="md"
                  fontSize="lg"
                  fontWeight="500"
                  color={scrolled ? 'gray.700' : 'white'}
                  _hover={{
                    textDecoration: 'none',
                    bg: scrolled ? 'gray.200' : 'whiteAlpha.300',
                  }}
                  transition="all 0.3s"
                >
                  {link.name}
                </Link>
              ))}
            </HStack>
          </HStack>
          <HStack spacing={4}>
            <Button
              as={NextLink}
              href="/login"
              variant="outline"
              colorScheme={scrolled ? 'accent' : 'whiteAlpha'}
              size="md"
              fontSize="md"
              fontWeight="600"
              px={6}
              py={5}
              borderColor={scrolled ? 'accent.500' : 'white'}
              color={scrolled ? 'accent.600' : 'white'}
              _hover={{
                bg: scrolled ? 'accent.50' : 'whiteAlpha.200',
              }}
            >
              Espace Client
            </Button>
            <Button
              as={NextLink}
              href="/contact"
              variant="solid"
              colorScheme="accent"
              size="md"
              fontSize="md"
              fontWeight="600"
              px={6}
              py={5}
            >
              Contactez-nous
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
