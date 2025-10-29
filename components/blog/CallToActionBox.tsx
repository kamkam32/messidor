'use client'

import { Box, Button, Text, VStack, HStack, Icon } from '@chakra-ui/react'
import { FiCalendar, FiMail } from 'react-icons/fi'

export default function CallToActionBox() {
  return (
    <Box
      position="fixed"
      top="120px"
      right="calc((100vw - 1400px) / 2 + 20px)"
      width="300px"
      bg="blue.800"
      borderRadius="lg"
      p={6}
      color="white"
      boxShadow="lg"
      mb={6}
    >
      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold" lineHeight="1.3">
          Besoin d'aide pour optimiser votre patrimoine ?
        </Text>

        <Text fontSize="sm" opacity={0.9}>
          Nos experts vous accompagnent dans votre stratégie patrimoniale au Maroc.
        </Text>

        <VStack spacing={3} pt={2}>
          <Button
            as="a"
            href="https://calendly.com/kamil-messidor"
            target="_blank"
            rel="noopener noreferrer"
            width="full"
            bg="white"
            color="blue.800"
            leftIcon={<Icon as={FiCalendar} />}
            _hover={{
              bg: 'gray.100',
              transform: 'translateY(-2px)',
            }}
            transition="all 0.2s"
            fontWeight="bold"
          >
            Prendre RDV gratuit
          </Button>

          <Button
            as="a"
            href="mailto:kamil@messidorai.com"
            width="full"
            variant="outline"
            borderColor="white"
            color="white"
            leftIcon={<Icon as={FiMail} />}
            _hover={{
              bg: 'whiteAlpha.200',
            }}
          >
            Nous contacter
          </Button>
        </VStack>

        <Text fontSize="xs" opacity={0.8} textAlign="center" pt={2}>
          Première consultation gratuite • Sans engagement
        </Text>
      </VStack>
    </Box>
  )
}
