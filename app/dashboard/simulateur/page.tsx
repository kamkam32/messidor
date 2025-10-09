'use client'

import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { useState } from 'react'

export default function SimulateurPage() {
  const [montantInitial, setMontantInitial] = useState('')
  const [duree, setDuree] = useState('')
  const [tauxRendement, setTauxRendement] = useState('')
  const [resultat, setResultat] = useState<number | null>(null)

  const calculer = () => {
    const capital = parseFloat(montantInitial)
    const annees = parseFloat(duree)
    const taux = parseFloat(tauxRendement) / 100

    if (capital && annees && taux) {
      const valeurFinale = capital * Math.pow(1 + taux, annees)
      setResultat(valeurFinale)
    }
  }

  return (
    <Box>
      <Box mb={8}>
        <Heading as="h1" size="xl" mb={2}>
          Simulateur d&apos;investissement
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Estimez le rendement potentiel de vos investissements !
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Formulaire */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Montant initial (MAD)</FormLabel>
                <Input
                  type="number"
                  placeholder="100000"
                  value={montantInitial}
                  onChange={(e) => setMontantInitial(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Durée (années)</FormLabel>
                <Input
                  type="number"
                  placeholder="5"
                  value={duree}
                  onChange={(e) => setDuree(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Taux de rendement annuel (%)</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="7"
                  value={tauxRendement}
                  onChange={(e) => setTauxRendement(e.target.value)}
                  size="lg"
                />
              </FormControl>

              <Button colorScheme="accent" size="lg" onClick={calculer}>
                Calculer
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Résultats */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch" h="full" justify="center">
              <Heading as="h2" size="md">Résultats</Heading>

              {resultat !== null ? (
                <>
                  <Stat>
                    <StatLabel>Valeur finale estimée</StatLabel>
                    <StatNumber color="accent.600">
                      {resultat.toLocaleString('fr-FR', {
                        maximumFractionDigits: 2,
                      })}{' '}
                      MAD
                    </StatNumber>
                    <StatHelpText>
                      Après {duree} {parseFloat(duree) > 1 ? 'années' : 'année'}
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>Gain potentiel</StatLabel>
                    <StatNumber color="green.600">
                      +
                      {(resultat - parseFloat(montantInitial)).toLocaleString(
                        'fr-FR',
                        { maximumFractionDigits: 2 }
                      )}{' '}
                      MAD
                    </StatNumber>
                    <StatHelpText>
                      Soit +
                      {(
                        ((resultat - parseFloat(montantInitial)) /
                          parseFloat(montantInitial)) *
                        100
                      ).toFixed(2)}
                      %
                    </StatHelpText>
                  </Stat>
                </>
              ) : (
                <Text color="gray.500" textAlign="center">
                  Remplissez le formulaire et cliquez sur &quot;Calculer&quot; pour voir
                  les résultats
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  )
}
