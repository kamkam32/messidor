'use client'

import { Box, Button, Text, VStack, Icon, Collapse, IconButton, useDisclosure } from '@chakra-ui/react'
import { FiCalendar, FiMail, FiX, FiMessageCircle } from 'react-icons/fi'
import { useState, useEffect } from 'react'

export default function FloatingCTA() {
  const { isOpen, onToggle, onClose } = useDisclosure()
  const [isVisible, setIsVisible] = useState(false)

  // Afficher le bouton après avoir scrollé un peu
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <Box
      position="fixed"
      bottom="20px"
      right="20px"
      zIndex={1000}
      display={{ base: 'block', lg: 'none' }} // Afficher uniquement sur mobile/tablette
    >
      <Collapse in={isOpen} animateOpacity>
        <Box
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          p={4}
          mb={3}
          width="280px"
          border="1px solid"
          borderColor="gray.200"
        >
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
              Besoin d'aide ?
            </Text>
            <Text fontSize="xs" color="gray.600">
              Contactez nos experts en gestion de patrimoine
            </Text>

            <Button
              as="a"
              href="https://calendly.com/kamil-messidor"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              bg="blue.800"
              color="white"
              leftIcon={<Icon as={FiCalendar} />}
              _hover={{ bg: 'blue.700' }}
            >
              Prendre RDV
            </Button>

            <Button
              as="a"
              href="mailto:kamil@messidorai.com"
              size="sm"
              variant="outline"
              borderColor="blue.800"
              color="blue.800"
              leftIcon={<Icon as={FiMail} />}
              _hover={{ bg: 'blue.50' }}
            >
              Nous écrire
            </Button>
          </VStack>
        </Box>
      </Collapse>

      {isOpen ? (
        <IconButton
          aria-label="Fermer"
          icon={<FiX />}
          onClick={onClose}
          bg="blue.800"
          color="white"
          borderRadius="full"
          size="lg"
          boxShadow="lg"
          ml="auto"
          display="block"
          _hover={{ bg: 'blue.700' }}
        />
      ) : (
        <Button
          onClick={onToggle}
          bg="blue.800"
          color="white"
          borderRadius="full"
          size="lg"
          leftIcon={<Icon as={FiMessageCircle} boxSize={5} />}
          boxShadow="lg"
          _hover={{
            bg: 'blue.700',
            transform: 'scale(1.05)',
          }}
          transition="all 0.2s"
        >
          Contactez-nous
        </Button>
      )}
    </Box>
  )
}
