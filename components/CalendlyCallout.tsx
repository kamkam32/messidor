'use client'

import { Box, Button, Heading, Text } from '@chakra-ui/react'

interface CalendlyCalloutProps {
  title?: string
  description?: string
  buttonText?: string
}

export default function CalendlyCallout({
  title = "Besoin de conseils personnalisés ?",
  description = "Nos experts analysent votre situation patrimoniale et vous proposent une stratégie sur mesure.",
  buttonText = "Prendre rendez-vous gratuitement"
}: CalendlyCalloutProps) {
  const handleClick = () => {
    window.open('https://calendly.com/kamil-messidor', '_blank')
  }

  return (
    <Box
      bg="brand.800"
      color="white"
      p={8}
      borderRadius="xl"
      textAlign="center"
      my={8}
      boxShadow="lg"
    >
      <Heading size="md" mb={3} fontWeight="700">
        {title}
      </Heading>
      <Text mb={5} color="whiteAlpha.900" maxW="600px" mx="auto">
        {description}
      </Text>
      <Button
        onClick={handleClick}
        size="lg"
        bg="white"
        color="brand.800"
        fontWeight="700"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'xl'
        }}
        transition="all 0.2s"
      >
        {buttonText} →
      </Button>
    </Box>
  )
}
