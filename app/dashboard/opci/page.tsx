'use client'

import { Box, Heading, Text, SimpleGrid, Card, CardBody, Badge, Button, HStack } from '@chakra-ui/react'

export default function OPCIPage() {
  return (
    <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 0 }}>
      <Box mb={8}>
        <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb={2}>
          Fonds OPCI
        </Heading>
        <Text color="gray.600" fontSize={{ base: 'md', md: 'lg' }}>
          Organismes de Placement Collectif Immobilier
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
        {/* Placeholder for funds */}
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Badge colorScheme="purple">OPCI</Badge>
              <Badge colorScheme="green">Actif</Badge>
            </HStack>
            <Heading size="md" mb={2}>
              Aucun fonds disponible
            </Heading>
            <Text color="gray.600" fontSize="sm" mb={4}>
              Les fonds OPCI seront affichés ici une fois configurés.
            </Text>
            <Button colorScheme="accent" size="sm" isDisabled>
              Investir
            </Button>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  )
}
