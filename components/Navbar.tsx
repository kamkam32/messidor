'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Flex,
  HStack,
  Link,
  Button,
  Container,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'

const links = [
  { name: 'Accueil', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Simulateurs', href: '/simulateurs' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

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
              fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
              fontWeight="bold"
              color={scrolled ? 'brand.800' : 'white'}
              _hover={{ textDecoration: 'none', color: scrolled ? 'accent.600' : 'accent.300' }}
              transition="all 0.3s"
            >
              Messidor Patrimoine
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
          <HStack spacing={{ base: 2, md: 4 }}>
            {/* Desktop Buttons */}
            <Button
              as={NextLink}
              href="/login"
              variant="outline"
              colorScheme={scrolled ? 'accent' : 'whiteAlpha'}
              size={{ base: 'sm', md: 'md' }}
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="600"
              px={{ base: 3, md: 6 }}
              py={{ base: 4, md: 5 }}
              borderColor={scrolled ? 'accent.500' : 'white'}
              color={scrolled ? 'accent.600' : 'white'}
              _hover={{
                bg: scrolled ? 'accent.50' : 'whiteAlpha.200',
              }}
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              Espace Client
            </Button>
            <Button
              as={NextLink}
              href="/contact"
              variant="solid"
              colorScheme="accent"
              size={{ base: 'sm', md: 'md' }}
              fontSize={{ base: 'sm', md: 'md' }}
              fontWeight="600"
              px={{ base: 3, md: 6 }}
              py={{ base: 4, md: 5 }}
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              Contactez-nous
            </Button>

            {/* Mobile Menu Button */}
            <IconButton
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
              color={scrolled ? 'gray.700' : 'white'}
              _hover={{
                bg: scrolled ? 'gray.100' : 'whiteAlpha.300',
              }}
              aria-label="Ouvrir le menu"
              display={{ base: 'flex', md: 'none' }}
              size="lg"
            />
          </HStack>
        </Flex>
      </Container>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Menu
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch" mt={4}>
              {links.map((link) => (
                <Link
                  key={link.name}
                  as={NextLink}
                  href={link.href}
                  onClick={onClose}
                  px={4}
                  py={3}
                  rounded="md"
                  fontSize="lg"
                  fontWeight="500"
                  color="gray.700"
                  _hover={{
                    textDecoration: 'none',
                    bg: 'gray.100',
                  }}
                >
                  {link.name}
                </Link>
              ))}

              <Box pt={4} borderTopWidth="1px">
                <Button
                  as={NextLink}
                  href="/login"
                  variant="outline"
                  colorScheme="accent"
                  size="md"
                  w="full"
                  mb={3}
                  onClick={onClose}
                >
                  Espace Client
                </Button>
                <Button
                  as={NextLink}
                  href="/contact"
                  variant="solid"
                  colorScheme="accent"
                  size="md"
                  w="full"
                  onClick={onClose}
                >
                  Contactez-nous
                </Button>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}
